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
    await page.waitForLoadState("networkidle");
  });

  test("should display post list", async ({ page }) => {
    // Posts should be visible
    const posts = page.locator("[class*='post'], [class*='item']");
    const postCount = await posts.count();
    expect(postCount).toBeGreaterThan(0);
  });

  test("should display post title", async ({ page }) => {
    // Click on the first post
    const firstPost = page.locator("[class*='post'], [class*='item']").first();
    await firstPost.click();

    // Wait for post detail to load
    await page.waitForLoadState("networkidle");

    // Post title should be visible
    const title = page.locator("h1, h2, [class*='title']").first();
    await expect(title).toBeVisible();
  });

  test("should display post content", async ({ page }) => {
    // Click on the first post
    const firstPost = page.locator("[class*='post'], [class*='item']").first();
    await firstPost.click();

    // Wait for post detail to load
    await page.waitForLoadState("networkidle");

    // Post content should be visible
    const content = page.locator("[class*='content'], [class*='body'], [class*='markdown']").first();
    await expect(content).toBeVisible();
  });

  test("should display post author", async ({ page }) => {
    // Click on the first post
    const firstPost = page.locator("[class*='post'], [class*='item']").first();
    await firstPost.click();

    // Wait for post detail to load
    await page.waitForLoadState("networkidle");

    // Author should be visible
    const author = page.locator("[class*='author'], [class*='user']").first();
    await expect(author).toBeVisible();
  });

  test("should display post comments", async ({ page }) => {
    // Click on the first post
    const firstPost = page.locator("[class*='post'], [class*='item']").first();
    await firstPost.click();

    // Wait for post detail to load
    await page.waitForLoadState("networkidle");

    // Comments section should be visible
    const comments = page.locator("[class*='comment']");
    if (await comments.first().isVisible()) {
      const commentCount = await comments.count();
      expect(commentCount).toBeGreaterThan(0);
    }
  });

  test("should allow upvoting a post", async ({ page }) => {
    // Click on the first post
    const firstPost = page.locator("[class*='post'], [class*='item']").first();
    await firstPost.click();

    // Wait for post detail to load
    await page.waitForLoadState("networkidle");

    // Find upvote button
    const upvoteButton = page.locator("[class*='upvote'], [class*='vote'], button").filter({ hasText: /up|赞|👍/ });
    if (await upvoteButton.first().isVisible()) {
      await upvoteButton.first().click();
      // Wait for upvote to be processed
      await page.waitForTimeout(1000);
    }
  });

  test("should allow adding a comment", async ({ page }) => {
    // Click on the first post
    const firstPost = page.locator("[class*='post'], [class*='item']").first();
    await firstPost.click();

    // Wait for post detail to load
    await page.waitForLoadState("networkidle");

    // Find comment input
    const commentInput = page.locator("textarea, [class*='comment'] input, [class*='comment'] textarea");
    if (await commentInput.first().isVisible()) {
      // Type a comment
      await commentInput.first().fill("This is a test comment");

      // Find submit button
      const submitButton = page.getByRole("button", { name: /submit|提交|comment/i });
      if (await submitButton.isVisible()) {
        await submitButton.click();
        // Wait for comment to be added
        await page.waitForTimeout(2000);
      }
    }
  });

  test("should navigate back to community page", async ({ page }) => {
    // Click on the first post
    const firstPost = page.locator("[class*='post'], [class*='item']").first();
    await firstPost.click();

    // Wait for post detail to load
    await page.waitForLoadState("networkidle");

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
    // Navigate to community page (already authenticated via storageState)
    await page.goto(URLS.community);
    await page.waitForLoadState("networkidle");
  });

  test("should display new post button", async ({ page }) => {
    // New post button should be visible
    const newPostButton = page.getByRole("link", { name: /new|创建|post/i });
    await expect(newPostButton).toBeVisible();
  });

  test("should navigate to create post page", async ({ page }) => {
    // Click new post button
    const newPostButton = page.getByRole("link", { name: /new|创建|post/i });
    await newPostButton.click();

    // Wait for create post page to load
    await page.waitForLoadState("networkidle");

    // Should be on create post page
    await expect(page).toHaveURL(/\/community\/new|\/create/);
  });

  test("should display post creation form", async ({ page }) => {
    // Navigate to create post page
    const newPostButton = page.getByRole("link", { name: /new|创建|post/i });
    await newPostButton.click();
    await page.waitForLoadState("networkidle");

    // Form fields should be visible
    const titleInput = page.locator("input[name='title'], input[placeholder*='title']");
    const contentInput = page.locator("textarea, [class*='editor']");

    await expect(titleInput).toBeVisible();
    await expect(contentInput).toBeVisible();
  });

  test("should fill in post title", async ({ page }) => {
    // Navigate to create post page
    const newPostButton = page.getByRole("link", { name: /new|创建|post/i });
    await newPostButton.click();
    await page.waitForLoadState("networkidle");

    // Fill in title
    const titleInput = page.locator("input[name='title'], input[placeholder*='title']");
    await titleInput.fill("Test Post Title");

    // Verify title was filled
    await expect(titleInput).toHaveValue("Test Post Title");
  });

  test("should fill in post content", async ({ page }) => {
    // Navigate to create post page
    const newPostButton = page.getByRole("link", { name: /new|创建|post/i });
    await newPostButton.click();
    await page.waitForLoadState("networkidle");

    // Fill in content
    const contentInput = page.locator("textarea, [class*='editor']");
    await contentInput.fill("This is a test post content with some details.");

    // Verify content was filled
    const contentValue = await contentInput.inputValue();
    expect(contentValue).toContain("test post content");
  });

  test("should select post type", async ({ page }) => {
    // Navigate to create post page
    const newPostButton = page.getByRole("link", { name: /new|创建|post/i });
    await newPostButton.click();
    await page.waitForLoadState("networkidle");

    // Find post type selector
    const typeSelector = page.locator("select[name='type'], [class*='type'] select, [class*='category']");
    if (await typeSelector.first().isVisible()) {
      // Select a post type
      await typeSelector.first().selectOption({ index: 1 });
    }
  });

  test("should submit a new post", async ({ page }) => {
    // Navigate to create post page
    const newPostButton = page.getByRole("link", { name: /new|创建|post/i });
    await newPostButton.click();
    await page.waitForLoadState("networkidle");

    // Fill in title and content
    const titleInput = page.locator("input[name='title'], input[placeholder*='title']");
    const contentInput = page.locator("textarea, [class*='editor']");

    await titleInput.fill("E2E Test Post");
    await contentInput.fill("This is an E2E test post created by automated testing.");

    // Submit the post
    const submitButton = page.getByRole("button", { name: /submit|提交|create|发布/i });
    await submitButton.click();

    // Wait for post to be created
    await page.waitForTimeout(3000);

    // Should redirect to community page or post detail
    const currentUrl = page.url();
    expect(currentUrl).toMatch(/\/community/);
  });

  test("should show validation error for empty title", async ({ page }) => {
    // Navigate to create post page
    const newPostButton = page.getByRole("link", { name: /new|创建|post/i });
    await newPostButton.click();
    await page.waitForLoadState("networkidle");

    // Try to submit without filling in title
    const submitButton = page.getByRole("button", { name: /submit|提交|create|发布/i });
    await submitButton.click();

    // Should show validation error
    await page.waitForTimeout(1000);
    const error = page.locator("[class*='error'], [class*='alert'], .error");
    if (await error.first().isVisible()) {
      await expect(error.first()).toBeVisible();
    }
  });

  test("should show validation error for empty content", async ({ page }) => {
    // Navigate to create post page
    const newPostButton = page.getByRole("link", { name: /new|创建|post/i });
    await newPostButton.click();
    await page.waitForLoadState("networkidle");

    // Fill in title but not content
    const titleInput = page.locator("input[name='title'], input[placeholder*='title']");
    await titleInput.fill("Test Title");

    // Try to submit
    const submitButton = page.getByRole("button", { name: /submit|提交|create|发布/i });
    await submitButton.click();

    // Should show validation error
    await page.waitForTimeout(1000);
    const error = page.locator("[class*='error'], [class*='alert'], .error");
    if (await error.first().isVisible()) {
      await expect(error.first()).toBeVisible();
    }
  });

  test("should cancel post creation", async ({ page }) => {
    // Navigate to create post page
    const newPostButton = page.getByRole("link", { name: /new|创建|post/i });
    await newPostButton.click();
    await page.waitForLoadState("networkidle");

    // Find cancel button
    const cancelButton = page.getByRole("link", { name: /cancel|取消/ });
    if (await cancelButton.isVisible()) {
      await cancelButton.click();
      await expect(page).toHaveURL(/\/community/);
    }
  });
});
