/**
 * E2E tests for user login flow.
 * Tests the complete login process from the user's perspective.
 */

import { test, expect } from "@playwright/test";
import { URLS } from "../fixtures/test-data";

test.describe("User Login", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(URLS.login);
  });

  test("should display the login form", async ({ page }) => {
    // Check page title
    await expect(page.getByText("Sign in to your account")).toBeVisible();

    // Check form fields exist
    await expect(page.getByPlaceholder("Enter your username or email")).toBeVisible();
    await expect(page.getByPlaceholder("Enter your password")).toBeVisible();

    // Check submit button
    await expect(page.getByRole("button", { name: "Sign In" })).toBeVisible();
  });

  test("should have a link to the registration page", async ({ page }) => {
    const registerLink = page.getByText("Sign up");
    await expect(registerLink).toBeVisible();
    await expect(registerLink).toHaveAttribute("href", "/register");
  });

  test("should navigate to register page when clicking the register link", async ({ page }) => {
    await page.getByText("Sign up").click();
    await expect(page).toHaveURL(URLS.register);
    await expect(page.getByText("Create your account")).toBeVisible();
  });

  test("should fill in login form fields", async ({ page }) => {
    await page.getByPlaceholder("Enter your username or email").fill("test@example.com");
    await page.getByPlaceholder("Enter your password").fill("password123");

    // Verify values are set
    await expect(page.getByPlaceholder("Enter your username or email")).toHaveValue("test@example.com");
    await expect(page.getByPlaceholder("Enter your password")).toHaveValue("password123");
  });

  test("should have correct input types", async ({ page }) => {
    await expect(page.getByPlaceholder("Enter your username or email")).toHaveAttribute("type", "text");
    await expect(page.getByPlaceholder("Enter your password")).toHaveAttribute("type", "password");
  });
});
