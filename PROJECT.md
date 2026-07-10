# AlgoMaster 开发文档

> 最后更新: 2026-07-10
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
- `GET /api/submissions/:id/status` - 轮询评测状态
- `POST /api/submissions/run-sample` - 运行样例测试

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
- 游戏化中心 `/gamification` - 积分概览、等级进度、连胜记录
- 成就页面 `/gamification/achievements`
- 每日挑战 `/gamification/daily-challenge`
- 虚拟商店 `/gamification/virtual-items`
- 积分中心 `/gamification/points`

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

共 396 个测试：

- 前端单元测试: 187 个 ✅
- Server 单元测试: 209 个 ✅
- E2E 测试: 65/65 ✅ (不含 judge 沙箱 5 个超时预存问题)

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

### 2026-07-08

- 社区功能完善 — 帖子编辑、评论编辑、Markdown 实时预览
  - 帖子编辑：复用 CreatePostPage 增加编辑模式，新增 `/posts/:id/edit` 路由
  - 评论编辑：PostDetailPage 评论原地编辑 + Markdown 实时预览
  - Markdown 实时预览：发帖页 Write/Preview 切换标签
  - 后端新增 `PUT /api/posts/comments/:id` 评论编辑 API
  - 新增测试：前端 14 个 + 后端 7 个
  - 设计文档: `docs/superpowers/specs/2026-07-08-community-enhancement-design.md`
  - 实施计划: `docs/superpowers/plans/2026-07-08-community-enhancement-plan.md`
- **修复 MarkdownRenderer 样式缺失** — Tailwind v4 preflight 清掉默认样式
  - 标题 H1-H6：补 26/22/18/16/15/14px 字号层级、font-weight
  - 列表 UL/OL：补 `list-style-type: disc/decimal`、24px 缩进
  - 链接 A：补 `text-decoration: underline`、`--primary-500` 颜色
  - 图片 IMG：补 `max-width: 100%`、`display: block`、`height: auto`
  - 段落 P、水平线 HR：补边距和样式
  - 设计文档: `docs/superpowers/specs/2026-07-08-side-by-side-editor-design.md`
  - 实施计划: `docs/superpowers/plans/2026-07-08-side-by-side-editor-plan.md`
- **发帖页 Markdown 并排编辑器** — Write/Preview 标签切换改为宽屏并排实时预览
  - 宽屏（>900px）：左右两列显示 textarea + 实时 Markdown 渲染
  - 窄屏（≤900px）：恢复标签切换（Write/Preview）
  - 容器加宽到 1200px（宽屏）/ 800px（窄屏）
  - 通过 `useEffect` + `resize` 事件检测屏幕宽度，无额外依赖

### 待完成

- 算法可视化组件
- 竞赛实时排行榜
- 题目管理后台（CRUD 题目 + 设置 std + 管理测试用例）
- 题解/讨论区（题目详情页挂载讨论）
- 侧边栏滚动不同步 + 个人中心不可见（`docs/todo-frontend-2026-07-07.md` 第1项）
- 侧边栏游戏化分组层级（`docs/todo-frontend-2026-07-07.md` 第3项）

### 2026-07-10

- **全量测试整改 Phase 2: Frontend** — 前端 16 个测试文件质量升级
  - 重写: App (ErrorBoundary 覆盖)、Home (loading/data/empty/error 四态)、Login (validation/loading/error 覆盖)
  - 修补: Register (error+loading)、DailyChallengePage (fallback 覆盖)、VirtualItemsPage (purchase 交互+error)、Header (mobile menu 真实断言)
  - 保留 7 个高质量文件不变（authStore, PostDetailPage, ProblemList, CommunityPage, CreatePostPage, LeaderboardPage, PointsPage）
  - 前端测试 165 → 187 (+22)，Server 维持 209/209
  - 实施计划: `docs/superpowers/plans/2026-07-10-phase2-frontend-test-overhaul.md`

- **全量测试整改 Phase 3: E2E** — 12 个 E2E 测试文件质量升级
  - 重写: gamificationFlow (5 tests)、contestDetail (8 tests)、postDetail (7 tests)
  - 修补: login (waitForTimeout+error 断言)、navigation (11x waitForTimeout+条件断言消除)、problemDetail (back 按钮)、profile (waitForTimeout+条件断言消除)
  - 确认干净无需修改: registration, problemList, communityFlow, contestFlow
  - 零 R1 (条件断言) + 零 R3 (waitForTimeout) 违规 ✅
  - E2E 65/65 通过 (不含 judge 沙箱 5 个超时预存问题)
  - 实施计划: `docs/superpowers/plans/2026-07-10-phase3-e2e-test-overhaul.md`

### 2026-07-08 (已完成)

- **评测系统 Docker 沙箱** — BullMQ 队列 + 4 语言沙箱镜像 + 安全隔离 ✅
  - Docker 沙箱镜像：alpine:3.21 含 g++/python3/nodejs/openjdk21
  - 语言配置系统：4 语言的编译/执行命令模板
  - 核心评测引擎：Docker 编译+执行+逐用例比对
  - BullMQ 队列 + Worker：异步评测，3 次重试，并发 2
  - submissionService 对接真实评测，保留 simulateJudge 降级方案
  - `POST /api/submissions/run-sample` 端点
  - 前端提交后 1s 间隔轮询 + 30s 超时
  - 前端运行样例按钮 + 逐用例 I/O 结果面板
  - 新增测试：Server +20（总 170），Frontend 保持 165
- 题目详情页功能增强 — Markdown 题面 + 代码模板 + 草稿 + 运行样例 + 评测结果细化 + 题目统计
- 题目详情页布局优化 — 压缩间距，提交按钮回到首屏
- 设计文档: `docs/superpowers/specs/2026-07-08-judge-system-design.md`
- 设计文档: `docs/superpowers/specs/2026-07-08-problem-detail-enhancement-design.md`
- 实施计划: `docs/superpowers/plans/2026-07-08-judge-system-plan.md`
- 实施计划: `docs/superpowers/plans/2026-07-08-problem-detail-enhancement-plan.md`

## 开发流程

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

### 2026-07-09

- **评测系统 Docker 沙箱** — 完整实施
  - Docker 沙箱镜像（Alpine 3.21 + g++/python3/nodejs/openjdk21）
  - 4 语言编译/执行配置（cpp/python/java/javascript）
  - 核心评测引擎 `dockerJudge.ts`：编译+逐用例执行+trim 比对
  - BullMQ 队列 `judgeQueue` + Worker `judgeWorker`（并发 2，3 次重试）
  - submissionService 对接真实验证队列，保留 simulateJudge 降级
  - `POST /api/submissions/run-sample` API 端点
  - 前端提交轮询（1s 间隔，30s 超时）+ 运行样例按钮 + 结果面板
  - Server 单元测试 170/170 通过（+20），Frontend 165/165
  - 设计文档: `docs/superpowers/specs/2026-07-08-judge-system-design.md`
  - 实施计划: `docs/superpowers/plans/2026-07-08-judge-system-plan.md`

### 2026-07-08

- 社区功能增强：评论内联编辑模式
  - 评论正文内联编辑（textarea + Markdown 实时预览）
  - 仅自己的评论显示 Edit 按钮
  - 编辑模式下显示 Save/Cancel 按钮，Cancel 在提交中时禁用
  - 前端测试 151/151 + Server 143/143 全部通过
  - 后端 API: `PUT /api/posts/comments/:id`

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
