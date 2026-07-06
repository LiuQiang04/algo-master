# 网站导航重构实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use subagent-driven-development (recommended) or executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 补齐所有已开发页面的导航入口（路由+菜单），新增游戏化中心页，修复死链

**Architecture:** 基于现有 MainLayout（Header + Sidebar + BottomNav），只改导航组件和路由配置，不碰页面组件内部逻辑。游戏化中心页作为新页面，复用现有 hooks 获取概览数据。

**Tech Stack:** React 19 + TypeScript + Tailwind CSS v4 + React Router + Lucide React

## Global Constraints

- 不改已有页面组件的内部逻辑
- 不改认证、鉴权逻辑
- 不改 API 或数据库
- 新页面（GamificationHubPage）放在 `frontend/src/pages/Gamification/` 目录下
- 导航图标统一使用 lucide-react
- BottomNav 改为横向滚动，不改变现有 5 项的布局和优先级

---

### Task 1: 补齐 routes/index.tsx 缺失路由

**Files:**
- Modify: `frontend/src/routes/index.tsx`

**Interfaces:**
- Consumes: 所有已存在的 page 组件（lazy import）
- Produces: 完整的路由表

- [ ] **Step 1: 导入所有缺失页面的 lazy 组件**

在现有 lazy imports 后添加：

```typescript
const CommunityPage = lazy(() => import('@/pages/CommunityPage'));
const CreatePostPage = lazy(() => import('@/pages/CreatePostPage'));
const PostDetailPage = lazy(() => import('@/pages/PostDetailPage'));
const UserProfilePage = lazy(() => import('@/pages/UserProfilePage'));
const MessagesPage = lazy(() => import('@/pages/MessagesPage'));
const NotificationsPage = lazy(() => import('@/pages/NotificationsPage'));
const FeedPage = lazy(() => import('@/pages/FeedPage'));
const GamificationHub = lazy(() => import('@/pages/Gamification/GamificationHubPage'));
const AchievementsPage = lazy(() => import('@/pages/Gamification/AchievementsPage'));
const LeaderboardPage = lazy(() => import('@/pages/Gamification/LeaderboardPage'));
const DailyChallengePage = lazy(() => import('@/pages/Gamification/DailyChallengePage'));
const VirtualItemsPage = lazy(() => import('@/pages/Gamification/VirtualItemsPage'));
const PointsPage = lazy(() => import('@/pages/Gamification/PointsPage'));
```

- [ ] **Step 2: 在 router children 中添加社区、消息、通知等路由**

在 `{ path: 'register', ... }` 后添加：

```typescript
// 社区路由
{ path: 'community', element: <LazyPage><CommunityPage /></LazyPage> },
{ path: 'community/new', element: <LazyPage><CreatePostPage /></LazyPage> },
{ path: 'posts/:id', element: <LazyPage><PostDetailPage /></LazyPage> },
{ path: 'users/:id', element: <LazyPage><UserProfilePage /></LazyPage> },
{ path: 'messages', element: <LazyPage><MessagesPage /></LazyPage> },
{ path: 'notifications', element: <LazyPage><NotificationsPage /></LazyPage> },
{ path: 'feed', element: <LazyPage><FeedPage /></LazyPage> },
// 游戏化路由
{ path: 'gamification', element: <LazyPage><GamificationHub /></LazyPage> },
{ path: 'achievements', element: <LazyPage><AchievementsPage /></LazyPage> },
{ path: 'leaderboard', element: <LazyPage><LeaderboardPage /></LazyPage> },
{ path: 'daily-challenge', element: <LazyPage><DailyChallengePage /></LazyPage> },
{ path: 'virtual-items', element: <LazyPage><VirtualItemsPage /></LazyPage> },
{ path: 'points', element: <LazyPage><PointsPage /></LazyPage> },
```

- [ ] **Step 3: 运行类型检查和测试确认无报错**

```bash
cd frontend && npx tsc --noEmit
```

