# Mock Removal — Problems Module Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Remove inline mock data from `problems.ts` and align API calls with server response format for ProblemList and ProblemDetail pages.

**Architecture:** Parameter mapping (keyword→search, difficulty string→number) and response format conversion happen in the service layer (`problems.ts`). The page components (`ProblemList.tsx`, `ProblemDetail.tsx`) remain unchanged — the service layer absorbs all incompatibilities.

**Tech Stack:** TypeScript, React 19, Express, Prisma

## Global Constraints

- `VITE_USE_MOCK` env var: all mock branches removed, env var no longer checked
- Difficulty mapping: server uses 1-5 (Int), frontend sends 'easy'|'medium'|'hard' strings → service converts
- Parameter mapping: `keyword` → `search`, `status` → dropped (server doesn't support), `pageSize` → `limit`
- Tags: server returns `[{id, name, category}]`, frontend expects `string[]` → service maps

---

### Task 1: Remove mock data and add parameter/response mapping in problems.ts

**Files:**
- Modify: `frontend/src/services/problems.ts`

**Interfaces:**
- Consumes: existing `getProblems()`, `getProblemTags()`, `getProblemById()` signatures
- Produces: same public signatures, no mock branches

- [ ] **Step 1: Remove mock data constants and useMock**

Delete lines 5-29 (mockProblems array, mockTags array, `const useMock = ...`). Keep the `import` statements and function signatures.

Expected: file starts with `import request from '@/utils/request';` followed directly by the first function.

- [ ] **Step 2: Clean `getProblems()` — remove mock branch, add parameter mapping**

Delete the `if (useMock) { ... }` block (the first conditional check). The remaining `else` body becomes the function body directly.

Then add parameter mapping before the `request.get` call. The complete function:

```typescript
export async function getProblems(
  params?: PaginationParams & { difficulty?: string; tag?: string; keyword?: string; status?: string }
): Promise<PaginatedData<ProblemListItem>> {
  // Map frontend params to server-expected params
  const serverParams: Record<string, any> = { ...params };
  if (serverParams.keyword) {
    serverParams.search = serverParams.keyword;
    delete serverParams.keyword;
  }
  if (serverParams.difficulty) {
    // 'easy'→1, 'medium'→3, 'hard'→5
    const diffMap: Record<string, number> = { easy: 1, medium: 3, hard: 5 };
    serverParams.difficulty = diffMap[serverParams.difficulty as string] || undefined;
  }
  delete serverParams.status; // Server doesn't support status filter
  delete serverParams.pageSize; // Will be passed as limit below

  const res = await request.get<ApiResponse<any>>('/problems', {
    params: {
      ...serverParams,
      limit: params?.pageSize,
    },
  });
  const apiData = res.data.data;
  const problems = (apiData.problems || []).map((p: any) => ({
    ...p,
    solvedCount: p.solveCount ?? 0,
    submissionCount: p.submitCount ?? 0,
    tags: (p.tags || []).map((t: any) => t.name || t),
  }));
  return {
    items: problems,
    total: apiData.total || 0,
    page: apiData.page || 1,
    pageSize: apiData.pageSize || params?.pageSize || apiData.limit || 20,
    totalPages: apiData.totalPages || 0,
  };
}
```

- [ ] **Step 3: Clean `getProblemById()` — remove mock branch only**

Delete the `if (useMock) { ... }` block (the ~15-line conditional). The `else` body becomes the function body directly.

Expected result:
```typescript
export async function getProblemById(id: number): Promise<Problem> {
  const res = await request.get<ApiResponse<any>>(`/problems/${id}`);
  const raw = res.data.data;
  return {
    ...raw,
    tags: (raw.tags || []).map((t: any) => t.name || t),
    solvedCount: raw.solveCount ?? 0,
    submissionCount: raw.submitCount ?? 0,
  };
}
```

- [ ] **Step 4: Clean `getProblemTags()` — remove mock branch, fix response mapping**

Delete the `if (useMock) { ... }` block. The else branch needs to map server response (tag objects) to strings:

```typescript
export async function getProblemTags(): Promise<string[]> {
  const res = await request.get<ApiResponse<any[]>>('/problems/tags');
  // Server returns [{id, name, category, problemCount}], UI expects string[]
  return (res.data.data || []).map((t: any) => t.name);
}
```

- [ ] **Step 5: Run frontend unit tests to confirm no breakage**

Run: `cd frontend && npm test -- --testPathPattern="ProblemList"`

Expected: All 18 tests in ProblemList.test.tsx pass. Tests use `jest.mock()` so they don't hit the service layer, but verify the import doesn't break.

- [ ] **Step 6: Commit**

```bash
git add frontend/src/services/problems.ts
git commit -m "refactor: remove mock data from problems.ts, align API params and response with server"
```

---

### Task 2: Run full verification (unit tests + E2E)

**Files:**
- Test: `e2e/problems/problemList.spec.ts`
- Test: `e2e/problems/problemDetail.spec.ts`
- Test: `frontend/src/__tests__/components/ProblemList.test.tsx`

- [ ] **Step 1: Run full frontend unit test suite**

Run: `cd frontend && npm test`

Expected: All 165 frontend tests pass.

- [ ] **Step 2: Run E2E tests for problems module**

Run: `npx playwright test e2e/problems/ --project=chromium`

Expected: 13 E2E tests pass (5 problemList + 8 problemDetail). Note: these tests run against the real backend, so the database must have seed data.

- [ ] **Step 3: If E2E tests fail, check database state**

If E2E tests fail due to empty database (no problems seeded), run the seed script first:
```bash
cd server && npx prisma db seed
```
Then re-run E2E tests.

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "test: verify problems module mock removal with full test suite"
```
