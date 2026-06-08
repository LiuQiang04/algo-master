# AlgoMaster - 算法竞赛学习平台

一个功能丰富、设计美观的算法竞赛学习平台，帮助你系统学习算法，提升编程能力，在竞赛中取得好成绩。

## 🚀 功能特色

### 📚 题库系统

- 丰富的题目资源，涵盖各种算法和数据结构
- 多维度筛选：难度、标签、状态
- 实时代码评测，支持多种编程语言

### 🏆 竞赛系统

- 模拟真实竞赛环境
- 实时排行榜
- Rating 系统

### 🎮 游戏化系统

- 积分和等级系统
- 成就徽章系统
- 每日挑战任务
- 虚拟物品奖励

### 👥 社区系统

- 讨论区和题解分享
- 评论和投票系统
- 用户关注和私信

### 🎯 学习路径

- 个性化学习推荐
- 知识图谱可视化
- 学习进度跟踪

## 🛠️ 技术栈

| 层级   | 技术                                           |
| ------ | ---------------------------------------------- |
| 前端   | React 19 + TypeScript + Tailwind CSS v4 + Vite |
| 后端   | Node.js + Express + TypeScript + Prisma ORM    |
| 数据库 | PostgreSQL 16 + Redis 7                        |
| 部署   | Docker + Docker Compose                        |

## 📦 项目结构

```
20260607/
├── frontend/              # 前端 React 应用
│   ├── src/
│   │   ├── components/    # 组件
│   │   ├── pages/         # 页面
│   │   ├── hooks/         # 自定义 Hook
│   │   ├── utils/         # 工具函数
│   │   └── types/         # TypeScript 类型
│   ├── package.json
│   └── vite.config.ts
│
├── backend/               # 后端 API 服务
│   ├── src/
│   │   ├── controllers/   # 控制器
│   │   ├── routes/        # 路由
│   │   ├── middleware/    # 中间件
│   │   ├── services/      # 服务层
│   │   └── utils/         # 工具函数
│   ├── prisma/
│   │   └── schema.prisma  # 数据库模型
│   └── package.json
│
├── server/                # 游戏化和 OJ 服务
│   ├── src/
│   │   ├── services/      # 服务
│   │   ├── controllers/   # 控制器
│   │   └── routes/        # 路由
│   └── package.json
│
├── docker-compose.yml     # Docker 部署配置
├── architecture-design.md # 架构设计文档
└── README.md              # 项目说明
```

## 🚀 快速开始

### 前置要求

- Docker 和 Docker Compose
- Node.js 18+（可选，用于本地开发）
- PostgreSQL 16（可选，用于本地开发）
- Redis 7（可选，用于本地开发）

### 使用 Docker Compose（推荐）

1. 克隆项目

```bash
cd D:\Files\school\project\20260607
```

2. 启动服务

```bash
docker compose up -d
```

3. 访问网站

- 前端：http://localhost:80
- 后端 API：http://localhost:3000
- 服务器：http://localhost:3001

4. 停止服务

```bash
docker compose down
```

### 本地开发

#### 前端开发

```bash
cd frontend
npm install
npm run dev
```

访问 http://localhost:5173

#### 后端开发

```bash
cd backend
npm install
npm run dev
```

API 运行在 http://localhost:3000

## 📚 API 文档

### 认证接口

```
POST /api/auth/register    # 用户注册
POST /api/auth/login       # 用户登录
POST /api/auth/logout      # 用户登出
```

### 用户接口

```
GET  /api/users/me         # 获取当前用户信息
PUT  /api/users/me         # 更新用户信息
GET  /api/users/:id        # 获取用户公开信息
```

### 题目接口

```
GET  /api/problems         # 获取题目列表
GET  /api/problems/:id     # 获取题目详情
POST /api/problems         # 创建题目（管理员）
```

### 提交接口

```
POST /api/submissions      # 提交代码
GET  /api/submissions      # 获取提交历史
GET  /api/submissions/:id  # 获取提交详情
```

### 竞赛接口

```
GET  /api/contests         # 获取竞赛列表
GET  /api/contests/:id     # 获取竞赛详情
POST /api/contests/:id/join # 加入竞赛
```

### 社区接口

```
GET  /api/posts            # 获取帖子列表
POST /api/posts            # 创建帖子
GET  /api/posts/:id        # 获取帖子详情
```

### 游戏化接口

```
GET  /api/achievements     # 获取成就列表
GET  /api/leaderboard      # 获取排行榜
GET  /api/daily-challenge  # 获取每日挑战
```

## 🎨 UI 设计

- 响应式设计，适配各种设备
- 暗色/亮色主题切换
- 流畅的动画效果
- 直观的用户界面

## 🔒 安全特性

- JWT 令牌认证
- 密码加密存储
- CORS 跨域保护
- 输入验证和过滤
- 速率限制

## 📈 性能优化

- 前端代码分割和懒加载
- 后端缓存策略
- 数据库索引优化
- CDN 静态资源加速

## 🤝 贡献指南

欢迎贡献代码！请遵循以下步骤：

1. Fork 项目
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 创建 Pull Request

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情

## 📧 联系我们

- 邮箱：support@algomaster.com
- GitHub：github.com/algomaster

## 🙏 致谢

感谢所有为这个项目做出贡献的人！

---

**AlgoMaster** - 让算法学习更有趣！ 🚀

算法竞赛网站完整架构设计方案

提供技术栈、功能模块、数据库详细信息

@architect❯ 提供技术栈、功能模块、数据库详细信息
  好的，以下是面向开发落地的详细信息汇总。
