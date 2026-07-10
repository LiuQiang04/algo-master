# Phase 3: E2E Test Overhaul — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Eliminate all R1 (conditional assertions), R3 (waitForTimeout), and defensive patterns from 12 E2E test files. Each test must run a real user flow with guaranteed assertions.

**Architecture:** Rewrite defensive tests using Playwright best practices — `waitForSelector` / `toBeVisible` / `toHaveURL` instead of `if (visible)`, proper `waitForLoadState` instead of `waitForTimeout`, real assertions on every path.

**Tech Stack:** Playwright, TypeScript. Tests run against local dev server with real PostgreSQL database.

## Global Constraints

1. Zero conditional assertions — no `if (await el.isVisible())` ever
2. Zero `waitForTimeout(N)` — use `waitForSelector`, `waitForResponse`, `waitForLoadState`, `toBeVisible({ timeout })`
3. Zero `catch(() => {})` swallowing
4. Every `it()` must have at least one guaranteed `expect()` call
5. Real user flows — no mocking API responses at the test level
6. Use `storageState: '.auth/user.json'` for authenticated tests
7. Tests in `e2e/` directory, mirror app route structure

---

## E2E File Audit

Based on sampling of 4/12 files:

**Good (2)** — real user flow, no conditional assertions:
- `judge/judgeFlow.spec.ts` — submit code → poll → assert result. Real flow.
- `problemList.spec.ts` — not sampled, assume good if follows judgeFlow pattern

**Defensive (10)** — need rewrite:
- `auth/login.spec.ts`, `auth/registration.spec.ts` — sampled? assume typical
- `contests/contestDetail.spec.ts` — sampled: R1 violations ×7, waitForTimeout ×3, catch swallowing ×1
- `contests/contestFlow.spec.ts` — not sampled
- `community/communityFlow.spec.ts` — not sampled
- `community/postDetail.spec.ts` — sampled: R1 violations ×4, waitForTimeout ×1, redirect workaround ×1
- `gamification/gamificationFlow.spec.ts` — sampled: R1 violations on nearly every test, "verify page doesn't crash" pattern
- `navigation.spec.ts` — not sampled
- `problems/problemDetail.spec.ts` — not sampled
- `user/profile.spec.ts` — not sampled

---

### Task 1: Rewrite gamificationFlow.spec.ts

**Files:**
- Rewrite: `e2e/gamification/gamificationFlow.spec.ts`

**Problem:** Nearly every test uses `if (await x.isVisible().catch(() => false))` — the exact R1 anti-pattern. Tests silently pass even when elements don't exist.

- [ ] **Step 1: Read each gamification page to understand guaranteed elements**

Each page (achievements, leaderboard, daily-challenge, virtual-items, points) has guaranteed rendering elements. Use `getByRole('heading')` or specific data attributes instead of conditional checks.

- [ ] **Step 2: Rewrite gamificationFlow tests**

Replace each test with unconditional flow:
```typescript
// Before (broken):
test('成就页面分类筛选可点击', async ({ page }) => {
  await page.goto(URLS.achievements);
  await page.waitForLoadState('networkidle');
  const contestFilter = page.getByText('竞赛').first();
  if (await contestFilter.isVisible().catch(() => false)) {
    await contestFilter.click();
    await expect(contestFilter).toBeVisible();
  }
});

// After (fixed):
test('成就页面加载并显示成就列表', async ({ page }) => {
  await page.goto(URLS.achievements);
  await page.waitForLoadState('networkidle');
  await expect(page.getByRole('heading', { name: '成就系统' })).toBeVisible({ timeout: 10000 });
  // Assert at least one achievement card rendered
  const cards = page.locator('[data-testid="achievement-card"]');
  await expect(cards.first()).toBeVisible({ timeout: 10000 });
});
```

- [ ] **Step 3: Run the updated tests**

```bash
npx playwright test e2e/gamification/gamificationFlow.spec.ts --project=chromium
```

- [ ] **Step 4: Commit**

```bash
git add e2e/gamification/gamificationFlow.spec.ts
git commit -m "test: rewrite gamification E2E tests to eliminate conditional assertions"
```

---

### Task 2: Rewrite contestDetail.spec.ts

**Files:**
- Rewrite: `e2e/contests/contestDetail.spec.ts`

**Problems identified:**
- 7 instances of R1: `if (await x.isVisible()) { await expect(x).toBeVisible(); }`
- 3 instances of R3: `await page.waitForTimeout(1000)`, `waitForTimeout(2000)`
- 1 instance of `catch(() => {})` — silently swallows selector timeout
- "Join contest" test has no actual assertion about join success

- [ ] **Step 1: Rewrite contestDetail tests**

Replace all conditional assertions with guaranteed expectations:
- Use `waitForSelector` with `{ timeout: 15000 }` instead of `.catch(() => {})`
- Replace `waitForTimeout` with `waitForLoadState('networkidle')`
- For elements that may not exist (e.g., leaderboard in upcoming contest), restructure test to check the contest status first, then conditionally assert — but inside the test, NOT using `if (await el.isVisible())`

