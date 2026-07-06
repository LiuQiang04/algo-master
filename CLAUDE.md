# CLAUDE.md

## 🚨 每次任务必须遵守（违反=流程违规）

### 1. 开发前

- **接到任务 → 先调用 `/brainstorming`**（新功能）或 `/systematic-debugging`（bug）
- **复杂任务（3+步骤）→ 调用 `/planning-with-files`** 创建持久化计划
- 图片识别一律用 Zai MCP，不要直接分析

### 2. 开发中（每完成一个子任务）

```
① 更新相关文档（PROJECT.md 进度、API 变更等）
② 运行测试：cd frontend && npm test && cd ../server && npm test
③ git add . && git commit -m "feat/fix/test: 描述"
```

### 3. 开发完成

```
④ 运行全量验证：
   cd frontend && npm test && npx tsc --noEmit
   cd ../server && npm test
   npx playwright test --project=chromium
⑤ 更新 PROJECT.md（日期、进度、测试统计）
⑥ 最终提交：git add . && git commit -m "feat: xxx 完成"
```

### 4. 启动服务规范

```bash
# 启动前必须杀掉旧进程
pwsh scripts/start-dev.ps1

# 用完即关
pwsh scripts/stop-dev.ps1
```

---

## 项目简介

**AlgoMaster (AlgoArena)** — 算法竞赛学习平台。React 19 + TypeScript + Tailwind CSS v4 + Vite 8 | Node.js + Express + Prisma + PostgreSQL 16 + Redis 7

Three-service arch: Frontend(5173) → Vite proxy /api → Server(3001) → DB。前端只与 Server 通信。

---

## 常用命令

### Frontend

```bash
cd frontend && npm install && npm run dev
npm test                           # Jest 测试
npm test -- --testPathPattern="xxx"
npm run lint                       # ESLint
npx tsc --noEmit                   # 类型检查
```

### Server

```bash
cd server && npm run dev
npm test
npx prisma validate                # Schema 验证
npx prisma generate                # 生成 Client
```

### E2E

```bash
npx playwright test --project=chromium
npx playwright test e2e/auth/login.spec.ts
```

---

## 开发流程速查

**完整流程规范见 `docs/development-workflow.md`**，核心流程如下：

### 新功能

```
brainstorming → writing-plans → planning-with-files → 执行 → 验证 → 审查 → 完成
```

### Bug 修复

```
systematic-debugging → test-driven-development → 修复 → verification-before-completion → 审查
```

### 必须使用的 Skill

| 场景            | Skill                              |
| --------------- | ---------------------------------- |
| 新功能开发前    | `brainstorming`                  |
| 任何 bug/失败   | `systematic-debugging`           |
| 声明完成前      | `verification-before-completion` |
| 任何功能/bugfix | `test-driven-development`        |
| React 组件      | `vercel-react-best-practices`    |
| 代码审查        | `requesting-code-review`         |

---

## 架构

```
frontend/ (5173) → /api proxy → server/ (3001) → PostgreSQL 16 + Redis 7
                                backend/ (3000)  ← 与 server 共享数据库
```

**关键路径**: `frontend/src/` 路由(routes.tsx)、状态(Zustand/stores)、API(services/)、组件(components/UI/)

**Server**: `server/src/routes/`、`services/gamification/`、`middleware/`

---

## 测试现状

- 前端单元测试: 115 ✅
- Server 单元测试: 143 ✅
- E2E 测试: 68/68 ✅

---

## 版本已知问题

- 根目录 package.json 的 dev:client/build 引用 client/，请在子目录执行
- postDetail E2E 测试有预存的报错（跟排行榜改动无关）
