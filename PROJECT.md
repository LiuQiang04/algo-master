# AlgoMaster - 算法竞赛学习平台开发文档

> **最后更新**: 2026-06-07
> **项目状态**: 开发中 (约 83% 完成)
> **前端地址**: http://localhost:5173 (需启动)

---

## 一、项目概述

### 1.1 项目简介
AlgoMaster 是一个面向算法竞赛学习者的一站式平台，融合题目练习、学习路径、竞赛模拟、社区交流四大核心模块，通过游戏化机制驱动持续学习。

### 1.2 核心理念
- **系统化学习**: 从入门到进阶的完整学习路径
- **实战导向**: 模拟真实竞赛环境
- **游戏化驱动**: 积分、成就、排行榜激励学习
- **社区互助**: 讨论区、题解分享、用户互动

---

## 二、技术栈

### 2.1 前端技术栈

| 技术 | 版本 | 用途 |
|------|------|------|
| React | 19.x | UI 框架 |
| TypeScript | 6.x | 类型安全 |
| Vite | 8.x | 构建工具 |
| Tailwind CSS | 4.x | 样式框架 |
| React Router | 7.x | 路由管理 |
| Zustand | 5.x | 状态管理 |
| Axios | 1.x | HTTP 客户端 |
| Lucide React | 1.x | 图标库 |
| Monaco Editor | - | 代码编辑器 |

### 2.2 后端技术栈

| 技术 | 版本 | 用途 |
|------|------|------|
| Node.js | 18+ | 运行时 |
| Express | 4.x | Web 框架 |
| TypeScript | 5.x | 类型安全 |
| Prisma | 5.x | ORM |
| PostgreSQL | 16 | 主数据库 |
| Redis | 7 | 缓存/排行榜 |
| JWT | - | 认证 |
| bcrypt | - | 密码加密 |
| Winston | - | 日志 |
| Joi | - | 请求验证 |

### 2.3 部署技术栈

| 技术 | 用途 |
|------|------|
| Docker | 容器化 |
| Docker Compose | 本地开发 |
| Kubernetes | 生产部署 |
| Nginx | 反向代理 |
| GitHub Actions | CI/CD |
| Prometheus + Grafana | 监控 |

---

## 三、项目结构

