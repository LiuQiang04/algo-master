# 算法竞赛学习网站架构设计

## 1. 项目概述

### 1.1 项目目标
构建一个功能丰富、设计美观、有趣且实用的算法竞赛学习网站，帮助用户学习和准备算法竞赛。

### 1.2 核心价值
- 提供系统化的算法学习路径
- 丰富的题目练习和评测系统
- 游戏化元素增加学习趣味性
- 社区交流促进学习氛围

## 2. 技术栈选择

### 2.1 前端技术栈
- **框架**: React 18 + TypeScript
- **构建工具**: Vite
- **样式**: Tailwind CSS + Headless UI
- **状态管理**: Zustand
- **路由**: React Router v6
- **HTTP客户端**: Axios
- **UI组件库**: Radix UI + 自定义组件

### 2.2 后端技术栈
- **运行时**: Node.js 18+
- **框架**: Express.js + TypeScript
- **ORM**: Prisma
- **认证**: JWT + bcrypt
- **验证**: Joi/Zod
- **日志**: Winston
- **API文档**: Swagger/OpenAPI

### 2.3 数据库
- **主数据库**: PostgreSQL 15
- **缓存**: Redis 7
- **搜索引擎**: Elasticsearch (可选)

### 2.4 开发工具
- **版本控制**: Git + GitHub
- **容器化**: Docker + Docker Compose
- **CI/CD**: GitHub Actions
- **代码质量**: ESLint + Prettier + Husky

## 3. 核心功能模块

### 3.1 用户系统
- 用户注册/登录 (邮箱/手机号)
- 个人资料管理
- 学习进度跟踪
- 成就徽章系统

### 3.2 题库系统
- 题目分类 (按算法类型、难度等级)
- 题目详情 (描述、输入输出格式、样例)
- 题目标签和搜索
- 题目收藏和笔记

### 3.3 在线评测系统 (OJ)
- 代码编辑器 (Monaco Editor)
- 多语言支持 (C++, Java, Python, JavaScript)
- 实时评测和结果反馈
- 评测历史记录

### 3.4 学习路径
- 算法分类学习路径
- 个性化推荐系统
- 学习进度可视化
- 知识图谱展示

### 3.5 竞赛系统
- 模拟竞赛创建和管理
- 实时排行榜
- 竞赛历史记录
- 竞赛分析报告

### 3.6 社区系统
- 讨论区和题解分享
- 用户关注和粉丝系统
- 私信系统
- 活动通知

### 3.7 游戏化系统
- 积分和等级系统
- 成就徽章系统
- 排行榜 (全局、好友、地区)
- 虚拟奖励和道具
- 每日挑战和任务

## 4. 数据库设计

### 4.1 用户相关表
```sql
-- 用户表
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  avatar_url VARCHAR(500),
  bio TEXT,
  rating INTEGER DEFAULT 1500,
  experience_points INTEGER DEFAULT 0,
  level INTEGER DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 用户成就表
CREATE TABLE user_achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  achievement_id UUID REFERENCES achievements(id),
  unlocked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, achievement_id)
);
```

### 4.2 题目相关表
```sql
-- 题目表
CREATE TABLE problems (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(200) NOT NULL,
  description TEXT NOT NULL,
  input_format TEXT,
  output_format TEXT,
  sample_input TEXT,
  sample_output TEXT,
  difficulty INTEGER CHECK (difficulty BETWEEN 1 AND 5),
  time_limit INTEGER DEFAULT 1000, -- 毫秒
  memory_limit INTEGER DEFAULT 256, -- MB
  author_id UUID REFERENCES users(id),
  is_public BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 题目标签表
CREATE TABLE problem_tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  problem_id UUID REFERENCES problems(id),
  tag_id UUID REFERENCES tags(id),
  UNIQUE(problem_id, tag_id)
);

-- 标签表
CREATE TABLE tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(50) UNIQUE NOT NULL,
  category VARCHAR(50) -- 算法类型、数据结构等
);
```

### 4.3 提交和评测表
```sql
-- 提交记录表
CREATE TABLE submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  problem_id UUID REFERENCES problems(id),
  language VARCHAR(20) NOT NULL,
  source_code TEXT NOT NULL,
  status VARCHAR(20) DEFAULT 'pending', -- pending, judging, accepted, wrong_answer, etc.
  execution_time INTEGER, -- 毫秒
  memory_used INTEGER, -- KB
  score INTEGER DEFAULT 0,
  submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 测试用例表
CREATE TABLE test_cases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  problem_id UUID REFERENCES problems(id),
  input TEXT NOT NULL,
  expected_output TEXT NOT NULL,
  is_sample BOOLEAN DEFAULT false,
  score INTEGER DEFAULT 1
);
```

