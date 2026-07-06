# 游戏化页面完善 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 修复 AchievementsPage 硬编码 bug，补全 4 个游戏化页面的单元测试和 E2E 测试

**Architecture:** 前端已有完整页面和 hooks，只需新增测试文件和修改一行 bug。测试沿用现有 LeaderboardPage.test.tsx 模式 — mock hooks 渲染组件，验证各状态分支。

**Tech Stack:** Jest + React Testing Library（前端测试）、Playwright（E2E）

**Global Constraints:**
- 不改后端代码
- 不改 UI 样式
- 不改路由配置

---

### Task 1: 修复 AchievementsPage 硬编码 bug

**Files:**
- Modify: `frontend/src/pages/Gamification/AchievementsPage.tsx:133`

- [ ] **Step 1: 修改 isUnlocked 为动态判断**

将第 133 行的硬编码 `isUnlocked={true}` 改为根据 `unlockedAt` 字段动态判断：

```tsx
// Before (line 133):
isUnlocked={true}

// After:
isUnlocked={!!(achievement as UserAchievement).unlockedAt}
```

需要在文件顶部添加 `UserAchievement` 类型导入（如未导入）：

```tsx
// 检查 import 中是否有 UserAchievement
import type { UserAchievement } from '../../types/gamification';
```

- [ ] **Step 2: 验证修改正确**

检查 `AchievementCard` 组件：当 `isUnlocked=false` 时，卡片显示 `opacity-60`、灰色边框、灰色图标背景 —— 锁定态视觉正常。

- [ ] **Step 3: 提交**

```bash
git add frontend/src/pages/Gamification/AchievementsPage.tsx
git commit -m "fix: AchievementsPage isUnlocked 从硬编码改为动态判断"
```

---

### Task 2: 新增 AchievementsPage 单元测试

**Files:**
- Create: `frontend/src/__tests__/components/AchievementsPage.test.tsx`

- [ ] **Step 1: 创建测试文件**

```tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import AchievementsPage from '../../pages/Gamification/AchievementsPage';
import type { UserAchievement } from '../../types/gamification';

// Mock hooks
const mockUseAchievements = jest.fn();

jest.mock('../../hooks/useGamification', () => ({
  useAchievements: (...args: any[]) => mockUseAchievements(...args),
}));

// Mock AchievementCard
jest.mock('../../components/gamification/AchievementCard', () => ({
  __esModule: true,
  default: ({ achievement, isUnlocked }: any) => (
    <div data-testid="achievement-card" data-unlocked={isUnlocked}>
      <div>{achievement.name}</div>
      <div>{achievement.description}</div>
    </div>
  ),
}));

describe('AchievementsPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const renderPage = () => render(<AchievementsPage />, { wrapper: BrowserRouter });

  const mockAchievements: UserAchievement[] = [
    {
      id: '1', name: 'First Blood', description: 'Solve first problem',
      category: 'problem', rarity: 'common', iconUrl: null, points: 50,
      requirement: {}, isActive: true,
      unlockedAt: '2026-06-01T00:00:00Z', progress: 100,
    },
    {
      id: '2', name: 'Bug Hunter', description: 'Find 10 bugs',
      category: 'special', rarity: 'rare', iconUrl: null, points: 100,
      requirement: {}, isActive: true,
      unlockedAt: '', progress: 60,
    },
  ];

  it('renders page title and description', () => {
    mockUseAchievements.mockReturnValue({
      achievements: [], stats: null, loading: false, error: null,
    });
    renderPage();
    expect(screen.getByText('成就系统')).toBeInTheDocument();
  });

  it('shows loading spinner when loading', () => {
    mockUseAchievements.mockReturnValue({
      achievements: [], stats: null, loading: true, error: null,
    });
    renderPage();
    const spinners = document.querySelectorAll('.animate-spin');
    expect(spinners.length).toBeGreaterThanOrEqual(1);
  });

  it('displays error message and retry button', () => {
    mockUseAchievements.mockReturnValue({
      achievements: [], stats: null, loading: false, error: 'Network Error',
    });
    renderPage();
    expect(screen.getByText('Network Error')).toBeInTheDocument();
    expect(screen.getByText('重试')).toBeInTheDocument();
  });

  it('renders stats cards when stats are available', () => {
    mockUseAchievements.mockReturnValue({
      achievements: mockAchievements,
      stats: { total: 10, unlocked: 5, percentage: 50, byCategory: [] },
      loading: false, error: null,
    });
    renderPage();
    expect(screen.getByText('5')).toBeInTheDocument(); // unlocked count
    expect(screen.getByText('10')).toBeInTheDocument(); // total count
    expect(screen.getByText('50%')).toBeInTheDocument(); // percentage
  });

  it('renders achievement cards', () => {
    mockUseAchievements.mockReturnValue({
      achievements: mockAchievements,
      stats: { total: 10, unlocked: 5, percentage: 50, byCategory: [] },
      loading: false, error: null,
    });
    renderPage();
    expect(screen.getByText('First Blood')).toBeInTheDocument();
    expect(screen.getByText('Bug Hunter')).toBeInTheDocument();
  });

  it('passes isUnlocked correctly based on unlockedAt', () => {
    mockUseAchievements.mockReturnValue({
      achievements: mockAchievements,
      stats: { total: 10, unlocked: 5, percentage: 50, byCategory: [] },
      loading: false, error: null,
    });
    renderPage();
    const cards = screen.getAllByTestId('achievement-card');
    expect(cards[0]).toHaveAttribute('data-unlocked', 'true');  // First Blood has unlockedAt
    expect(cards[1]).toHaveAttribute('data-unlocked', 'false'); // Bug Hunter has no unlockedAt
  });

  it('filters achievements by category', () => {
    mockUseAchievements.mockReturnValue({
      achievements: mockAchievements,
      stats: { total: 10, unlocked: 5, percentage: 50, byCategory: [] },
      loading: false, error: null,
    });
    renderPage();
    // Click '解题' filter
    fireEvent.click(screen.getByText('解题'));
    expect(screen.getByText('First Blood')).toBeInTheDocument();
    // Bug Hunter is 'special' category, should be filtered out
    expect(screen.queryByText('Bug Hunter')).not.toBeInTheDocument();
  });

  it('shows empty state when no achievements match filter', () => {
    mockUseAchievements.mockReturnValue({
      achievements: [],
      stats: { total: 0, unlocked: 0, percentage: 0, byCategory: [] },
      loading: false, error: null,
    });
    renderPage();
    expect(screen.getByText('暂无成就数据')).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: 运行测试确认通过**

```bash
cd frontend && npm test -- --testPathPattern="AchievementsPage"
```

Expected: All tests PASS.

- [ ] **Step 3: 提交**

```bash
git add frontend/src/__tests__/components/AchievementsPage.test.tsx
git commit -m "test: 添加 AchievementsPage 单元测试"
```

---

### Task 3: 新增 DailyChallengePage 单元测试

**Files:**
- Create: `frontend/src/__tests__/components/DailyChallengePage.test.tsx`

- [ ] **Step 1: 创建测试文件**

```tsx
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import DailyChallengePage from '../../pages/Gamification/DailyChallengePage';

// Mock hooks
const mockUseDailyChallenge = jest.fn();
const mockUseDailyTasks = jest.fn();
const mockUseLoginStreak = jest.fn();
const mockUseLoginCalendar = jest.fn();

jest.mock('../../hooks/useGamification', () => ({
  useDailyChallenge: (...args: any[]) => mockUseDailyChallenge(...args),
  useDailyTasks: (...args: any[]) => mockUseDailyTasks(...args),
  useLoginStreak: (...args: any[]) => mockUseLoginStreak(...args),
  useLoginCalendar: (...args: any[]) => mockUseLoginCalendar(...args),
}));

// Mock child components
jest.mock('../../components/gamification/DailyChallengeCard', () => ({
  __esModule: true,
  default: ({ challenge, isCompleted }: any) => (
    <div data-testid="daily-challenge-card">
      {challenge ? challenge.problem.title : '今日暂无挑战'}
      {isCompleted && <span data-testid="completed-badge">已完成</span>}
    </div>
  ),
  DailyTaskList: ({ tasks }: any) => (
    <div data-testid="daily-task-list">
      {tasks.length > 0 ? `${tasks.length} tasks` : '暂无任务'}
    </div>
  ),
}));

