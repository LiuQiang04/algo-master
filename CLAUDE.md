# CLAUDE.md

## 🚨 每次任务必须遵守（违反=流程违规）

### 1. 开发前

- **接到任务 → 先调用 `/brainstorming`**（新功能）或 `/systematic-debugging`（bug）
- **复杂任务（3+步骤）→ 调用 `/planning-with-files`** 创建持久化计划
- 图片识别一律用 Zai MCP，不要直接分析
- **数据库安全（以下操作必须用户明确确认）**：
  - `seed` / `prisma db seed` — 清空数据库，必须先问
  - `prisma migrate reset` — 清库+重建，绝对禁止自动执行
  - `prisma migrate dev` — 可能触发 reset，必须用户确认后再执行
  - 任何直接 `TRUNCATE` / `DROP` / `DELETE FROM` 操作 — 必须用户确认
  - 规则：AI **绝不自动执行**任何有删库风险的命令，一律先停手问用户

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

### 测试开发规则

**写任何测试前必须先加载 `test-driven-development` skill（含 `testing-anti-patterns.md`），严格遵循以下规则：**

#### 禁止的反模式

1. **禁止测试 mock 行为** — 不断言 mock 的存在，只断言真实组件行为。`jest.mock()` 的返回值不是为了让你断言它，而是为了隔离外部依赖。
2. **mock 必须覆盖完整字段** — 不能用 `{ title: "x" }` 这种部分 mock，必须包含真实 API 返回的全部字段。部分 mock 会隐藏结构假设，下游代码依赖了你没 mock 的字段时测试仍然通过但线上崩溃。
3. **禁止 `waitForTimeout(N)`** — 用 `waitForSelector` / `waitForResponse` / `toBeVisible` 替代。硬编码等待是不稳定测试的根源。
4. **禁止条件断言** — 不允许 `if (await el.isVisible()) { await expect(el).toBeVisible() }`。这种模式在元素不存在时静默跳过断言，测试等于没跑。
5. **禁止把 bug 断言为正确行为** — 比如 API 报错时显示"空列表"被断言为正确。错误状态应该断言错误信息出现。

#### 前端测试

- 允许 mock service 层来隔离外部依赖，但必须验证 service 被用正确的参数调用（`toHaveBeenCalledWith`）
- 禁止 mock response 只包含测试知道的字段 — 必须包含真实 API 的全部字段和结构
- 测试必须覆盖：加载态、数据态、空态、错误态

#### Server 测试

- 允许 mock Prisma，但真实业务逻辑（计算、映射、条件分支）必须用真实数据验证
- 优先使用真实数据库写集成测试（`prisma` 直调），覆盖核心查询

#### E2E 测试

- 禁止 `page.waitForTimeout(N)` — 用 `waitForLoadState` / `waitForSelector` / `waitForResponse`
- 禁止条件断言 — 每个 `it()` 必须有必然执行的断言
- 必须走真实用户流程：点击 → 等待 → 断言数据变化

#### 违反处理

任何违反上述规则的测试，review 时直接打回重写。

**核心三件套**: `ui-ux-pro-max`（设计指导）+ `vercel-react-best-practices`（代码质量）+ `webapp-testing`（视觉验证）

| 规模 | 适用场景 | 流程 |
|------|---------|------|
| 🔹 小 | 1-2 组件调整 | `ui-ux-pro-max` → 实现 → `webapp-testing` 截图 → 测试 → `verification-before-completion` |
| 🔸 中 | 单页面/3-5 组件 | `brainstorming` → `ui-ux-pro-max` 设计 → 设计规格(存 `docs/superpowers/specs/`) → `planning-with-files` → 逐步实现 → 全量测试 |
| 🔶 大 | 多页面/全局样式 | 中流程 + `frontend-design` 多方案 + 按层实施(全局→共享组件→页面) → 更新 PROJECT.md |

**关键规则**:
- 每次改动后必须 `webapp-testing` 截图确认，不能只靠自动化测试
- 设计规格文档存 `docs/superpowers/specs/YYYY-MM-DD-xxx.md`
- 实施计划存 `docs/superpowers/plans/YYYY-MM-DD-xxx.md`
- 检查多尺寸（375/768/1920）+ 加载/空/错误状态

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
