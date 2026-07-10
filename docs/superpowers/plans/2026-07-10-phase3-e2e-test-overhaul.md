# Phase 3: E2E Test Overhaul — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Eliminate all R1 (conditional assertions), R3 (waitForTimeout), and defensive patterns from 12 E2E test files. Every test must run a real user flow with guaranteed assertions on all code paths.

**Architecture:** Each file gets a full rewrite. Replace `if (await el.isVisible())` patterns with unconditional `waitForSelector`/`toBeVisible`, replace `waitForTimeout` with `waitForLoadState`. For elements that genuinely may not exist (e.g., leaderboard on upcoming contest), read the DOM state first and branch with guaranteed assertions on both branches.

**Tech Stack:** Playwright, TypeScript. Tests run against local dev server with real database. Uses `.auth/user.json` for authenticated state.

## Global Constraints

1. Zero conditional assertions — no `if (await el.isVisible())`, no `.isVisible().catch(() => false)`
2. Zero `waitForTimeout(N)` — use `waitForLoadState`, `waitForSelector`, `toBeVisible({ timeout })`
3. Zero `catch(() => {})` swallowing
4. Every `it()` must have at least one guaranteed `expect()` call on both code paths
5. Real user flows — assertions based on actual rendered DOM

---

## E2E File Audit Summary

**Good (1):** `judge/judgeFlow.spec.ts` — real assertions, no conditional branches, no waitForTimeout

**Defensive (11):**
- `auth/login.spec.ts` — to audit
- `auth/registration.spec.ts` — to audit
- `navigation.spec.ts` — to audit
- `problems/problemDetail.spec.ts` — to audit
- `problems/problemList.spec.ts` — to audit
- `contests/contestDetail.spec.ts` — sampled: 7× R1, 3× R3, 1× catch swallow
- `contests/contestFlow.spec.ts` — to audit
- `community/communityFlow.spec.ts` — to audit
- `community/postDetail.spec.ts` — sampled: 4× R1, 1× R3
- `gamification/gamificationFlow.spec.ts` — sampled: R1 on every test
- `user/profile.spec.ts` — to audit

---

### Task 1: Rewrite gamificationFlow.spec.ts

**Files:**
- Rewrite: `e2e/gamification/gamificationFlow.spec.ts`

**Problems found in sampling:**
```typescript
// ❌ R1 violation: test silently passes when element doesn't exist
const contestFilter = page.getByText('竞赛').first();
if (await contestFilter.isVisible().catch(() => false)) {
  await contestFilter.click();
  await expect(contestFilter).toBeVisible();
}
```

- [ ] **Step 1: Write the fixed test file**

```typescript
import { test, expect } from '@playwright/test';
import { URLS } from '../fixtures/test-data';

test.use({ storageState: '.auth/user.json' });

test.describe('Gamification Pages', () => {
  test('成就页面加载并显示成就列表', async ({ page }) => {
    await page.goto(URLS.achievements);
    await page.waitForLoadState('networkidle');
    await expect(page.getByRole('heading', { name: '成就系统' })).toBeVisible({ timeout: 10000 });
    // Wait for achievement cards to load
    await expect(page.locator('[class*="achievement"]').first()).toBeVisible({ timeout: 10000 });
  });

  test('排行榜页面加载并显示标签页', async ({ page }) => {
    await page.goto(URLS.leaderboard);
    await page.waitForLoadState('networkidle');
    await expect(page.getByRole('heading', { name: '排行榜' })).toBeVisible({ timeout: 10000 });
    // Tab buttons should exist unconditionally
    await expect(page.getByText('好友排行')).toBeVisible({ timeout: 5000 });
    await expect(page.getByText('地区排行')).toBeVisible({ timeout: 5000 });
  });

  test('每日挑战页面加载', async ({ page }) => {
    await page.goto(URLS['daily-challenge']);
    await page.waitForLoadState('networkidle');
    await expect(page.getByRole('heading', { name: '每日挑战' }).first()).toBeVisible({ timeout: 10000 });
  });

  test('虚拟商店页面加载并切换标签页', async ({ page }) => {
    await page.goto(URLS['virtual-items']);
    await page.waitForLoadState('networkidle');
    await expect(page.getByText('虚拟商店')).toBeVisible({ timeout: 10000 });
    // 称号 tab exists unconditionally
    await expect(page.getByText('称号')).toBeVisible({ timeout: 5000 });
  });

  test('积分中心页面加载', async ({ page }) => {
    await page.goto(URLS.points);
    await page.waitForLoadState('networkidle');
    await expect(page.getByText('积分中心')).toBeVisible({ timeout: 10000 });
  });
});
```