Expected: 无类型错误（注意：社区相关页面若使用旧 store 路径可能需要调整）
Note: CommunityPage/CreatePostPage/PostDetailPage/UserProfilePage/MessagesPage/NotificationsPage/FeedPage 可能使用了 `store/authStore`（非 `stores/useAuthStore`），如果 tsc 报错需要改 import 路径。

- [ ] **Step 4: 提交**

```bash
git add frontend/src/routes/index.tsx
git commit -m "feat: add missing routes for community and gamification pages"
```

---

### Task 2: 更新 Header — 添加"游戏化"导航项

**Files:**
- Modify: `frontend/src/components/Layout/Header.tsx`

**Interfaces:**
- Consumes: 路由 `/gamification` 已在 Task 1 中注册
- Navigation items 数组需要添加新项

- [ ] **Step 1: 在 navItems 数组中添加游戏化导航项**

在 `{ path: '/leaderboard', ... }` 后添加：

```typescript
{ path: '/gamification', label: '游戏化' },
```

- [ ] **Step 2: 运行类型检查**

```bash
cd frontend && npx tsc --noEmit
```

Expected: 无错误

- [ ] **Step 3: 提交**

```bash
git add frontend/src/components/Layout/Header.tsx
git commit -m "feat: add gamification nav link to Header"
```

---

### Task 3: 更新 Sidebar — 重组为三组 + 添加游戏化项

**Files:**
- Modify: `frontend/src/components/Layout/Sidebar.tsx`
- Modify: `frontend/src/components/Layout/Sidebar.css`

**Interfaces:**
- Consumes: 路由 `/gamification`、`/achievements`、`/leaderboard`、`/daily-challenge`、`/virtual-items`、`/points`、`/feed` 已在 Task 1 中注册
- 新增 lucide 图标：`Map`、`BarChart3`、`Gamepad2`、`Award`、`CalendarCheck`、`Coins`、`Gift`、`Rss`

- [ ] **Step 1: 重构 Sidebar.tsx 的导航数据结构**

将单个扁平 navItems 数组改为分组结构：

```typescript
interface NavGroup {
  title: string;
  items: NavItem[];
}

const navGroups: NavGroup[] = [
  {
    title: '核心功能',
    items: [
      { to: '/', label: '首页', icon: <Home size={20} /> },
      { to: '/problems', label: '题库', icon: <BookOpen size={20} /> },
      { to: '/contests', label: '竞赛', icon: <Trophy size={20} /> },
      { to: '/paths', label: '学习路径', icon: <Map size={20} /> },
    ],
  },
  {
    title: '社区',
    items: [
      { to: '/community', label: '社区', icon: <Users size={20} /> },
      { to: '/feed', label: '动态', icon: <Rss size={20} /> },
    ],
  },
  {
    title: '游戏化',
    items: [
      { to: '/gamification', label: '游戏化中心', icon: <Gamepad2 size={20} /> },
      { to: '/achievements', label: '成就', icon: <Award size={20} /> },
      { to: '/leaderboard', label: '排行榜', icon: <BarChart3 size={20} /> },
      { to: '/daily-challenge', label: '每日挑战', icon: <CalendarCheck size={20} /> },
      { to: '/points', label: '积分', icon: <Coins size={20} /> },
      { to: '/virtual-items', label: '虚拟道具', icon: <Gift size={20} /> },
    ],
  },
];
```

在导入中添加新图标：
```typescript
import {
  Home, BookOpen, Trophy, Users, Map, BarChart3, User,
  Gamepad2, Award, CalendarCheck, Coins, Gift, Rss,
  X, ChevronRight,
} from 'lucide-react';
```

- [ ] **Step 2: 更新 Sidebar 渲染逻辑**

将 `nav` 中的 map 改为嵌套：

```tsx
<nav className="sidebar-nav">
  {navGroups.map((group) => (
    <div key={group.title} className="sidebar-group">
      <div className="sidebar-group-title">{group.title}</div>
      {group.items.map((item) => {
        const active = isActive(item.to);
        return (
          <Link
            key={item.to}
            to={item.to}
            className={`sidebar-link ${active ? 'sidebar-link--active' : ''}`}
            onClick={onClose}
          >
            <span className="sidebar-link-icon">{item.icon}</span>
            <span className="sidebar-link-label">{item.label}</span>
            {active && <ChevronRight size={16} className="sidebar-link-arrow" />}
          </Link>
        );
      })}
    </div>
  ))}
</nav>
```

