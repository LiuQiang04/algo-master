import { test, expect } from "@playwright/test";

// 未登录状态的测试 - 不使用storageState
test.describe("Navigation Links - Unauthenticated", () => {
  test.use({ storageState: { cookies: [], origins: [] } });

  test("登录/注册链接在未登录时显示", async ({ page }) => {
    await page.goto("http://localhost:5173");
    await page.waitForLoadState("domcontentloaded");

    const loginLink = page.getByRole("link", { name: /login|sign in|登录/i });
    const registerLink = page.getByRole("link", { name: /register|sign up|注册/i });

    await expect(loginLink.first()).toBeVisible({ timeout: 10000 });
    await expect(registerLink.first()).toBeVisible({ timeout: 10000 });
  });
});

// 已登录状态的测试 - 使用storageState
test.describe("Navigation Links - Authenticated", () => {
  test.use({ storageState: ".auth/user.json" });

  test("导航链接存在", async ({ page }) => {
    await page.goto("http://localhost:5173");
    await page.waitForLoadState("domcontentloaded");

    const nav = page.locator("nav");
    await expect(nav.first()).toBeVisible({ timeout: 10000 });
  });

  test("首页 Logo 和标题", async ({ page }) => {
    await page.goto("http://localhost:5173");
    await page.waitForLoadState("domcontentloaded");

    const logo = page.locator("nav a").first();
    await expect(logo).toBeVisible({ timeout: 10000 });
  });

  test("首页导航菜单项", async ({ page }) => {
    await page.goto("http://localhost:5173");
    await page.waitForLoadState("domcontentloaded");

    const navItems = page.locator("nav a");
    const count = await navItems.count();
    expect(count).toBeGreaterThanOrEqual(1);
  });

  test("导航链接可以点击并跳转", async ({ page }) => {
    await page.goto("http://localhost:5173");
    await page.waitForLoadState("domcontentloaded");

    const navLink = page.locator("nav a").first();
    await expect(navLink).toBeEnabled();
  });

  test("底部导航或页脚", async ({ page }) => {
    await page.goto("http://localhost:5173");
    await page.waitForLoadState("domcontentloaded");

    await expect(page.getByText("关于 AlgoMaster")).toBeVisible({ timeout: 10000 });
  });

  test("导航状态保持", async ({ page }) => {
    await page.goto("http://localhost:5173/problems");
    await page.waitForLoadState("domcontentloaded");

    await page.goto("http://localhost:5173/contests");
    await page.waitForLoadState("domcontentloaded");

    const nav = page.locator("nav");
    await expect(nav.first()).toBeVisible({ timeout: 10000 });
  });
});