```
D:\Files\school\project\20260607\
├── README.md                    # 项目说明文档
├── PROJECT.md                   # 本文档（开发细节）
├── architecture-design.md       # 架构设计文档
├── docker-compose.yml           # Docker 部署配置
├── package.json                 # 根项目配置
│
├── frontend/                    # 前端 React 应用
│   ├── src/
│   │   ├── App.tsx              # 路由入口
│   │   ├── main.tsx             # 应用入口
│   │   ├── index.css            # 全局样式
│   │   ├── components/
│   │   │   ├── Layout/
│   │   │   │   ├── Header.tsx   # 导航栏
│   │   │   │   ├── Footer.tsx   # 页脚
│   │   │   │   └── MainLayout.tsx
│   │   │   ├── Navbar/
│   │   │   │   └── Navbar.tsx   # 响应式导航栏
│   │   │   └── UI/              # 基础 UI 组件
│   │   ├── pages/
│   │   │   ├── Home.tsx         # 首页
│   │   │   ├── Home/
│   │   │   │   └── Home.tsx     # 增强版首页
│   │   │   ├── Problems.tsx     # 题库页面
│   │   │   ├── Problems/
│   │   │   │   ├── ProblemList.tsx    # 题目列表
│   │   │   │   └── ProblemDetail.tsx  # 题目详情
│   │   │   ├── Login.tsx        # 登录
│   │   │   ├── Register.tsx     # 注册
│   │   │   ├── Contests/
│   │   │   │   ├── ContestList.tsx    # 竞赛列表
│   │   │   │   └── ContestDetail.tsx  # 竞赛详情
│   │   │   ├── Profile/
│   │   │   │   └── Profile.tsx  # 个人中心
│   │   │   ├── Community/       # 社区页面
│   │   │   └── Gamification/    # 游戏化页面
│   │   ├── routes/
│   │   │   └── index.tsx        # 路由配置
│   │   ├── stores/              # Zustand 状态
│   │   ├── hooks/               # 自定义 Hooks
│   │   ├── services/            # API 服务
│   │   ├── types/               # TypeScript 类型
│   │   └── utils/               # 工具函数
│   ├── package.json
│   └── vite.config.ts
│
├── backend/                     # 后端 API 服务（主服务）
│   ├── src/
│   │   ├── index.ts             # 入口
│   │   ├── config/              # 配置
│   │   ├── controllers/         # 控制器
│   │   ├── routes/              # 路由
│   │   ├── middleware/          # 中间件
│   │   ├── services/            # 服务层
│   │   └── utils/               # 工具
│   ├── prisma/
│   │   ├── schema.prisma        # 数据库模型（25张表）
│   │   ├── seed.ts              # 种子数据
│   │   └── migrations/          # 迁移文件
│   └── package.json
│
├── server/                      # 游戏化和 OJ 服务
│   ├── src/
│   │   ├── index.ts             # 入口
│   │   ├── config/              # 配置
│   │   ├── controllers/         # 控制器
│   │   ├── routes/              # 路由
│   │   ├── services/            # 业务逻辑
│   │   │   └── gamification/
│   │   │       ├── points.ts        # 积分系统
│   │   │       ├── achievements.ts  # 成就系统
│   │   │       ├── leaderboard.ts   # 排行榜
│   │   │       ├── dailyChallenge.ts # 每日挑战
│   │   │       └── virtualItems.ts  # 虚拟物品
│   │   ├── middleware/          # 中间件
│   │   └── utils/               # 工具
│   ├── prisma/
│   │   ├── schema.prisma        # 完整数据库模型
│   │   └── seed.ts              # 种子数据
│   └── package.json
│
├── kubernetes/                  # K8s 部署配置
├── monitoring/                  # 监控配置
├── security/                    # 安全配置
├── deploy/                      # 部署脚本
└── .github/                     # GitHub Actions
```

---

## 四、数据库设计

### 4.1 数据库概览

- **主数据库**: PostgreSQL 16
- **缓存**: Redis 7
- **ORM**: Prisma 5
- **总表数**: 25 张

### 4.2 数据库表清单

#### 用户系统
| 表名 | 说明 |
|------|------|
| users | 用户表 |
| achievements | 成就定义表 |
| user_achievements | 用户成就关联表 |

#### 题库系统
| 表名 | 说明 |
|------|------|
| problems | 题目表 |
| tags | 标签表 |
| problem_tags | 题目标签关联表 |
| test_cases | 测试用例表 |

#### 提交系统
| 表名 | 说明 |
|------|------|
| submissions | 提交记录表 |

#### 竞赛系统
| 表名 | 说明 |
|------|------|
| contests | 竞赛表 |
| contest_problems | 竞赛题目关联表 |
| contest_participants | 竞赛参与者表 |

#### 学习路径
| 表名 | 说明 |
|------|------|
| learning_paths | 学习路径表 |
| learning_modules | 学习模块表 |
| module_problems | 模块题目关联表 |
| learning_progress | 学习进度表 |

#### 游戏化系统
| 表名 | 说明 |
|------|------|
| point_history | 积分历史表 |
| daily_challenges | 每日挑战表 |
| daily_challenge_completions | 每日挑战完成记录表 |
| virtual_items | 虚拟物品表 |
| user_virtual_items | 用户虚拟物品关联表 |

#### 社交系统
| 表名 | 说明 |
|------|------|
| friendships | 好友关系表 |
| login_streaks | 登录连续天数表 |
| posts | 帖子表 |
| comments | 评论表 |
| notifications | 通知表 |

---

## 五、API 接口设计

### 5.1 认证接口

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | /api/auth/register | 用户注册 |
| POST | /api/auth/login | 用户登录 |
| POST | /api/auth/logout | 用户登出 |
| GET | /api/auth/me | 获取当前用户 |

### 5.2 用户接口

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | /api/users/:id | 获取用户信息 |
| PUT | /api/users/me | 更新用户信息 |
| GET | /api/users/:id/posts | 获取用户帖子 |
| GET | /api/users/:id/followers | 获取粉丝列表 |
| GET | /api/users/:id/following | 获取关注列表 |
| POST | /api/users/:id/follow | 关注用户 |