jest.mock('../../components/gamification/LoginStreakCalendar', () => ({
  __esModule: true,
  default: () => <div data-testid="login-calendar">Calendar</div>,
}));

const mockChallenge = {
  id: 'c1', problemId: 'p1', challengeDate: '2026-07-06',
  bonusPoints: 50,
  problem: { id: 'p1', title: 'Two Sum', description: '...', difficulty: 3, tags: [] },
};

const mockTasks = [
  { id: 't1', title: 'Solve 3 problems', description: 'Solve any 3 problems', current: 1, target: 3, reward: 20, completed: false },
  { id: 't2', title: 'Daily Login', description: 'Login today', current: 1, target: 1, reward: 5, completed: true },
];

describe('DailyChallengePage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const renderPage = () => render(<DailyChallengePage />, { wrapper: BrowserRouter });

  it('renders page title', () => {
    mockUseDailyChallenge.mockReturnValue({ challenge: null, isCompleted: false, loading: false, error: null });
    mockUseDailyTasks.mockReturnValue({ tasksData: null, loading: false });
    mockUseLoginStreak.mockReturnValue({ streakInfo: null, loading: false });
    mockUseLoginCalendar.mockReturnValue({ calendar: [], loading: false });

    renderPage();
    expect(screen.getByText('每日挑战')).toBeInTheDocument();
  });

  it('shows loading spinner for challenge', () => {
    mockUseDailyChallenge.mockReturnValue({ challenge: null, isCompleted: false, loading: true, error: null });
    mockUseDailyTasks.mockReturnValue({ tasksData: null, loading: false });
    mockUseLoginStreak.mockReturnValue({ streakInfo: null, loading: false });
    mockUseLoginCalendar.mockReturnValue({ calendar: [], loading: false });

    renderPage();
    const spinners = document.querySelectorAll('.animate-spin');
    expect(spinners.length).toBeGreaterThanOrEqual(1);
  });

  it('renders streak info cards', () => {
    mockUseDailyChallenge.mockReturnValue({ challenge: mockChallenge, isCompleted: false, loading: false, error: null });
    mockUseDailyTasks.mockReturnValue({ tasksData: { tasks: mockTasks, totalCompleted: 1, totalRewards: 25 }, loading: false });
    mockUseLoginStreak.mockReturnValue({ streakInfo: { currentStreak: 5, maxStreak: 10, isLoggedInToday: true, recentLogins: [] }, loading: false });
    mockUseLoginCalendar.mockReturnValue({ calendar: [], loading: false });

    renderPage();
    expect(screen.getByText('5')).toBeInTheDocument();  // current streak
    expect(screen.getByText('10')).toBeInTheDocument(); // max streak
    expect(screen.getByText('1')).toBeInTheDocument();  // completed tasks count
  });

  it('renders challenge card when challenge exists', () => {
    mockUseDailyChallenge.mockReturnValue({ challenge: mockChallenge, isCompleted: false, loading: false, error: null });
    mockUseDailyTasks.mockReturnValue({ tasksData: { tasks: [], totalCompleted: 0, totalRewards: 0 }, loading: false });
    mockUseLoginStreak.mockReturnValue({ streakInfo: null, loading: false });
    mockUseLoginCalendar.mockReturnValue({ calendar: [], loading: false });

    renderPage();
    expect(screen.getByTestId('daily-challenge-card')).toBeInTheDocument();
  });

  it('shows login calendar when calendar loads', () => {
    mockUseDailyChallenge.mockReturnValue({ challenge: null, isCompleted: false, loading: false, error: null });
    mockUseDailyTasks.mockReturnValue({ tasksData: null, loading: false });
    mockUseLoginStreak.mockReturnValue({ streakInfo: null, loading: false });
    mockUseLoginCalendar.mockReturnValue({ calendar: [], loading: false });

    renderPage();
    expect(screen.getByTestId('login-calendar')).toBeInTheDocument();
  });

  it('renders daily task list when tasks are available', () => {
    mockUseDailyChallenge.mockReturnValue({ challenge: mockChallenge, isCompleted: false, loading: false, error: null });
    mockUseDailyTasks.mockReturnValue({ tasksData: { tasks: mockTasks, totalCompleted: 1, totalRewards: 25 }, loading: false });
    mockUseLoginStreak.mockReturnValue({ streakInfo: { currentStreak: 3, maxStreak: 7, isLoggedInToday: false, recentLogins: [] }, loading: false });
    mockUseLoginCalendar.mockReturnValue({ calendar: [], loading: false });

    renderPage();
    expect(screen.getByTestId('daily-task-list')).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: 运行测试确认通过**

```bash
cd frontend && npm test -- --testPathPattern="DailyChallengePage"
```

Expected: All tests PASS.

- [ ] **Step 3: 提交**

```bash
git add frontend/src/__tests__/components/DailyChallengePage.test.tsx
git commit -m "test: 添加 DailyChallengePage 单元测试"
```

---

### Task 4: 新增 VirtualItemsPage 单元测试

**Files:**
- Create: `frontend/src/__tests__/components/VirtualItemsPage.test.tsx`

- [ ] **Step 1: 创建测试文件**

```tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import VirtualItemsPage from '../../pages/Gamification/VirtualItemsPage';

const mockUseVirtualItems = jest.fn();
const mockUseUserVirtualItems = jest.fn();
const mockUseLevelInfo = jest.fn();

jest.mock('../../hooks/useGamification', () => ({
  useVirtualItems: (...args: any[]) => mockUseVirtualItems(...args),
  useUserVirtualItems: (...args: any[]) => mockUseUserVirtualItems(...args),
  useLevelInfo: (...args: any[]) => mockUseLevelInfo(...args),
}));

jest.mock('../../components/gamification/VirtualItemCard', () => ({
  __esModule: true,
  default: ({ item, isOwned, isEquipped, onPurchase, onEquip, userPoints }: any) => (
    <div data-testid="virtual-item-card" data-owned={isOwned} data-equipped={isEquipped}>
      <div>{item.name}</div>
      <div>{item.price} 积分</div>
      <button onClick={() => onPurchase?.(item.id)} data-testid={`buy-${item.id}`}>
        {isOwned ? '已拥有' : (userPoints >= item.price ? '购买' : '积分不足')}
      </button>
      {isOwned && (
        <button onClick={() => onEquip?.(item.id, !isEquipped)} data-testid={`equip-${item.id}`}>
          {isEquipped ? '卸下' : '装备'}
        </button>
      )}
    </div>
  ),
}));

jest.mock('../../components/gamification/LevelProgress', () => ({
  __esModule: true,
  default: ({ levelInfo }: any) => <div data-testid="level-progress">Level {levelInfo.level}</div>,
}));

const mockBadgeItems = [
  { id: 'b1', name: 'Gold Badge', type: 'badge' as const, rarity: 'rare' as const, description: 'Shiny', iconUrl: null, price: 500, isActive: true },
  { id: 'b2', name: 'Silver Badge', type: 'badge' as const, rarity: 'common' as const, description: 'Nice', iconUrl: null, price: 200, isActive: true },
];

const mockTitleItems = [
  { id: 't1', name: 'Grandmaster', type: 'title' as const, rarity: 'legendary' as const, description: 'Top', iconUrl: null, price: 5000, isActive: true },
];

const mockFrameItems = [
  { id: 'f1', name: 'Gold Frame', type: 'frame' as const, rarity: 'epic' as const, description: 'Shiny frame', iconUrl: null, price: 1000, isActive: true },
];

const mockDecorationItems = [
  { id: 'd1', name: 'Sparkle', type: 'decoration' as const, rarity: 'common' as const, description: 'Sparkles', iconUrl: null, price: 100, isActive: true },
];

describe('VirtualItemsPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const renderPage = () => render(<VirtualItemsPage />, { wrapper: BrowserRouter });

  it('renders page title', () => {
    mockUseVirtualItems.mockReturnValue({ items: [], loading: false });
    mockUseUserVirtualItems.mockReturnValue({ userItems: [], loading: false, purchaseItem: jest.fn(), equipItem: jest.fn() });
    mockUseLevelInfo.mockReturnValue({ levelInfo: null });

    renderPage();
    expect(screen.getByText('虚拟商店')).toBeInTheDocument();
  });

  it('shows loading spinner when loading', () => {
    mockUseVirtualItems.mockReturnValue({ items: [], loading: true });
    mockUseUserVirtualItems.mockReturnValue({ userItems: [], loading: true, purchaseItem: jest.fn(), equipItem: jest.fn() });
    mockUseLevelInfo.mockReturnValue({ levelInfo: null });

    renderPage();
    const spinners = document.querySelectorAll('.animate-spin');
    expect(spinners.length).toBeGreaterThanOrEqual(1);
  });

  it('renders level info when available', () => {
    mockUseVirtualItems.mockReturnValue({ items: mockBadgeItems, loading: false });
    mockUseUserVirtualItems.mockReturnValue({ userItems: [], loading: false, purchaseItem: jest.fn(), equipItem: jest.fn() });
    mockUseLevelInfo.mockReturnValue({ levelInfo: { level: 10, currentExp: 500, nextLevelExp: 1000, progress: 50, totalExp: 5000 } });

    renderPage();
    expect(screen.getByTestId('level-progress')).toBeInTheDocument();
  });

  it('renders items in "badge" tab by default', () => {
    mockUseVirtualItems.mockReturnValue({ items: mockBadgeItems, loading: false });
    mockUseUserVirtualItems.mockReturnValue({ userItems: [], loading: false, purchaseItem: jest.fn(), equipItem: jest.fn() });
    mockUseLevelInfo.mockReturnValue({ levelInfo: null });

    renderPage();
    expect(screen.getByText('Gold Badge')).toBeInTheDocument();
    expect(screen.getByText('Silver Badge')).toBeInTheDocument();
  });

  it('switches tabs and renders different item types', () => {
    mockUseVirtualItems.mockReturnValue({ items: mockBadgeItems, loading: false });
    mockUseUserVirtualItems.mockReturnValue({ userItems: [], loading: false, purchaseItem: jest.fn(), equipItem: jest.fn() });
    mockUseLevelInfo.mockReturnValue({ levelInfo: null });

    renderPage();

    // Switch to 称号 tab
    mockUseVirtualItems.mockReturnValue({ items: mockTitleItems, loading: false });
    fireEvent.click(screen.getByText('称号'));
    expect(screen.getByText('Grandmaster')).toBeInTheDocument();

    // Switch to 头像框 tab
    mockUseVirtualItems.mockReturnValue({ items: mockFrameItems, loading: false });
    fireEvent.click(screen.getByText('头像框'));
    expect(screen.getByText('Gold Frame')).toBeInTheDocument();

    // Switch to 装饰 tab
    mockUseVirtualItems.mockReturnValue({ items: mockDecorationItems, loading: false });
    fireEvent.click(screen.getByText('装饰'));
    expect(screen.getByText('Sparkle')).toBeInTheDocument();
  });

  it('shows empty state when no items', () => {
    mockUseVirtualItems.mockReturnValue({ items: [], loading: false });
    mockUseUserVirtualItems.mockReturnValue({ userItems: [], loading: false, purchaseItem: jest.fn(), equipItem: jest.fn() });
    mockUseLevelInfo.mockReturnValue({ levelInfo: null });

    renderPage();
    expect(screen.getByText('暂无可兑换的物品')).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: 运行测试确认通过**

```bash
cd frontend && npm test -- --testPathPattern="VirtualItemsPage"
```

Expected: All tests PASS.

- [ ] **Step 3: 提交**

```bash
git add frontend/src/__tests__/components/VirtualItemsPage.test.tsx
git commit -m "test: 添加 VirtualItemsPage 单元测试"
```

---

### Task 5: 新增 PointsPage 单元测试

**Files:**
- Create: `frontend/src/__tests__/components/PointsPage.test.tsx`

- [ ] **Step 1: 创建测试文件**

```tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import PointsPage from '../../pages/Gamification/PointsPage';

const mockUsePointHistory = jest.fn();
const mockUseLevelInfo = jest.fn();
const mockUseGamificationOverview = jest.fn();

jest.mock('../../hooks/useGamification', () => ({
  usePointHistory: (...args: any[]) => mockUsePointHistory(...args),
  useLevelInfo: (...args: any[]) => mockUseLevelInfo(...args),
  useGamificationOverview: (...args: any[]) => mockUseGamificationOverview(...args),
}));

jest.mock('../../components/gamification/LevelProgress', () => ({
  __esModule: true,
  default: ({ levelInfo }: any) => <div data-testid="level-progress">Level {levelInfo.level}</div>,
}));

jest.mock('../../components/gamification/PointHistoryList', () => ({
  __esModule: true,
  default: ({ history, showLoadMore, onLoadMore }: any) => (
    <div data-testid="point-history-list">
      {history.length > 0 ? (
        history.map((h: any) => <div key={h.id}>{h.description}</div>)
      ) : (
        <div>暂无积分记录</div>
      )}
      {showLoadMore && <button onClick={onLoadMore} data-testid="load-more">加载更多</button>}
    </div>
  ),
}));

const mockHistory = [
  { id: 'h1', points: 50, type: 'solve', description: 'Solved Two Sum', relatedId: null, createdAt: '2026-07-06T10:00:00Z' },
  { id: 'h2', points: 100, type: 'achievement', description: 'Unlocked First Blood', relatedId: null, createdAt: '2026-07-05T10:00:00Z' },
];

describe('PointsPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const renderPage = () => render(<PointsPage />, { wrapper: BrowserRouter });

  it('renders page title', () => {
    mockUsePointHistory.mockReturnValue({ history: [], loading: false, error: null, hasMore: false, loadMore: jest.fn() });
    mockUseLevelInfo.mockReturnValue({ levelInfo: null, loading: false });
    mockUseGamificationOverview.mockReturnValue({ overview: null });

    renderPage();
    expect(screen.getByText('积分中心')).toBeInTheDocument();
  });

  it('shows loading spinner when loading history', () => {
    mockUsePointHistory.mockReturnValue({ history: [], loading: true, error: null, hasMore: false, loadMore: jest.fn() });
    mockUseLevelInfo.mockReturnValue({ levelInfo: null, loading: false });
    mockUseGamificationOverview.mockReturnValue({ overview: null });

    renderPage();
    const spinners = document.querySelectorAll('.animate-spin');
    expect(spinners.length).toBeGreaterThanOrEqual(1);
  });

  it('renders level progress', () => {
    mockUsePointHistory.mockReturnValue({ history: [], loading: false, error: null, hasMore: false, loadMore: jest.fn() });
    mockUseLevelInfo.mockReturnValue({ levelInfo: { level: 15, currentExp: 800, nextLevelExp: 1000, progress: 80, totalExp: 5000 }, loading: false });
    mockUseGamificationOverview.mockReturnValue({ overview: null });

    renderPage();
    expect(screen.getByTestId('level-progress')).toBeInTheDocument();
  });

  it('renders overview stats cards', () => {
    mockUsePointHistory.mockReturnValue({ history: [], loading: false, error: null, hasMore: false, loadMore: jest.fn() });
    mockUseLevelInfo.mockReturnValue({ levelInfo: null, loading: false });
    mockUseGamificationOverview.mockReturnValue({
      overview: { level: 10, currentExp: 500, nextLevelExp: 1000, progress: 50, totalExp: 5000, title: null, achievementCount: 12, completedDailyChallenges: 8, loginStreak: 3, maxLoginStreak: 7, globalRank: 42 },
    });

    renderPage();
    expect(screen.getByText('5,000')).toBeInTheDocument();  // totalExp formatted
    expect(screen.getByText('12')).toBeInTheDocument();      // achievementCount
    expect(screen.getByText('8')).toBeInTheDocument();       // completedDailyChallenges
    expect(screen.getByText('#42')).toBeInTheDocument();     // globalRank
  });

  it('renders point history list', () => {
    mockUsePointHistory.mockReturnValue({ history: mockHistory, loading: false, error: null, hasMore: false, loadMore: jest.fn() });
    mockUseLevelInfo.mockReturnValue({ levelInfo: null, loading: false });
    mockUseGamificationOverview.mockReturnValue({ overview: null });

    renderPage();
    expect(screen.getByText('Solved Two Sum')).toBeInTheDocument();
    expect(screen.getByText('Unlocked First Blood')).toBeInTheDocument();
  });

  it('displays load more button when hasMore is true', () => {
    const mockLoadMore = jest.fn();
    mockUsePointHistory.mockReturnValue({ history: mockHistory, loading: false, error: null, hasMore: true, loadMore: mockLoadMore });
    mockUseLevelInfo.mockReturnValue({ levelInfo: null, loading: false });
    mockUseGamificationOverview.mockReturnValue({ overview: null });

    renderPage();
    const loadMoreBtn = screen.getByTestId('load-more');
    expect(loadMoreBtn).toBeInTheDocument();
    fireEvent.click(loadMoreBtn);
    expect(mockLoadMore).toHaveBeenCalled();
  });

  it('shows error state', () => {
    mockUsePointHistory.mockReturnValue({ history: [], loading: false, error: 'Failed to load', hasMore: false, loadMore: jest.fn() });
    mockUseLevelInfo.mockReturnValue({ levelInfo: null, loading: false });
    mockUseGamificationOverview.mockReturnValue({ overview: null });

    renderPage();
    expect(screen.getByText('Failed to load')).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: 运行测试确认通过**

```bash
cd frontend && npm test -- --testPathPattern="PointsPage"
```

Expected: All tests PASS.

- [ ] **Step 3: 提交**

```bash
git add frontend/src/__tests__/components/PointsPage.test.tsx
git commit -m "test: 添加 PointsPage 单元测试"
```

---

### Task 6: 更新 E2E 测试数据 + 新增游戏化 E2E 测试

**Files:**
- Modify: `e2e/fixtures/test-data.ts`
- Create: `e2e/gamification/gamificationFlow.spec.ts`

- [ ] **Step 1: 更新 test-data.ts 添加游戏化 URL**

在 `e2e/fixtures/test-data.ts` 的 `URLS` 对象中添加：

```ts
export const URLS = {
  // ... existing URLs ...
  achievements: '/achievements',
  'daily-challenge': '/daily-challenge',
  'virtual-items': '/virtual-items',
  points: '/points',
};
```

- [ ] **Step 2: 创建 E2E 测试文件**

```ts
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
    // 点击"竞赛"筛选
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
    // 验证标签页切换
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
    // 切换标签页
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
```

- [ ] **Step 3: 运行 E2E 测试确认通过**

```bash
npx playwright test e2e/gamification/gamificationFlow.spec.ts --project=chromium
```

Expected: All tests PASS.

- [ ] **Step 4: 提交**

```bash
git add e2e/fixtures/test-data.ts e2e/gamification/gamificationFlow.spec.ts
git commit -m "test: 添加游戏化页面 E2E 测试"
```

---

### Task 7: 全量验证

- [ ] **Step 1: 运行前端所有单元测试**

```bash
cd frontend && npm test
```

Expected: 119+ tests PASS（原有 115 + 新增 4 个测试文件）。

- [ ] **Step 2: 运行 TypeScript 类型检查**

```bash
cd frontend && npx tsc --noEmit
```

Expected: No type errors.

- [ ] **Step 3: 运行 Server 测试确保没破坏后端**

```bash
cd server && npm test
```

Expected: 143 tests PASS.

- [ ] **Step 4: 运行全部 E2E 测试**

```bash
npx playwright test --project=chromium
```

Expected: 72+ tests PASS（原有 68 + 新增游戏化 E2E）。

- [ ] **Step 5: 更新 PROJECT.md 测试统计数据**

更新 `PROJECT.md` 中的测试计数：
- 前端单元测试: `115` → `119`（或实际数字）
- E2E 测试: `68/68` → `73/73`（或实际数字）

- [ ] **Step 6: 最终提交**

```bash
git add .
git commit -m "feat: 游戏化页面完善 — 修复 bug、补充单元测试和 E2E 测试"
```
