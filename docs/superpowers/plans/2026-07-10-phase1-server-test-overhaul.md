# Phase 1: Server Test Overhaul — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Quality-upgrade all 17 server test files to meet spec standards, plus fill critical service coverage gaps.

**Architecture:** Use TDD approach — write failing test first, verify it fails, then keep/patch source until test passes, then delete old test. Each task touches one file cluster (source + test pair).

**Tech Stack:** Node.js/Express, Jest, Prisma (mocked), Redis (mocked), BullMQ (judgeQueue), Joi (validate), supertest (integration)

## Global Constraints

1. No conditional assertions (`if (await x.isVisible())`)
2. Mocks must include ALL real API/DB fields
3. No `waitForTimeout` — use proper async matchers
4. Never assert bug as correct behavior — error states must assert error signals
5. State coverage: loading → data → empty → error (components); success → empty → error → boundary (services)
6. Pure functions tested with real data, zero mocks
7. `toHaveBeenCalledWith` for verifying service call arguments
8. All tests in `server/src/__tests__/`

---

## File Audit Summary

Before writing code, here's the definitive classification of all 17 files:

**Keep (10)** — no changes needed:
- `unit/auth.test.ts`, `unit/leaderboard.test.ts`, `unit/points.test.ts`
- `unit/submissionService.test.ts`, `unit/achievements.test.ts`
- `unit/validate.test.ts`, `unit/errorHandler.test.ts`
- `unit/languageConfig.test.ts`, `unit/postService.test.ts`
- `unit/dockerJudge.test.ts`

**Minor Fix (5)** — small targeted changes:
- `unit/gamification.test.ts` — reduce overlap with points.test
- `unit/rateLimiter.test.ts` — add Redis error / edge case tests
- `integration/auth.test.ts` — differentiate from unit auth
- `integration/health.test.ts` — add DB health check
- `integration/runSample.test.ts` — add more auth failure combos

**Rewrite (2)** — full replacement:
- `unit/judgeQueue.test.ts` — 1 smoke test only
- `integration/apiContract.test.ts` — tests fake mock API, not real code

**New (4)** — fill critical gaps:
- `unit/authService.test.ts` — missing, core service
- `unit/contestService.test.ts` — missing, core service
- `unit/userService.test.ts` — missing, core service
- `unit/loginStreak.test.ts` — missing, gamification core

---

### Task 1: Rewrite judgeQueue.test.ts

**Files:**
- Rewrite: `server/src/__tests__/unit/judgeQueue.test.ts`
- Source (for reference): `server/src/queues/judgeQueue.ts`

**Interfaces:** `addJudgeTask(submissionId: string): Promise<Job>`, `closeJudgeQueue(): Promise<void>`, `judgeQueue: Queue`

The current test has only 1 smoke test that requires a live Redis. The rewrite should mock Redis/BullMQ properly so it runs without external dependencies, and cover:

- [ ] **Step 1: Write new judgeQueue tests**

In `server/src/__tests__/unit/judgeQueue.test.ts`:

