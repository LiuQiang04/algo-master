import { test, expect } from "@playwright/test";
import { URLS } from "../fixtures/test-data";

test.use({ storageState: ".auth/user.json" });

test.describe("Contest Detail", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(URLS.contests);
    await page.waitForLoadState("networkidle");
    // Wait for contest cards to render unconditionally
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

    // Tabs should exist unconditionally
    await expect(page.locator(".cd-tab").filter({ hasText: "概览" })).toBeVisible({ timeout: 5000 });
    await expect(page.locator(".cd-tab").filter({ hasText: "题目" })).toBeVisible({ timeout: 5000 });
    await expect(page.locator(".cd-tab").filter({ hasText: "排行榜" })).toBeVisible({ timeout: 5000 });
  });

  test("should display problem overview section", async ({ page }) => {
    await page.locator(".contest-card").first().click();
    await page.waitForLoadState("domcontentloaded");

    // Overview tab shows problem overview card
    await expect(page.locator(".cd-card-title").filter({ hasText: "题目概览" })).toBeVisible({ timeout: 5000 });
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

    // Page should have content (not a blank/error page)
    const body = page.locator("body");
    await expect(body).toBeVisible();
    const bodyText = await body.textContent();
    expect(bodyText?.length).toBeGreaterThan(0);
  });
});
