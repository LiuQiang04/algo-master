/**
 * E2E tests for user registration flow.
 * Tests the complete registration process from the user's perspective.
 */

import { test, expect } from "@playwright/test";
import { URLS } from "../fixtures/test-data";

test.describe("User Registration", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(URLS.register);
  });

  test("should display the registration form", async ({ page }) => {
    // Check page title
    await expect(page.getByText("Create your account")).toBeVisible();

    // Check form fields exist
    await expect(page.getByPlaceholder("Choose a username")).toBeVisible();
    await expect(page.getByPlaceholder("Enter your email")).toBeVisible();
    await expect(page.getByPlaceholder("At least 6 characters")).toBeVisible();
    await expect(page.getByPlaceholder("Re-enter your password")).toBeVisible();

    // Check submit button
    await expect(page.getByRole("button", { name: "Create Account" })).toBeVisible();
  });

  test("should have a link to the login page", async ({ page }) => {
    const loginLink = page.getByText("Sign in");
    await expect(loginLink).toBeVisible();
    await expect(loginLink).toHaveAttribute("href", "/login");
  });

  test("should navigate to login page when clicking the login link", async ({ page }) => {
    await page.getByText("Sign in").click();
    await expect(page).toHaveURL(URLS.login);
    await expect(page.getByText("Sign in to your account")).toBeVisible();
  });

  test("should fill in registration form fields", async ({ page }) => {
    await page.getByPlaceholder("Choose a username").fill("newuser");
    await page.getByPlaceholder("Enter your email").fill("new@example.com");
    await page.getByPlaceholder("At least 6 characters").fill("password123");
    await page.getByPlaceholder("Re-enter your password").fill("password123");

    // Verify values are set
    await expect(page.getByPlaceholder("Choose a username")).toHaveValue("newuser");
    await expect(page.getByPlaceholder("Enter your email")).toHaveValue("new@example.com");
  });

  test("should have correct input types", async ({ page }) => {
    await expect(page.getByPlaceholder("Choose a username")).toHaveAttribute("type", "text");
    await expect(page.getByPlaceholder("Enter your email")).toHaveAttribute("type", "email");
    await expect(page.getByPlaceholder("At least 6 characters")).toHaveAttribute("type", "password");
    await expect(page.getByPlaceholder("Re-enter your password")).toHaveAttribute("type", "password");
  });
});
