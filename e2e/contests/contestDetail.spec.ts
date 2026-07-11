import { test, expect } from "@playwright/test";
import { URLS } from "../fixtures/test-data";

test.use({ storageState: ".auth/user.json" });

test.describe("Contest Detail", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(URLS.contests);
    await page.waitForLoadState("networkidle");
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

  test("should display contest tabs", async ({ page }) => {
    await page.locator(".contest-card").first().click();
    await page.waitForLoadState("domcontentloaded");

    await expect(page.locator(".cd-tab").filter({ hasText: "概览" })).toBeVisible({ timeout: 5000 });
    await expect(page.locator(".cd-tab").filter({ hasText: "题目" })).toBeVisible({ timeout: 5000 });
    await expect(page.locator(".cd-tab").filter({ hasText: "排行榜" })).toBeVisible({ timeout: 5000 });
  });

  test("should display problem overview section", async ({ page }) => {
    await page.locator(".contest-card").first().click();
    await page.waitForLoadState("domcontentloaded");

    await expect(page.locator(".cd-card-title").filter({ hasText: "题目概览" })).toBeVisible({ timeout: 5000 });
  });

  test("should display ranking section or empty state", async ({ page }) => {
    await page.locator(".contest-card").first().click();
    await page.waitForLoadState("domcontentloaded");

    // Ranking section always renders — either top 5 list or empty state
    const rankingSection = page.locator(".cd-card-title").filter({ hasText: "实时排名" });
    await expect(rankingSection).toBeVisible({ timeout: 5000 });
  });

  test("should join an upcoming contest if available", async ({ page }) => {
    const joinButtons = page.locator(".contest-card__btn").filter({ hasText: "立即报名" });
    const joinCount = await joinButtons.count();

    if (joinCount > 0) {
      // Listen for the join API request (success 200 or already-joined 400)
      const responsePromise = page.waitForResponse(
        (res) => res.url().includes('/contests/') && res.url().includes('/join')
      );
      await joinButtons.first().click();
      // Wait for the API response
      const response = await responsePromise;
      // 200 = new join, 400 = already joined — both are valid server responses
      expect([200, 400]).toContain(response.status());
      // Verify the page is still in a valid state after the API call
      await expect(page.locator(".cl-title")).toHaveText("竞赛中心");
    } else {
      // No joinable upcoming contests — verify contests page still renders
      await expect(page.locator(".cl-title")).toHaveText("竞赛中心");
      const cards = page.locator(".contest-card");
      const cardCount = await cards.count();
      expect(cardCount).toBeGreaterThan(0);
    }
  });

  test("should navigate back to contests list", async ({ page }) => {
    await page.locator(".contest-card").first().click();
    await page.waitForLoadState("domcontentloaded");

    await page.locator(".cd-back").click();
    await expect(page).toHaveURL(/\/contests/);
  });

  test("should not crash when navigating to contest detail", async ({ page }) => {
    await page.locator(".contest-card").first().click();
    await page.waitForLoadState("networkidle");

    const body = page.locator("body");
    await expect(body).toBeVisible();
    const bodyText = await body.textContent();
    expect(bodyText?.length).toBeGreaterThan(0);
  });
});