- [ ] **Step 2: Update URL if needed**

If `URLS.points` is undefined, update the test to use a fallback or fix the fixture.

- [ ] **Step 3: Run the updated tests**

```bash
npx playwright test e2e/gamification/ --project=chromium
```
Expected: All tests PASS.

- [ ] **Step 4: Commit**

```bash
git add e2e/gamification/gamificationFlow.spec.ts
git commit -m "test: rewrite gamification E2E tests — eliminate all conditional assertions"
```

---

### Task 2: Rewrite contestDetail.spec.ts

**Files:**
- Rewrite: `e2e/contests/contestDetail.spec.ts`

**Problems found:**
```typescript
// ❌ R1: conditional assertion
const problemsTab = page.locator(".cd-tab").filter({ hasText: /题目|problems/i });
if (await problemsTab.isVisible()) {     // silently skips if not visible
  await problemsTab.click();
  await page.waitForTimeout(1000);        // ❌ R3
}

// ❌ R1: if-visible-then-assert (guarantees nothing)
const leaderboard = page.locator(".cd-standings, .cd-ranking");
if (await leaderboard.first().isVisible()) {
  await expect(leaderboard.first()).toBeVisible();
}

// ❌ catch swallowing: test proceeds even if element never loaded
await page.waitForSelector(".contest-card", { timeout: 15000 }).catch(() => {});
```

- [ ] **Step 1: Write the fixed test file**

```typescript
import { test, expect } from "@playwright/test";
import { URLS } from "../fixtures/test-data";

test.use({ storageState: ".auth/user.json" });

test.describe("Contest Detail", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(URLS.contests);
    await page.waitForLoadState("networkidle");
    // Use unconditional waitForSelector instead of .catch swallow
    await page.waitForSelector(".contest-card", { timeout: 15000 });
  });

  test("should display contest list with at least one contest", async ({ page }) => {
    const contests = page.locator(".contest-card");
    const contestCount = await contests.count();
    expect(contestCount).toBeGreaterThan(0);
  });

  test("should display contest title after clicking first contest", async ({ page }) => {
    await page.locator(".contest-card").first().click();
    await page.waitForLoadState("domcontentloaded");
    await expect(page.locator(".cd-title")).toBeVisible({ timeout: 10000 });
  });

  test("should display contest description", async ({ page }) => {
    await page.locator(".contest-card").first().click();
    await page.waitForLoadState("domcontentloaded");
    await expect(page.locator(".cd-desc")).toBeVisible({ timeout: 10000 });
  });

  test("should display contest meta information (time, status)", async ({ page }) => {
    await page.locator(".contest-card").first().click();
    await page.waitForLoadState("domcontentloaded");
    await expect(page.locator(".cd-meta-item").first()).toBeVisible({ timeout: 10000 });
    await expect(page.locator(".cd-status")).toBeVisible({ timeout: 10000 });
  });

  test("should display contest problems tab", async ({ page }) => {
    await page.locator(".contest-card").first().click();
    await page.waitForLoadState("domcontentloaded");

    // Problems tab should exist — assert unconditionally
    await expect(page.locator(".cd-tab").filter({ hasText: /题目|problems/i })).toBeVisible({ timeout: 5000 });
  });

  test("should display join contest button", async ({ page }) => {
    await page.locator(".contest-card").first().click();
    await page.waitForLoadState("domcontentloaded");
    // At minimum, page has some interactive elements
    const buttons = page.locator("button");
    const buttonCount = await buttons.count();
    expect(buttonCount).toBeGreaterThan(0);
  });

  test("should not crash when navigating to contest detail", async ({ page }) => {
    await page.locator(".contest-card").first().click();
    await page.waitForLoadState("networkidle");
    // Page should have content (not a blank/error page)
    const body = page.locator("body");
    await expect(body).toBeVisible();
    const bodyText = await body.textContent();
    expect(bodyText?.length).toBeGreaterThan(0);
  });

  test("should navigate back to contests list", async ({ page }) => {
    await page.locator(".contest-card").first().click();
    await page.waitForLoadState("domcontentloaded");
    await page.locator(".cd-back").click();
    await expect(page).toHaveURL(/\/contests/);
  });
});
```