移除原来的 `visibleItems` 逻辑（个人中心按鈕移至底部，保持 `requireAuth` 逻辑）。

在 nav 底部保留个人中心：
```tsx
{/* 底部个人中心 */}
<div className="sidebar-footer">
  {user && (
    <Link
      to="/profile"
      className={`sidebar-link ${isActive('/profile') ? 'sidebar-link--active' : ''}`}
      onClick={onClose}
    >
      <span className="sidebar-link-icon"><User size={20} /></span>
      <span className="sidebar-link-label">个人中心</span>
    </Link>
  )}
</div>
```

- [ ] **Step 3: 添加 Sidebar 分组 CSS**

在 `Sidebar.css` 中添加：

```css
/* Group titles */
.sidebar-group {
  margin-bottom: 4px;
}

.sidebar-group-title {
  padding: 12px 16px 6px;
  font-size: 11px;
  font-weight: 600;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.sidebar-footer {
  border-top: 1px solid var(--border-light);
  padding: 8px;
  margin-top: auto;
}
```

- [ ] **Step 4: 运行类型检查**

```bash
cd frontend && npx tsc --noEmit
```

Expected: 无错误

- [ ] **Step 5: 提交**

```bash
git add frontend/src/components/Layout/Sidebar.tsx frontend/src/components/Layout/Sidebar.css
git commit -m "feat: reorganize Sidebar into groups with gamification section"
```

---

### Task 4: 更新 BottomNav — 横向滚动 + 添加游戏化

**Files:**
- Modify: `frontend/src/components/Layout/BottomNav.tsx`
- Modify: `frontend/src/components/Layout/BottomNav.css`

**Interfaces:**
- Consumes: 路由 `/gamification` 已在 Task 1 中注册
- 新增 lucide 图标：`Gamepad2`

- [ ] **Step 1: 在 navItems 中添加"游戏化"项**

```typescript
import { Home, BookOpen, Trophy, Users, User, Gamepad2 } from 'lucide-react';

const navItems = [
  { path: '/', icon: Home, label: '首页' },
  { path: '/problems', icon: BookOpen, label: '题库' },
  { path: '/contests', icon: Trophy, label: '竞赛' },
  { path: '/community', icon: Users, label: '社区' },
  { path: '/gamification', icon: Gamepad2, label: '游戏化' },
  { path: '/profile', icon: User, label: '我的' },
];
```

- [ ] **Step 2: 更新 BottomNav CSS — 改为横向滚动**

```css
@media (max-width: 768px) {
  .bottom-nav {
    display: flex;
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
    scrollbar-width: none;
    gap: 0;
  }

  .bottom-nav::-webkit-scrollbar {
    display: none;
  }

  .bottom-nav__item {
    flex: 0 0 auto;
    width: calc(100% / 5); /* 始终保持 5 项可见宽度 */
    min-width: 64px;
  }
}
```

关键设计：6 项在 scroll container 中，每项固定宽度（100%/5），用户可滑动查看多出的项。当前屏幕默认显示前 5 项，"游戏化"在滚动后可见。

- [ ] **Step 3: 运行类型检查**

```bash
cd frontend && npx tsc --noEmit
```

Expected: 无错误

- [ ] **Step 4: 提交**

```bash
git add frontend/src/components/Layout/BottomNav.tsx frontend/src/components/Layout/BottomNav.css
git commit -m "feat: make BottomNav horizontally scrollable and add gamification entry"
```

---

### Task 5: 更新 Footer — 修复死链

**Files:**
- Modify: `frontend/src/components/Layout/Footer.tsx`

**Interfaces:**
- 替换 Footer 中不存在的路由链接

- [ ] **Step 1: 替换 Footer 中的死链**

"学习资源"区块中：

