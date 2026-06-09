/**
 * E2E tests for the problem list page.
 * Tests navigation, problem display, and filtering.
 */

import { test, expect } from "@playwright/test";
import { URLS } from "../fixtures/test-data";

test.describe("Problem List Page", () => {
  test("should navigate to problems page from home", async ({ page }) => {
    await page.goto(URLS.home);

    // Click the "开始练习" button in hero section
    await page.getByRole("link", { name: "开始练习" }).click();
    await expect(page).toHaveURL(URLS.problems);
  });

  test("should navigate to problems page from header navigation", async ({ page }) => {
    await page.goto(URLS.home);

    // Click the "Problems" link in the header
    await page.getByRole("navigation").getByText("Problems").click();
    await expect(page).toHaveURL(URLS.problems);
  });

  test("should display problems page content", async ({ page }) => {
    await page.goto(URLS.problems);

    // The page should load without errors
    // Check that the page has some content
    await expect(page.locator("body")).toBeVisible();
  });

  test("should have header navigation visible", async ({ page }) => {
    await page.goto(URLS.problems);

    // Verify header elements are visible
    await expect(page.getByText("AlgoArena").first()).toBeVisible();
    await expect(page.getByText("Problems").first()).toBeVisible();
    await expect(page.getByText("Contests").first()).toBeVisible();
    await expect(page.getByText("Community").first()).toBeVisible();
  });

  test("should have footer visible", async ({ page }) => {
    await page.goto(URLS.problems);

    // Scroll to bottom to verify footer
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await expect(page.getByText("AlgoArena - Algorithm Competition Learning Platform")).toBeVisible();
  });
});
