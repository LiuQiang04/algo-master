/**
 * E2E tests for the community flow.
 * Tests community page navigation and display.
 */

import { test, expect } from "@playwright/test";
import { URLS } from "../fixtures/test-data";

test.describe("Community Flow", () => {
  test("should navigate to community page from header", async ({ page }) => {
    await page.goto(URLS.home);

    await page.getByRole("navigation").getByText("社区").click();
    await expect(page).toHaveURL(URLS.community);
  });

  test("should display community page", async ({ page }) => {
    await page.goto(URLS.community);

    // Page should load
    await expect(page.locator("body")).toBeVisible();
  });

  test("should navigate to community from footer links", async ({ page }) => {
    await page.goto(URLS.home);

    // Scroll to footer
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));

    // Click community link in footer
    const footerCommunityLinks = page.getByText("社区");
    await footerCommunityLinks.last().click();
    await expect(page).toHaveURL(URLS.community);
  });
});
