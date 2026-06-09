/**
 * E2E tests for site navigation.
 * Tests that all major pages are accessible and navigation works correctly.
 */

import { test, expect } from "@playwright/test";
import { URLS } from "./fixtures/test-data";

test.describe("Site Navigation", () => {
  test("should load the home page", async ({ page }) => {
    await page.goto(URLS.home);

    await expect(page.getByText("算法竞赛学习平台")).toBeVisible();
    await expect(page.getByText("AlgoArena").first()).toBeVisible();
  });

  test("should display all main features on home page", async ({ page }) => {
    await page.goto(URLS.home);

    await expect(page.getByText("丰富的题库")).toBeVisible();
    await expect(page.getByText("即时评测")).toBeVisible();
    await expect(page.getByText("竞赛系统")).toBeVisible();
    await expect(page.getByText("社区交流")).toBeVisible();
    await expect(page.getByText("进度追踪")).toBeVisible();
  });

  test("should display statistics on home page", async ({ page }) => {
    await page.goto(URLS.home);

    await expect(page.getByText("1,200+")).toBeVisible();
    await expect(page.getByText("50,000+")).toBeVisible();
    await expect(page.getByText("2,000,000+")).toBeVisible();
    await expect(page.getByText("300+")).toBeVisible();
  });

  test("should navigate between all main pages", async ({ page }) => {
    // Start at home
    await page.goto(URLS.home);
    await expect(page.getByText("算法竞赛学习平台")).toBeVisible();

    // Go to problems
    await page.getByRole("navigation").getByText("Problems").click();
    await expect(page).toHaveURL(URLS.problems);

    // Go to contests
    await page.getByRole("navigation").getByText("Contests").click();
    await expect(page).toHaveURL(URLS.contests);

    // Go to community
    await page.getByRole("navigation").getByText("Community").click();
    await expect(page).toHaveURL(URLS.community);

    // Go back to home via logo
    await page.getByText("AlgoArena").first().click();
    await expect(page).toHaveURL(URLS.home);
  });

  test("should navigate to login and register from header", async ({ page }) => {
    await page.goto(URLS.home);

    // Go to login
    await page.getByRole("link", { name: "Login" }).click();
    await expect(page).toHaveURL(URLS.login);

    // Go back to home
    await page.goto(URLS.home);

    // Go to register
    await page.getByRole("link", { name: "Register" }).click();
    await expect(page).toHaveURL(URLS.register);
  });

  test("should have consistent header across pages", async ({ page }) => {
    const pages = [URLS.home, URLS.login, URLS.register];

    for (const url of pages) {
      await page.goto(url);

      // Logo should always be visible
      await expect(page.getByText("AlgoArena").first()).toBeVisible();
    }
  });

  test("should have consistent footer across pages", async ({ page }) => {
    const pages = [URLS.home, URLS.login];

    for (const url of pages) {
      await page.goto(url);

      // Scroll to footer
      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));

      // Footer text should always be visible
      await expect(page.getByText("AlgoArena - Algorithm Competition Learning Platform")).toBeVisible();
    }
  });

  test("should handle browser back and forward navigation", async ({ page }) => {
    await page.goto(URLS.home);
    await page.goto(URLS.login);
    await page.goto(URLS.register);

    // Go back
    await page.goBack();
    await expect(page).toHaveURL(URLS.login);

    // Go back again
    await page.goBack();
    await expect(page).toHaveURL(URLS.home);

    // Go forward
    await page.goForward();
    await expect(page).toHaveURL(URLS.login);
  });
});