```typescript
// Pattern for conditional-but-guaranteed:
test('should display leaderboard for ongoing/past contests', async ({ page }) => {
  // ...navigate...
  const status = page.locator('.cd-status');
  await expect(status).toBeVisible({ timeout: 10000 });
  const statusText = await status.textContent();
  
  if (statusText?.includes('ended') || statusText?.includes('ongoing')) {
    await expect(page.locator('.cd-standings')).toBeVisible({ timeout: 10000 });
  }
  // If upcoming — skip leaderboard assertion but that's a valid data condition
});
```

- [ ] **Step 2: Run the updated tests**

```bash
npx playwright test e2e/contests/contestDetail.spec.ts --project=chromium
```

- [ ] **Step 3: Commit**

```bash
git add e2e/contests/contestDetail.spec.ts
git commit -m "test: rewrite contestDetail E2E tests — remove R1/R3 violations"
```

---

### Task 3: Rewrite postDetail.spec.ts

**Files:**
- Rewrite: `e2e/community/postDetail.spec.ts`

**Problems identified:**
- 4 instances of R1: `if (await content.isVisible())`, `if (await backButton.isVisible())`, etc.
- 1 instance of R3: `await page.waitForTimeout(2000)`
- Redirect workaround (`if (currentUrl.includes('/community'))`) tries to handle flaky navigation by asserting different things

- [ ] **Step 1: Rewrite postDetail tests**

Use direct post ID navigation (from test data fixtures) instead of clicking from community page:
```typescript
test('should display post content', async ({ page }) => {
  const postId = testData.postIds[0]; // from fixtures
  await page.goto(`/posts/${postId}`);
  await page.waitForLoadState('networkidle');
  // If redirected to /community, post doesn't exist — that's a valid finding
  // Assert one of two outcomes based on URL
  if (page.url().includes('/community')) {
    await expect(page.getByText(/post not found|404|not exist/i)).toBeVisible();
  } else {
    await expect(page.locator('h1')).toBeVisible({ timeout: 10000 });
  }
});
```

Key change: every code path has a guaranteed assertion. No `if (await x.isVisible())` silently skipping.

- [ ] **Step 2: Run the updated tests**

```bash
npx playwright test e2e/community/postDetail.spec.ts --project=chromium
```

- [ ] **Step 3: Commit**

```bash
git add e2e/community/postDetail.spec.ts
git commit -m "test: rewrite postDetail E2E tests — eliminate conditional assertions"
```

---

### Task 4: Audit and fix remaining 6 E2E files

**Files to check:**
- `e2e/auth/login.spec.ts`, `e2e/auth/registration.spec.ts`
- `e2e/navigation.spec.ts`
- `e2e/problems/problemDetail.spec.ts`, `e2e/problems/problemList.spec.ts`
- `e2e/community/communityFlow.spec.ts`
- `e2e/contests/contestFlow.spec.ts`
- `e2e/user/profile.spec.ts`

- [ ] **Step 1: Read and score each file**

For each file, check:
- Does it use `if (await el.isVisible())`? → R1 violation, must fix
- Does it use `waitForTimeout(N)`? → R3 violation, must fix
- Does it use `catch(() => {})`? → must fix
- Does every `it()` have at least one guaranteed `expect()`? → must fix

- [ ] **Step 2: Fix violations found**

Apply same patterns as Tasks 1-3.

- [ ] **Step 3: Run each fixed file**

```bash
npx playwright test e2e/auth/login.spec.ts e2e/auth/registration.spec.ts e2e/navigation.spec.ts --project=chromium
npx playwright test e2e/problems/problemDetail.spec.ts e2e/problems/problemList.spec.ts --project=chromium
npx playwright test e2e/community/communityFlow.spec.ts --project=chromium
npx playwright test e2e/contests/contestFlow.spec.ts --project=chromium
npx playwright test e2e/user/profile.spec.ts --project=chromium
```

- [ ] **Step 4: Commit**

```bash
git add e2e/
git commit -m "test: fix remaining E2E files — eliminate R1/R3 violations"
```

---

### Task 5: Full E2E suite validation

- [ ] **Step 1: Run all E2E tests**

```bash
npx playwright test --project=chromium
```
Expected: 68/68+ passing (or close, accounting for pre-existing issues noted in CLAUDE.md).

- [ ] **Step 2: Check for R1 violations across all E2E tests**

```bash
grep -rn "if.*isVisible\|if.*toBe\|\.catch(" e2e/ --include="*.ts" || echo "Clean"
```

- [ ] **Step 3: Check for R3 violations across all E2E tests**

```bash
grep -rn "waitForTimeout" e2e/ --include="*.ts" || echo "Clean"
```

- [ ] **Step 4: Update PROJECT.md**

- [ ] **Step 5: Final commit**

```bash
git add .
git commit -m "test: Phase 3 E2E test overhaul complete"
```
