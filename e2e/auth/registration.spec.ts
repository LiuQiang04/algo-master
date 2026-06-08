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
    await expect(page.getByText("注册 AlgoMaster 账号")).toBeVisible();

    // Check form fields exist
    await expect(page.getByPlaceholder("用户名")).toBeVisible();
    await expect(page.getByPlaceholder("邮箱地址")).toBeVisible();
    await expect(page.getByPlaceholder("密码")).toBeVisible();
    await expect(page.getByPlaceholder("确认密码")).toBeVisible();

    // Check submit button
    await expect(page.getByRole("button", { name: "注册" })).toBeVisible();
  });

  test("should have a link to the login page", async ({ page }) => {
    const loginLink = page.getByText("立即登录");
    await expect(loginLink).toBeVisible();
    await expect(loginLink).toHaveAttribute("href", "/login");
  });

  test("should navigate to login page when clicking the login link", async ({ page }) => {
    await page.getByText("立即登录").click();
    await expect(page).toHaveURL(URLS.login);
    await expect(page.getByText("登录到 AlgoMaster")).toBeVisible();
  });

  test("should fill in registration form fields", async ({ page }) => {
    await page.getByPlaceholder("用户名").fill("newuser");
    await page.getByPlaceholder("邮箱地址").fill("new@example.com");
    await page.getByPlaceholder("密码").fill("password123");
    await page.getByPlaceholder("确认密码").fill("password123");

    // Verify values are set
    await expect(page.getByPlaceholder("用户名")).toHaveValue("newuser");
    await expect(page.getByPlaceholder("邮箱地址")).toHaveValue("new@example.com");
  });

  test("should have required attributes on form fields", async ({ page }) => {
    // Check that fields are required
    await expect(page.getByPlaceholder("用户名")).toHaveAttribute("required", "");
    await expect(page.getByPlaceholder("邮箱地址")).toHaveAttribute("required", "");
    await expect(page.getByPlaceholder("密码")).toHaveAttribute("required", "");
    await expect(page.getByPlaceholder("确认密码")).toHaveAttribute("required", "");
  });

  test("should have correct input types", async ({ page }) => {
    await expect(page.getByPlaceholder("用户名")).toHaveAttribute("type", "text");
    await expect(page.getByPlaceholder("邮箱地址")).toHaveAttribute("type", "email");
    await expect(page.getByPlaceholder("密码")).toHaveAttribute("type", "password");
    await expect(page.getByPlaceholder("确认密码")).toHaveAttribute("type", "password");
  });

  test("should have terms and conditions checkbox", async ({ page }) => {
    const checkbox = page.getByLabel(/我同意/);
    await expect(checkbox).toBeVisible();
    await expect(checkbox).toHaveAttribute("required", "");
  });

  test("should display terms and privacy policy links", async ({ page }) => {
    await expect(page.getByText("服务条款")).toBeVisible();
    await expect(page.getByText("隐私政策")).toBeVisible();
  });
});