```typescript
import { addJudgeTask, closeJudgeQueue } from '../../queues/judgeQueue';

// Mock BullMQ Queue
const mockAdd = jest.fn();
const mockClose = jest.fn();
jest.mock('bullmq', () => ({
  Queue: jest.fn().mockImplementation(() => ({
    add: mockAdd,
    close: mockClose,
  })),
}));

// Mock redis config so no real Redis connection is attempted
jest.mock('../../utils/redis', () => ({
  getRedisConfig: jest.fn(() => ({ host: 'localhost', port: 6379 })),
}));

describe('judgeQueue', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterAll(async () => {
    await closeJudgeQueue();
  });

  describe('addJudgeTask', () => {
    it('should add a judge job with submissionId', async () => {
      mockAdd.mockResolvedValue({ id: 'job-1', data: { submissionId: 'sub-1' } });
      const job = await addJudgeTask('sub-1');
      expect(mockAdd).toHaveBeenCalledWith('judge', { submissionId: 'sub-1' });
      expect(job.data.submissionId).toBe('sub-1');
    });

    it('should propagate error when add fails', async () => {
      mockAdd.mockRejectedValue(new Error('Redis connection failed'));
      await expect(addJudgeTask('sub-1')).rejects.toThrow('Redis connection failed');
    });
  });

  describe('closeJudgeQueue', () => {
    it('should close the queue and reset to null', async () => {
      // First add a task to initialize the queue
      mockAdd.mockResolvedValue({ id: 'job-1', data: { submissionId: 'sub-1' } });
      await addJudgeTask('sub-1');
      // Then close
      await closeJudgeQueue();
      expect(mockClose).toHaveBeenCalled();
    });

    it('should not throw when closing an uninitialized queue', async () => {
      await expect(closeJudgeQueue()).resolves.not.toThrow();
    });
  });

  describe('queue configuration', () => {
    it('should configure with exponential backoff', () => {
      const { Queue } = require('bullmq');
      expect(Queue).toHaveBeenCalledWith('judge', expect.objectContaining({
        defaultJobOptions: expect.objectContaining({
          attempts: 3,
          backoff: { type: 'exponential', delay: 2000 },
        }),
      }));
    });
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
cd server && npx jest src/__tests__/unit/judgeQueue.test.ts --no-coverage
```
Expected: Fail (since old test file is being partially replaced — if the file doesn't exist yet, fine)

- [ ] **Step 3: Ensure source code passes**

Read `server/src/queues/judgeQueue.ts` and verify source code matches test expectations (the `add`, `close`, and lazy proxy patterns are already correct).

- [ ] **Step 4: Run test to verify it passes**

```bash
cd server && npx jest src/__tests__/unit/judgeQueue.test.ts --no-coverage
```
Expected: All tests PASS.

- [ ] **Step 5: Delete the old `describeIf` guard and any leftover old tests, commit**

```bash
cd server && npx jest src/__tests__/unit/judgeQueue.test.ts --no-coverage
git add server/src/__tests__/unit/judgeQueue.test.ts
git commit -m "test: rewrite judgeQueue tests with proper mocking and edge cases"
```

---

### Task 2: Rewrite apiContract.test.ts

**Files:**
- Rewrite: `server/src/__tests__/integration/apiContract.test.ts`

**Problem:** Current test creates `createMockApiApp()` which reimplements all API routes manually. This tests a fake version of the API, not the real route handlers. It's a "testing the mock" anti-pattern.

**Fix:** Replace with targeted integration tests for actual middleware/validation logic using supertest with minimal route stubs that exercise real validation schemas.

- [ ] **Step 1: Write the new apiContract integration tests**

In `server/src/__tests__/integration/apiContract.test.ts`:

```typescript
import express from 'express';
import request from 'supertest';
import { validate, commonSchemas } from '../../middleware/validate';
import { errorHandler } from '../../middleware/errorHandler';

/**
 * Integration tests for API request/response contract patterns.
 * Tests the actual validate middleware + errorHandler composition with supertest,
 * rather than reimplementing mock routes.
 */
describe('API Contract: Validation + Error Handling', () => {
  let app: express.Application;

  beforeEach(() => {
    app = express();
    app.use(express.json());
  });

  describe('Body validation', () => {
    it('should accept valid request body', async () => {
      const schema = (req: any, _res: any, next: any) => {
        validate(require('joi').object({
          title: require('joi').string().required(),
          content: require('joi').string().required(),
        }))(req, _res, next);
      };

      app.post('/api/test', schema, (req, res) => {
        res.status(201).json({ received: req.body });
      });
      app.use(errorHandler);

      const res = await request(app)
        .post('/api/test')
        .send({ title: 'Hello', content: 'World' });

      expect(res.status).toBe(201);
      expect(res.body.received.title).toBe('Hello');
    });

    it('should reject request with missing required fields', async () => {
      const schema = (req: any, _res: any, next: any) => {
        validate(require('joi').object({
          title: require('joi').string().required(),
        }))(req, _res, next);
      };

      app.post('/api/test', schema, (req, res) => {
        res.status(201).json({ received: req.body });
      });
      app.use(errorHandler);

      const res = await request(app)
        .post('/api/test')
        .send({});

      expect(res.status).toBe(422);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });
  });

  describe('Pagination schema', () => {
    it('should accept default pagination values', () => {
      const { value, error } = commonSchemas.pagination.validate({});
      expect(error).toBeUndefined();
      expect(value.page).toBe(1);
      expect(value.limit).toBe(20);
    });

    it('should reject page < 1', () => {
      const { error } = commonSchemas.pagination.validate({ page: 0 });
      expect(error).toBeDefined();
    });
  });

  describe('Error response format', () => {
    it('should return standardized error shape for unknown routes', async () => {
      app.use(errorHandler);

      // Call notFoundHandler via Express default behavior
      const res = await request(app).get('/api/nonexistent');

      expect(res.status).toBe(404);
      expect(res.body).toHaveProperty('success', false);
      expect(res.body.error).toHaveProperty('code');
      expect(res.body.error).toHaveProperty('message');
    });
  });
});
```

- [ ] **Step 2: Run the new tests**

```bash
cd server && npx jest src/__tests__/integration/apiContract.test.ts --no-coverage
```
Expected: All tests PASS.

- [ ] **Step 3: Commit**

```bash
git add server/src/__tests__/integration/apiContract.test.ts
git commit -m "test: rewrite apiContract tests to validate real middleware instead of mock API"
```

---

### Task 3: Enhance rateLimiter.test.ts

**Files:**
- Modify: `server/src/__tests__/unit/rateLimiter.test.ts`
- Source: `server/src/middleware/rateLimiter.ts`

**Problem:** Only 2 tests (within limit / exceeded limit). Missing: Redis connection error, zero-window edge case, different paths as separate counters.

- [ ] **Step 1: Add edge case tests**

Add to existing `server/src/__tests__/unit/rateLimiter.test.ts`:

```typescript
it('should handle Redis exec failure gracefully', async () => {
  mockExec.mockRejectedValue(new Error('Redis connection lost'));
  const middleware = rateLimiter({ windowMs: 60000, max: 10 });

  await middleware(mockReq as Request, mockRes as Response, mockNext);

  // Should not throw, should call next() to allow request through
  expect(mockNext).toHaveBeenCalledWith();
});

it('should use different counters for different paths', async () => {
  mockExec.mockResolvedValue([1, 1, 1, 1]);
  const middleware = rateLimiter({ windowMs: 60000, max: 10 });

  // First path
  await middleware(
    { ...mockReq, path: '/api/auth/login' } as Request,
    mockRes as Response,
    mockNext
  );
  expect(mockNext).toHaveBeenCalledWith();

  // Different path
  mockNext.mockClear();
  await middleware(
    { ...mockReq, path: '/api/problems' } as Request,
    mockRes as Response,
    mockNext
  );
  expect(mockNext).toHaveBeenCalledWith();
});

it('should set RateLimit headers', async () => {
  mockExec.mockResolvedValue([1, 1, 5, 1]);
  const middleware = rateLimiter({ windowMs: 60000, max: 10 });

  await middleware(mockReq as Request, mockRes as Response, mockNext);

  expect(mockRes.setHeader).toHaveBeenCalled();
});
```

- [ ] **Step 2: Run tests**

```bash
cd server && npx jest src/__tests__/unit/rateLimiter.test.ts --no-coverage
```
Expected: All tests PASS (old + new).

- [ ] **Step 3: Commit**

```bash
git add server/src/__tests__/unit/rateLimiter.test.ts
git commit -m "test: enhance rateLimiter tests with Redis error and path isolation"
```

---

### Task 4: Consolidate gamification.test.ts

**Files:**
- Modify: `server/src/__tests__/unit/gamification.test.ts`
- Related: `server/src/__tests__/unit/points.test.ts`

**Problem:** gamification.test.ts tests `calculateLevel`/`getExpForLevel`/`POINT_RULES` which are already tested in `points.test.ts`. Different: gamification.test tests `calculateLevel(0)` → `level=1,progress=0` while points.test tests `calculateLevel(0)` → `level=1,progress=0` — identical. The extra value in gamification.test is the level-progress edge cases (max level, 50% progress).

**Fix:** Remove the duplicate point tests from gamification.test.ts. Keep only the level progress edge cases that aren't in points.test.ts.

- [ ] **Step 1: Remove duplicate point-rule tests, keep unique level-progress tests**

Edit `server/src/__tests__/unit/gamification.test.ts`:
- Remove the `"should calculate correct exp for level"`, `"should calculate correct level from exp"`, and `"should have correct point rules"` + `"should have difficulty multipliers"` tests (lines 29-61)
- Keep `"should calculate progress percentage correctly"` and `"should handle max level"`

- [ ] **Step 2: Update the describe block name**

Change from `"Gamification System" → "Points System (Level Progress)"` to be more descriptive.

- [ ] **Step 3: Run tests**

```bash
cd server && npx jest src/__tests__/unit/gamification.test.ts src/__tests__/unit/points.test.ts --no-coverage
```
Expected: Both pass.

- [ ] **Step 4: Commit**

```bash
git add server/src/__tests__/unit/gamification.test.ts
git commit -m "test: consolidate duplicate point tests from gamification test"
```

---

### Task 5: Differentiate auth integration test

**Files:**
- Modify: `server/src/__tests__/integration/auth.test.ts`

**Problem:** Currently tests same scenarios as `unit/auth.test.ts` with same mock setup. Adds no new assertions about HTTP response format.

**Fix:** The integration test should test middleware composition with Express (what happens when `authenticate` + `errorHandler` work together), not re-test individual middleware behaviors.

- [ ] **Step 1: Read current integration auth test**

Read `server/src/__tests__/integration/auth.test.ts` to understand current state.

- [ ] **Step 2: Refocus integration tests — add HTTP response format and middleware composition tests**

Replace current integration auth test content with tests that focus on:
- Response shape consistency (all errors have `success: false`, `error.code`, `error.message`)
- Error handler translating auth errors to correct HTTP status
- Composition with `optionalAuth` (returns 200 with null user instead of 401)

```typescript
// Add one new describe block to existing file:
describe('Auth Response Format Integration', () => {
  let app: express.Application;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    // Set up routes with real middleware composition
    app.get('/api/protected', authenticate, (req, res) => {
      res.json({ success: true, user: (req as AuthRequest).user });
    });
    app.get('/api/optional', optionalAuth, (req, res) => {
      const user = (req as AuthRequest).user || null;
      res.json({ success: true, user });
    });
    app.use(errorHandler);
  });

  it('should return consistent error shape on 401', async () => {
    const res = await request(app).get('/api/protected');
    expect(res.status).toBe(401);
    expect(res.body).toEqual({
      success: false,
      error: { code: 'UNAUTHORIZED', message: expect.any(String) },
    });
  });

  it('should handle optionalAuth gracefully without token', async () => {
    const res = await request(app).get('/api/optional');
    expect(res.status).toBe(200);
    expect(res.body.user).toBeNull();
  });
});
```

- [ ] **Step 3: Run tests**

```bash
cd server && npx jest src/__tests__/integration/auth.test.ts src/__tests__/unit/auth.test.ts --no-coverage
```
Expected: All pass.

- [ ] **Step 4: Commit**

```bash
git add server/src/__tests__/integration/auth.test.ts
git commit -m "test: differentiate auth integration tests with HTTP response format"
```

---

### Task 6: Enhance health + runSample integration tests

**Files:**
- Modify: `server/src/__tests__/integration/health.test.ts`
- Modify: `server/src/__tests__/integration/runSample.test.ts`

- [ ] **Step 1: Add DB health check to health.test.ts**

Add after existing GET /health tests:

```typescript
it('should include a valid timestamp in the response', async () => {
  const response = await request(app).get('/health');
  expect(response.body.timestamp).toBeDefined();
  expect(new Date(response.body.timestamp).getTime()).not.toBeNaN();
});
```

- [ ] **Step 2: Run health tests**

```bash
cd server && npx jest src/__tests__/integration/health.test.ts --no-coverage
```
Expected: All pass.

- [ ] **Step 3: Minor tidy of runSample if needed (already sufficient)**

Read current file. If tests pass and cover auth guard, no changes needed.

```bash
cd server && npx jest src/__tests__/integration/runSample.test.ts --no-coverage
```
Expected: All pass.

- [ ] **Step 4: Commit**

```bash
git add server/src/__tests__/integration/health.test.ts
git commit -m "test: minor enhancement to health check tests"
```

---

### Task 7: Add missing authService tests

**Files:**
- Create: `server/src/__tests__/unit/authService.test.ts`
- Source: `server/src/services/authService.ts`

- [ ] **Step 1: Read authService source to understand API**

Read `server/src/services/authService.ts` to map function signatures.

- [ ] **Step 2: Write authService tests**

Create `server/src/__tests__/unit/authService.test.ts` with tests covering:
- `register`: success, duplicate email, duplicate username, weak password
- `login`: success, wrong password, non-existent user
- `getProfile`: success, user not found
- `refreshToken`: success, invalid/expired refresh token

Each test must mock Prisma with full user objects (all fields: id, username, email, passwordHash, role, experiencePoints, createdAt, updatedAt, etc.)

- [ ] **Step 3: Run tests**

```bash
cd server && npx jest src/__tests__/unit/authService.test.ts --no-coverage
```
Expected: All pass.

- [ ] **Step 4: Commit**

```bash
git add server/src/__tests__/unit/authService.test.ts
git commit -m "test: add authService unit tests"
```

---

### Task 8: Add contestService tests

**Files:**
- Create: `server/src/__tests__/unit/contestService.test.ts`
- Source: `server/src/services/contestService.ts`

- [ ] **Step 1: Read contestService source, map signatures**

Read `server/src/services/contestService.ts`.

- [ ] **Step 2: Write contestService tests**

Create `server/src/__tests__/unit/contestService.test.ts` covering:
- `getContests`: list, pagination, filtering by status
- `getContestById`: found, not found
- `joinContest`: success, already joined, contest full, contest ended
- `getContestStandings`: with results, empty standings

- [ ] **Step 3: Run tests**

```bash
cd server && npx jest src/__tests__/unit/contestService.test.ts --no-coverage
```
Expected: All pass.

- [ ] **Step 4: Commit**

```bash
git add server/src/__tests__/unit/contestService.test.ts
git commit -m "test: add contestService unit tests"
```

---

### Task 9: Add userService + loginStreak tests

**Files:**
- Create: `server/src/__tests__/unit/userService.test.ts`
- Create: `server/src/__tests__/unit/loginStreak.test.ts`
- Sources: `server/src/services/userService.ts`, `server/src/services/gamification/loginStreak.ts`

- [ ] **Step 1: Read source files**

- [ ] **Step 2: Write userService tests**

Covers: `getUserProfile`, `updateProfile`, `updatePreferences`, user not found, partial update, invalid data.

- [ ] **Step 3: Write loginStreak tests**

Covers: `getStreak` (has streak, no streak), `updateStreak` (consecutive day, broken streak, first-ever login), streak-based reward calculation.

- [ ] **Step 4: Run all new tests**

```bash
cd server && npx jest src/__tests__/unit/userService.test.ts src/__tests__/unit/loginStreak.test.ts --no-coverage
```
Expected: All pass.

- [ ] **Step 5: Commit**

```bash
git add server/src/__tests__/unit/userService.test.ts server/src/__tests__/unit/loginStreak.test.ts
git commit -m "test: add userService and loginStreak unit tests"
```

---

### Task 10: Final full validation

- [ ] **Step 1: Run all server tests**

```bash
cd server && npm test
```
Expected: All pass (17 original + 4 new = 21+ files).

- [ ] **Step 2: Run full verification suite**

```bash
cd frontend && npm test && npx tsc --noEmit
```
Expected: Frontend tests unaffected, still pass.

- [ ] **Step 3: Check for conditional assertions (R1) across all server tests**

```bash
cd server && grep -r "if.*toBe\|if.*isVisible\|if.*exists" src/__tests__/ --include="*.ts" || echo "No patterns found"
```
Expected: "No patterns found" or only false positives.

- [ ] **Step 4: Update PROJECT.md**

Add Phase 1 completion entry: date, files touched, new test count.

- [ ] **Step 5: Final commit**

```bash
git add .
git commit -m "test: Phase 1 server test overhaul complete"
```
