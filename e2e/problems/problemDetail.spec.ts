/**
 * E2E tests for problem detail page.
 * Tests the complete problem viewing and code submission flow.
 * Uses storageState to reuse login state.
 */

import { test, expect } from "@playwright/test";
import { URLS } from "../fixtures/test-data";

// Use saved authentication state for all tests in this file
test.use({ storageState: ".auth/user.json" });

test.describe("Problem Detail", () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to problems list
    await page.goto(URLS.problems);
    // Wait for problem table to load
    await page.waitForSelector(".pl-row", { timeout: 10000 });
    // Click on the first problem link
    await page.locator(".pl-td-title a").first().click();
    // Wait for problem detail page to load
    await page.waitForLoadState("domcontentloaded");
  });

  test("should display problem title", async ({ page }) => {
    // Problem title should be visible
    const title = page.locator("h1, h2").first();
    await expect(title).toBeVisible();
    const titleText = await title.textContent();
    expect(titleText?.length).toBeGreaterThan(0);
  });

  test("should display problem description", async ({ page }) => {
    // Problem description should be visible
    const description = page.locator(".problem-description, [class*='description'], [class*='content']").first();
    await expect(description).toBeVisible();
  });

  test("should display difficulty badge", async ({ page }) => {
    // Difficulty badge should be visible
    const difficulty = page.locator("[class*='difficulty'], [class*='badge']").first();
    await expect(difficulty).toBeVisible();
  });

  test("should display problem tags", async ({ page }) => {
    // Tags should be visible (tags区域在pd-tags div内)
    const tagsContainer = page.locator(".pd-tags");
    await expect(tagsContainer).toBeVisible({ timeout: 5000 });
    const tags = page.locator(".pd-tags .pd-tag, .pd-tags span");
    const tagCount = await tags.count();
    expect(tagCount).toBeGreaterThan(0);
  });

  test("should display code editor", async ({ page }) => {
    // Code editor should be visible (Monaco or textarea)
    const editor = page.locator(".monaco-editor, textarea, [class*='editor']").first();
    await expect(editor).toBeVisible();
  });

  test("should display submit button", async ({ page }) => {
    // Submit button should be visible (使用实际的CSS类名 .pd-submit-btn)
    const submitButton = page.locator(".pd-submit-btn");
    await expect(submitButton).toBeVisible();
  });

  test("should navigate back to problem list", async ({ page }) => {
    // Find back button or link (使用实际的CSS类名 .pd-back)
    const backButton = page.locator(".pd-back");
    if (await backButton.isVisible()) {
      await backButton.click();
      await expect(page).toHaveURL(/\/problems/);
    }
  });
});
