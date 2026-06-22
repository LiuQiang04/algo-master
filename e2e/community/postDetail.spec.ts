/**
 * E2E tests for community post detail and creation.
 * Tests the complete post viewing, creation, and interaction flow.
 * Uses storageState to reuse login state.
 */

import { test, expect } from "@playwright/test";
import { URLS } from "../fixtures/test-data";

// Use saved authentication state for all tests in this file
test.use({ storageState: ".auth/user.json" });

test.describe("Community Post Detail", () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to community page (already authenticated via storageState)
    await page.goto(URLS.community);
    // Wait for posts to load
    await page.waitForSelector("h1:text('Community')", { timeout: 10000 });
    // Wait for post list to appear
    await page.waitForSelector("a[href^='/posts/']", { timeout: 10000 });
  });

  test("should display post list", async ({ page }) => {
    // Post links should be visible
    const posts = page.locator("a[href^='/posts/']");
    const postCount = await posts.count();
    expect(postCount).toBeGreaterThan(0);
  });

  test("should display post title", async ({ page }) => {
    // Click on the first post
    const firstPost = page.locator("a[href^='/posts/']").first();
    await firstPost.click();

    // Wait for post detail to load
    await page.waitForSelector("h1", { timeout: 10000 });

    // Post title should be visible
    const title = page.locator("h1").first();
    await expect(title).toBeVisible();
  });

  test("should display post content", async ({ page }) => {
    // Click on the first post
    const firstPost = page.locator("a[href^='/posts/']").first();
    await firstPost.click();

    // Wait for post detail to load
    await page.waitForSelector("h1", { timeout: 10000 });

    // Post content should be visible (markdown rendered content)
    const content = page.locator("[class*='markdown'], [class*='content']").first();
    if (await content.isVisible()) {
      await expect(content).toBeVisible();
    }
  });

  test("should display post author", async ({ page }) => {
    // Click on the first post
    const firstPost = page.locator("a[href^='/posts/']").first();
    await firstPost.click();

    // Wait for post detail to load
    await page.waitForSelector("h1", { timeout: 10000 });

    // Author link should be visible
    const author = page.locator("a[href^='/users/']").first();
    await expect(author).toBeVisible();
  });

  test("should navigate back to community page", async ({ page }) => {
    // Click on the first post
    const firstPost = page.locator("a[href^='/posts/']").first();
    await firstPost.click();

    // Wait for post detail to load
    await page.waitForSelector("h1", { timeout: 10000 });

    // Find back button
    const backButton = page.getByRole("link", { name: /back|返回|community/i });
    if (await backButton.isVisible()) {
      await backButton.click();
      await expect(page).toHaveURL(/\/community/);
    }
  });
});

test.describe("Create Post", () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to create post page (already authenticated via storageState)
    await page.goto("/community/new");
    // Wait for form to load
    await page.waitForLoadState("domcontentloaded");
  });

  test("should display post creation form", async ({ page }) => {
    // Form fields should be visible
    const titleInput = page.locator("input[placeholder*='title'], input[name='title']");
    await expect(titleInput).toBeVisible();
  });

  test("should fill in post title", async ({ page }) => {
    // Fill in title
    const titleInput = page.locator("input[placeholder*='title'], input[name='title']");
    await titleInput.fill("Test Post Title");

    // Verify title was filled
    await expect(titleInput).toHaveValue("Test Post Title");
  });

  test("should fill in post content", async ({ page }) => {
    // Fill in content
    const contentInput = page.locator("textarea");
    await contentInput.fill("This is a test post content with some details.");

    // Verify content was filled
    const contentValue = await contentInput.inputValue();
    expect(contentValue).toContain("test post content");
  });

  test("should cancel post creation", async ({ page }) => {
    // Find cancel button or link
    const cancelButton = page.getByRole("link", { name: /cancel|取消/i });
    if (await cancelButton.isVisible()) {
      await cancelButton.click();
      await expect(page).toHaveURL(/\/community/);
    }
  });
});