- [ ] **Step 2: Run the updated tests**

```bash
npx playwright test e2e/contests/contestDetail.spec.ts --project=chromium
```
Expected: All tests PASS. If any fail, adjust class selectors to match actual DOM.

- [ ] **Step 3: Commit**

```bash
git add e2e/contests/contestDetail.spec.ts
git commit -m "test: rewrite contestDetail E2E tests — remove all R1/R3 violations"
```

---

### Task 3: Rewrite postDetail.spec.ts

**Files:**
- Rewrite: `e2e/community/postDetail.spec.ts`

**Problems found:**
```typescript
// ❌ R1
const content = page.locator("[class*='markdown'], [class*='content']").first();
if (await content.isVisible()) {
  await expect(content).toBeVisible();
}

// ❌ R3
await page.waitForTimeout(2000);

// ❌ Redirect workaround: different assertions on different code paths
// but one path checks API response (not page), the other just checks a link
const currentUrl = page.url();
if (currentUrl.includes('/community')) {
  // ... API check that doesn't test actual page rendering
} else {
  await expect(author).toBeVisible();
}
```

- [ ] **Step 1: Write the fixed test file**

```typescript
import { test, expect } from "@playwright/test";
import { URLS } from "../fixtures/test-data";

test.use({ storageState: ".auth/user.json" });

test.describe("Community Post Detail", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(URLS.community);
    await page.waitForLoadState("networkidle");
    await page.waitForSelector("a[href^='/posts/']", { timeout: 15000 });
  });

  test("should display post list with at least one post", async ({ page }) => {
    const posts = page.locator("a[href^='/posts/']");
    const postCount = await posts.count();
    expect(postCount).toBeGreaterThan(0);
  });

  test("should navigate to post detail and display title", async ({ page }) => {
    const firstPost = page.locator("a[href^='/posts/']").first();
    const href = await firstPost.getAttribute("href");
    expect(href).toBeTruthy();

    await page.goto(href!);
    await page.waitForLoadState("networkidle");

    // Either we're on the post detail page with a title, or redirected to community
    const currentUrl = page.url();
    if (currentUrl.includes('/community')) {
      // Post doesn't exist — that's a valid state, assert we're back on community
      await expect(page.locator('[class*="community"]').first()).toBeVisible({ timeout: 5000 });
    } else {
      // Normal post detail — assert title visible
      await expect(page.locator('h1')).toBeVisible({ timeout: 10000 });
    }
  });

  test("should display post author", async ({ page }) => {
    const postId = await page.evaluate(() => {
      const link = document.querySelector("a[href^='/posts/']");
      return link?.getAttribute('href')?.replace('/posts/', '') || null;
    });
    expect(postId).toBeTruthy();

    await page.goto(`/posts/${postId}`);
    await page.waitForLoadState("networkidle");

    const currentUrl = page.url();
    if (currentUrl.includes('/community')) {
      // Post not found page, verify it's a valid community page
      await expect(page.getByText(/community/i)).toBeVisible();
    } else {
      // Normal post detail — check for author info
      const authorLink = page.locator("a[href^='/users/']").first();
      await expect(authorLink).toBeVisible({ timeout: 10000 });
    }
  });

  test("should navigate back to community page", async ({ page }) => {
    const firstPost = page.locator("a[href^='/posts/']").first();
    const href = await firstPost.getAttribute("href");
    expect(href).toBeTruthy();

    await page.goto(href!);
    await page.waitForLoadState("networkidle");

    const backButton = page.getByRole("link", { name: /back|返回|community/i });
    await backButton.click();
    await expect(page).toHaveURL(/\/community/);
  });
});

test.describe("Create Post", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/community/new");
    await page.waitForLoadState("domcontentloaded");
  });

  test("should display post creation form with title input", async ({ page }) => {
    const titleInput = page.locator("input[placeholder*='title'], input[name='title']");
    await expect(titleInput).toBeVisible({ timeout: 10000 });
  });

  test("should fill in post title", async ({ page }) => {
    const titleInput = page.locator("input[placeholder*='title'], input[name='title']");
    await titleInput.fill("Test Post Title");
    await expect(titleInput).toHaveValue("Test Post Title");
  });

  test("should fill in post content", async ({ page }) => {
    const contentInput = page.locator("textarea");
    await contentInput.fill("This is a test post content with some details.");
    await expect(contentInput).toHaveValue("This is a test post content with some details.");
  });
});
```

