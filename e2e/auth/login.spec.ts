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
    await expect(page.getByText("登录到 AlgoMaster")).toBeVisible();

    // Check form fields exist
    await expect(page.getByPlaceholder("邮箱地址")).toBeVisible();
    await expect(page.getByPlaceholder("密码")).toBeVisible();

    // Check submit button
    await expect(page.getByRole("button", { name: "登录" })).toBeVisible();
  });

  test("should have a link to the registration page", async ({ page }) => {
    const registerLink = page.getByText("立即注册");
    await expect(registerLink).toBeVisible();
    await expect(registerLink).toHaveAttribute("href", "/register");
  });

  test("should navigate to register page when clicking the register link", async ({ page }) => {
    await page.getByText("立即注册").click();
    await expect(page).toHaveURL(URLS.register);
    await expect(page.getByText("注册 AlgoMaster 账号")).toBeVisible();
  });

  test("should fill in login form fields", async ({ page }) => {
    await page.getByPlaceholder("邮箱地址").fill("test@example.com");
    await page.getByPlaceholder("密码").fill("password123");

    // Verify values are set
    await expect(page.getByPlaceholder("邮箱地址")).toHaveValue("test@example.com");
    await expect(page.getByPlaceholder("密码")).toHaveValue("password123");
  });

  test("should have required attributes on form fields", async ({ page }) => {
    await expect(page.getByPlaceholder("邮箱地址")).toHaveAttribute("required", "");
    await expect(page.getByPlaceholder("密码")).toHaveAttribute("required", "");
  });

  test("should have remember me checkbox", async ({ page }) => {
    const checkbox = page.getByLabel("记住我");
    await expect(checkbox).toBeVisible();
  });

  test("should have forgot password link", async ({ page }) => {
    const forgotLink = page.getByText("忘记密码？");
    await expect(forgotLink).toBeVisible();
  });

  test("should have correct input types", async ({ page }) => {
    await expect(page.getByPlaceholder("邮箱地址")).toHaveAttribute("type", "email");
    await expect(page.getByPlaceholder("密码")).toHaveAttribute("type", "password");
  });
});
