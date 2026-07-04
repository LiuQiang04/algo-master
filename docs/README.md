# 文档索引

这个目录包含项目的所有开发文档。

## 核心文档

| 文档 | 用途 | 什么时候看 |
|------|------|-----------|
| [../README.md](../README.md) | 项目说明、快速开始 | 新成员加入、快速了解项目 |
| [../PROJECT.md](../PROJECT.md) | 开发细节、API、数据库、进度 | 开发时参考 |
| [development-workflow.md](development-workflow.md) | 开发流程、skills 使用 | 开发新功能、修 bug 时 |

## 参考文档

| 文档 | 用途 |
|------|------|
| [architecture-design.md](architecture-design.md) | 系统架构设计（早期设计文档） |
| [testing-guide.md](testing-guide.md) | 测试覆盖情况和测试策略 |

## 临时文件（自动管理）

以下文件由 `planning-with-files` skill 自动管理，位于 `.planning/` 目录：

- `task_plan.md` - 当前任务计划
- `progress.md` - 进度日志
- `findings.md` - 研究发现

这些文件是**临时文件**，用于：
- 跨会话恢复任务
- 自动注入上下文
- 跟踪当前任务进度

**不要手动编辑这些文件**，它们会由 planning-with-files 自动管理。

## 文档规范

### 什么时候创建新文档

- **新功能开发**: 在 `docs/` 目录创建设计文档
- **API 变更**: 更新 PROJECT.md
- **测试策略**: 更新 docs/testing-guide.md
- **开发流程**: 更新 docs/development-workflow.md

### 什么时候不创建新文档

- **临时笔记**: 使用 `.planning/findings.md`
- **任务进度**: 使用 `.planning/progress.md`
- **快速参考**: 更新现有文档

### 文档命名规范

- 使用小写字母和连字符
- 使用 `.md` 扩展名
- 名称要清晰描述内容

示例：
- `testing-guide.md` ✅
- `TestingGuide.md` ❌
- `testing_guide.md` ❌

## 相关 Skills

- **humanizer-zh** - 去除文档 AI 痕迹
- **planning-with-files** - 任务跟踪（自动管理 .planning/ 目录）
- **writing-plans** - 编写实施计划
