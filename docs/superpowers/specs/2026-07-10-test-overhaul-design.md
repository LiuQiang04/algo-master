# Test Overhaul Design Spec

## 1. Background & Problem

### 项目测试现状

AlgoMaster 算法竞赛学习平台目前有 **45 个测试文件**：

| 层级 | 数量 | 说明 |
|------|------|------|
| 前端组件/Store | 16 | `frontend/src/__tests__/` |
| 服务端 Unit/Integration | 17 | `server/src/__tests__/` |
| E2E | 12 | `e2e/` |

### 核心问题

**A. 防御性测试（~30% 文件）**

部分测试文件"为了测试而测试"，绕过真实逻辑只求通过：

- **`Home.test.tsx`**：静态快照式测试，mock 的数据从不被断言，无加载/空/错误态
- **`Login.test.tsx`**：仅验证 `mockLogin` 被调用，无加载态/错误态/禁用态覆盖
- **`App.test.tsx`**：只验证 `container` 和 `body.textContent` 存在，无实际行为断言
- **`judgeQueue.test.ts`**：仅 1 个 smoke test，无错误处理/重试/边界测试

**B. Mock 不完整**

部分测试使用部分 mock，缺少 API 返回的真实字段，可能隐藏结构假设问题。

**C. 覆盖缺口**

20 个页面 + 15 个服务 + 5 个中间件 + 3 个 store 中，仅有 45 个测试文件，以下核心功能缺乏测试：

- ContestList, ContestDetail, ProblemDetail, Profile, LearningPaths 等 12 个页面
- authService, userService, contestService, learningPathService 等 8 个服务
- metrics 中间件

**D. 少量重叠**

`auth.test.ts`（unit）和 `auth.test.ts`（integration）的 mock 和测试场景几乎相同，unit 测了 middleware 逻辑，integration 用相同 mock 又测了一遍 HTTP 层。

### 抽样评估详情

**前端（抽样 6/16）：**

| 文件 | 评级 | 理由 |
|------|------|------|
| `authStore.test.ts` | Good | 真实 Zustand store 状态转换，完整生命周期覆盖 |
| `PostDetailPage.test.tsx` | Good | 真实行为测试（权限、编辑模式、空内容禁用） |
| `ProblemList.test.tsx` | Good | 过滤/搜索/分页/加载/错误态完整 |
| `CommunityPage.test.tsx` | Good | 标签/排序/搜索/分页/加载态/错误态完整覆盖 |
| `CreatePostPage.test.tsx` | Good | Create/Edit 双模式，验证 payload 和导航 |
| `AchievementsPage.test.tsx` | Acceptable | 状态覆盖全，但用 `any` stub 替代子组件 |
| `Home.test.tsx` | **Bad** | 静态快照，无动态行为验证 |
| `Login.test.tsx` | **Bad** | 防御性测试 |
| `App.test.tsx` | **Bad** | 仅验证渲染不崩溃 |

**服务端（抽样 8/17）：**

| 文件 | 评级 | 理由 |
|------|------|------|
| `auth.test.ts`（unit） | Good | 4 种失败模式全覆盖，无 if 断言 |
| `leaderboard.test.ts` | Good | 缓存/分页/分组全覆盖 |
| `points.test.ts` | Good | 纯函数零 mock |
| `submissionService.test.ts` | Good | 所有分支全覆盖 |
| `achievements.test.ts` | Good | 成就定义结构全验证 |
| `gamification.test.ts` | Acceptable | 与 points.test 有重叠 |
| `dockerJudge.test.ts` | Good | 真实 Docker 集成，适当的 condition skip |
| `judgeQueue.test.ts` | **Bad** | 仅 1 个 smoke test |

---

## 2. Quality Standards

源自 CLAUDE.md"测试开发规则"。每个测试文件必须遵守以下标准。

### 2.1 四条红线

| # | 规则 | 说明 |
|---|------|------|
| R1 | **禁止条件断言** | 每个 `it()` 必须有必然执行的断言。不允许 `if (await el.isVisible()) { await expect(el).toBeVisible() }` |
| R2 | **Mock 必须完整** | 必须包含真实 API 返回的全部字段，不能用 `{ title: "x" }` 部分 mock |
| R3 | **禁止 `waitForTimeout(N)`** | 用 `waitForSelector` / `waitForResponse` / `toBeVisible` 替代 |
| R4 | **禁止把 bug 断言为正确** | API 报错时断言错误信息，而不是断言"空列表" |