### 4.4 竞赛相关表
```sql
-- 竞赛表
CREATE TABLE contests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(200) NOT NULL,
  description TEXT,
  start_time TIMESTAMP NOT NULL,
  end_time TIMESTAMP NOT NULL,
  creator_id UUID REFERENCES users(id),
  is_public BOOLEAN DEFAULT true,
  max_participants INTEGER,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 竞赛题目表
CREATE TABLE contest_problems (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contest_id UUID REFERENCES contests(id),
  problem_id UUID REFERENCES problems(id),
  problem_order CHAR(1), -- A, B, C, etc.
  score INTEGER DEFAULT 100,
  UNIQUE(contest_id, problem_id)
);

-- 竞赛参与表
CREATE TABLE contest_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contest_id UUID REFERENCES contests(id),
  user_id UUID REFERENCES users(id),
  total_score INTEGER DEFAULT 0,
  rank INTEGER,
  joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(contest_id, user_id)
);
```

### 4.5 社区相关表
```sql
-- 帖子表
CREATE TABLE posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  title VARCHAR(200) NOT NULL,
  content TEXT NOT NULL,
  problem_id UUID REFERENCES problems(id), -- 关联题目 (可选)
  post_type VARCHAR(20), -- discussion, solution, question
  upvotes INTEGER DEFAULT 0,
  downvotes INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 评论表
CREATE TABLE comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  post_id UUID REFERENCES posts(id),
  parent_comment_id UUID REFERENCES comments(id), -- 嵌套评论
  content TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## 5. API设计

### 5.1 用户相关API
```
POST   /api/auth/register     - 用户注册
POST   /api/auth/login        - 用户登录
POST   /api/auth/logout       - 用户登出
GET    /api/users/me          - 获取当前用户信息
PUT    /api/users/me          - 更新用户信息
GET    /api/users/:id         - 获取用户公开信息
GET    /api/users/:id/stats   - 获取用户统计信息
```

### 5.2 题目相关API
```
GET    /api/problems          - 获取题目列表 (分页、筛选)
GET    /api/problems/:id      - 获取题目详情
POST   /api/problems          - 创建题目 (管理员)
PUT    /api/problems/:id      - 更新题目 (管理员)
GET    /api/problems/tags     - 获取所有标签
GET    /api/problems/random   - 获取随机题目
```

### 5.3 提交和评测API
```
POST   /api/submissions       - 提交代码
GET    /api/submissions       - 获取提交历史
GET    /api/submissions/:id   - 获取提交详情
GET    /api/submissions/:id/status - 获取评测状态
```

### 5.4 竞赛相关API
```
GET    /api/contests          - 获取竞赛列表
GET    /api/contests/:id      - 获取竞赛详情
POST   /api/contests          - 创建竞赛
POST   /api/contests/:id/join - 加入竞赛
GET    /api/contests/:id/ranking - 获取竞赛排名
GET    /api/contests/:id/problems - 获取竞赛题目
```

### 5.5 社区相关API
```
GET    /api/posts             - 获取帖子列表
GET    /api/posts/:id         - 获取帖子详情
POST   /api/posts             - 创建帖子
POST   /api/posts/:id/vote    - 投票
GET    /api/posts/:id/comments - 获取评论
POST   /api/posts/:id/comments - 创建评论
```

### 5.6 游戏化相关API
```
GET    /api/achievements      - 获取成就列表
GET    /api/achievements/me   - 获取用户成就
GET    /api/leaderboard       - 获取排行榜
GET    /api/daily-challenge   - 获取每日挑战
POST   /api/daily-challenge/complete - 完成每日挑战
```

## 6. 系统架构

### 6.1 整体架构图
```
┌─────────────────────────────────────────────────────────────┐
│                      客户端 (浏览器)                          │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐            │
│  │   React    │  │  Monaco    │  │  Chart.js  │            │
│  │   App      │  │  Editor    │  │  图表库    │            │
│  └────────────┘  └────────────┘  └────────────┘            │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    负载均衡器 (Nginx)                         │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    API网关 (Express.js)                      │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐            │
│  │  认证中间件  │  │  限流中间件  │  │  日志中间件  │            │
│  └────────────┘  └────────────┘  └────────────┘            │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    微服务层 (可选)                            │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐            │
│  │  用户服务   │  │  题目服务   │  │  评测服务   │            │
│  └────────────┘  └────────────┘  └────────────┘            │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐            │
│  │  竞赛服务   │  │  社区服务   │  │  游戏化服务 │            │
│  └────────────┘  └────────────┘  └────────────┘            │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    数据层                                    │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐            │
│  │ PostgreSQL │  │   Redis    │  │  评测沙箱   │            │
│  │  主数据库   │  │   缓存     │  │  (Docker)  │            │
│  └────────────┘  └────────────┘  └────────────┘            │
└─────────────────────────────────────────────────────────────┘
```

### 6.2 评测系统架构
```
┌─────────────────────────────────────────────────────────────┐
│                    评测系统                                  │
│  ┌─────────────────────────────────────────────────────┐   │
│  │                 评测队列 (Redis)                     │   │
│  └─────────────────────────────────────────────────────┘   │
│                              │                              │
│                              ▼                              │
│  ┌─────────────────────────────────────────────────────┐   │
│  │                 评测调度器                           │   │
│  └─────────────────────────────────────────────────────┘   │
│                              │                              │
│                              ▼                              │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐            │
│  │  C++ 沙箱  │  │  Java 沙箱 │  │ Python 沙箱│            │
│  │  (Docker)  │  │  (Docker)  │  │  (Docker)  │            │
│  └────────────┘  └────────────┘  └────────────┘            │
│                              │                              │
│                              ▼                              │
│  ┌─────────────────────────────────────────────────────┐   │
│  │                 结果收集器                           │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