### 5.3 题目接口

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | /api/problems | 获取题目列表 |
| GET | /api/problems/:id | 获取题目详情 |
| POST | /api/problems | 创建题目（管理员） |
| PUT | /api/problems/:id | 更新题目 |

### 5.4 提交接口

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | /api/submissions | 提交代码 |
| GET | /api/submissions | 获取提交历史 |
| GET | /api/submissions/:id | 获取提交详情 |

### 5.5 竞赛接口

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | /api/contests | 获取竞赛列表 |
| GET | /api/contests/:id | 获取竞赛详情 |
| POST | /api/contests | 创建竞赛 |
| POST | /api/contests/:id/join | 加入竞赛 |
| GET | /api/contests/:id/standings | 获取排行榜 |

### 5.6 社区接口

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | /api/posts | 获取帖子列表 |
| POST | /api/posts | 创建帖子 |
| GET | /api/posts/:id | 获取帖子详情 |
| POST | /api/posts/:id/vote | 投票 |
| GET | /api/posts/:id/comments | 获取评论 |
| POST | /api/posts/:id/comments | 创建评论 |

### 5.7 游戏化接口

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | /api/achievements | 获取成就列表 |
| GET | /api/achievements/me | 获取用户成就 |
| GET | /api/leaderboard/:type | 获取排行榜 |
| GET | /api/daily-challenge | 获取每日挑战 |
| POST | /api/daily-challenge/complete | 完成每日挑战 |
| GET | /api/virtual-items | 获取虚拟物品 |
| POST | /api/virtual-items/:id/buy | 购买虚拟物品 |

---

## 六、前端页面

### 6.1 已完成页面

| 页面 | 路径 | 功能 |
|------|------|------|
| 首页 | / | 英雄区域、统计数据、功能展示、热门题目、竞赛预告 |
| 题目列表 | /problems | 搜索、难度筛选、状态筛选、标签筛选、分页 |
| 题目详情 | /problems/:id | 题目描述、代码编辑器、提交结果、相关题目 |
| 竞赛列表 | /contests | 搜索、状态筛选、竞赛卡片 |
| 竞赛详情 | /contests/:id | 倒计时器、题目列表、排行榜 |
| 个人中心 | /profile | 个人信息、学习进度、成就徽章、提交历史 |
| 登录 | /login | 登录表单 |
| 注册 | /register | 注册表单 |

### 6.2 待完成页面

| 页面 | 路径 | 功能 |
|------|------|------|
| 社区首页 | /community | 帖子列表、分类筛选 |
| 帖子详情 | /community/:id | 帖子内容、评论 |
| 创建帖子 | /community/create | 发帖表单 |
| 成就页面 | /achievements | 成就列表、进度 |
| 排行榜 | /leaderboard | 全局/好友/地区排行 |
| 每日挑战 | /daily-challenge | 今日题目、任务 |
| 虚拟商店 | /virtual-items | 物品列表、购买 |
| 学习路径 | /paths | 路径列表、进度 |

---

## 七、后端服务

### 7.1 已完成服务

| 服务 | 说明 |
|------|------|
| 认证服务 | JWT 登录/注册/鉴权 |
| 用户服务 | 用户 CRUD、关注系统 |
| 题目服务 | 题目 CRUD、标签管理 |
| 提交服务 | 代码提交、评测结果 |
| 竞赛服务 | 竞赛 CRUD、报名、排行榜 |
| 社区服务 | 帖子、评论、投票 |
| 游戏化服务 | 积分、成就、排行榜、每日挑战、虚拟物品 |
| 通知服务 | 通知推送、已读状态 |

### 7.2 游戏化系统详情

#### 积分系统
- 解题 AC: +50 * difficulty_multiplier
- 每日登录: +5 XP
- 写题解: +100 XP
- 参与竞赛: +30 XP
- 成就解锁: +10~100 XP（按稀有度）

#### 等级系统
- 公式: level = floor(sqrt(xp / 100)) + 1
- 等级 1-100
- 每级所需经验指数增长