```tsx
{/* 学习资源 */}
<div>
  <h3 className="text-lg font-semibold mb-4">学习资源</h3>
  <ul className="space-y-2">
    <li>
      <Link to="/paths" className="text-gray-400 hover:text-white text-sm transition-colors">
        学习路径
      </Link>
    </li>
    <li>
      <Link to="/problems" className="text-gray-400 hover:text-white text-sm transition-colors">
        算法题库
      </Link>
    </li>
    <li>
      <Link to="/achievements" className="text-gray-400 hover:text-white text-sm transition-colors">
        成就系统
      </Link>
    </li>
    <li>
      <Link to="/daily-challenge" className="text-gray-400 hover:text-white text-sm transition-colors">
        每日挑战
      </Link>
    </li>
  </ul>
</div>
```

"快速链接"区块中补充：

在排行榜后添加 `/gamification`：
```tsx
<li>
  <Link to="/gamification" className="text-gray-400 hover:text-white text-sm transition-colors">
    游戏化
  </Link>
</li>
```

- [ ] **Step 2: 运行类型检查**

```bash
cd frontend && npx tsc --noEmit
```

Expected: 无错误

- [ ] **Step 3: 提交**

```bash
git add frontend/src/components/Layout/Footer.tsx
git commit -m "fix: replace dead links in Footer with valid routes"
```

---

### Task 6: 新增游戏化中心页 GamificationHubPage

**Files:**
- Create: `frontend/src/pages/Gamification/GamificationHubPage.tsx`
- Create: `frontend/src/pages/Gamification/GamificationHubPage.css`（可选，若样式简单可直接内联或使用 Tailwind）

**Interfaces:**
- Consumes: `useGamificationOverview` hook from `../../hooks/useGamification`
- Consumes: `useAchievements` hook for achievement count data
- Consumes: `useDailyChallenge` hook for daily challenge status
- Produces: 游戏化中心概览页面，展示 5 个模块卡片

- [ ] **Step 1: 创建 GamificationHubPage.tsx**

```tsx
import React from 'react';
import { Link } from 'react-router-dom';
import { useGamificationOverview } from '../../hooks/useGamification';
import {
  Award, BarChart3, CalendarCheck, Coins, Gift,
  ChevronRight, Trophy, Flame, Sparkles,
} from 'lucide-react';

const hubCards = [
  {
    to: '/achievements',
    icon: Award,
    title: '成就',
    color: 'from-amber-400 to-orange-500',
    bgLight: 'bg-amber-50',
    getDesc: (data: any) => `${data.achievementCount ?? '--'} 个已解锁`,
  },
  {
    to: '/leaderboard',
    icon: BarChart3,
    title: '排行榜',
    color: 'from-blue-400 to-indigo-500',
    bgLight: 'bg-blue-50',
    getDesc: (data: any) => data.globalRank ? `全球排名 #${data.globalRank}` : '暂无排名',
  },
  {
    to: '/daily-challenge',
    icon: CalendarCheck,
    title: '每日挑战',
    color: 'from-emerald-400 to-teal-500',
    bgLight: 'bg-emerald-50',
    getDesc: (data: any) => `已完成 ${data.completedDailyChallenges ?? 0} 次`,
  },
  {
    to: '/points',
    icon: Coins,
    title: '积分',
    color: 'from-purple-400 to-violet-500',
    bgLight: 'bg-purple-50',
    getDesc: (data: any) => `${data.totalExp ?? '--'} 总经验`,
  },
  {
    to: '/virtual-items',
    icon: Gift,
    title: '虚拟道具',
    color: 'from-pink-400 to-rose-500',
    bgLight: 'bg-pink-50',
    getDesc: () => '徽章 / 称号 / 头像框',
  },
];

