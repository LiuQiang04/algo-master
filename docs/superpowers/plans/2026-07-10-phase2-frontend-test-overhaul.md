# Phase 2: Frontend Test Overhaul — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Quality-upgrade all 16 frontend test files to meet spec standards — eliminating conditional assertions, completing mocks, and adding missing state coverage.

**Architecture:** TDD approach — read real component behavior → write new/failing tests first → verify → patch → old test removed. Each task touches one component + its test file.

**Tech Stack:** React 19 + TypeScript, Jest + @testing-library/react, Zustand stores, React Router v6

## Global Constraints

1. No conditional assertions (R1) — every `it()` has a guaranteed assertion
2. Mocks must include ALL real API/DB fields (R2)
3. No `waitForTimeout` (R3) — use async matchers only
4. Never assert bug as correct (R4)
5. State coverage: loading → data → empty → error
6. Mock service layer but verify `toHaveBeenCalledWith` with correct args
7. Pure utility functions (level calculation, formatting) tested with zero mocks
8. All test files in `frontend/src/__tests__/`

---

## File Audit Summary

**Keep (7)** — no changes:
- `components/PostDetailPage.test.tsx`, `components/ProblemList.test.tsx`
- `components/CommunityPage.test.tsx`, `components/CreatePostPage.test.tsx`
- `components/LeaderboardPage.test.tsx`, `components/PointsPage.test.tsx`
- `store/authStore.test.ts`

**Minor Fix (5)** — small targeted changes:
- `components/AchievementsPage.test.tsx` — replace `any` stub with real child
- `components/Register.test.tsx` — add error/loading states
- `components/DailyChallengePage.test.tsx` — add error state tests
- `components/VirtualItemsPage.test.tsx` — add purchase interaction verify + error
- `components/Header.test.tsx` — remove empty mobile-menu test

**Rewrite (4)** — full replacement:
- `components/App.test.tsx` — test real routing behavior
- `components/Home.test.tsx` — test real dynamic data
- `components/Login.test.tsx` — add all state coverage
- `components/Footer.test.tsx` — minor: already mostly fine

---

### Task 1: Rewrite App.test.tsx

**Files:**
- Rewrite: `frontend/src/__tests__/components/App.test.tsx`
- Source: `frontend/src/App.tsx`

**Problem:** Current test mocks `@/routes` with a stub, then checks `container` and `body.textContent` exist — no meaningful behavior.

- [ ] **Step 1: Read App.tsx source**

```bash
cat frontend/src/App.tsx
```

- [ ] **Step 2: Write new tests**

Replace content with tests that verify:
- App renders without error
- ErrorBoundary catches exceptions
- Proper Suspense fallback shows LoadingPage during lazy load

- [ ] **Step 3: Run tests**

```bash
cd frontend && npx jest src/__tests__/components/App.test.tsx --no-coverage
```

- [ ] **Step 4: Commit**

```bash
git add frontend/src/__tests__/components/App.test.tsx
git commit -m "test: rewrite App test with ErrorBoundary and Suspense coverage"
```

---

### Task 2: Rewrite Home.test.tsx

**Files:**
- Rewrite: `frontend/src/__tests__/components/Home.test.tsx`
- Source: `frontend/src/pages/Home/Home.tsx`

**Problem:** Current test is a static snapshot — mocks service but never asserts on returned data. No loading/error/empty states.

- [ ] **Step 1: Read Home.tsx source to understand data flow**

- [ ] **Step 2: Write new tests**

Cover:
- Loading state shows skeleton/spinner
- Popular problems render with correct titles
- Upcoming contests render
- Empty state: "No problems" or "No contests" when arrays empty
- Error state: graceful degradation
- CTA buttons link to correct pages

Mock data must include ALL fields the component uses (full problem shape: id, title, difficulty, tags, etc.)

- [ ] **Step 3: Run tests**

```bash
cd frontend && npx jest src/__tests__/components/Home.test.tsx --no-coverage
```

- [ ] **Step 4: Commit**

