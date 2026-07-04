# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

AlgoMaster (AlgoArena) - 算法竞赛学习平台。融合题目练习、学习路径、竞赛模拟、社区交流四大核心模块，通过游戏化机制驱动持续学习。

**技术栈**: React 19 + TypeScript + Tailwind CSS v4 + Vite 8 | Node.js + Express + Prisma + PostgreSQL 16 + Redis 7

## Common Commands

### Frontend (frontend/)

```bash
cd frontend
npm install
npm run dev          # 启动开发服务器 (http://localhost:5173)
npm run build        # 构建生产版本 (tsc -b && vite build)
npm run lint         # ESLint 检查
npm test             # Jest 测试
npm test -- --testPathPattern="Login"  # 运行单个测试文件
npm test:watch       # Jest 监听模式
npm test:coverage    # 测试覆盖率
```

### Backend (backend/)

```bash
cd backend
npm install
npm run dev          # 启动开发服务器 (tsx watch, http://localhost:3000)
npm run build        # TypeScript 编译
npm run lint         # ESLint 检查
npm run db:migrate   # Prisma 迁移
npm run db:seed      # 种子数据
npm run db:studio    # Prisma Studio (数据库可视化)
```

### Server (server/) - 游戏化和 OJ 服务

```bash
cd server
npm install
npm run dev          # 启动开发服务器 (ts-node-dev, http://localhost:3001)
npm run build        # TypeScript 编译
npm run lint         # ESLint 检查
npm run db:setup     # 生成 Prisma + 迁移 + 种子数据 (一键初始化)
npm test             # Jest 测试
npm test -- --testPathPattern="auth"  # 运行单个测试文件
```

### 🛑 启动服务规范（必须遵守）

**每次启动 Server 或 Frontend 之前，必须先杀掉该端口上的旧进程：**

```bash
# 先杀旧进程，再启新服务（防止端口冲突）
pwsh -Command "netstat -ano | Select-String ':3001\s' | ForEach-Object { Stop-Process -Id (($_ -split '\s+')[-1]) -Force -SilentlyContinue }"
cd server && npm run dev

pwsh -Command "netstat -ano | Select-String ':5173\s' | ForEach-Object { Stop-Process -Id (($_ -split '\s+')[-1]) -Force -SilentlyContinue }"
cd frontend && npm run dev
```

**用完即关：** 验证完功能后，立即用 `pwsh scripts/stop-dev.ps1` 关闭服务，不留孤儿进程。

### 开发环境管理

```bash
# 一键启动开发环境（会清理旧的端口冲突进程）
pwsh scripts/start-dev.ps1

# 一键关闭开发环境
pwsh scripts/stop-dev.ps1

# 或手动起停单个服务
cd server && npm run dev                          # 启动 Server (端口 3001)
cd frontend && npm run dev                        # 启动 Frontend (端口 5173)
```

**重要**: 主机自带 PostgreSQL 服务，不需要 Docker 启动。Redis 仅 E2E 测试需要。

### Docker（仅生产部署用）

```bash
docker compose up -d                              # 启动所有服务
docker compose --profile production up -d         # 生产环境
docker compose down                               # 停止服务
```

### E2E 测试

```bash
npx playwright test                           # 运行 E2E 测试
npx playwright test --ui                      # UI 模式
npx playwright test --headed                  # 有界面模式
npx playwright test e2e/auth/login.spec.ts    # 运行单个测试文件
```

## Architecture

### 三服务架构

```
frontend/     → React SPA (Vite, 端口 5173)
    ↓ API 代理 (/api → localhost:3001)
server/       → 游戏化 + OJ 服务 (Express, 端口 3001)
    ↕ 共享数据库
backend/      → 主 API 服务 (Express, 端口 3000)
    ↓
PostgreSQL 16 + Redis 7
```

**关键**: 前端 Vite 配置中 `/api` 代理指向 `localhost:3001` (server)，而非 backend (3000)。前端只与 server 通信。

### Frontend 结构

- **路由**: `src/routes.tsx` - 使用 `react-router-dom` v7 的 `createBrowserRouter`
- **状态管理**: Zustand (`src/stores/`)
- **UI 组件库**: `src/components/UI/` - 50+ 自定义组件，统一从 `UI/index.ts` 导出
- **API 服务**: `src/services/` - Axios 封装，按模块拆分 (auth, problems, contests, users, submissions, home)
- **路径别名**: `@` → `./src` (vite.config.ts 配置)

### Backend 结构

- **ORM**: Prisma (`prisma/schema.prisma`) — 完整 schema，25+ 表
- **控制器**: `src/controllers/`
- **路由**: `src/routes/`
- **中间件**: `src/middleware/` (认证、错误处理等)

### Server 结构

- **游戏化系统**: `src/services/gamification/` (积分、成就、排行榜、每日挑战、虚拟物品)
- **测试**: `src/__tests__/` (Jest + Supertest)
- **Prisma**: `prisma/schema.prisma` — 游戏化/OJ 子集 schema

