# 评测系统 Docker 沙箱 + 题目详情页布局优化 — 设计规格

> 日期: 2026-07-08
> 状态: 待实施

## 一、评测系统 Docker 沙箱

### 1.1 背景

当前 `server/src/services/submissionService.ts` 在开发环境用 `simulateJudge()` 随机模拟评测结果，生产环境无真实评测能力。需要实现真实的代码编译与执行评测。

### 1.2 架构

```
POST /api/submissions
    │
    ▼
submissionService.createSubmission()
    │  创建 Submission (status: pending)
    │
    ▼
judgeQueue.add(submissionId)
    │  BullMQ 队列 (Redis-backed)
    │
    ▼
Judge Worker (独立进程)
    │  1. 取 job
    │  2. 写代码到 /tmp/judge/{uuid}/
    │  3. Docker run 编译（C++/Java）
    │  4. 逐个测试用例: Docker run 执行 → 比对输出
    │  5. 写入 SubmissionTestCase 记录（每个用例一条）
    │  6. 更新 Submission (status, executionTime, memoryUsed, score)
    │  7. 清理临时文件
    │  8. 如 AC → 触发积分/成就
    ▼
前端轮询 GET /submissions/:id/status → 显示结果
```

### 1.3 Docker 镜像

单镜像 `algo-arena-judge`，基于 Alpine 3.21，包含全部运行时：

| 运行时 | 用途 | 预估大小 |
|---|---|---|
| g++ | C++ 编译+执行 | ~100MB |
| python3 | Python 解释执行 | ~50MB |
| nodejs | JavaScript 执行 | ~50MB |
| openjdk21 | Java 编译+执行 | ~200MB |
| **合计** | | **~400-500MB** |

Dockerfile: `server/Dockerfile.judge` — 构建命令 `docker build -t algo-arena-judge -f server/Dockerfile.judge .`

### 1.4 安全沙箱参数

| 参数 | 编译阶段 | 执行阶段 |
|---|---|---|
| `--network` | `none` | `none` |
| `--memory` | 256m | 128m |
| `--cpus` | 1 | 0.5 |
| `--read-only` | — | 是（除 /tmp） |
| timeout | 15s | 题目时限 × 2 |
| 用户 | root（编译）/ nobody（执行） | |

### 1.5 语言配置

每种语言定义 `compile` 和 `run` 命令模板：

```typescript
// C++:   compile: g++ -O2 -o solution solution.cpp
//         run:     ./solution < input.txt
// Python: compile: null (解释型)
//         run:     python3 solution.py < input.txt
// Java:   compile: javac Solution.java
//         run:     java Solution < input.txt
// JS:     compile: null
//         run:     node solution.js < input.txt
```

### 1.6 评测结果判定

```
compile_error  → 编译失败（stderr 非空）→ 记录错误信息
runtime_error  → 执行崩溃（exit code ≠ 0）
time_limit     → timeout 触发
memory_limit   → Docker OOM kill
wrong_answer   → 输出与预期不一致
accepted       → 所有测试用例通过
```

### 1.7 标准代码（std）与评测数据

每个题目需存储一份标准解答（std），用于生成测试用例的预期输出：

- **std 字段**：在 `Problem` 表新增 `stdCode`（标准代码）和 `stdLanguage`（标准代码语言）
- **预期输出生成**：管理员创建/编辑测试用例时，后端用 std 代码执行输入 → 生成 expectedOutput
- **评测数据**：`TestCase` 表已有 `input`、`expectedOutput`、`isSample`、`score` 字段，无需改动
- **评测流程**：用户提交 → 编译 → 逐个 testCase 执行（input → 比对 expectedOutput）→ 汇总结果

**完整评测生命周期**：

```
管理员创建题目
  ├── 设置题目描述（Markdown）
  ├── 编写标准代码（std）
  ├── 添加测试用例（输入 + 预期输出由 std 自动生成）
  └── 发布题目

用户提交代码
  ├── 编译（C++/Java）
  ├── 执行测试用例 1 → 比对 → 通过/失败
  ├── 执行测试用例 2 → 比对 → ...
  ├── ...
  └── 汇总结果 → 更新 Submission → 返回前端
```

> ⚠️ **注意**：题目管理后台（创建/编辑题目、设置 std、管理测试用例的 UI）本次不实现，记入 PROJECT.md 待办。

### 1.8 新增依赖

```json
// server/package.json
"bullmq": "^5.0.0",
"ioredis": "^5.0.0"
```

### 1.9 数据库改动

**Problem 表新增字段**：

```prisma
model Problem {
  // ... 现有字段
  stdCode     String?  @map("std_code")     // 标准解答代码
  stdLanguage String?  @map("std_language") // 标准解答语言 (cpp/python/java/javascript)
}
```

**新增 SubmissionTestCase 表**（评测结果细化，详见题目详情页增强 spec）：

```prisma
model SubmissionTestCase {
  id             String  @id @default(uuid()) @db.Uuid
  submissionId   String  @map("submission_id") @db.Uuid
  testCaseId     String  @map("test_case_id") @db.Uuid
  input          String
  expectedOutput String  @map("expected_output")
  actualOutput   String? @map("actual_output")
  passed         Boolean
  runtime        Int?
  memory         Int?
  errorMessage   String? @map("error_message")

  submission Submission @relation(fields: [submissionId], references: [id])
  testCase   TestCase   @relation(fields: [testCaseId], references: [id])

  @@map("submission_test_cases")
}
```

