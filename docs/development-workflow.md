# 开发流程规范

这个文档定义了项目的标准开发流程，基于已安装的 40 个 skills。

## 已安装 Skills 分类

### 开发流程类

| Skill | 用途 | 什么时候用 |
|-------|------|-----------|
| brainstorming | 创意工作前的头脑风暴 | 任何新功能开发前 |
| writing-plans | 编写实施计划 | 有需求后，写可执行的计划 |
| executing-plans | 执行计划 | 在独立会话中执行计划 |
| planning-with-files | 持久化计划跟踪 | 复杂任务，用 task_plan.md 跟踪进度 |
| subagent-driven-development | 子代理驱动开发 | 当前会话中有独立任务 |
| dispatching-parallel-agents | 并行代理调度 | 3+ 个独立问题需要同时处理 |
| finishing-a-development-branch | 完成开发分支 | 实现完成、测试通过后 |
| using-git-worktrees | Git worktree 隔离 | 需要隔离工作区时 |

### 测试相关

| Skill | 用途 | 什么时候用 |
|-------|------|-----------|
| test-driven-development | TDD 核心 | 任何功能/bugfix 前 |
| tdd | TDD 实践 | 集成测试风格 |
| webapp-testing | Web 应用测试 | 前端测试 |
| playwright-cli | Playwright CLI | 编写 E2E 测试 |
| playwright-best-practices | Playwright 最佳实践 | E2E 测试 |

### 代码质量

| Skill | 用途 | 什么时候用 |
|-------|------|-----------|
| systematic-debugging | 系统化调试 | 任何 bug/测试失败前 |
| karpathy-guidelines | 减少编码错误 | 写代码/审查/重构时 |
| improve-codebase-architecture | 改进代码架构 | 重构机会分析 |
| requesting-code-review | 请求代码审查 | 完成任务后、合并前 |
| receiving-code-review | 接收审查反馈 | 收到审查意见时 |
| verification-before-completion | 完成前验证 | 声明完成前 |

### 前端/UI

| Skill | 用途 | 什么时候用 |
|-------|------|-----------|
| vercel-react-best-practices | React 最佳实践 | React 组件开发 |
| tailwind | Tailwind CSS | 样式开发 |
| ui-ux-pro-max | UI/UX 设计指南 | 设计新页面/组件 |
| frontend-design | 前端设计 | 创建独特界面 |
| typescript-advanced-types | TypeScript 高级类型 | 复杂类型定义 |

### 后端

| Skill | 用途 | 什么时候用 |
|-------|------|-----------|
| nodejs-backend-patterns | Node.js 后端模式 | Express/Prisma 开发 |

### 文档处理

| Skill | 用途 |
|-------|------|
| humanizer-zh | 去除 AI 写作痕迹 |
| writing-skills | 编写技能文档 |
| skill-creator | 创建技能 |
| markitdown | 文档转 Markdown |
| docx/pdf/pptx/xlsx | 文档格式处理 |

---

## 标准开发流程

### 新功能开发流程

```
1. brainstorming - 探索需求、设计方案
       ↓
2. writing-plans - 写实施计划
       ↓
3. planning-with-files - 持久化跟踪（复杂任务）
       ↓
4. subagent-driven-development - 执行计划
       ↓
5. requesting-code-review - 代码审查
       ↓
6. finishing-a-development-branch - 完成合并
```

**详细步骤：**

1. **需求探索** (brainstorming)
   - 理解用户意图
   - 问澄清问题
   - 提出 2-3 个方案
   - 获得用户批准

2. **写计划** (writing-plans)
   - 分解任务为小步骤
   - 指定要修改的文件
   - 写测试策略
   - 保存到 docs/superpowers/plans/

3. **执行计划** (subagent-driven-development)
   - 每个任务派发一个子代理
   - 子代理完成后做任务审查
   - 最后做整体审查

4. **代码审查** (requesting-code-review)
   - 获取 git SHAs
   - 派发代码审查子代理
   - 审查代码质量、测试覆盖

5. **完成分支** (finishing-a-development-branch)
   - 验证测试通过
   - 检测环境（main/feature）
   - 选择合并策略
   - 清理工作区

---

### Bug 修复流程

```
1. systematic-debugging - 系统化找根因
       ↓
2. test-driven-development - 写测试复现
       ↓
3. 修复代码
       ↓
4. verification-before-completion - 验证修复
       ↓
5. requesting-code-review - 代码审查
```

**详细步骤：**

1. **找根因** (systematic-debugging)
   - 收集症状
   - 形成假设
   - 验证假设
   - 找到根本原因

2. **写测试** (test-driven-development)
   - 先写失败的测试
   - 测试应该验证预期行为
   - 测试应该能稳定复现 bug

3. **修复代码**
   - 只修复根因，不碰其他代码
   - 保持代码风格一致

4. **验证修复** (verification-before-completion)
   - 运行完整测试套件
   - 确认测试通过
   - 提供证据

5. **代码审查** (requesting-code-review)
   - 确保修复不会引入新问题

---

### 代码重构流程

```
1. improve-codebase-architecture - 分析架构问题
       ↓
2. writing-plans - 写重构计划
       ↓
3. test-driven-development - 确保有测试覆盖
       ↓
4. 重构代码
       ↓
5. verification-before-completion - 验证重构
       ↓
6. requesting-code-review - 代码审查
```