### 数据库

- **主数据库**: PostgreSQL 16
- **缓存**: Redis 7 (排行榜用 Sorted Set)
- **ORM**: Prisma 5
- **表数量**: 25 张 (用户、题目、提交、竞赛、学习路径、游戏化、社区)
- **注意**: backend 和 server 各自有独立的 Prisma schema 文件，指向同一个数据库。backend 的 schema 是完整的，server 的是子集。

## Key Patterns

### 前端组件导入

```tsx
import { Button, Card, Modal, Toast } from '@/components/UI';
```

### API 调用

```tsx
import { problemsApi } from '@/services';
const data = await problemsApi.getProblems({ page: 1, difficulty: 'easy' });
```

### 样式

- 使用 Tailwind CSS v4 + CSS 变量 (如 `var(--primary-600)`, `var(--text-secondary)`)
- 部分组件有独立 CSS 文件 (如 `Badge.css`, `Tabs.css`)
- Prettier 配置: semi, single quotes, trailing commas (es5), 100 字符宽度, 2 空格缩进

### 测试

- 前端: Jest + @testing-library/react (测试文件在 `src/__tests__/`)
- 后端/Server: Jest + Supertest (测试文件在 `src/__tests__/`)
- E2E: Playwright (测试文件在 `e2e/`)

## Environment Variables

后端和 Server 需要 `.env` 文件，参考 `.env.example`：

```
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/algo_arena
REDIS_URL=redis://localhost:6379
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=7d
```

## Project Status

**当前进度**: 90% 完成 (60+ 任务已完成)

### 测试覆盖情况

- **前端单元测试**: 107 个 ✅
- **Server 单元测试**: 141 个 ✅
- **E2E 测试**: 73 个 ✅（全部通过）
- **总测试数**: 321 个 ✅

### 已完成页面

- 首页 (`/`) - 英雄区域、统计数据、功能展示、热门题目、竞赛预告
- 题目列表 (`/problems`) - 搜索、难度筛选、状态筛选、标签筛选、分页
- 题目详情 (`/problems/:id`) - 题目描述、代码编辑器、提交结果
- 竞赛列表 (`/contests`) - 搜索、状态筛选、竞赛卡片
- 竞赛详情 (`/contests/:id`) - 倒计时器、题目列表、排行榜
- 个人中心 (`/profile`) - 个人信息、学习进度、成就徽章、提交历史
- 登录/注册 (`/login`, `/register`)
- 学习路径 (`/paths`, `/paths/:id`) - 算法分类、学习进度跟踪、模块解锁
- 社区页面 (`/community`) - 帖子列表、详情、创建（已测试）

### 待完成页面

- 成就页面 (`/achievements`)
- 排行榜 (`/leaderboard`)
- 每日挑战 (`/daily-challenge`)
- 虚拟商店 (`/virtual-items`)

### 高优先级待完成任务

- 学习路径页面连接后端 API
- 算法可视化组件
- 代码编辑器增强（更多语言支持、主题）
- 竞赛系统完善（实时排行榜、倒计时）
- 社区功能完善（帖子编辑、评论回复）
- 增加游戏化系统测试覆盖

## Development Workflow

### 🚀 任务执行规范（必须遵守）

**每次接到开发任务时，必须自动调用 `planning-with-files` skill 进行持久化计划跟踪：**

```typescript
// 每次任务开始时自动执行
Skill({ skill: "planning-with-files", args: "任务描述" })
```

**执行流程：**

1. 接到任务 → 立即调用 `/planning-with-files`
2. 创建任务计划 → `.planning/task_plan.md`
3. 逐步执行 → 更新进度到 `.planning/progress.md`
4. 完成后 → 自动同步 Git（commit + 可选 push）

**为什么使用：**

- 任务进度持久化，断点续传
- 自动生成进度日志，便于复盘
- 防止遗漏步骤，确保完整性

### Skill 使用规范

**建议：后续开发优先参考已安装的 skill 中的最佳实践，但不强制照搬**

已安装 40 个 skills，按类别分组：

#### 开发流程类（必须使用）

- `brainstorming` - 创意工作前的头脑风暴（任何新功能开发前）
- `systematic-debugging` - 系统化调试（任何 bug/测试失败前）
- `verification-before-completion` - 完成前验证（声明完成前）
- `test-driven-development` - TDD 核心（任何功能/bugfix 前）
- `planning-with-files` - 持久化计划跟踪（复杂任务）

#### 测试相关

- `webapp-testing` - Web 应用测试（92K 安装量）
- `playwright-cli` - Playwright 测试（52K 安装量）
- `playwright-best-practices` - Playwright 最佳实践（48K 安装量）
- `tdd` - TDD 实践

#### 代码质量

- `karpathy-guidelines` - 减少编码错误
- `improve-codebase-architecture` - 改进代码架构
- `requesting-code-review` - 请求代码审查
- `receiving-code-review` - 接收审查反馈

#### 前端/UI

