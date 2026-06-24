# AlgoMaster

算法竞赛学习平台。做这个项目是因为市面上的 OJ 网站大多只提供题目，缺少系统化的学习路径和社区氛围。

## 文档结构

```
docs/
├── README.md              # 文档索引（本文件）
├── development-workflow.md # 开发流程规范
├── architecture-design.md  # 系统架构设计
└── testing-guide.md       # 测试指南

.planning/                  # planning-with-files 自动管理
├── task_plan.md           # 当前任务计划
├── progress.md            # 进度日志
└── findings.md            # 研究发现
```

**核心文档**：
- [README.md](README.md) - 项目说明、快速开始
- [PROJECT.md](PROJECT.md) - 开发细节、API、数据库、进度
- [docs/development-workflow.md](docs/development-workflow.md) - 开发流程、skills 使用

## 现在能用的功能

**题库** - 目前有题目列表、详情页、代码编辑器。支持按难度和标签筛选，提交后能看到评测结果。代码编辑器用的 Monaco Editor，体验还行。

**竞赛** - 有竞赛列表和详情页，能看到倒计时和题目列表。排行榜用 Redis Sorted Set 实现，查询速度不错。

**社区** - 可以发帖、评论、点赞。帖子支持置顶和标签分类。这块功能基本完整，但评论回复还没做。

**个人中心** - 能看到用户信息、提交历史、成就徽章。编辑资料的功能也有了。

**游戏化** - 后端做好了积分、成就、排行榜、每日挑战、虚拟物品。前端页面还没写，这是接下来的重点。

**学习路径** - 页面做了，但还没接后端 API。计划是按算法分类，用户可以跟踪学习进度。

## 技术栈

前端用 React 19 + TypeScript + Tailwind CSS v4 + Vite 8。状态管理用 Zustand，路由用 React Router v7。

后端是 Node.js + Express + Prisma + PostgreSQL 16 + Redis 7。有两个服务：backend 是主 API 服务（端口 3000），server 是游戏化和 OJ 服务（端口 3001）。

前端只和 server 通信（端口 3001），Vite 配置里 `/api` 代理指向的是 server。

## 快速开始

用 Docker 是最省事的方式：

```bash
docker compose up -d
```

这会启动 PostgreSQL、Redis、后端服务和前端。访问 http://localhost:80 就能看到页面。

如果想本地开发，分别在 frontend 和 server 目录下 `npm install && npm run dev`。需要先确保 PostgreSQL 和 Redis 在跑。

种子数据里有两个测试用户：
- 普通用户：alice@example.com / Test123456
- 管理员：admin@algoarena.com / Admin123456

## 测试

共 338 个测试：

- 前端单元测试 107 个 - 覆盖了主要页面和状态管理
- Server 单元测试 141 个 - 覆盖了中间件和游戏化服务
- E2E 测试 90 个（67 通过，12 选择器问题，11 待调整）

跑测试：
```bash
cd frontend && npm test    # 前端测试
cd server && npm test      # Server 测试
npx playwright test        # E2E 测试
```

## 还没做的

- 成就页面、排行榜、每日挑战、虚拟商店的前端
- 学习路径接后端 API
- 算法可视化组件
- 社区的帖子编辑和评论回复
- 竞赛的实时排行榜

## 已知问题

根目录 package.json 的 `dev:client` 和 `build` 脚本引用的是 `client/` 而不是 `frontend/`，直接跑会报错。请在各子目录内执行命令。

部分页面还是 PlaceholderPage（Problems, Contests），前后端集成也没完全搞定。

代理关闭后还会发空闲通知，这个 bug 还没修。