### 2.2 状态覆盖要求

| 层 | 必须覆盖的状态 |
|----|--------------|
| 前端组件 | 加载态 → 数据态 → 空态 → 错误态 |
| 服务端 Service | 正常路径 → 空结果 → 错误/异常 → 边界值 |
| 服务端 Middleware | 正常通过 → 各维度拒绝场景 → 缺失/无效参数 |
| Store | 初始态 → 操作成功 → 操作失败 → 状态清理 |
| E2E | 真实用户流程（登录→点击→等待→断言数据变化） |

### 2.3 Mock 原则

- **前端组件**：允许 mock service 层隔离外部依赖，但必须验证 service 被正确参数调用（`toHaveBeenCalledWith`）
- **服务端 Unit**：允许 mock Prisma/Redis，但纯函数/计算逻辑（points、achievement 定义）必须用真实数据验证
- **服务端 Integration**：优先使用真实数据库，或与被测层匹配的 mock 粒度
- **E2E**：禁止 mock，走真实用户流程和真实数据库

### 2.4 结构要求

每个测试文件应遵循 AAA 模式（Arrange-Act-Assert），`describe` 按场景/功能分组，`it` 描述具体行为而非实现。

---

## 3. Full Inventory

### 3.1 前端测试（16 个文件）

| # | 文件路径 | 当前质量 | 整改方式 |
|---|---------|---------|---------|
| F01 | `__tests__/components/App.test.tsx` | Bad | 重写：测试路由挂载和 ErrorBoundary |
| F02 | `__tests__/components/Login.test.tsx` | Bad | 重写：加载/错误/禁用态全覆盖 |
| F03 | `__tests__/components/Register.test.tsx` | 未抽样 | 审计后决定 |
| F04 | `__tests__/components/ProblemList.test.tsx` | Good | 保留，小幅增强 |
| F05 | `__tests__/components/CommunityPage.test.tsx` | Good | 保留 |
| F06 | `__tests__/store/authStore.test.ts` | Good | 保留，可补 token refresh |
| F07 | `__tests__/components/LeaderboardPage.test.tsx` | 未抽样 | 审计 |
| F08 | `__tests__/components/Footer.test.tsx` | 未抽样 | 审计 |
| F09 | `__tests__/components/Home.test.tsx` | Bad | 重写 |
| F10 | `__tests__/components/Header.test.tsx` | 未抽样 | 审计 |
| F11 | `__tests__/components/AchievementsPage.test.tsx` | Acceptable | 修复 stub，补完整渲染 |
| F12 | `__tests__/components/DailyChallengePage.test.tsx` | 未抽样 | 审计 |
| F13 | `__tests__/components/PointsPage.test.tsx` | 未抽样 | 审计 |
| F14 | `__tests__/components/VirtualItemsPage.test.tsx` | 未抽样 | 审计 |
| F15 | `__tests__/components/PostDetailPage.test.tsx` | Good | 保留 |
| F16 | `__tests__/components/CreatePostPage.test.tsx` | Good | 保留 |

### 3.2 服务端测试（17 个文件）

| # | 文件路径 | 当前质量 | 整改方式 |
|---|---------|---------|---------|
| S01 | `unit/auth.test.ts` | Good | 保留 |
| S02 | `unit/leaderboard.test.ts` | Good | 保留 |
| S03 | `unit/points.test.ts` | Good | 保留 |
| S04 | `unit/submissionService.test.ts` | Good | 保留 |
| S05 | `unit/achievements.test.ts` | Good | 保留 |
| S06 | `unit/gamification.test.ts` | Acceptable | 与 points.test 重叠，可合并 |
| S07 | `unit/dockerJudge.test.ts` | Good | 保留 |
| S08 | `unit/judgeQueue.test.ts` | Bad | 重写 |
| S09 | `unit/validate.test.ts` | 未抽样 | 审计 |
| S10 | `unit/errorHandler.test.ts` | 未抽样 | 审计 |
| S11 | `unit/rateLimiter.test.ts` | 未抽样 | 审计 |
| S12 | `unit/languageConfig.test.ts` | 未抽样 | 审计 |
| S13 | `unit/postService.test.ts` | 未抽样 | 审计 |
| S14 | `integration/auth.test.ts` | Acceptable | 与 unit auth 重叠，差异化 |
| S15 | `integration/health.test.ts` | 未抽样 | 审计 |
| S16 | `integration/apiContract.test.ts` | 未抽样 | 审计 |
| S17 | `integration/runSample.test.ts` | 未抽样 | 审计 |

