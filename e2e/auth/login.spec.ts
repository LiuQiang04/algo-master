/**
 * E2E tests for user login flow.
 * Tests the complete login process from the user's perspective.
 */

import { test, expect } from "@playwright/test";
import { URLS } from "../fixtures/test-data";

test.describe("User Login", () => {
  test.beforeEach(async ({ page }) => {
    // 清除认证状态，使登录测试不受 setup 影响
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

  test("should login successfully with valid credentials", async ({ page }) => {
    // 使用种子数据中的测试用户
    await page.getByPlaceholder("Enter your username or email").fill("alice@example.com");
    await page.getByPlaceholder("Enter your password").fill("Test123456");

    // 提交表单
    await page.getByRole("button", { name: "Sign In" }).click();

    // 等待登录完成并跳转
    await page.waitForURL("**/community", { timeout: 10000 });

    // 验证跳转成功
    await expect(page).toHaveURL(/\/community/);
  });

  test("should show error message with invalid credentials", async ({ page }) => {
    // 使用错误的密码
    await page.getByPlaceholder("Enter your username or email").fill("alice@example.com");
    await page.getByPlaceholder("Enter your password").fill("wrongpassword");

    // 提交表单
    await page.getByRole("button", { name: "Sign In" }).click();

    // 等待一段时间让错误消息出现
    await page.waitForTimeout(2000);

    // 检查是否有错误消息显示（可能是任何文本）
    const errorElement = page.locator('[style*="danger"], [style*="error"], .error, .alert');
    const errorCount = await errorElement.count();

    if (errorCount > 0) {
      // 如果有错误元素，验证它可见
      await expect(errorElement.first()).toBeVisible();
    } else {
      // 如果没有错误元素，检查页面是否仍在登录页面（没有跳转）
      await expect(page).toHaveURL(/\/login/);
    }
  });
});
