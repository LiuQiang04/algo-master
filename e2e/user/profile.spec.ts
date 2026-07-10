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
    await page.locator(".profile-edit-btn").click();

    // Wait for modal overlay to appear
    const modalOverlay = page.locator(".modal-overlay");
    await expect(modalOverlay).toBeVisible({ timeout: 5000 });
  });

  test("should cancel profile editing", async ({ page }) => {
    await page.locator(".profile-edit-btn").click();

    // Wait for modal to appear
    const modalOverlay = page.locator(".modal-overlay");
    await expect(modalOverlay).toBeVisible({ timeout: 5000 });

    // Click cancel button inside modal
    await page.locator(".btn-cancel").click();

    // Modal should close
    await expect(modalOverlay).not.toBeVisible({ timeout: 5000 });
  });
});