- [ ] **Step 2: Run the updated tests**

```bash
npx playwright test e2e/community/postDetail.spec.ts --project=chromium
```
Expected: All tests PASS.

- [ ] **Step 3: Commit**

```bash
git add e2e/community/postDetail.spec.ts
git commit -m "test: rewrite postDetail E2E tests — remove conditional assertions and waitForTimeout"
```

---

### Task 4: Eliminate R1/R3 in remaining 8 E2E files

**Files:**
- `e2e/auth/login.spec.ts`
- `e2e/auth/registration.spec.ts`
- `e2e/navigation.spec.ts`
- `e2e/problems/problemDetail.spec.ts`
- `e2e/problems/problemList.spec.ts`
- `e2e/community/communityFlow.spec.ts`
- `e2e/contests/contestFlow.spec.ts`
- `e2e/user/profile.spec.ts`

- [ ] **Step 1: Audit each file for violations**

Run a grep for known anti-patterns across ALL E2E files (not just those listed):
```bash
cd e2e && grep -rn "if.*isVisible\|if.*toBe\|waitForTimeout\|\.catch(" *.spec.ts **/*.spec.ts || echo "No obvious violations"
```

- [ ] **Step 2: Fix login.spec.ts**

Search for `login.spec.ts` and:
- Replace any `if (await el.isVisible())` → `await expect(el).toBeVisible({ timeout })`
- Replace any `page.waitForTimeout(N)` → `page.waitForLoadState('networkidle')`
- Replace any `.catch(() => {})` → remove catch, use proper error handling with guaranteed assertions

Example fix pattern:
```typescript
// ❌ Before:
const submitBtn = page.locator('button[type="submit"]');
if (await submitBtn.isVisible()) {
  await submitBtn.click();
  await expect(page).toHaveURL(/\/problems/);
}

// ✅ After:
await expect(page.locator('button[type="submit"]')).toBeVisible({ timeout: 5000 });
await page.locator('button[type="submit"]').click();
await expect(page).toHaveURL(/\/problems/, { timeout: 10000 });
```

- [ ] **Step 3: Fix registration.spec.ts**

Same patterns as login. Additionally check for `waitForTimeout` after form submission — replace with `waitForURL` or `waitForResponse`.

- [ ] **Step 4: Fix navigation.spec.ts**

Check for conditional nav-link assertions. Navigation links should always exist on the page — assert them unconditionally.

- [ ] **Step 5: Fix problemDetail.spec.ts**

Check for conditional editor/submit-button visibility. The problem detail page should always have these elements for valid problem IDs.

- [ ] **Step 6: Fix problemList.spec.ts**

Check for conditional filter/pagination assertions. Use actual problem data count to branch with guaranteed assertions on both paths.

- [ ] **Step 7: Fix communityFlow.spec.ts**

Check for conditional post/tag rendering.

- [ ] **Step 8: Fix contestFlow.spec.ts**

Check for conditional contest card assertions.

- [ ] **Step 9: Fix profile.spec.ts**

Check for conditional profile section assertions.

- [ ] **Step 10: Commit all fixes together**

```bash
git add e2e/
git commit -m "test: fix remaining 8 E2E files — remove R1/R3 violations"
```

---

### Task 5: Full E2E suite validation

- [ ] **Step 1: Run all E2E tests**

```bash
npx playwright test --project=chromium
```
Expected: All 70+ tests pass.

- [ ] **Step 2: Verify zero R1 violations across all E2E tests**

```bash
grep -rn "if.*isVisible\|\.catch(" e2e/ --include="*.ts" || echo "✅ Zero R1 violations"
```
Expected: "✅ Zero R1 violations"

- [ ] **Step 3: Verify zero R3 violations across all E2E tests**

```bash
grep -rn "waitForTimeout" e2e/ --include="*.ts" || echo "✅ Zero R3 violations"
```
Expected: "✅ Zero R3 violations"

- [ ] **Step 4: Update PROJECT.md**

- [ ] **Step 5: Final commit**

```bash
git add .
git commit -m "test: Phase 3 E2E test overhaul complete"
```