const GamificationHubPage: React.FC = () => {
  const { overview, loading } = useGamificationOverview();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/30 to-purple-50/30 px-6 py-10 lg:px-16 lg:py-16">
      {/* 页面标题 */}
      <div className="max-w-5xl mx-auto mb-12">
        <div className="flex items-center gap-3 mb-3">
          <Sparkles size={28} className="text-indigo-500" />
          <h1 className="text-4xl lg:text-5xl font-black bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            游戏化中心
          </h1>
        </div>
        <p className="text-lg text-gray-500 ml-1">
          追踪你的学习成就，与全球用户一较高下
        </p>
      </div>

      {/* 登录连续天数横幅 */}
      {overview && (
        <div className="max-w-5xl mx-auto mb-10">
          <div className="bg-white/70 backdrop-blur-xl border border-white/50 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center gap-6 flex-wrap">
              <div className="flex items-center gap-3">
                <Flame size={24} className="text-orange-500" />
                <span className="text-sm text-gray-500">连续登录</span>
                <span className="text-2xl font-bold text-orange-600">{overview.loginStreak}</span>
                <span className="text-sm text-gray-400">天</span>
              </div>
              <div className="w-px h-8 bg-gray-200 hidden sm:block" />
              <div className="flex items-center gap-3">
                <Trophy size={24} className="text-amber-500" />
                <span className="text-sm text-gray-500">等级</span>
                <span className="text-2xl font-bold text-gray-800">Lv.{overview.level}</span>
              </div>
              <div className="w-px h-8 bg-gray-200 hidden sm:block" />
              <div className="flex-1 min-w-[120px]">
                <div className="flex justify-between text-xs text-gray-400 mb-1">
                  <span>经验值</span>
                  <span>{overview.currentExp} / {overview.nextLevelExp}</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-indigo-400 to-purple-500 rounded-full transition-all duration-500"
                    style={{ width: `${overview.progress}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 加载状态 */}
      {loading && (
        <div className="max-w-5xl mx-auto flex justify-center py-20">
          <div className="animate-spin rounded-full w-12 h-12 border-b-2 border-indigo-500" />
        </div>
      )}

      {/* 5 个模块卡片 */}
      {!loading && (
        <div className="max-w-5xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {hubCards.map((card) => (
            <Link
              key={card.to}
              to={card.to}
              className="group bg-white/70 backdrop-blur-xl border border-white/50 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-200 hover:-translate-y-0.5"
            >
              <div className="flex items-center gap-4 mb-3">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${card.color} flex items-center justify-center shadow-sm`}>
                  <card.icon size={22} className="text-white" />
                </div>
                <h3 className="text-lg font-semibold text-gray-800">{card.title}</h3>
              </div>
              <p className="text-sm text-gray-500 mb-3">
                {card.getDesc(overview ?? {})}
              </p>
              <div className="flex items-center gap-1 text-sm font-medium text-indigo-500 group-hover:gap-2 transition-all">
                查看详情 <ChevronRight size={14} />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default GamificationHubPage;
```

- [ ] **Step 2: 运行类型检查**

```bash
cd frontend && npx tsc --noEmit
```

Expected: 无错误

- [ ] **Step 3: 提交**

```bash
git add frontend/src/pages/Gamification/GamificationHubPage.tsx
git commit -m "feat: add GamificationHubPage overview page"
```

---

### Task 7: 修复首页死链 /learn → /paths

**Files:**
- Modify: `frontend/src/pages/Home/Home.tsx`

**Interfaces:**
- 仅修复链接路径

- [ ] **Step 1: 将 Hero 区"学习路径"按钮的 href 从 `/learn` 改为 `/paths`**

```tsx
<Link to="/paths" className="hero__btn hero__btn--secondary">
  学习路径
  <ChevronRight size={18} />
</Link>
```

- [ ] **Step 2: 提交**

```bash
git add frontend/src/pages/Home/Home.tsx
git commit -m "fix: change dead link /learn to /paths in Home page"
```

---

### 验证步骤

所有任务完成后，运行全量验证：

```bash
cd frontend && npm test && npx tsc --noEmit
```

确认以下路径均能正常渲染：
- `/gamification` — 游戏化中心页
- `/achievements` — 成就页
- `/leaderboard` — 排行榜（之前有 Header 链接但无路由）
- `/daily-challenge` — 每日挑战
- `/virtual-items` — 虚拟道具
- `/points` — 积分
- `/community` — 社区列表
- `/feed` — 动态
