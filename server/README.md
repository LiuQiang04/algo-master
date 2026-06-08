# 算法竞赛学习网站 - 后端服务

基于 Node.js + Express + TypeScript + Prisma 构建的算法竞赛学习网站后端 API 服务。

## 技术栈

- **运行时**: Node.js 18+
- **框架**: Express.js
- **语言**: TypeScript
- **ORM**: Prisma
- **数据库**: PostgreSQL
- **缓存**: Redis
- **认证**: JWT + bcrypt
- **验证**: Joi
- **日志**: Winston

## 快速开始

### 前置要求

- Node.js 18+
- PostgreSQL 15+
- Redis 7+
- npm 或 yarn

### 安装

```bash
# 安装依赖
npm install

# 生成 Prisma 客户端
npm run prisma:generate

# 运行数据库迁移
npm run prisma:migrate

# 填充种子数据
npm run prisma:seed
```

### 环境变量

复制 `.env.example` 为 `.env` 并配置：

```bash
cp .env.example .env
```

主要配置项：

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/algo_arena?schema=public"
REDIS_URL="redis://localhost:6379"
JWT_SECRET="your-super-secret-jwt-key"
JWT_EXPIRES_IN="7d"
PORT=3001
NODE_ENV=development
```

### 运行

```bash
# 开发模式（热重载）
npm run dev

# 构建
npm run build

# 生产模式
npm start
```

## API 文档

### 认证相关

```
POST   /api/auth/register       - 用户注册
POST   /api/auth/login          - 用户登录
POST   /api/auth/refresh-token  - 刷新令牌
POST   /api/auth/change-password - 修改密码
POST   /api/auth/forgot-password - 忘记密码
GET    /api/auth/me             - 获取当前用户
```

### 用户相关

```
GET    /api/users               - 获取用户列表（管理员）
GET    /api/users/search        - 搜索用户
GET    /api/users/:id           - 获取用户信息
GET    /api/users/:id/stats     - 获取用户统计
PUT    /api/users/me            - 更新个人信息
```

### 题目相关

```
GET    /api/problems            - 获取题目列表
GET    /api/problems/tags       - 获取所有标签
GET    /api/problems/random     - 获取随机题目
GET    /api/problems/:id        - 获取题目详情
POST   /api/problems            - 创建题目（管理员）
PUT    /api/problems/:id        - 更新题目（管理员）
DELETE /api/problems/:id        - 删除题目（管理员）
```

### 提交相关

```
POST   /api/submissions         - 提交代码
GET    /api/submissions         - 获取提交历史
GET    /api/submissions/:id     - 获取提交详情
GET    /api/submissions/:id/status - 获取评测状态
```

### 竞赛相关

```
GET    /api/contests            - 获取竞赛列表
GET    /api/contests/:id        - 获取竞赛详情
POST   /api/contests            - 创建竞赛
POST   /api/contests/:id/join   - 加入竞赛
GET    /api/contests/:id/ranking - 获取竞赛排名
GET    /api/contests/:id/problems - 获取竞赛题目
```

### 社区相关

```
GET    /api/posts               - 获取帖子列表
GET    /api/posts/:id           - 获取帖子详情
POST   /api/posts               - 创建帖子
PUT    /api/posts/:id           - 更新帖子
DELETE /api/posts/:id           - 删除帖子
POST   /api/posts/:id/vote      - 投票
GET    /api/posts/:id/comments  - 获取评论
POST   /api/posts/:id/comments  - 创建评论
```

### 游戏化相关

```
GET    /api/achievements        - 获取成就列表
GET    /api/achievements/me     - 获取用户成就
GET    /api/leaderboard         - 获取排行榜
GET    /api/leaderboard/me      - 获取用户排名
GET    /api/daily-challenge     - 获取每日挑战
POST   /api/daily-challenge/complete - 完成每日挑战
GET    /api/virtual-items       - 获取虚拟物品
GET    /api/virtual-items/me    - 获取用户物品
POST   /api/virtual-items/:id/buy - 购买物品
POST   /api/virtual-items/:id/equip - 装备物品
GET    /api/gamification/points/history - 积分历史
```

## 数据库管理

```bash
# 打开 Prisma Studio（可视化数据库管理）
npm run prisma:studio

# 重置数据库并重新填充数据
npm run prisma:reset

# 创建新的迁移
npm run prisma:migrate
```

## 测试

```bash
# 运行测试
npm test

# 监听模式
npm run test:watch

# 生成覆盖率报告
npm run test:coverage
```

## 项目结构

```
server/
├── prisma/
│   ├── schema.prisma      # 数据库模型定义
│   ├── seed.ts            # 种子数据脚本
│   └── migrations/        # 数据库迁移文件
├── src/
│   ├── config/            # 配置文件
│   │   └── index.ts
│   ├── controllers/       # 控制器层
│   │   ├── authController.ts
│   │   ├── userController.ts
│   │   ├── problemController.ts
│   │   ├── submissionController.ts
│   │   ├── contestController.ts
│   │   └── postController.ts
│   ├── middleware/         # 中间件
│   │   ├── auth.ts        # 认证中间件
│   │   ├── errorHandler.ts # 错误处理
│   │   ├── validate.ts    # 请求验证
│   │   └── rateLimiter.ts # 速率限制
│   ├── routes/            # 路由定义
│   │   ├── auth.ts
│   │   ├── users.ts
│   │   ├── problems.ts
│   │   ├── submissions.ts
│   │   ├── contests.ts
│   │   ├── posts.ts
│   │   ├── achievements.ts
│   │   ├── leaderboard.ts
│   │   ├── dailyChallenge.ts
│   │   ├── virtualItems.ts
│   │   └── gamification.ts
│   ├── services/          # 业务逻辑层
│   │   ├── authService.ts
│   │   ├── userService.ts
│   │   ├── problemService.ts
│   │   ├── submissionService.ts
│   │   ├── contestService.ts
│   │   ├── postService.ts
│   │   └── gamification/
│   │       ├── achievements.ts
│   │       ├── leaderboard.ts
│   │       └── points.ts
│   ├── utils/             # 工具函数
│   │   ├── logger.ts      # 日志工具
│   │   ├── prisma.ts      # Prisma客户端
│   │   ├── redis.ts       # Redis客户端
│   │   ├── jwt.ts         # JWT工具
│   │   ├── password.ts    # 密码工具
│   │   └── errors.ts      # 错误定义
│   └── index.ts           # 应用入口
├── .env.example           # 环境变量示例
├── .gitignore
├── jest.config.ts         # 测试配置
├── package.json
├── README.md
└── tsconfig.json
```

## 默认账户

种子数据包含以下默认账户：

**管理员账户**
- 邮箱: admin@algoarena.com
- 密码: Admin123456

**测试用户**
- 邮箱: alice@example.com
- 密码: Test123456

## 许可证

MIT
