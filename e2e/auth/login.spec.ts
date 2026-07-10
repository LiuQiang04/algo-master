import { test, expect } from "@playwright/test";
import { URLS } from "../fixtures/test-data";

test.describe("User Login", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(URLS.login);
    await page.evaluate(() => {
      localStorage.clear();
      document.cookie.split(";").forEach(c => {
        document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
      });
    });
    await page.goto(URLS.login);
  });

  test("should display the login form", async ({ page }) => {
    await expect(page.getByText("Sign in to your account")).toBeVisible();
    await expect(page.getByPlaceholder("Enter your username or email")).toBeVisible();
    await expect(page.getByPlaceholder("Enter your password")).toBeVisible();
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

    await expect(page.getByPlaceholder("Enter your username or email")).toHaveValue("test@example.com");
    await expect(page.getByPlaceholder("Enter your password")).toHaveValue("password123");
  });

  test("should have correct input types", async ({ page }) => {
    await expect(page.getByPlaceholder("Enter your username or email")).toHaveAttribute("type", "text");
    await expect(page.getByPlaceholder("Enter your password")).toHaveAttribute("type", "password");
  });

  test("should login successfully with valid credentials", async ({ page }) => {
    await page.getByPlaceholder("Enter your username or email").fill("alice@example.com");
    await page.getByPlaceholder("Enter your password").fill("Test123456");

    await page.getByRole("button", { name: "Sign In" }).click();

    await page.waitForURL("**/community", { timeout: 10000 });
    await expect(page).toHaveURL(/\/community/);
  });

  test("should show error message with invalid credentials", async ({ page }) => {
    await page.getByPlaceholder("Enter your username or email").fill("alice@example.com");
    await page.getByPlaceholder("Enter your password").fill("wrongpassword");

    await page.getByRole("button", { name: "Sign In" }).click();

    // Wait for the error message to appear after failed login
    const errorEl = page.locator('[style*="danger"]').first();
    await expect(errorEl).toBeVisible({ timeout: 10000 });
    // Verify we stay on the login page (no redirect)
    await expect(page).toHaveURL(/\/login/);
  });
});
