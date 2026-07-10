import { test, expect } from '@playwright/test';
import { URLS } from '../fixtures/test-data';

test.use({ storageState: '.auth/user.json' });

test.describe('Gamification Pages', () => {
  test('成就页面加载并显示筛选按钮', async ({ page }) => {
    await page.goto(URLS.achievements);
    await page.waitForLoadState('networkidle');
    await expect(page.getByRole('heading', { name: '成就系统' })).toBeVisible({ timeout: 10000 });
    // Category filter buttons are always rendered
    await expect(page.getByText('全部')).toBeVisible({ timeout: 5000 });
    await expect(page.getByText('竞赛')).toBeVisible({ timeout: 5000 });
  });

  test('排行榜页面加载并显示标签页', async ({ page }) => {
    await page.goto(URLS.leaderboard);
    await page.waitForLoadState('networkidle');
    await expect(page.getByRole('heading', { name: '排行榜' })).toBeVisible({ timeout: 10000 });
    // Tab buttons should exist unconditionally
    await expect(page.getByText('好友排行')).toBeVisible({ timeout: 5000 });
    await expect(page.getByText('地区排行')).toBeVisible({ timeout: 5000 });
  });

  test('每日挑战页面加载', async ({ page }) => {
    await page.goto(URLS['daily-challenge']);
    await page.waitForLoadState('networkidle');
    await expect(page.getByRole('heading', { name: '每日挑战' }).first()).toBeVisible({ timeout: 10000 });
  });

  test('虚拟商店页面加载并显示标签页', async ({ page }) => {
    await page.goto(URLS['virtual-items']);
    await page.waitForLoadState('networkidle');
    await expect(page.getByText('虚拟商店')).toBeVisible({ timeout: 10000 });
    // Tab buttons are always rendered
    await expect(page.getByText('称号')).toBeVisible({ timeout: 5000 });
    await expect(page.getByText('头像框')).toBeVisible({ timeout: 5000 });
  });

  test('积分中心页面加载', async ({ page }) => {
    await page.goto(URLS.points);
    await page.waitForLoadState('networkidle');
    await expect(page.getByText('积分中心')).toBeVisible({ timeout: 10000 });
  });
});
