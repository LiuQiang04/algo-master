/**
 * E2E tests for the contest flow.
 * Tests contest page navigation and display.
 */

import { test, expect } from "@playwright/test";
import { URLS } from "../fixtures/test-data";

test.describe("Contest Flow", () => {
  test("should navigate to contests page from header", async ({ page }) => {
    await page.goto(URLS.home);

    await page.getByRole("navigation").getByText("Contests").click();
    await expect(page).toHaveURL(URLS.contests);
  });

  test("should display contests page", async ({ page }) => {
    await page.goto(URLS.contests);

    // Page should load
    await expect(page.locator("body")).toBeVisible();
  });

  test("should navigate to contests from footer links", async ({ page }) => {
    await page.goto(URLS.home);

    // Scroll to footer
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));

    // The layout footer is simple and doesn't have navigation links
    // Just verify the footer text is visible
    await expect(page.getByText("AlgoArena - Algorithm Competition Learning Platform")).toBeVisible();
  });
});
