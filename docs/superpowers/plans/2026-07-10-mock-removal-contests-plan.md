# Mock Removal — Contests Module Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Remove inline mock data from `contests.ts` and align API calls with server response format for ContestList and ContestDetail pages.

**Architecture:** Server gets a `/standings` route alias. Service layer (`contests.ts`) handles status mapping (`ongoing`→`running`), field mapping (`contests[]`→`items[]`), and standing format conversion. ContestDetail page fixes `Number(id)` type bug. ContestList page unchanged.

**Tech Stack:** TypeScript, React 19, Express, Prisma

## Global Constraints

- `VITE_USE_MOCK` env var: no longer checked in contests.ts (mock removed)
- Status mapping: server returns `'ongoing'` for in-progress, frontend expects `'running'`
- Contest type: server has no `type` field, default to `'rated'`
- Standings: server returns `{totalScore}` and no per-problem data, frontend expects `{score, penalty, problems[]}`
- Route: server `/ranking` gets `/standings` alias

---

### Task 1: Add `/standings` route alias on server

**Files:**
- Modify: `server/src/routes/contests.ts`

- [ ] **Step 1: Add standings route**

After line 31 (`router.get('/:id/ranking', contestController.getContestRanking);`), add:

```typescript
router.get('/:id/standings', contestController.getContestRanking);
```

- [ ] **Step 2: Run server tests**

Run: `cd server && npm test`

Expected: All 170 server tests pass (route change is additive, shouldn't break anything).

- [ ] **Step 3: Commit**

```bash
git add server/src/routes/contests.ts
git commit -m "feat: add /:id/standings route alias for contest ranking"
```

---

### Task 2: Remove mock data and add response mapping in contests.ts

**Files:**
- Modify: `frontend/src/services/contests.ts`

- [ ] **Step 1: Remove mock data constants and useMock**

Delete:
- `mockContests` array (lines 5-51)
- `mockStandings` array (lines 53-62)  
- `const useMock = ...` line (63)

- [ ] **Step 2: Clean `getContests()` — remove mock branch, add mapping**

Delete the `if (useMock) { ... }` block. The remaining body:

```typescript
export async function getContests(
  params?: PaginationParams & { status?: string }
): Promise<PaginatedData<Contest>> {
  const serverParams: Record<string, any> = { ...params };
  if (serverParams.status === 'running') {
    serverParams.status = 'ongoing';
  }

  const res = await request.get<ApiResponse<any>>('/contests', {
    params: { ...serverParams, limit: params?.pageSize },
  });
  const apiData = res.data.data;
  const items = (apiData.contests || []).map((c: any) => ({
    ...c,
    status: c.status === 'ongoing' ? 'running' : c.status,
    type: c.type || 'rated',
  }));
  return {
    items,
    total: apiData.total || 0,
    page: apiData.page || 1,
    pageSize: params?.pageSize || 20,
    totalPages: apiData.totalPages || 0,
  };
}
```

- [ ] **Step 3: Clean `getContestById()` — remove mock branch, add mapping**

```typescript
export async function getContestById(id: number | string): Promise<Contest> {
  const res = await request.get<ApiResponse<any>>(`/contests/${id}`);
  const raw = res.data.data;
  // Map difficulty from number to string for contest problems
  if (raw.problems) {
    raw.problems = raw.problems.map((p: any) => ({
      ...p,
      problem: p.problem ? {
        ...p.problem,
        difficulty: ({ 1: 'easy', 2: 'easy', 3: 'medium', 4: 'hard', 5: 'hard' } as any)[p.problem.difficulty] || 'medium',
      } : undefined,
    }));
  }
  return {
    ...raw,
    status: raw.status === 'ongoing' ? 'running' : raw.status,
    type: raw.type || 'rated',
  };
}
```

- [ ] **Step 4: Clean `joinContest()` — remove mock branch only**

Delete the `if (useMock) { return; }` block, keep the else body:

```typescript
export async function joinContest(id: number | string): Promise<void> {
  await request.post<ApiResponse<null>>(`/contests/${id}/join`);
}
```

- [ ] **Step 5: Clean `getContestStandings()` — remove mock branch, add mapping**

```typescript
export async function getContestStandings(id: number | string): Promise<ContestStanding[]> {
  const res = await request.get<ApiResponse<any[]>>(`/contests/${id}/standings`);
  return (res.data.data || []).map((entry: any) => ({
    rank: entry.rank,
    userId: entry.userId,
    username: entry.username,
    score: entry.totalScore || 0,
    penalty: 0,
    problems: [],
  }));
}
```

- [ ] **Step 6: Run frontend unit tests**

Run: `cd frontend && npm test`

Expected: All 165 frontend tests pass.

- [ ] **Step 7: Commit**

```bash
git add frontend/src/services/contests.ts
git commit -m "refactor: remove mock data from contests.ts, align API params and response with server"
```

---

### Task 3: Fix ContestDetail.tsx type issues

**Files:**
- Modify: `frontend/src/pages/Contests/ContestDetail.tsx`

- [ ] **Step 1: Fix Number(id) conversion**

Change line 27-28 from:
```typescript
const { id } = useParams<{ id: string }>();
const contestId = Number(id);
```
To:
```typescript
const { id } = useParams<{ id: string }>();
const contestId = id ?? '';
```

- [ ] **Step 2: Fix joiningId type**

Change line 35 from:
```typescript
const [joiningId, setJoiningId] = useState<number | null>(null);
```
To:
```typescript
const [joiningId, setJoiningId] = useState<string | null>(null);
```

- [ ] **Step 3: Run frontend unit tests**

Run: `cd frontend && npm test`

Expected: All tests pass.

- [ ] **Step 4: Commit**

```bash
git add frontend/src/pages/Contests/ContestDetail.tsx
git commit -m "fix: use string contestId instead of Number() to support UUID"
```

---

### Task 4: Run full verification

**Files:**
- Test: `e2e/contests/contestFlow.spec.ts`
- Test: `e2e/contests/contestDetail.spec.ts`

- [ ] **Step 1: Run full frontend unit test suite**

Run: `cd frontend && npm test`

Expected: All 165 frontend tests pass.

- [ ] **Step 2: Run E2E tests for contests module**

Run: `npx playwright test e2e/contests/ --project=chromium`

Expected: 18 E2E tests pass (3 contestFlow + 15 contestDetail).

- [ ] **Step 3: If E2E tests fail due to empty data**

If no seed contest data, the tests may fail on empty state. Check E2E test expectations — they should handle empty state gracefully.

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "test: verify contests module mock removal with full test suite"
```
