# AlgoMaster 开发文档

> 最后更新: 2026-07-07
> 项目状态: 约 97% 完成

这个文档记录项目的开发细节，包括架构、数据库、API、开发进度等。

## 技术栈

**前端**: React 19 + TypeScript + Tailwind CSS v4 + Vite 8

**后端**: Node.js + Express + Prisma 5 + PostgreSQL 16 + Redis 7

**其他**: Docker、GitHub Actions、Prometheus + Grafana（监控这块还没配）

## 项目结构

三个服务：

- **frontend/** - React SPA，端口 5173
- **backend/** - 主 API 服务，端口 3000
- **server/** - 游戏化 + OJ 服务，端口 3001

前端只和 server 通信。Vite 配置里 `/api` 代理指向 `localhost:3001`。

## 数据库

PostgreSQL 16，用 Prisma ORM。一共 25 张表。

**用户系统**: users, achievements, user_achievements

**题库系统**: problems, tags, problem_tags, test_cases

**提交系统**: submissions

**竞赛系统**: contests, contest_problems, contest_participants

**学习路径**: learning_paths, learning_modules, module_problems, learning_progress

**游戏化**: point_history, daily_challenges, daily_challenge_completions, virtual_items, user_virtual_items

**社交**: friendships, login_streaks, posts, comments, notifications

backend 和 server 各自有独立的 Prisma schema 文件，指向同一个数据库。backend 的 schema 是完整的，server 的是子集。

## API 接口

### 认证

- `POST /api/auth/register` - 注册
- `POST /api/auth/login` - 登录
- `POST /api/auth/logout` - 登出
- `GET /api/auth/me` - 获取当前用户

### 用户

- `GET /api/users/:id` - 用户信息
- `PUT /api/users/me` - 更新信息
- `GET /api/users/:id/posts` - 用户帖子
- `GET /api/users/:id/followers` - 粉丝列表
- `GET /api/users/:id/following` - 关注列表
- `POST /api/users/:id/follow` - 关注用户

### 题目

- `GET /api/problems` - 题目列表（支持分页、筛选）
- `GET /api/problems/:id` - 题目详情
- `POST /api/problems` - 创建题目（管理员）
- `PUT /api/problems/:id` - 更新题目

### 提交

- `POST /api/submissions` - 提交代码
- `GET /api/submissions` - 提交历史
- `GET /api/submissions/:id` - 提交详情

### 竞赛

- `GET /api/contests` - 竞赛列表
- `GET /api/contests/:id` - 竞赛详情
- `POST /api/contests` - 创建竞赛
- `POST /api/contests/:id/join` - 加入竞赛
- `GET /api/contests/:id/standings` - 排行榜

### 社区

- `GET /api/posts` - 帖子列表
- `POST /api/posts` - 创建帖子
- `GET /api/posts/:id` - 帖子详情
- `POST /api/posts/:id/vote` - 投票
- `GET /api/posts/:id/comments` - 评论列表
- `POST /api/posts/:id/comments` - 创建评论

### 游戏化

- `GET /api/achievements` - 成就列表
- `GET /api/achievements/me` - 用户成就
- `GET /api/leaderboard/:type` - 排行榜（global/friends/region）
- `GET /api/daily-challenge` - 每日挑战
- `POST /api/daily-challenge/complete` - 完成挑战
- `GET /api/virtual-items` - 虚拟物品
- `POST /api/virtual-items/:id/buy` - 购买物品

## 前端页面

### 已完成

- 首页 `/` - 英雄区域、统计数据、热门题目、竞赛预告
- 题目列表 `/problems` - 搜索、筛选、分页
- 题目详情 `/problems/:id` - 题目描述、代码编辑器、提交结果
- 竞赛列表 `/contests` - 搜索、状态筛选
- 竞赛详情 `/contests/:id` - 倒计时、题目列表、排行榜
- 个人中心 `/profile` - 用户信息、成就、提交历史
- 登录 `/login`、注册 `/register`
- 学习路径 `/paths`、`/paths/:id` - 已连接后端 API
- 社区 `/community` - 帖子列表、详情、创建
- 排行榜 `/leaderboard` - 全局/好友/地区排行（CSS 变量内联样式）

### 待完成

- 成就页面 `/achievements`
- 每日挑战 `/daily-challenge`
- 虚拟商店 `/virtual-items`

## 游戏化系统

### 积分

- 解题 AC: +50 * difficulty_multiplier
- 每日登录: +5 XP
- 写题解: +100 XP
- 参与竞赛: +30 XP
- 成就解锁: +10~100 XP（按稀有度）

### 等级

公式: `level = floor(sqrt(xp / 100)) + 1`，1-100 级，每级所需经验指数增长。

### 成就

25+ 种，分四类：解题、竞赛、学习、社交、特殊。稀有度：普通、稀有、史诗、传说。

### 排行榜

用 Redis Sorted Set + PostgreSQL 实现，支持全局、好友、地区三种排行。

- 全局排行：按经验值降序，Redis 缓存 5 分钟
- 好友排行：包含自己和已接受好友
- 地区排行：按地区分组聚合
- 前端使用 CSS 变量内联样式，无 Tailwind 类名

## 测试

共 333 个测试：

- 前端单元测试: 142 个 ✅
- Server 单元测试: 143 个 ✅
- E2E 测试: 79/79 ✅

## 开发进度

### 已完成

- 架构设计、数据库设计
- 前端所有主要页面
- 后端所有 API 服务
- 游戏化系统后端（含排行榜 API）
- 社区系统
- 测试框架和测试用例
- Docker 部署配置
- 学习路径页面连接后端 API
- 排行榜页面修复和 UI 改造
- 修复 authenticate 中间件 async 错误处理 bug
- 游戏化前端页面（成就、每日挑战、虚拟商店、积分中心）
- 游戏化系统单元测试和 E2E 测试覆盖
- 游戏化页面 UI 视觉升级 v2 — 全面放大字号、Hero Banner 布局、装饰光斑、10个组件文件改造
  - 设计文档: `docs/superpowers/specs/2026-07-06-gamification-redesign-v2.md`
- 导航栏 & 侧边栏 UI 优化 — 简约白净风格导航栏、侧边栏改为正常文档流布局
  - 设计文档: `docs/superpowers/specs/2026-07-07-navbar-sidebar-redesign.md`

### 2026-07-07 (续)

- 游戏化页面 UI 改造 v3 — 混合风格：CSS 变量外壳 + 玻璃态卡片，对标 LeaderboardPage
  - 5 个页面重写：GamificationHubPage、AchievementsPage、DailyChallengePage、PointsPage、VirtualItemsPage
  - 6 个组件降噪：LevelProgress、AchievementCard、DailyChallengeCard、LoginStreakCalendar、PointHistoryList、VirtualItemCard
  - 去掉装饰光斑、去掉 text-5xl 渐变标题、统计改纯色渐变
  - 设计文档: `docs/superpowers/specs/2026-07-07-gamification-redesign-v3.md`
  - 实施计划: `docs/superpowers/plans/2026-07-07-gamification-redesign-v3.md`

### 待完成

- 算法可视化组件
- 社区功能完善（帖子编辑、评论回复）
- 竞赛实时排行榜

## 已知问题

1. 根目录 package.json 的 `dev:client` 和 `build` 脚本引用 `client/` 而非 `frontend/`，请在各子目录内执行命令
2. 部分页面仍是 PlaceholderPage（Problems, Contests）
3. 前后端集成尚未完全完成

## 开发流程

### 开发前

1. 明确需求
2. 检查现有代码能否复用
3. 规划实现方案

### 开发中

1. 小步迭代，每完成一个子功能就测试
2. 保持代码风格一致
3. 关键逻辑加注释，但别过度

### 开发后

```bash
# 单元测试
cd frontend && npm test
cd server && npm test

# Lint 检查
cd frontend && npm run lint

# TypeScript 编译
cd frontend && npx tsc --noEmit

# E2E 测试
npx playwright test --project=chromium
```

### Bug 修复流程

```
发现 bug → 写测试复现 → 修复代码 → 确认测试通过 → 提交
```

### 提交规范

格式：`<类型>: <简短描述>`

类型：`feat`（新功能）、`fix`（修复）、`docs`（文档）、`style`（格式）、`refactor`（重构）、`test`（测试）、`chore`（构建/工具）

### 测试策略

- 核心功能（登录、注册、提交代码）：单元测试 + E2E 测试
- 一般功能（页面显示、导航）：单元测试
- 辅助功能（动画、样式）：手动测试

## 环境变量

```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/algo_arena
REDIS_URL=redis://localhost:6379
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=7d
PORT=3001
NODE_ENV=development
```

## 启动命令

```bash
# 前端
cd frontend && npm install && npm run dev

# 后端
cd server && npm install && npm run db:setup && npm run dev

# Docker
docker compose up -d
```

## 更新日志

### 2026-07-06

- 网站导航重构：Header/Sidebar/BottomNav 全部更新
- 补齐社区系和游戏化系页面路由（共 14 条）
- 新增游戏化中心页 `/gamification`（概览大厅）
- Sidebar 重组为三组（核心功能/社区/游戏化）
- BottomNav 改为横向滚动以支持 6 项导航
- Footer 修复死链，替换为有效链接
- 修复首页 `/learn` 死链为 `/paths`

### 2026-07-07

- 导航栏 & 侧边栏 UI 优化设计定稿和实施
  - 顶部导航栏：简约白色风格、深色文字 #374151、字号 16px、间距 32px、高度 72px、底部蓝色激活指示条
  - 侧边栏：移除 `position: fixed`，改为 `flex-shrink: 0` 正常文档流布局，不再遮盖页面内容
  - MainLayout：移除 margin-left 偏移，统一 flex 并排布局
  - 测试：前端 142/142 + Server 143/143 全部通过
  - 设计文档: `docs/superpowers/specs/2026-07-07-navbar-sidebar-redesign.md`
  - 实施计划: `docs/superpowers/plans/2026-07-07-navbar-sidebar-redesign.md`

### 2026-06-22

- 重构项目文档，去除 AI 痕迹
- 创建 task_plan.md、progress.md、findings.md 跟踪开发进度
- E2E 登录态复用改造：创建 `e2e/auth.setup.ts`，修改 `playwright.config.ts` 支持 storageState，三个需登录的测试文件改用复用登录态

### 2026-06-09

- 修复前端单元测试（52/52 通过）
- 修复 E2E 测试（31/31 通过）
- 添加开发流程规范

### 2026-06-08

- 清理重复页面，统一路由配置
- 前端页面连接后端 API（6 个页面）
- 创建学习路径页面
- 创建 UI 组件库（26 个组件）

### 2026-06-07

- 项目初始化
- 完成架构设计、数据库设计
- 完成前后端基础框架
