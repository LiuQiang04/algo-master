# AlgoMaster - 算法竞赛学习平台开发文档

> **最后更新**: 2026-06-09
> **项目状态**: 开发中 (约 88% 完成)
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

### 9.1 已完成任务 (88%)

| 类别 | 完成数 | 状态 |
|------|--------|------|
| 架构设计 | 2 | ✅ |
| 前端基础 | 12 | ✅ |
| 后端基础 | 10 | ✅ |
| 数据库 | 5 | ✅ |
| 游戏化 | 2 | ✅ |
| 社区 | 7 | ✅ |
| 测试 | 12 | ✅ |
| 部署 | 5 | ✅ |
| 文档 | 3 | ✅ |
| **总计** | **58+** | ✅ |

### 9.2 测试覆盖情况

| 测试类型 | 数量 | 状态 |
|---------|------|------|
| 前端单元测试 | 52 | ✅ 全部通过 |
| 服务器单元测试 | 97 | ✅ 全部通过 |
| E2E 测试 | 31 | ✅ 全部通过 |
| TypeScript 编译 | 3 | ✅ 全部通过 |

### 9.3 待完成任务

| 任务 | 优先级 | 预计工时 |
|------|--------|----------|
| 集成前后端 | 高 | 2天 |
| 学习路径页面连接 API | 中 | 1天 |
| 算法可视化 | 低 | 5天 |
| 前端 lint 错误修复 | 中 | 1天 |

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
5. **根目录 package.json**: `dev:client` 和 `build` 脚本引用 `client/` 而非 `frontend/`，请在各子目录内执行命令
6. **前端 lint 错误**: 有 152 个 lint 错误/警告（主要是代码质量问题，不影响功能）
   - 41 个 `@typescript-eslint/no-explicit-any`
   - 31 个 `react-hooks/set-state-in-effect`
   - 26 个 `@typescript-eslint/no-unused-vars`

---

## 十二、开发进度

### 2026-06-08 上午 - 核心功能开发

#### ✅ 已完成的功能

**1. 页面清理与路由优化**
- 清理重复页面文件（Home.tsx、Login.tsx、Register.tsx、Problems.tsx）
- 统一路由配置，使用完整实现的页面组件
- 添加学习路径页面路由（/paths、/paths/:id）

**2. 前端页面连接后端API**
- Home页面：连接热门题目和竞赛预告API
- ProblemList页面：连接题目列表API，支持搜索、筛选、分页
- ProblemDetail页面：连接题目详情API，实现真实代码提交
- ContestList页面：连接竞赛列表API，实现报名功能
- ContestDetail页面：连接竞赛详情API，实现排行榜数据
- Profile页面：连接用户信息API，实现编辑资料功能

**3. 新增页面**
- 学习路径列表页（LearningPaths.tsx）
- 学习路径详情页（LearningPathDetail.tsx）
- 支持算法分类、学习进度跟踪、模块解锁

**4. 核心UI组件库**

| 组件 | 文件 | 功能 |
|------|------|------|
| CodeEditor | UI/CodeEditor.tsx | Monaco Editor封装，支持多语言、语法高亮、快捷键提交 |
| SearchBar | UI/SearchBar.tsx | 全局搜索，支持搜索建议、历史记录、Ctrl+K触发 |
| Pagination | UI/Pagination.tsx | 高级分页，支持快速跳转、每页条数选择 |
| InfiniteScroll | UI/InfiniteScroll.tsx | 无限滚动加载，支持正向/反向滚动 |
| TagSelector | UI/TagSelector.tsx | 标签选择器，支持多选、搜索、创建新标签 |
| DatePicker | UI/DatePicker.tsx | 日期选择器，支持日期范围、时间选择、快捷选项 |
| Chart | UI/Chart.tsx | 图表组件，支持折线图、柱状图、饼图 |
| Modal | UI/Modal.tsx | 通用模态框，支持动画、键盘快捷键关闭 |
| Tooltip | UI/Tooltip.tsx | 工具提示，支持自定义位置、箭头指向 |
| Dropdown | UI/Dropdown.tsx | 下拉菜单，支持自定义触发器、菜单项、快捷键 |
| ProgressBar | UI/ProgressBar.tsx | 进度条，支持线性、圆形进度条，动画效果 |
| Avatar | UI/Avatar.tsx | 头像组件，支持图片、文字头像，状态指示 |
| Badge | UI/Badge.tsx | 徽章组件，支持不同类型、颜色、可关闭 |
| Switch | UI/Switch.tsx | 开关组件，支持不同尺寸、颜色、标签 |
| Tabs | UI/Tabs.tsx | 标签页，支持水平、垂直布局，动画效果 |
| Collapse | UI/Collapse.tsx | 折叠面板，支持手风琴模式、自定义图标 |
| Stepper | UI/Stepper.tsx | 步进器，支持水平、垂直布局，自定义步骤状态 |
| Rate | UI/Rate.tsx | 评分组件，支持半星评分、自定义图标 |
| Tree | UI/Tree.tsx | 树形组件，支持展开/折叠、选择、拖拽排序 |
| Table | UI/Table.tsx | 表格组件，支持排序、筛选、分页、自定义列 |
| Form | UI/Form.tsx | 表单组件，支持表单验证、布局、表单项联动 |
| Input | UI/Input.tsx | 输入框，支持不同类型、前后缀、字数统计 |
| Select | UI/Select.tsx | 选择器，支持单选、多选、搜索、分组选项 |
| Textarea | UI/Textarea.tsx | 文本域，支持自动调整高度、字数统计 |
| Checkbox | UI/Checkbox.tsx | 复选框，支持复选框组、全选功能 |
| Radio | UI/Radio.tsx | 单选框，支持单选框组、按钮样式 |

