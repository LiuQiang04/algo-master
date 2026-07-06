import { test, expect } from '@playwright/test';
import { URLS } from '../fixtures/test-data';

test.use({ storageState: '.auth/user.json' });

test.describe('Gamification Pages', () => {
  test('成就页面加载并显示标题', async ({ page }) => {
    await page.goto(URLS.achievements);
    await page.waitForLoadState('networkidle');
    await expect(page.getByText('成就系统')).toBeVisible({ timeout: 10000 });
  });

  test('成就页面分类筛选可点击', async ({ page }) => {
    await page.goto(URLS.achievements);
    await page.waitForLoadState('networkidle');
    const contestFilter = page.getByText('竞赛').first();
    if (await contestFilter.isVisible().catch(() => false)) {
      await contestFilter.click();
      await expect(contestFilter).toBeVisible();
    }
  });

  test('排行榜页面加载并显示标签页', async ({ page }) => {
    await page.goto(URLS.leaderboard);
    await page.waitForLoadState('networkidle');
    await expect(page.getByText('排行榜')).toBeVisible({ timeout: 10000 });
    const friendTab = page.getByText('好友排行');
    if (await friendTab.isVisible().catch(() => false)) {
      await friendTab.click();
    }
    const regionTab = page.getByText('地区排行');
    if (await regionTab.isVisible().catch(() => false)) {
      await regionTab.click();
    }
  });

  test('每日挑战页面加载', async ({ page }) => {
    await page.goto(URLS['daily-challenge']);
    await page.waitForLoadState('networkidle');
    await expect(page.getByText('每日挑战')).toBeVisible({ timeout: 10000 });
  });

  test('虚拟商店页面加载并切换标签页', async ({ page }) => {
    await page.goto(URLS['virtual-items']);
    await page.waitForLoadState('networkidle');
    await expect(page.getByText('虚拟商店')).toBeVisible({ timeout: 10000 });
    const titleTab = page.getByText('称号');
    if (await titleTab.isVisible().catch(() => false)) {
      await titleTab.click();
    }
  });

  test('积分中心页面加载', async ({ page }) => {
    await page.goto(URLS.points || '/points');
    await page.waitForLoadState('networkidle');
    await expect(page.getByText('积分中心')).toBeVisible({ timeout: 10000 });
  });
});