---

## 测试策略

### 测试金字塔

```
        /  E2E  \        ← 少量，测试关键路径
       / 集成测试 \       ← 中量，测试模块协作
      /  单元测试   \      ← 大量，测试单个函数
     ‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾
```

### 测试优先级

| 功能类型 | 测试方式 | 优先级 |
|---------|---------|--------|
| 核心功能（登录、注册、提交代码） | 单元测试 + E2E 测试 | 高 |
| 一般功能（页面显示、导航） | 单元测试 | 中 |
| 辅助功能（动画、样式） | 手动测试 | 低 |

### 测试 Skills 使用

- **前端组件测试**: webapp-testing + vercel-react-best-practices
- **E2E 测试**: playwright-cli + playwright-best-practices
- **后端测试**: nodejs-backend-patterns + tdd
- **TDD 循环**: test-driven-development（红-绿-重构）

---

## 代码质量检查

### 开发后必须执行

```bash
# 1. 单元测试
cd frontend && npm test
cd server && npm test

# 2. Lint 检查
cd frontend && npm run lint

# 3. TypeScript 编译
cd frontend && npx tsc --noEmit

# 4. E2E 测试（关键功能）
npx playwright test --project=chromium
```

### 代码审查清单

使用 karpathy-guidelines 检查：

- [ ] 代码是否过度复杂？
- [ ] 是否有不必要的抽象？
- [ ] 是否有未使用的变量或导入？
- [ ] 是否有安全隐患？
- [ ] 是否有性能问题？
- [ ] 测试是否覆盖了主要场景？

使用 verification-before-completion 验证：

- [ ] 运行了所有测试吗？
- [ ] 测试通过了吗？
- [ ] 有证据吗？

---

## 文档规范

### 代码注释

- 关键逻辑加注释
- 不要过度注释
- 注释要解释"为什么"，而不是"是什么"

### 提交信息

格式：`<类型>: <简短描述>`

类型：
- `feat`: 新功能
- `fix`: 修复 bug
- `docs`: 文档更新
- `style`: 代码格式调整
- `refactor`: 代码重构
- `test`: 测试相关
- `chore`: 构建/工具相关

示例：
```
feat: 添加用户登录功能

- 实现登录表单
- 连接后端 API
- 添加登录成功/失败处理
```

### 文档去 AI 痕迹

使用 humanizer-zh 处理文档：

- 删除填充短语
- 打破公式结构
- 变化节奏
- 信任读者
- 删除金句

---

## 并行开发

### 使用 Git Worktrees

当需要同时开发多个功能时：

```bash
# 创建 worktree
git worktree add ../feature-branch feature-branch

# 在 worktree 中开发
cd ../feature-branch
# ... 开发 ...

# 完成后删除 worktree
git worktree remove ../feature-branch
```

使用 using-git-worktrees skill 自动处理。

### 使用子代理

当有多个独立任务时：

1. 使用 dispatching-parallel-agents 派发多个子代理
2. 每个子代理处理一个任务
3. 收集结果并整合

---

## Skills 使用建议

### 必须使用

- **brainstorming** - 任何新功能开发前
- **systematic-debugging** - 任何 bug/测试失败前
- **verification-before-completion** - 声明完成前
- **test-driven-development** - 任何功能/bugfix 前

### 推荐使用

- **planning-with-files** - 复杂任务（3+ 步骤）
- **karpathy-guidelines** - 写代码时
- **vercel-react-best-practices** - React 组件开发
- **playwright-best-practices** - E2E 测试

### 可选使用

- **ui-ux-pro-max** - 设计新页面/组件
- **frontend-design** - 创建独特界面
- **improve-codebase-architecture** - 重构分析

---

## 流程图

### 新功能开发

```
用户需求
    ↓
brainstorming (探索需求)
    ↓
writing-plans (写计划)
    ↓
planning-with-files (持久化跟踪)
    ↓
subagent-driven-development (执行)
    ↓
requesting-code-review (审查)
    ↓
finishing-a-development-branch (完成)
    ↓
功能完成
```

### Bug 修复

```
发现 bug
    ↓
systematic-debugging (找根因)
    ↓
test-driven-development (写测试)
    ↓
修复代码
    ↓
verification-before-completion (验证)
    ↓
requesting-code-review (审查)
    ↓
bug 修复完成
```

### 代码重构

```
发现架构问题
    ↓
improve-codebase-architecture (分析)
    ↓
writing-plans (写计划)
    ↓
test-driven-development (确保测试覆盖)
    ↓
重构代码
    ↓
verification-before-completion (验证)
    ↓
requesting-code-review (审查)
    ↓
重构完成
```

---

## 常见问题

### Q: 什么时候用 planning-with-files？

A: 当任务有 3+ 个步骤，或者需要跨会话跟踪进度时。

### Q: 什么时候用 subagent-driven-development？

A: 当有多个独立任务可以并行处理时。

### Q: 什么时候用 systematic-debugging？

A: 任何时候遇到 bug 或测试失败，都必须先找根因再修复。

### Q: 什么时候用 verification-before-completion？

A: 任何时候声称"完成了"或"测试通过了"之前，必须运行验证命令。

### Q: 如何去除文档中的 AI 痕迹？

A: 使用 humanizer-zh skill，按照它的指导重写文档。

---

*这个文档会随项目开发持续更新*
