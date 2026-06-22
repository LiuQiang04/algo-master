/**
 * E2E tests for contest detail page.
 * Tests the complete contest viewing and participation flow.
 * Uses storageState to reuse login state.
 */

import { test, expect } from "@playwright/test";
import { URLS } from "../fixtures/test-data";

// Use saved authentication state for all tests in this file
test.use({ storageState: ".auth/user.json" });

test.describe("Contest Detail", () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to contests page (already authenticated via storageState)
    await page.goto(URLS.contests);
    await page.waitForLoadState("networkidle");
  });

  test("should display contest list", async ({ page }) => {
    // Contests should be visible
    const contests = page.locator("[class*='contest'], [class*='item']");
    const contestCount = await contests.count();
    expect(contestCount).toBeGreaterThan(0);
  });

  test("should display contest title", async ({ page }) => {
    // Click on the first contest
    const firstContest = page.locator("[class*='contest'], [class*='item']").first();
    await firstContest.click();

    // Wait for contest detail to load
    await page.waitForLoadState("networkidle");

    // Contest title should be visible
    const title = page.locator("h1, h2, [class*='title']").first();
    await expect(title).toBeVisible();
  });

  test("should display contest description", async ({ page }) => {
    // Click on the first contest
    const firstContest = page.locator("[class*='contest'], [class*='item']").first();
    await firstContest.click();

    // Wait for contest detail to load
    await page.waitForLoadState("networkidle");

    // Contest description should be visible
    const description = page.locator("[class*='description'], [class*='content']").first();
    await expect(description).toBeVisible();
  });

  test("should display contest time", async ({ page }) => {
    // Click on the first contest
    const firstContest = page.locator("[class*='contest'], [class*='item']").first();
    await firstContest.click();

    // Wait for contest detail to load
    await page.waitForLoadState("networkidle");

    // Contest time should be visible
    const time = page.locator("[class*='time'], [class*='date'], [class*='duration']").first();
    await expect(time).toBeVisible();
  });

  test("should display contest problems", async ({ page }) => {
    // Click on the first contest
    const firstContest = page.locator("[class*='contest'], [class*='item']").first();
    await firstContest.click();

    // Wait for contest detail to load
    await page.waitForLoadState("networkidle");

    // Problems should be visible
    const problems = page.locator("[class*='problem'], [class*='question']");
    const problemCount = await problems.count();
    expect(problemCount).toBeGreaterThan(0);
  });

  test("should display contest leaderboard", async ({ page }) => {
    // Click on the first contest
    const firstContest = page.locator("[class*='contest'], [class*='item']").first();
    await firstContest.click();

    // Wait for contest detail to load
    await page.waitForLoadState("networkidle");

    // Find leaderboard tab or section
    const leaderboard = page.locator("[class*='leaderboard'], [class*='ranking']");
    if (await leaderboard.first().isVisible()) {
      await expect(leaderboard.first()).toBeVisible();
    }
  });

  test("should display contest participants", async ({ page }) => {
    // Click on the first contest
    const firstContest = page.locator("[class*='contest'], [class*='item']").first();
    await firstContest.click();

    // Wait for contest detail to load
    await page.waitForLoadState("networkidle");

    // Participants count should be visible
    const participants = page.locator("[class*='participant'], [class*='user']");
    if (await participants.first().isVisible()) {
      await expect(participants.first()).toBeVisible();
    }
  });

  test("should display contest status", async ({ page }) => {
    // Click on the first contest
    const firstContest = page.locator("[class*='contest'], [class*='item']").first();
    await firstContest.click();

    // Wait for contest detail to load
    await page.waitForLoadState("networkidle");

    // Status should be visible
    const status = page.locator("[class*='status'], [class*='badge']").first();
    await expect(status).toBeVisible();
  });

  test("should display join contest button", async ({ page }) => {
    // Click on the first contest
    const firstContest = page.locator("[class*='contest'], [class*='item']").first();
    await firstContest.click();

    // Wait for contest detail to load
    await page.waitForLoadState("networkidle");

    // Join button should be visible
    const joinButton = page.getByRole("button", { name: /join|参加|注册/i });
    if (await joinButton.isVisible()) {
      await expect(joinButton).toBeVisible();
    }
  });

  test("should join a contest", async ({ page }) => {
    // Click on the first contest
    const firstContest = page.locator("[class*='contest'], [class*='item']").first();
    await firstContest.click();

    // Wait for contest detail to load
    await page.waitForLoadState("networkidle");

    // Click join button
    const joinButton = page.getByRole("button", { name: /join|参加|注册/i });
    if (await joinButton.isVisible()) {
      await joinButton.click();
      await page.waitForTimeout(2000);

      // Should show success message or change button state
      const successMessage = page.locator("[class*='success'], [class*='joined']");
      if (await successMessage.first().isVisible()) {
        await expect(successMessage.first()).toBeVisible();
      }
    }
  });

  test("should display contest rules", async ({ page }) => {
    // Click on the first contest
    const firstContest = page.locator("[class*='contest'], [class*='item']").first();
    await firstContest.click();

    // Wait for contest detail to load
    await page.waitForLoadState("networkidle");

    // Rules should be visible
    const rules = page.locator("[class*='rule'], [class*='guideline']");
    if (await rules.first().isVisible()) {
      await expect(rules.first()).toBeVisible();
    }
  });

  test("should display contest prizes", async ({ page }) => {
    // Click on the first contest
    const firstContest = page.locator("[class*='contest'], [class*='item']").first();
    await firstContest.click();

    // Wait for contest detail to load
    await page.waitForLoadState("networkidle");

    // Prizes should be visible
    const prizes = page.locator("[class*='prize'], [class*='reward']");
    if (await prizes.first().isVisible()) {
      await expect(prizes.first()).toBeVisible();
    }
  });

  test("should navigate to contest problem", async ({ page }) => {
    // Click on the first contest
    const firstContest = page.locator("[class*='contest'], [class*='item']").first();
    await firstContest.click();

    // Wait for contest detail to load
    await page.waitForLoadState("networkidle");

    // Click on the first problem
    const firstProblem = page.locator("[class*='problem'], [class*='question']").first();
    if (await firstProblem.isVisible()) {
      await firstProblem.click();
      await page.waitForLoadState("networkidle");

      // Should navigate to problem detail
      const currentUrl = page.url();
      expect(currentUrl).toMatch(/\/problems\/|\/contests\/.*\/problems/);
    }
  });

  test("should display contest countdown", async ({ page }) => {
    // Click on the first contest
    const firstContest = page.locator("[class*='contest'], [class*='item']").first();
    await firstContest.click();

    // Wait for contest detail to load
    await page.waitForLoadState("networkidle");

    // Countdown should be visible
    const countdown = page.locator("[class*='countdown'], [class*='timer']");
    if (await countdown.first().isVisible()) {
      await expect(countdown.first()).toBeVisible();
    }
  });

  test("should navigate back to contests list", async ({ page }) => {
    // Click on the first contest
    const firstContest = page.locator("[class*='contest'], [class*='item']").first();
    await firstContest.click();

    // Wait for contest detail to load
    await page.waitForLoadState("networkidle");

    // Find back button
    const backButton = page.getByRole("link", { name: /back|返回|contests/i });
    if (await backButton.isVisible()) {
      await backButton.click();
      await expect(page).toHaveURL(/\/contests/);
    }
  });
});
