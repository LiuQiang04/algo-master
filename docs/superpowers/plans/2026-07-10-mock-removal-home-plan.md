# Mock Removal — Home Module Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Remove inline mock data from `home.ts` and align API calls with server response format for the Home page.

**Architecture:** Service layer (`home.ts`) removes mock and fixes response mapping. Home page (`Home.tsx`) gets a small fix for difficulty display (server returns number, page uses string comparison). This is the smallest of the three spec modules.

**Tech Stack:** TypeScript, React 19, Express, Prisma

## Global Constraints

- `VITE_USE_MOCK` env var: no longer checked in home.ts (mock removed)
- Difficulty: server returns 1-5, Home page uses string `'easy'|'medium'|'hard'` → fix page to use mapping
- Sort param: `sort: 'popular'` not supported by server, remove
- Response format: server `{problems, ...}` not `{items, ...}`, need mapping

---

### Task 1: Remove mock data and fix response mapping in home.ts

**Files:**
- Modify: `frontend/src/services/home.ts`

- [ ] **Step 1: Remove mock data constants and useMock**

Delete:
- `mockProblems` array (lines 5-11)
- `mockContests` array (lines 13-36)
- `const useMock = ...` line (38)

- [ ] **Step 2: Fix `getPopularProblems()`**

Remove the `if (useMock)` block. Replace function body:

```typescript
export async function getPopularProblems(limit = 4): Promise<ProblemListItem[]> {
  const res = await request.get<ApiResponse<any>>('/problems', {
    params: { limit, page: 1 },
  });
  const apiData = res.data.data;
  return (apiData.problems || []).map((p: any) => ({
    ...p,
    solvedCount: p.solveCount ?? 0,
    submissionCount: p.submitCount ?? 0,
    tags: (p.tags || []).map((t: any) => t.name || t),
  }));
}
```

- [ ] **Step 3: Fix `getUpcomingContests()`**

Remove the `if (useMock)` block. Replace function body:

```typescript
export async function getUpcomingContests(limit = 2): Promise<Contest[]> {
  const res = await request.get<ApiResponse<any>>('/contests', {
    params: { status: 'upcoming', limit, page: 1 },
  });
  const apiData = res.data.data;
  return (apiData.contests || []).map((c: any) => ({
    ...c,
    status: c.status === 'ongoing' ? 'running' : c.status,
    type: c.type || 'rated',
  }));
}
```

- [ ] **Step 4: Run frontend unit tests to check for breakage**

Run: `cd frontend && npm test -- --testPathPattern="Home"`

Expected: All 11 Home tests pass.

- [ ] **Step 5: Commit**

```bash
git add frontend/src/services/home.ts
git commit -m "refactor: remove mock data from home.ts, align API response with server"
```

---

### Task 2: Fix Home.tsx difficulty display

**Files:**
- Modify: `frontend/src/pages/Home/Home.tsx`

- [ ] **Step 1: Add difficulty mapping before the render section**

Find the section around line 216 where difficulty is displayed, and add a mapping.

Look for `problem.difficulty === 'easy'` pattern and replace with numeric-safe mapping.

Around line 216-217, current code:
```tsx
<span className={`difficulty difficulty--${problem.difficulty}`}>
  {problem.difficulty === 'easy' ? '简单' : problem.difficulty === 'medium' ? '中等' : '困难'}
</span>
```

Replace with:
```tsx
{(() => {
  const diffKey = typeof problem.difficulty === 'number'
    ? ({ 1: 'easy', 2: 'easy', 3: 'medium', 4: 'hard', 5: 'hard' } as Record<number, string>)[problem.difficulty] || 'medium'
    : problem.difficulty;
  return (
    <>
      <span className={`difficulty difficulty--${diffKey}`}>
        {diffKey === 'easy' ? '简单' : diffKey === 'medium' ? '中等' : '困难'}
      </span>
    </>
  );
})()}
```

Or more cleanly, add a constant before the return statement and use it:
```tsx
// Add near other constants in the component, around line 30-40
const difficultyMap: Record<number, string> = { 1: 'easy', 2: 'easy', 3: 'medium', 4: 'hard', 5: 'hard' };

// Then in the JSX at line 216:
const diffKey = typeof problem.difficulty === 'number'
  ? difficultyMap[problem.difficulty] || 'medium'
  : problem.difficulty;
<span className={`difficulty difficulty--${diffKey}`}>
  {diffKey === 'easy' ? '简单' : diffKey === 'medium' ? '中等' : '困难'}
</span>
```

- [ ] **Step 2: Run tests**

Run: `cd frontend && npm test -- --testPathPattern="Home"`

Expected: All 11 Home tests pass. If tests mock difficulty as `'easy'` string, add a case for numeric difficulty too.

- [ ] **Step 3: Commit**

```bash
git add frontend/src/pages/Home/Home.tsx
git commit -m "fix: handle numeric difficulty in Home page (server returns 1-5)"
```

---

### Task 3: Run full verification

- [ ] **Step 1: Run full frontend unit test suite**

Run: `cd frontend && npm test`

Expected: All 165 frontend tests pass.

- [ ] **Step 2: Run full E2E suite (spot check)**

Run: `npx playwright test e2e/navigation.spec.ts --project=chromium`

Expected: Navigation tests pass, including home page access.

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "test: verify home module mock removal with full test suite"
```