### 3.3 E2E 测试（12 个文件）

| # | 文件路径 | 说明 |
|---|---------|------|
| E01 | `auth/login.spec.ts` | 通过，待审计是否存在条件断言 |
| E02 | `auth/registration.spec.ts` | 同上 |
| E03 | `navigation.spec.ts` | 同上 |
| E04 | `problems/problemList.spec.ts` | 同上 |
| E05 | `problems/problemDetail.spec.ts` | 同上 |
| E06 | `community/communityFlow.spec.ts` | 同上 |
| E07 | `community/postDetail.spec.ts` | 同上 |
| E08 | `contest/contestFlow.spec.ts` | 同上 |
| E09 | `contest/contestDetail.spec.ts` | 同上 |
| E10 | `gamification/gamificationFlow.spec.ts` | 同上 |
| E11 | `user/profile.spec.ts` | 同上 |
| E12 | `judge/judgeFlow.spec.ts` | 同上 |

### 3.4 覆盖缺口分析

**有测试覆盖的：**

- 页面：Home, Login, Register, ProblemList, CommunityPage, CreatePostPage, PostDetailPage, LeaderboardPage, DailyChallengePage, AchievementsPage, PointsPage, VirtualItemsPage
- Store：authStore
- 组件：Footer, Header, App
- 服务：auth, points, achievements, gamification, leaderboard, submissionService, postService, dockerJudge, languageConfig, judgeQueue
- 中间件：validate, errorHandler, rateLimiter
- 集成：health, auth, apiContract, runSample

**无测试覆盖的核心页面/功能（需补）：**

- 页面：ProblemDetail, ContestList, ContestDetail, Profile, LearningPaths, LearningPathDetail, UserProfilePage, MessagesPage, NotificationsPage, FeedPage, GamificationHub
- 服务：authService, userService, contestService, learningPathService, dailyChallenge, virtualItems, loginStreak
- Store：useUIStore, useNotificationStore, useI18nStore
- 中间件：metrics

---

## 4. Phase Plan

该规范通过后，分 4 个 Phase 执行，依次放入独立的实现 Plan。

### Phase 1: Server 整改（17 个文件）

- 重写：judgeQueue
- 审计+修补：validate, errorHandler, rateLimiter, languageConfig, postService, gamification, auth integration, health, apiContract, runSample
- 保留：所有 Good 评级文件
- 补缺：根据审计结果补少量服务端缺口

**预期产出：** Server 17 个文件全部达标，测试覆盖全部 15 个服务 + 5 个中间件 + 1 个 queue。

### Phase 2: Frontend 整改（16 个文件）

- 重写：Home, Login, App
- 审计+修补：Register, LeaderboardPage, Footer, Header, DailyChallengePage, PointsPage, VirtualItemsPage, AchievementsPage
- 保留：所有 Good 评级文件
- 补缺：根据审计补需要新增的页面测试

**预期产出：** Frontend 16 个文件全部达标。

### Phase 3: E2E 整改（12 个文件）

- 逐文件审计：检查条件断言、waitForTimeout、mock 使用
- 按标准和真实用户流程修复/重写

**预期产出：** E2E 12 个文件全部达标，无条件断言，69/69+ 通过。

### Phase 4: 缺口补漏

- 补充无测试的核心页面（ProblemDetail, ContestList, ContestDetail, Profile, LearningPaths...）
- 补充缺失的服务测试（authService, userService, contestService...）
- 补充缺失的 Store 测试（useUIStore, notificationStore...）

**预期产出：** 测试覆盖全部 24 个路由页面 + 15 个服务 + 3 个 store。

---

## 5. Completion Criteria

整个整改完成后，必须满足：

1. **所有现有 45 个测试文件**质量达标——不违反 R1-R4，状态覆盖完整
2. **E2E 全部通过**——`npx playwright test --project=chromium`
3. **前端测试全部通过**——`cd frontend && npm test`
4. **服务端测试全部通过**——`cd server && npm test`
5. **无类型错误**——`cd frontend && npx tsc --noEmit`
6. **覆盖率报告**——生成并记录在 PROJECT.md 中
7. **PROJECT.md 更新**——日期、进度、测试统计
8. **无条件断言**——全文搜索 `if.*toBe` / `if.*isVisible` / `if.*exists` 等模式为 0
9. **无 waitForTimeout**——全文搜索 `waitForTimeout` 为 0（E2E 中）