**5. 全局功能组件**

| 组件 | 文件 | 功能 |
|------|------|------|
| ErrorBoundary | ErrorBoundary.tsx | 全局错误边界，捕获React组件错误 |
| Spinner | UI/Spinner.tsx | 旋转加载指示器 |
| Skeleton | UI/Skeleton.tsx | 骨架屏组件 |
| Toast | UI/Toast.tsx | 全局Toast通知 |
| ConfirmDialog | UI/ConfirmDialog.tsx | 确认对话框 |
| PageTransition | PageTransition.tsx | 页面过渡动画 |
| Sidebar | Layout/Sidebar.tsx | 响应式侧边栏导航 |
| BottomNav | Layout/BottomNav.tsx | 移动端底部导航栏 |
| Header | Layout/Header.tsx | 导航栏高亮当前页面 |

**6. 工具与服务**

| 工具 | 文件 | 功能 |
|------|------|------|
| API服务 | services/index.ts | 统一导出所有API服务 |
| 请求重试 | utils/request.ts | 自动重试、指数退避、重试条件判断 |
| 缓存工具 | utils/cache.ts | 内存缓存、localStorage缓存、LRU淘汰 |
| 数据持久化 | utils/persistence.ts | 状态持久化、过期时间、命名空间隔离 |
| 性能监控 | utils/performance.ts | 页面加载、组件渲染、API请求耗时监控 |
| 国际化 | i18n/ | 中英文支持、语言切换 |
| 主题切换 | stores/useUIStore.ts | 亮色、暗色、跟随系统三种模式 |
| 键盘快捷键 | hooks/useKeyboardShortcuts.ts | 全局快捷键注册、冲突检测 |
| 代码片段 | UI/CodeSnippet.tsx | 代码片段管理、保存、加载、分享 |

---

### 📋 待实现功能（按优先级排序）

#### 高优先级（核心功能完善）
- [ ] 学习路径页面连接后端API
- [ ] 算法可视化组件
- [ ] 代码编辑器增强（更多语言支持、主题）
- [ ] 竞赛系统完善（实时排行榜、倒计时）
- [ ] 社区功能完善（帖子编辑、评论回复）

#### 中优先级（用户体验优化）
- [ ] 滑块组件（Slider）
- [ ] 上传组件（Upload）
- [ ] 通知组件（Notification）
- [ ] 空状态组件（Empty）
- [ ] 响应式优化
- [ ] 动画效果增强
- [ ] 可访问性改进

#### 低优先级（高级功能）
- [ ] 算法可视化
- [ ] 实时协作编辑
- [ ] 语音输入
- [ ] 离线支持
- [ ] PWA支持

---

## 十三、开发流程规范

### 13.1 开发流程

```
开发前 → 开发中 → 开发后 → 提交
  ↓         ↓         ↓        ↓
规划功能   小步迭代   测试验证  小批量提交
```

### 13.2 开发前准备

1. **明确需求**：清楚要做什么功能，实现什么效果
2. **代码复用**：检查是否有相关的现有代码可以复用
3. **方案规划**：规划好实现方案，避免中途大幅修改

