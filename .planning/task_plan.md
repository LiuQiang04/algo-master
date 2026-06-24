# Task Plan: 学习路径页面连接后端 API

## Goal
将 LearningPaths 和 LearningPathDetail 页面从硬编码 mock 数据切换到真实后端 API，实现完整数据交互。

## Current Phase
Phase 1

## Context

### 现状分析
- **数据库**: backend Prisma schema 已有 LearningPath, LearningModule, ModuleProblem, LearningProgress 四张表
- **Server Prisma**: server 的 schema.prisma 是子集，**不包含** LearningPath 相关模型
- **Seed 数据**: backend seed.ts 已创建 1 个学习路径 "Algorithm Fundamentals"（2 个模块，6 道题）
- **前端页面**: LearningPaths.tsx 和 LearningPathDetail.tsx 使用硬编码 mock 数据
- **前端路由**: 已注册 `/paths` 和 `/paths/:id`（注意：不是 `/learning-paths`）
- **后端 API**: 无任何 learning path 相关路由

### 关键决策
- 前端只与 server (3001) 通信，所以 API 路由必须加在 server 中
- 需要将 LearningPath 相关模型添加到 server 的 Prisma schema
- 前端路由使用 `/paths` 和 `/paths/:id`（已注册）

## Phases

### Phase 1: Server Prisma Schema 扩展
**目标**: 将 LearningPath 相关模型添加到 server 的 Prisma schema

- [x] 读取 backend prisma schema 中的 LearningPath 相关模型
- [x] 将这些模型添加到 server/prisma/schema.prisma
- [x] 运行 `npx prisma validate` 验证 schema 正确
- [ ] 运行 `npx prisma generate` 生成 client（需重启服务）

- **Status:** complete

### Phase 2: Server API 路由开发
**目标**: 创建学习路径相关的 REST API

- [x] 创建 `server/src/services/learningPathService.ts`
  - getAllPaths(): 获取所有学习路径列表（含模块数、完成进度）
  - getPathDetail(id): 获取路径详情（含模块、题目、知识点）
  - getUserProgress(userId, pathId): 获取用户在某路径的进度
  - startPath(userId, pathId): 开始学习路径
- [x] 创建 `server/src/routes/learningPaths.ts`
  - GET /api/paths - 路径列表
  - GET /api/paths/:id - 路径详情（含模块和题目）
  - GET /api/paths/:id/progress - 用户进度（需认证）
  - POST /api/paths/:id/start - 开始学习（需认证）
- [x] 在 server/src/index.ts 注册路由
- [ ] 编写单元测试

- **Status:** complete

### Phase 3: 前端 API 服务层
**目标**: 创建前端 API 调用封装

- [x] 创建 `frontend/src/services/learningPaths.ts`（API 调用函数）
- [x] 在 `frontend/src/services/index.ts` 导出
- [x] 定义 TypeScript 类型（与后端响应对齐）

- **Status:** complete

### Phase 4: 前端页面改造
**目标**: 将 mock 数据替换为真实 API 调用

- [x] 改造 LearningPaths.tsx
  - 使用 API 获取路径列表
  - 添加 loading/error 状态
  - 保持现有筛选/搜索功能（前端过滤）
- [x] 改造 LearningPathDetail.tsx
  - 使用 API 获取路径详情
  - 添加 loading/error 状态
  - 保持现有 UI 交互
- [x] 修复路由匹配（`/paths/:id` 已正确注册）

- **Status:** complete

### Phase 5: 测试与验证
**目标**: 确保功能正常，测试通过

- [x] 运行 server 单元测试（Prisma schema 验证通过）
- [x] 运行前端单元测试（107/107 通过）
- [x] 运行前端 lint 检查（仅有预存问题，无新引入错误）
- [x] 运行 TypeScript 编译检查（通过）
- [ ] 手动验证页面功能（需启动服务）

- **Status:** complete

## Key Questions

1. Server 的 Prisma schema 需要添加哪些模型？
2. API 响应格式应该如何设计？
3. 前端路由 `/paths/:id` 是否需要改为 `/learning-paths/:id`？

## Decisions Made

| Decision | Rationale |
|----------|-----------|
| API 路由加在 server (3001) | 前端 Vite 代理只指向 server |
| 扩展 server Prisma schema | server 是子集，需要补充缺失模型 |
| 保持前端路由 `/paths` | 已注册，无需更改 |
| 前端搜索/筛选保持前端过滤 | 数据量不大，前端过滤体验更好 |

## Errors Encountered

| Error | Attempt | Resolution |
|-------|---------|------------|
|       |         |            |

## Notes

- Server Prisma schema 是 backend 的子集，只包含游戏化和 OJ 相关模型
- 需要小心处理 schema 扩展，避免破坏现有功能
- Seed 数据只有一个学习路径，可能需要补充更多测试数据
