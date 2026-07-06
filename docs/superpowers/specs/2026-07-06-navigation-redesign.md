# 网站导航重构设计

> 日期: 2026-07-06
> 状态: 设计定稿

## 目标

补全所有已开发页面（学习路径、排行榜、游戏化 5 页面）的导航入口，修复死链，使网站导航结构完整统一。

## 现状问题

1. **两套路由文件冲突** — `routes.tsx`（完整）未被使用，`routes/index.tsx`（活跃）缺失大量路由
2. **6 个页面无导航入口** — 排行榜（有 Header 链接但无路由）、成就、每日挑战、虚拟道具、积分
3. **首页死链** — Hero 区学习路径链接到 `/learn`（不存在），实际路由是 `/paths`
4. **Footer 死链** — `tutorials`、`algorithms`、`data-structures`、`practice` 这些路由不存在
5. **移动端 BottomNav 已满 5 项** — 需改为横向滚动以容纳"游戏化"入口

## 改动清单

### 1. 路由补齐（`routes/index.tsx`）

添加社区系、游戏化系等所有已开发页面的路由。

| 路由 | 组件 | 备注 |
|------|------|------|
| `community` | CommunityPage | 社区列表 |
| `community/new` | CreatePostPage | 发帖 |
| `posts/:id` | PostDetailPage | 帖子详情 |
| `users/:id` | UserProfilePage | 用户主页 |
| `messages` | MessagesPage | 私信 |
| `notifications` | NotificationsPage | 通知 |
| `feed` | FeedPage | 动态 |
| `gamification` | GamificationHubPage | 游戏化中心（新增） |
| `achievements` | AchievementsPage | 成就 |
| `leaderboard` | LeaderboardPage | 排行榜 |
| `daily-challenge` | DailyChallengePage | 每日挑战 |
| `virtual-items` | VirtualItemsPage | 虚拟道具 |
| `points` | PointsPage | 积分 |

### 2. Header — 加"游戏化"导航项

在"排行榜"后添加 `gamification` 链接，lucide 图标用 `Gamepad2`。

### 3. Sidebar — 重组为三组 + 个人中心

当前侧边栏是 7 项扁平列表。改为**三组**区域化布局，组间加分割线：

| 分组 | 项目 | 说明 |
|------|------|------|
| **核心功能** | 首页、题库、竞赛、学习路径 | 不变 |
| **社区** | 社区、动态 | 排行榜移出本组 |
| **游戏化** | 排行榜、成就、每日挑战、积分、虚拟道具 | 排行榜从原列表移入本组 |
| 底部 | 个人中心 | 保持原有 auth guard |

注：`/feed` 路由对应的 FeedPage 组件已存在，之前无导航入口，现加入社区组。

### 4. BottomNav — 横向滚动

- 改为 `overflow-x: auto` + `flex: 0 0 auto` 固定宽度 items
- 添加"游戏化"项（`Gamepad2` 图标）
- 保持当前 5 项 + 新增 1 项 = 6 项

### 5. Footer — 修复/替换死链

- 移除 `tutorials`、`algorithms`、`data-structures`、`practice` 等不存在链接
- 替换为 `paths`（学习路径）、`achievements`（成就）、`leaderboard`（排行榜）
- 保留社区和竞赛现有链接

### 6. 新增：游戏化中心页（`/gamification`）

五个概览卡片，每个卡片展示核心数据，点击跳转对应子页面：

| 卡片 | 数据字段 | 跳转链接 |
|------|---------|---------|
| 成就 | 已解锁/总数 | `/achievements` |
| 排行榜 | 我的排名 | `/leaderboard` |
| 每日挑战 | 今日完成状态、剩余时间 | `/daily-challenge` |
| 积分 | 总积分、今日获取 | `/points` |
| 虚拟道具 | 已拥有/总数 | `/virtual-items` |

数据从各 service 接口获取，静态展示无需实时推送。

### 7. 首页修复

Hero 区"学习路径"链接 `href="/learn"` → `href="/paths"`

## 不需要改的

- 不新增路由以外的页面组件（仅新增 `GamificationHubPage`）
- 不改已有页面组件的内部逻辑
- 不改认证、鉴权逻辑
- 不改数据库或 API

## 实施顺序

```
路由补齐 → Sidebar → Header → Footer → BottomNav → 游戏化中心页 → 首页修复
```

## 测试要点

- 所有新增路由可正常访问、跳转
- 导航高亮状态正确
- 移动端 BottomNav 横向滚动可用
- 游戏化中心页数据正常加载
- 无死链（指首页和 Footer）