## 7. 安全设计

### 7.1 认证和授权
- JWT令牌认证
- 角色基础访问控制 (RBAC)
- OAuth2.0集成 (可选)
- 密码加密 (bcrypt)

### 7.2 数据安全
- SQL注入防护 (参数化查询)
- XSS防护 (内容安全策略)
- CSRF防护 (令牌验证)
- 输入验证和清理

### 7.3 系统安全
- HTTPS强制使用
- 限流和防DDoS
- 日志审计
- 定期安全更新

## 8. 性能优化

### 8.1 前端优化
- 代码分割和懒加载
- 图片优化和CDN
- 缓存策略 (Service Worker)
- 虚拟滚动 (长列表)

### 8.2 后端优化
- 数据库索引优化
- 查询优化
- 缓存策略 (Redis)
- 连接池管理

### 8.3 评测系统优化
- 评测队列管理
- 资源限制和隔离
- 结果缓存
- 并发控制

## 9. 部署方案

### 9.1 开发环境
- Docker Compose本地开发
- 热重载开发服务器
- 本地数据库和缓存

### 9.2 生产环境
- Kubernetes集群部署
- 自动扩缩容
- 蓝绿部署
- 监控和告警

### 9.3 CI/CD流水线
```
代码提交 → 自动测试 → 代码扫描 → 构建镜像 → 部署到暂存 → 集成测试 → 部署到生产
```

## 10. 监控和运维

### 10.1 监控指标
- 系统性能 (CPU、内存、磁盘)
- 应用性能 (响应时间、错误率)
- 业务指标 (用户活跃度、题目通过率)

### 10.2 日志管理
- 结构化日志
- 日志聚合和分析
- 错误追踪和告警

### 10.3 备份和恢复
- 数据库定期备份
- 灾难恢复计划
- 数据迁移策略

## 11. 项目里程碑

### 阶段一：基础功能 (4周)
- 用户系统
- 基础题库
- 简单评测系统
- 基础UI框架

### 阶段二：核心功能 (6周)
- 完整评测系统
- 学习路径
- 竞赛系统
- 社区功能

### 阶段三：游戏化功能 (4周)
- 成就系统
- 排行榜
- 积分系统
- 每日挑战

### 阶段四：优化和部署 (4周)
- 性能优化
- 安全加固
- 生产部署
- 监控系统

## 12. 团队分工建议

### 前端开发 (2人)
- 用户界面和组件库
- 响应式设计
- 交互体验优化

### 后端开发 (2人)
- API开发
- 数据库设计
- 业务逻辑实现

### 评测系统开发 (1人)
- 评测沙箱
- 评测队列
- 结果处理

### 全栈开发 (1人)
- 游戏化系统
- 社区功能
- 系统集成

## 13. 风险评估

### 技术风险
- 评测系统安全性
- 高并发性能
- 数据一致性

### 项目风险
- 需求变更
- 进度延迟
- 技术债务

### 缓解措施
- 原型验证
- 迭代开发
- 代码审查
- 自动化测试

---

*文档版本: 1.0*
*最后更新: 2026年6月7日*