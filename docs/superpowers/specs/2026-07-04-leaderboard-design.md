# 排行榜页面开发设计文档

## 概述

排行榜功能（Leaderboard）的前端代码已存在但未正式启用。本任务修复问题、完成 UI 改造并补充测试。

## 现状

### 已有代码（无需改动）

- Server 路由 `GET /api/leaderboard/:type`（global / friends / region）
- Server 路由 `GET /api/leaderboard/rank/me`（用户排名）
- Server 服务层 leaderboard.ts（含 Redis 缓存、Sorted Set 维护）
- Server 单元测试（10 个，全部通过）
- 前端路由 `/leaderboard` 和 `/gamification/leaderboard` 已注册
- 前端 API 层 leaderboardApi 已封装
- 前端类型 LeaderboardEntry / RegionLeaderboardEntry 已定义
- 导航栏 / 侧边栏 / 底部导航已完成链接
- Redis Sorted Set `leaderboard:global` 在 addPoints 时已维护

### 需要修复的问题

1. **`useGamification.ts:130` — `useUserRank` 数据读取 bug**
   - 当前：`setRanks(response.data.data)`
   - Server 返回：`{ global: number, friends: number }`（无 data 包装）
   - 应改为：`setRanks(response.data)`

2. **UI 使用 Tailwind 类名而非项目 CSS 变量风格**
   - LeaderboardPage.tsx 和 LeaderboardTable.tsx 使用 Tailwind 类名
   - 需要改为与 LoginPage 一致的 CSS 变量内联样式

3. **Seed 数据无 region 字段**
   - region 排行榜始终为空
   - 需要给 seed 用户添加 region 值

4. **无前端测试覆盖**
   - 补充 LeaderboardPage 组件测试

## 技术方案

### 1. Bug 修复

**`frontend/src/hooks/useGamification.ts`**
- 第 130 行：`setRanks(response.data.data)` → `setRanks(response.data)`

### 2. UI 改造

**LeaderboardPage.tsx** 改为 CSS 变量内联样式：

| 元素 | 使用变量 |
|------|---------|
| 背景 | `var(--bg-secondary)` |
| 卡片 | `var(--bg-card)` + `var(--shadow-lg)` |
| 标题 | `var(--text-primary)` |
| 副标题 | `var(--text-secondary)` |
| 排名卡片 | `var(--primary-600)` 渐变（同 LoginPage logo 风格）|
| 标签页 | `var(--bg-secondary)` 背景，激活态 `var(--bg-card)` |
| 错误提示 | `var(--danger-50)` / `var(--danger-700)` |
| 加载动画 | CSS 变量色 spinner |

**LeaderboardTable.tsx**：

| 元素 | 使用变量 |
|------|---------|
| 表格容器 | `var(--bg-card)` + `var(--border-light)` 边框 |
| 表头 | `var(--text-muted)` 文字 |
| 行悬停 | `var(--hover-bg)` |
| 当前用户高亮 | `var(--primary-100)` 背景 + `var(--primary-600)` 边框 |
| 等级徽章 | `var(--primary-100)` + `var(--primary-700)` |
| 经验值 | `var(--text-primary)` |

### 3. Seed 数据

**backend/prisma/seed.ts** 中添加用户 region：

```ts
const regions = ['北京', '上海', '深圳', '杭州', '成都']
// 分配 region 给每个用户
```

### 4. 测试

**`frontend/src/__tests__/components/LeaderboardPage.test.tsx`**
- 渲染页标题
- 加载中显示 spinner
- 错误状态显示错误信息 + 重试按钮
- 正常数据渲染排名卡片 + 表格
- 标签页切换

## 不变的范围

- Server 路由 / 服务 / 测试：不做改动
- 前端路由 / API 层 / 类型定义：不做改动
- 其他 hooks / 导航组件：不做改动
- Redis Sorted Set：不做改动

## 测试策略

- 前端单元测试验证组件渲染和状态处理
- API 通过 `jest.mock` 模拟，不依赖真实后端
- 不写 E2E 测试（已有单元测试覆盖足够）
- 改动后运行完整测试套件确保不破坏现有功能