### 13.3 开发中规范

1. **小步迭代**：每完成一个子功能就进行测试
2. **代码风格**：保持与现有代码风格一致
3. **注释规范**：关键逻辑添加注释，但不要过度注释

### 13.4 开发后测试

**每次开发完一部分功能后，必须执行以下检查：**

```bash
# 1. 运行单元测试
cd frontend && npm test
cd server && npm test

# 2. 运行 lint 检查
cd frontend && npm run lint
cd server && npm run lint

# 3. TypeScript 编译检查
cd frontend && npx tsc --noEmit
cd server && npx tsc --noEmit

# 4. 运行 E2E 测试（关键功能）
npx playwright test --project=chromium
```

### 13.5 测试策略

| 功能类型 | 测试方式 | 优先级 |
|---------|---------|--------|
| 核心功能（登录、注册、提交代码） | 单元测试 + E2E 测试 | 高 |
| 一般功能（页面显示、导航） | 单元测试 | 中 |
| 辅助功能（动画、样式） | 手动测试 | 低 |

**测试金字塔：**
```
        /  E2E  \        ← 少量，测试关键路径
       / 集成测试 \       ← 中量，测试模块协作
      /  单元测试   \      ← 大量，测试单个函数
     ‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾
```

### 13.6 代码提交规范

**提交频率：**
- 小批量提交，不要积压大量修改
- 每次提交只做一件事
- 提交前确保测试通过

**提交信息格式：**
```
<类型>: <简短描述>

<详细描述（可选）>
```

**类型说明：**
- `feat`: 新功能
- `fix`: 修复 bug
- `docs`: 文档更新
- `style`: 代码格式调整（不影响功能）
- `refactor`: 代码重构
- `test`: 测试相关
- `chore`: 构建/工具相关

**示例：**
```
feat: 添加用户登录功能

- 实现登录表单
- 连接后端 API
- 添加登录成功/失败处理
```

### 13.7 Bug 修复流程

```
发现 bug → 写测试复现 → 修复代码 → 确认测试通过 → 提交
```

1. **写测试复现**：先写一个测试用例，能够稳定复现 bug
2. **修复代码**：修改代码修复 bug
3. **确认测试通过**：确保修复后的代码能通过所有测试
4. **提交代码**：提交修复，并在提交信息中说明修复了什么问题

### 13.8 代码审查清单

提交代码前，检查以下内容：

- [ ] 代码是否符合项目风格
- [ ] 是否有未使用的变量或导入
- [ ] 是否有硬编码的值应该提取为常量
- [ ] 是否有安全隐患（如 SQL 注入、XSS）
- [ ] 是否有性能问题（如不必要的渲染、内存泄漏）
- [ ] 测试是否覆盖了主要场景

### 13.9 开发工具推荐

**VS Code 插件：**
- ESLint：代码风格检查
- Prettier：代码格式化
- TypeScript Vue Plugin (Volar)：Vue/React 支助
- GitLens：Git 历史查看

**浏览器扩展：**
- React Developer Tools：React 调试
- Redux DevTools：状态管理调试

---

## 十四、联系方式

- **项目地址**: D:\Files\school\project\20260607
- **前端地址**: http://localhost:5173
- **后端地址**: http://localhost:3001

---

## 十五、更新日志

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

### 2026-06-08 上午
- 清理重复页面，统一路由配置
- 前端页面连接后端API（6个页面）
- 创建学习路径页面
- 集成Monaco Editor代码编辑器
- 创建完整UI组件库（26个组件）
- 添加全局功能组件（9个）
- 添加工具与服务（9个）
- 更新开发文档

### 2026-06-09
- 修复前端单元测试问题（52/52 通过）
  - 修复 Home 测试：更新期望的文本内容
  - 修复 Header 测试：使用更精确的选择器
  - 修复 Login/Register 测试：mock auth store，更新英文界面文本
  - 添加 import.meta.env 模拟
- 修复 E2E 测试问题（31/31 通过）
  - 修复导入路径问题
  - 更新页面文本期望（AlgoArena、英文导航）
  - 添加真实登录流程测试
- 添加开发流程规范文档
  - 开发流程（开发前/中/后）
  - 测试策略（测试金字塔）
  - 代码提交规范
  - Bug 修复流程
- 更新项目文档
  - 更新开发进度（88%）
  - 更新已知问题
  - 更新测试覆盖情况

---

*本文档将随项目开发持续更新*