- `vercel-react-best-practices` - React 最佳实践（462K 安装量）
- `tailwind` - Tailwind CSS（64K 安装量）
- `ui-ux-pro-max` - UI/UX 设计指南
- `frontend-design` - 前端设计
- `typescript-advanced-types` - TypeScript 高级类型（46K 安装量）

#### 后端

- `nodejs-backend-patterns` - Node.js 后端模式（36K 安装量）

#### 文档处理

- `humanizer-zh` - 去除 AI 写作痕迹
- `writing-skills` - 编写技能文档
- `skill-creator` - 创建技能
- `markitdown` - 文档转 Markdown

**参考场景：**

| 开发任务       | 必须使用                                              | 推荐使用                                                   |
| -------------- | ----------------------------------------------------- | ---------------------------------------------------------- |
| 新功能开发     | `brainstorming`                                     | `planning-with-files`、`writing-plans`                 |
| Bug 修复       | `systematic-debugging`、`test-driven-development` | `verification-before-completion`                         |
| React 组件开发 | -                                                     | `vercel-react-best-practices`、`tailwind`              |
| 编写测试       | `test-driven-development`                           | `webapp-testing`、`playwright-best-practices`          |
| E2E 测试       | -                                                     | `playwright-cli`、`playwright-best-practices`          |
| 代码重构       | -                                                     | `improve-codebase-architecture`、`karpathy-guidelines` |
| 文档整理       | -                                                     | `humanizer-zh`                                           |
| 完成任务       | `verification-before-completion`                    | `requesting-code-review`                                 |

**使用方式：**

- **每次任务必须先调用 `/planning-with-files`**
- 遇到技术问题时，优先查阅相关 skill
- 根据项目实际情况灵活调整
- 简单功能不必过度工程化
- 鼓励创新，但要遵循基本规范

### 📦 完成任务后自动同步（必须执行）

**每完成一个任务或子任务后，必须执行以下操作：**

```bash
# 1. 更新相关文档（如适用）
#    - README.md（新功能说明）
#    - PROJECT.md（进度更新）
#    - CLAUDE.md（架构变更）

# 2. Git 提交（描述性提交信息）
git add .
git commit -m "feat: 描述性提交信息"

# 3. 可选：推送到远程（根据情况）
# git push
```

**提交信息格式：**

- `feat: 新增xxx功能`
- `fix: 修复xxx问题`
- `test: 新增xxx测试`
- `docs: 更新xxx文档`
- `refactor: 重构xxx模块`

### 文档结构

```
docs/
├── README.md              # 文档索引
├── development-workflow.md # 开发流程规范（详细）
├── architecture-design.md  # 系统架构设计
└── testing-guide.md       # 测试指南

.planning/                  # planning-with-files 自动管理
├── task_plan.md           # 当前任务计划
├── progress.md            # 进度日志
└── findings.md            # 研究发现
```

**核心文档**：

- `README.md` - 项目说明、快速开始
- `PROJECT.md` - 开发细节、API、数据库、进度
- `docs/development-workflow.md` - 开发流程、skills 使用（详细版）

**注意**：`.planning/` 目录由 `planning-with-files` skill 自动管理，不需要手动编辑。

### 开发后必须执行的检查

```bash
# 运行单元测试
cd frontend && npm test
cd server && npm test

# 运行 lint 检查
cd frontend && npm run lint

# TypeScript 编译检查
cd frontend && npx tsc --noEmit

# 运行 E2E 测试（关键功能）
npx playwright test --project=chromium
```

### 测试策略

| 功能类型               | 测试方式            | 优先级 |
| ---------------------- | ------------------- | ------ |
| 核心功能（登录、注册） | 单元测试 + E2E 测试 | 高     |
| 一般功能（页面显示）   | 单元测试            | 中     |
| 辅助功能（动画）       | 手动测试            | 低     |

**测试覆盖情况**:

- **前端单元测试**: 107 个 (ProblemList, CommunityPage, authStore 等)
- **Server 单元测试**: 141 个 (errorHandler, validate, leaderboard 等)
- **E2E 测试**: 73 个 (全部通过，覆盖登录、导航、题目、社区、竞赛、个人资料)

### Bug 修复流程

```
发现 bug → systematic-debugging（找根因） → test-driven-development（写测试） → 修复代码 → verification-before-completion（验证） → requesting-code-review（审查）
```

详细开发流程规范请参考 `docs/development-workflow.md`。

## Known Issues

- 根目录 `package.json` 的 `dev:client` 和 `build` 脚本引用 `client/` 而非 `frontend/`，直接用会报错。请在各子目录内执行命令。
- 部分页面仍使用 PlaceholderPage (Problems, Contests)
- 前后端集成尚未完全完成
- 需要 PostgreSQL 和 Redis 才能运行后端服务
- 代理关闭问题：代理在收到关闭请求后仍会发送空闲通知
- 部分前端文件可能是 Vite 默认模板（已由代理更新）
- 可能存在少量 TypeScript 类型错误，需要修复
