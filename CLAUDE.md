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

### Docker
```bash
docker compose -f docker-compose.dev.yml up -d  # 仅启动 PostgreSQL + Redis (开发用)
docker compose up -d                              # 启动所有服务 (含前端/后端/服务器)
docker compose --profile production up -d         # 生产环境
docker compose down                               # 停止服务
docker compose down -v                            # 停止并删除数据卷
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

**当前进度**: 83% 完成 (50+ 任务已完成)

### 已完成页面
- 首页 (`/`) - 英雄区域、统计数据、功能展示、热门题目、竞赛预告
- 题目列表 (`/problems`) - 搜索、难度筛选、状态筛选、标签筛选、分页
- 题目详情 (`/problems/:id`) - 题目描述、代码编辑器、提交结果
- 竞赛列表 (`/contests`) - 搜索、状态筛选、竞赛卡片
- 竞赛详情 (`/contests/:id`) - 倒计时器、题目列表、排行榜
- 个人中心 (`/profile`) - 个人信息、学习进度、成就徽章、提交历史
- 登录/注册 (`/login`, `/register`)
- 学习路径 (`/paths`, `/paths/:id`) - 算法分类、学习进度跟踪、模块解锁

### 待完成页面
- 社区页面 (`/community`) - 帖子列表、详情、创建
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

## Development Workflow

### Skill 使用规范

**建议：后续开发优先参考已安装的 skill 中的最佳实践，但不强制照搬**

已安装的 skill：
- `vercel-react-best-practices` - React 最佳实践（462K 安装量）
- `webapp-testing` - Web 应用测试（92K 安装量）
- `tailwind` - Tailwind CSS（64K 安装量）
- `playwright-cli` - Playwright 测试（52K 安装量）
- `playwright-best-practices` - Playwright 最佳实践（48K 安装量）
- `typescript-advanced-types` - TypeScript 高级类型（46K 安装量）
- `nodejs-backend-patterns` - Node.js 后端模式（36K 安装量）

**参考场景：**
| 开发任务 | 参考的 Skill |
|---------|-------------|
| React 组件开发 | `vercel-react-best-practices` |
| 编写测试用例 | `webapp-testing`、`playwright-best-practices` |
| Tailwind CSS 样式 | `tailwind` |
| E2E 测试 | `playwright-cli`、`playwright-best-practices` |
| TypeScript 类型定义 | `typescript-advanced-types` |
| Node.js 后端开发 | `nodejs-backend-patterns` |

**使用方式：**
- 遇到技术问题时，优先查阅相关 skill
- 根据项目实际情况灵活调整
- 简单功能不必过度工程化
- 鼓励创新，但要遵循基本规范

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

| 功能类型 | 测试方式 | 优先级 |
|---------|---------|--------|
| 核心功能（登录、注册） | 单元测试 + E2E 测试 | 高 |
| 一般功能（页面显示） | 单元测试 | 中 |
| 辅助功能（动画） | 手动测试 | 低 |

### Bug 修复流程

```
发现 bug → 写测试复现 → 修复代码 → 确认测试通过 → 提交
```

详细开发流程规范请参考 `PROJECT.md` 第十三章。

## Known Issues

- 根目录 `package.json` 的 `dev:client` 和 `build` 脚本引用 `client/` 而非 `frontend/`，直接用会报错。请在各子目录内执行命令。
- 部分页面仍使用 PlaceholderPage (Problems, Contests)
- 前后端集成尚未完全完成
- 需要 PostgreSQL 和 Redis 才能运行后端服务
- 代理关闭问题：代理在收到关闭请求后仍会发送空闲通知
- 部分前端文件可能是 Vite 默认模板（已由代理更新）
- 可能存在少量 TypeScript 类型错误，需要修复