#### 成就系统
- 25+ 种成就
- 分类: 解题、竞赛、学习、社交、特殊
- 稀有度: 普通、稀有、史诗、传说

#### 排行榜
- 全局排行榜（经验值）
- 好友排行榜
- 地区排行榜
- Redis Sorted Set 实现

---

## 八、部署配置

### 8.1 Docker Compose

```yaml
services:
  postgres:
    image: postgres:16-alpine
    ports: ["5432:5432"]
    
  redis:
    image: redis:7-alpine
    ports: ["6379:6379"]
    
  backend:
    build: ./backend
    ports: ["3000:3000"]
    
  server:
    build: ./server
    ports: ["3001:3001"]
    
  frontend:
    build: ./frontend
    ports: ["80:80"]
```

### 8.2 启动命令

```bash
# 开发环境
docker compose up -d

# 生产环境
docker compose --profile production up -d

# 停止服务
docker compose down
```

### 8.3 环境变量

```env
# 数据库
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/algo_oj
REDIS_URL=redis://localhost:6379

# JWT
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=7d

# 服务端口
PORT=3001
NODE_ENV=development
```

---

## 九、开发进度

### 9.1 已完成任务 (83%)

| 类别 | 完成数 | 状态 |
|------|--------|------|
| 架构设计 | 2 | ✅ |
| 前端基础 | 12 | ✅ |
| 后端基础 | 10 | ✅ |
| 数据库 | 5 | ✅ |
| 游戏化 | 2 | ✅ |
| 社区 | 7 | ✅ |
| 测试 | 7 | ✅ |
| 部署 | 5 | ✅ |
| **总计** | **50+** | ✅ |

### 9.2 待完成任务

| 任务 | 优先级 | 预计工时 |
|------|--------|----------|
| 集成前后端 | 高 | 2天 |
| 运行调试 | 高 | 2天 |
| 学习路径页面 | 中 | 3天 |
| 算法可视化 | 低 | 5天 |
| 文档完善 | 中 | 1天 |

---

## 十、启动指南

### 10.1 前端启动

```bash
cd frontend
npm install
npm run dev
# 访问 http://localhost:5173
```

### 10.2 后端启动

```bash
cd server
npm install
npm run db:setup   # 生成 Prisma + 迁移 + 种子数据
npm run dev        # 启动开发服务器
# API 地址 http://localhost:3001
```

### 10.3 Docker 启动

```bash
# 安装 Docker Desktop 后
docker compose up -d
# 前端: http://localhost:80
# 后端: http://localhost:3000
# 服务器: http://localhost:3001
```

---

## 十一、已知问题

1. **代理关闭问题**: 代理在收到关闭请求后仍会发送空闲通知
2. **前端模板**: 部分前端文件可能是 Vite 默认模板（已由代理更新）
3. **数据库连接**: 需要 PostgreSQL 和 Redis 才能运行后端
4. **TypeScript 错误**: 可能存在少量类型错误，需要修复

---

## 十二、后续开发计划

### Phase 1: 完善核心功能 (1周)
- [ ] 集成前后端
- [ ] 修复 TypeScript 错误
- [ ] 运行和调试
- [ ] 完善错误处理

### Phase 2: 添加缺失功能 (2周)
- [ ] 学习路径页面
- [ ] 社区页面完善
- [ ] 游戏化页面完善
- [ ] 算法可视化

### Phase 3: 优化和测试 (1周)
- [ ] 性能优化
- [ ] 单元测试
- [ ] E2E 测试
- [ ] 安全审计

### Phase 4: 部署上线 (1周)
- [ ] 生产环境配置
- [ ] CI/CD 流水线
- [ ] 监控告警
- [ ] 文档完善

---

## 十三、联系方式

- **项目地址**: D:\Files\school\project\20260607
- **前端地址**: http://localhost:5173
- **后端地址**: http://localhost:3001

---

## 十四、更新日志

### 2026-06-07
- 创建项目文档
- 完成架构设计
- 完成前端基础页面
- 完成后端 API 服务
- 完成数据库设计
- 完成游戏化系统
- 完成社区系统
- 完成测试框架
- 完成部署配置

---

*本文档将随项目开发持续更新*