```bash
git add frontend/src/__tests__/components/Home.test.tsx
git commit -m "test: rewrite Home tests with loading/data/empty/error coverage"
```

---

### Task 3: Rewrite Login.test.tsx

**Files:**
- Rewrite: `frontend/src/__tests__/components/Login.test.tsx`
- Source: `frontend/src/pages/LoginPage.tsx`

**Problem:** Only verifies `mockLogin` was called. No loading state (submit disabled while logging in), no error state (wrong credentials), no form validation.

- [ ] **Step 1: Read LoginPage.tsx source**

- [ ] **Step 2: Write new tests**

Cover:
- Form renders: email/password inputs, submit button
- Input changes work
- Submit calls login with correct args
- Loading state: submit button disabled or shows spinner
- Error state: error message displayed
- Empty validation: show "required" messages for empty fields
- Success: navigation to home

- [ ] **Step 3: Run tests**

```bash
cd frontend && npx jest src/__tests__/components/Login.test.tsx --no-coverage
```

- [ ] **Step 4: Commit**

```bash
git add frontend/src/__tests__/components/Login.test.tsx
git commit -m "test: rewrite Login tests with loading/error/validation coverage"
```

---

### Task 4: Fix Acceptable-level tests

**Files:**
- Modify: `frontend/src/__tests__/components/AchievementsPage.test.tsx`
- Modify: `frontend/src/__tests__/components/Register.test.tsx`
- Modify: `frontend/src/__tests__/components/DailyChallengePage.test.tsx`
- Modify: `frontend/src/__tests__/components/VirtualItemsPage.test.tsx`
- Modify: `frontend/src/__tests__/components/Header.test.tsx`
- Modify: `frontend/src/__tests__/components/Footer.test.tsx`

- [ ] **Step 1: Fix AchievementsPage**

Replace the `any`-typed AchievementCard stub with a component that:
- Renders actual achievement name/description/rarity
- Tests that cards appear with correct content

Add error state for achievements load failure.

- [ ] **Step 2: Fix Register — add error state**

Add test for:
- Register fails (API error) → error message shown
- Loading state → button disabled while submitting

- [ ] **Step 3: Fix DailyChallengePage — add error state**

Add test for:
- Challenge load fails → error message shown
- Tasks load fails → error message shown

- [ ] **Step 4: Fix VirtualItemsPage — add purchase verification**

Add test for:
- Purchase button calls onPurchase with correct item ID
- Purchase failure shows error
- Already-owned items show "owned" state

- [ ] **Step 5: Fix Header — remove empty mobile menu test**

The mobile menu toggle test has no assertion (only a comment). Either:
- Remove it, or
- Write a real test that verifies sidebar state change

- [ ] **Step 6: Minor Footer fix**

Add loading state test if Footer has dynamic content; otherwise confirm static tests are sufficient.

- [ ] **Step 7: Run all frontend tests**

```bash
cd frontend && npm test
```

- [ ] **Step 8: Commit**

```bash
git add frontend/src/__tests__/
git commit -m "test: fix acceptable-level tests with missing error/loading states"
```

---

### Task 5: Final full validation

- [ ] **Step 1: Run all frontend tests**

```bash
cd frontend && npm test
```
Expected: All 16+ tests pass.

- [ ] **Step 2: TypeScript check**

```bash
cd frontend && npx tsc --noEmit
```
Expected: No type errors.

- [ ] **Step 3: Run server tests to confirm no breakage**

```bash
cd server && npm test
```

- [ ] **Step 4: Check for conditional assertions**

```bash
cd frontend && grep -rn "if.*toBe\|if.*isVisible\|if.*exists" src/__tests__/ --include="*.tsx" --include="*.ts" || echo "No patterns found"
```

- [ ] **Step 5: Check for waitForTimeout**

```bash
cd frontend && grep -rn "waitForTimeout" src/__tests__/ --include="*.tsx" --include="*.ts" || echo "No waitForTimeout found"
```

- [ ] **Step 6: Update PROJECT.md**

- [ ] **Step 7: Final commit**

```bash
git add .
git commit -m "test: Phase 2 frontend test overhaul complete"
```
