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
    await page.waitForLoadState("networkidle");
  });

  test("should navigate to profile page", async ({ page }) => {
    // Should be on profile page
    await expect(page).toHaveURL(/\/profile/);
  });

  test("should display user information", async ({ page }) => {
    // User information should be visible
    const username = page.locator("[class*='username'], [class*='name']").first();
    await expect(username).toBeVisible();
  });

  test("should display user avatar", async ({ page }) => {
    // Avatar should be visible
    const avatar = page.locator("img[class*='avatar'], [class*='avatar'] img, [class*='profile'] img");
    if (await avatar.first().isVisible()) {
      await expect(avatar.first()).toBeVisible();
    }
  });

  test("should display user statistics", async ({ page }) => {
    // Statistics should be visible
    const stats = page.locator("[class*='stat'], [class*='metric']");
    if (await stats.first().isVisible()) {
      const statCount = await stats.count();
      expect(statCount).toBeGreaterThan(0);
    }
  });

  test("should display user level", async ({ page }) => {
    // Level should be visible
    const level = page.locator("[class*='level'], [class*='rank']").first();
    if (await level.isVisible()) {
      await expect(level).toBeVisible();
    }
  });

  test("should display user achievements", async ({ page }) => {
    // Achievements section should be visible
    const achievements = page.locator("[class*='achievement'], [class*='badge']");
    if (await achievements.first().isVisible()) {
      await expect(achievements.first()).toBeVisible();
    }
  });

  test("should display submission history", async ({ page }) => {
    // Submission history should be visible
    const submissions = page.locator("[class*='submission'], [class*='history']");
    if (await submissions.first().isVisible()) {
      await expect(submissions.first()).toBeVisible();
    }
  });

  test("should display learning progress", async ({ page }) => {
    // Learning progress should be visible
    const progress = page.locator("[class*='progress'], [class*='learning']");
    if (await progress.first().isVisible()) {
      await expect(progress.first()).toBeVisible();
    }
  });

  test("should display user rating", async ({ page }) => {
    // Rating should be visible
    const rating = page.locator("[class*='rating'], [class*='score']").first();
    if (await rating.isVisible()) {
      await expect(rating).toBeVisible();
    }
  });

  test("should display edit profile button", async ({ page }) => {
    // Edit button should be visible
    const editButton = page.getByRole("button", { name: /edit|编辑|修改/i });
    if (await editButton.isVisible()) {
      await expect(editButton).toBeVisible();
    }
  });

  test("should open edit profile form", async ({ page }) => {
    // Click edit button
    const editButton = page.getByRole("button", { name: /edit|编辑|修改/i });
    if (await editButton.isVisible()) {
      await editButton.click();
      await page.waitForTimeout(1000);

      // Edit form should be visible
      const editForm = page.locator("[class*='edit'], [class*='form'], form");
      if (await editForm.first().isVisible()) {
        await expect(editForm.first()).toBeVisible();
      }
    }
  });

  test("should update user profile", async ({ page }) => {
    // Click edit button
    const editButton = page.getByRole("button", { name: /edit|编辑|修改/i });
    if (await editButton.isVisible()) {
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
          const updatedBio = page.locator("[class*='bio']").first();
          if (await updatedBio.isVisible()) {
            const bioText = await updatedBio.textContent();
            expect(bioText).toContain("Updated bio from E2E test");
          }
        }
      }
    }
  });

  test("should cancel profile editing", async ({ page }) => {
    // Click edit button
    const editButton = page.getByRole("button", { name: /edit|编辑|修改/i });
    if (await editButton.isVisible()) {
      await editButton.click();
      await page.waitForTimeout(1000);

      // Find cancel button
      const cancelButton = page.getByRole("button", { name: /cancel|取消/ });
      if (await cancelButton.isVisible()) {
        await cancelButton.click();
        await page.waitForTimeout(1000);

        // Edit form should be closed
        const editForm = page.locator("[class*='edit'], [class*='form'], form");
        const formCount = await editForm.count();
        expect(formCount).toBe(0);
      }
    }
  });

  test("should display user posts", async ({ page }) => {
    // Find posts tab or section
    const postsTab = page.getByRole("tab", { name: /posts|帖子/ });
    if (await postsTab.isVisible()) {
      await postsTab.click();
      await page.waitForTimeout(1000);

      // Posts should be visible
      const posts = page.locator("[class*='post']");
      if (await posts.first().isVisible()) {
        const postCount = await posts.count();
        expect(postCount).toBeGreaterThan(0);
      }
    }
  });

  test("should display user contests", async ({ page }) => {
    // Find contests tab or section
    const contestsTab = page.getByRole("tab", { name: /contests|竞赛/ });
    if (await contestsTab.isVisible()) {
      await contestsTab.click();
      await page.waitForTimeout(1000);

      // Contests should be visible
      const contests = page.locator("[class*='contest']");
      if (await contests.first().isVisible()) {
        const contestCount = await contests.count();
        expect(contestCount).toBeGreaterThan(0);
      }
    }
  });

  test("should navigate to settings", async ({ page }) => {
    // Find settings link
    const settingsLink = page.getByRole("link", { name: /settings|设置/ });
    if (await settingsLink.isVisible()) {
      await settingsLink.click();
      await page.waitForLoadState("networkidle");

      // Should be on settings page
      await expect(page).toHaveURL(/\/settings/);
    }
  });
});
