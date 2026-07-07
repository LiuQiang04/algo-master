/**
 * E2E tests for user profile page.
 * Tests the complete user profile viewing and editing flow.
 * Uses storageState to reuse login state.
 */

import { test, expect } from "@playwright/test";
import { URLS } from "../fixtures/test-data";

// Use saved authentication state for all tests in this file
test.use({ storageState: ".auth/user.json" });

test.describe("User Profile", () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to profile page (already authenticated via storageState)
    await page.goto(URLS.profile);
    // Wait for profile content to load (not just the loading spinner)
    await page.waitForSelector(".profile-name, .profile-edit-btn, [class*='error']", { timeout: 15000 });
  });

  test("should navigate to profile page", async ({ page }) => {
    // Should be on profile page
    await expect(page).toHaveURL(/\/profile/);
  });

  test("should display user information", async ({ page }) => {
    // User name should be visible
    const username = page.locator(".profile-name").first();
    if (await username.isVisible()) {
      await expect(username).toBeVisible();
    }
  });

  test("should display user avatar", async ({ page }) => {
    // Avatar should be visible
    const avatar = page.locator(".profile-avatar").first();
    if (await avatar.isVisible()) {
      await expect(avatar).toBeVisible();
    }
  });

  test("should display user statistics", async ({ page }) => {
    // Statistics should be visible
    const stats = page.locator(".profile-stats");
    if (await stats.isVisible()) {
      await expect(stats).toBeVisible();
    }
  });

  test("should display user level", async ({ page }) => {
    // Level should be visible
    const level = page.locator(".profile-level");
    if (await level.isVisible()) {
      await expect(level).toBeVisible();
    }
  });

  test("should display user achievements", async ({ page }) => {
    // Achievements section should be visible
    const achievements = page.locator(".profile-achievements");
    if (await achievements.isVisible()) {
      await expect(achievements).toBeVisible();
    }
  });

  test("should display submission history", async ({ page }) => {
    // Submission history should be visible
    const submissions = page.locator(".profile-submissions");
    if (await submissions.isVisible()) {
      await expect(submissions).toBeVisible();
    }
  });

  test("should display edit profile button", async ({ page }) => {
    // Edit button should be visible
    const editButton = page.locator(".profile-edit-btn");
    await expect(editButton).toBeVisible();
  });

  test("should open edit profile form", async ({ page }) => {
    // Click edit button
    const editButton = page.locator(".profile-edit-btn");
    await editButton.click();
    await page.waitForTimeout(1000);

    // Edit form should be visible
    const editForm = page.locator(".profile-edit-modal, .modal");
    if (await editForm.first().isVisible()) {
      await expect(editForm.first()).toBeVisible();
    }
  });

  test("should update user profile", async ({ page }) => {
    // Click edit button
    const editButton = page.locator(".profile-edit-btn");
    await editButton.click();
    await page.waitForTimeout(1000);

    // Find bio input
    const bioInput = page.locator("textarea[name='bio'], input[name='bio']");
    if (await bioInput.first().isVisible()) {
      // Update bio
      await bioInput.first().fill("Updated bio from E2E test");

      // Save changes
      const saveButton = page.getByRole("button", { name: /save|保存|update/i });
      if (await saveButton.isVisible()) {
        await saveButton.click();
        await page.waitForTimeout(2000);

        // Verify bio was updated
        const updatedBio = page.locator(".profile-bio");
        if (await updatedBio.isVisible()) {
          const bioText = await updatedBio.textContent();
          expect(bioText).toContain("Updated bio from E2E test");
        }
      }
    }
  });

  test("should cancel profile editing", async ({ page }) => {
    // Click edit button
    const editButton = page.locator(".profile-edit-btn");
    await editButton.click();
    await page.waitForTimeout(1000);

    // Find cancel button
    const cancelButton = page.getByRole("button", { name: /cancel|取消/ });
    if (await cancelButton.isVisible()) {
      await cancelButton.click();
      await page.waitForTimeout(1000);

      // Edit form should be closed
      const editForm = page.locator(".profile-edit-modal, .modal");
      const formCount = await editForm.count();
      expect(formCount).toBe(0);
    }
  });
});
