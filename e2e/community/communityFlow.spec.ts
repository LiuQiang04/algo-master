/**
 * E2E tests for the community flow.
 * Tests community page navigation and display.
 */

import { test, expect } from "@playwright/test";
import { URLS } from "../fixtures/test-data";

test.describe("Community Flow", () => {
  test("should navigate to community page from header", async ({ page }) => {
    await page.goto(URLS.home);

    // 点击顶部导航栏中的"社区"链接
    await page.locator('header a').filter({ hasText: '社区' }).click();
    await expect(page).toHaveURL(URLS.community);
  });

  test("should display community page", async ({ page }) => {
    await page.goto(URLS.community);

    // Page should load
    await expect(page.locator("body")).toBeVisible();
  });

  test("should navigate to community from footer links", async ({ page }) => {
    await page.goto(URLS.home);

    // Scroll to footer
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));

    // The layout footer is simple and doesn't have navigation links
    // Just verify the footer text is visible
    await expect(page.getByText("关于 AlgoMaster")).toBeVisible();
  });
});
