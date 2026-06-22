/**
 * Authentication setup for Playwright E2E tests.
 * Runs once before the entire test suite to authenticate and save session state.
 * This is a setup test that creates the storage state file.
 */

import { test as setup, expect } from "@playwright/test";
import { URLS, TEST_USERS } from "./fixtures/test-data";

const authFile = ".auth/user.json";

setup("authenticate", async ({ page }) => {
  console.log("[Auth Setup] Starting authentication");

  // Navigate to login page
  await page.goto(URLS.login);
  await page.waitForLoadState("networkidle");

  // Fill in login form using test user credentials
  await page.getByPlaceholder("Enter your username or email").fill(TEST_USERS.valid.email);
  await page.getByPlaceholder("Enter your password").fill(TEST_USERS.valid.password);

  // Submit the form
  await page.getByRole("button", { name: "Sign In" }).click();

  // Wait for successful login redirect
  await page.waitForURL("**/community", { timeout: 15000 });

  // Verify we're logged in
  await expect(page).toHaveURL(/\/community/);

  // Save the authentication state
  await page.context().storageState({ path: authFile });

  console.log("[Auth Setup] Authentication successful. Session saved to .auth/user.json");
});