### 1.10 新增 API

| 方法 | 路径 | 说明 |
|---|---|---|
| `POST` | `/api/submissions/run-sample` | 运行样例用例（不创建提交记录） |
| `GET` | `/api/submissions/:id/status` | 轮询评测状态（已有） |

**POST /api/submissions/run-sample** 请求/响应：

```json
// Request
{ "problemId": "uuid", "language": "cpp", "code": "..." }

// Response
{
  "compileError": null,
  "results": [
    { "input": "1 2", "expectedOutput": "3", "actualOutput": "3", "passed": true, "runtime": 12 },
    { "input": "5 3", "expectedOutput": "8", "actualOutput": "10", "passed": false, "runtime": 15 }
  ]
}
```

### 1.11 新增文件

| 文件 | 职责 |
|---|---|
| `server/Dockerfile.judge` | 评测沙箱镜像 |
| `server/src/queues/judgeQueue.ts` | BullMQ 队列，导出 `addJudgeTask()` |
| `server/src/services/judge/languageConfig.ts` | 4 语言编译/执行命令配置 |
| `server/src/services/judge/dockerJudge.ts` | 核心评测逻辑：编译→执行→比对 |
| `server/src/workers/judgeWorker.ts` | Worker 进程入口（独立 tsx 启动） |

### 1.12 修改文件

| 文件 | 改动 |
|---|---|
| `server/src/services/submissionService.ts` | `simulateJudge()` → `addJudgeTask()`；新增 `runSample()` |
| `server/package.json` | 加 `bullmq`、`ioredis`，加 `workers:judge` 脚本 |
| `server/prisma/schema.prisma` | Problem 加 stdCode/stdLanguage；新增 SubmissionTestCase |
| `docker-compose.dev.yml` | 加 `judge-worker` 服务 |
| `frontend/src/pages/Problems/ProblemDetail.tsx` | 提交后轮询；新增运行样例按钮 |
| `frontend/src/services/submissions.ts` | 新增 `getSubmissionStatus()`、`runSample()` |

### 1.13 前端轮询逻辑

```typescript
// 提交后
const submission = await submitCode(problemId, { language, code });
// 进入轮询
const interval = setInterval(async () => {
  const status = await getSubmissionStatus(submission.id);
  if (status.status !== 'pending' && status.status !== 'judging') {
    clearInterval(interval);
    setResult(status);
  }
}, 1000);
// 30s 超时兜底
setTimeout(() => clearInterval(interval), 30000);
```

---

## 二、题目详情页布局优化

### 2.1 问题

提交按钮在首屏之下，需要额外滚动才能看到，使用体验不合理。

### 2.2 根因

- `.pd-header` 区占用过多垂直空间（标题 28px + 间距 12px + meta 行 + tags 行 ≈ 120px）
- 左侧面板的 sticky 导航栏 + tabs 各占 ~49px
- 整体布局虽然用了 flex + `calc(100vh - 64px)`，但实际内容撑开导致溢出

### 2.3 改动方案

**① 压缩标题区域**
- 标题字号 28px → 24px
- 标题 margin-bottom 12px → 8px
- meta 与 tags 合并为一行（flex-wrap，减小 gap）
- header padding 24px 24px 0 → 16px 20px 0

**② 压缩 tabs 区域**
- tab padding 12px 16px → 8px 14px
- tab 字号 14px → 13px

**③ 压缩 nav 区域**
- nav padding 12px 20px → 8px 16px

**④ 右面板 submit bar**
- padding 12px 16px → 10px 16px
- 按钮 padding 12px → 10px

**⑤ 左面板 content 区**
- padding 24px → 16px

### 2.4 预期效果

- 左侧标题区节省约 30px
- 左侧 tabs + nav 节省约 16px
- 右侧 submit bar 节省约 8px
- 总计节省约 54px，提交按钮回到首屏可见范围

### 2.5 修改文件

仅修改 `frontend/src/pages/Problems/ProblemDetail.css`，无 JSX 变更。

---

## 三、测试计划

### 评测系统

| 测试类型 | 文件 | 覆盖内容 |
|---|---|---|
| 单元测试 | `server/src/__tests__/unit/judge.test.ts` | 语言配置、编译命令生成、输出比对 |
| 单元测试 | `server/src/__tests__/unit/judgeQueue.test.ts` | 队列 add/get/remove |
| 集成测试 | `server/src/__tests__/integration/submission.test.ts` | 提交→评测→结果 全流程 |

### 前端

| 测试类型 | 覆盖内容 |
|---|---|
| 单元测试 | 轮询 hook 逻辑（usePollingStatus） |
| 单元测试 | ProblemDetail 提交后轮询状态切换 |
| 视觉验证 | 题目详情页 3 尺寸截图（375/768/1920）确认提交按钮可见 |

---

## 四、实施顺序

```
1. 数据库迁移（Problem.stdCode/stdLanguage + SubmissionTestCase 表）
2. 评测镜像 (Dockerfile.judge) + 构建
3. 语言配置 + 核心评测逻辑
4. BullMQ 队列 + Worker
5. 修改 submissionService 对接真实评测
6. 新增 run-sample API
7. 前端轮询改造 + 运行样例按钮
8. 题目详情页布局优化
9. 测试 + 验证
```