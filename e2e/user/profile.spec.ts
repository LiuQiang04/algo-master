import { test, expect } from "@playwright/test";
import { URLS } from "../fixtures/test-data";

test.use({ storageState: ".auth/user.json" });

test.describe("User Profile", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(URLS.profile);
    // Wait for profile content to load
    await page.waitForSelector(".profile-name", { timeout: 15000 });
  });

  test("should navigate to profile page", async ({ page }) => {
    await expect(page).toHaveURL(/\/profile/);
  });

  test("should display user name", async ({ page }) => {
    const username = page.locator(".profile-name");
    await expect(username).toBeVisible();
  });

  test("should display user avatar", async ({ page }) => {
    const avatar = page.locator(".profile-avatar");
    await expect(avatar).toBeVisible();
  });

  test("should display user level", async ({ page }) => {
    const level = page.locator(".profile-level");
    await expect(level).toBeVisible();
  });

  test("should display edit profile button", async ({ page }) => {
    const editButton = page.locator(".profile-edit-btn");
    await expect(editButton).toBeVisible();
  });

  test("should display user statistics", async ({ page }) => {
    const statsGrid = page.locator(".profile-stats-grid");
    await expect(statsGrid).toBeVisible();
  });

  test("should open edit profile form when clicking edit button", async ({ page }) => {
    const editButton = page.locator(".profile-edit-btn");
    await editButton.click();

    // Edit form should be visible after clicking
    const editForm = page.locator(".profile-edit-modal, .modal").first();
    await expect(editForm).toBeVisible({ timeout: 5000 });
  });

  test("should cancel profile editing", async ({ page }) => {
    const editButton = page.locator(".profile-edit-btn");
    await editButton.click();

    // Wait for modal to appear
    const editForm = page.locator(".profile-edit-modal, .modal").first();
    await expect(editForm).toBeVisible({ timeout: 5000 });

    // Click cancel
    const cancelButton = page.getByRole("button", { name: /cancel|取消/ });
    await cancelButton.click();

    // Modal should close
    await expect(editForm).not.toBeVisible({ timeout: 5000 });
  });
});
