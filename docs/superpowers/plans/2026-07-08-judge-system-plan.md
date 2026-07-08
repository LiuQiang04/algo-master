# 评测系统 Docker 沙箱 — 实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 构建 Docker 沙箱评测系统，替换当前的 simulateJudge() 模拟逻辑，实现真实的代码编译、执行与自动评测。

**Architecture:** POST /api/submissions → submissionService 创建 pending 记录 → BullMQ 入队 → Judge Worker 消费 → Docker 编译+执行 → 逐用例比对 → 更新 Submission + 写入 SubmissionTestCase → 前端轮询结果。

**Tech Stack:** Docker (Alpine 3.21), BullMQ + ioredis (Redis 7), TypeScript, Prisma 5, PostgreSQL 16

**依赖 spec:** `docs/superpowers/specs/2026-07-08-judge-system-design.md`

## Global Constraints

- 单镜像 `algo-arena-judge`，基于 Alpine 3.21，包含 g++ / python3 / nodejs / openjdk21
- 安全沙箱: `--network=none`, `--memory` 限制, `--cpus` 限制, timeout
- 编译超时 15s，执行超时 = 题目时限 × 2
- 新增依赖: `bullmq` ^5.0.0, `ioredis` ^5.0.0
- Worker 独立进程，通过 `tsx` 启动
- 开发环境保留 `simulateJudge()` 作为降级方案（无 Docker 时自动切换）

---

### Task 1: 数据库迁移 — Problem 扩展 + SubmissionTestCase 表

**Files:**
- Modify: `server/prisma/schema.prisma`
- Create: `server/prisma/migrations/` (由 Prisma 自动生成)

**Interfaces:**
- Produces: `Problem.stdCode`, `Problem.stdLanguage`, `SubmissionTestCase` 表（含 submissionId, testCaseId, input, expectedOutput, actualOutput, passed, runtime, memory, errorMessage）

- [ ] **Step 1: 修改 Prisma schema**

在 `server/prisma/schema.prisma` 中：

**Problem 表新增字段**（在 `solveCount` 行之后插入）:
```prisma
  stdCode     String?  @map("std_code")     @db.Text
  stdLanguage String?  @map("std_language") @db.VarChar(20)
```

**在 Submission 模型之后新增 SubmissionTestCase 模型**:
```prisma
model SubmissionTestCase {
  id             String   @id @default(uuid()) @db.Uuid
  submissionId   String   @map("submission_id") @db.Uuid
  testCaseId     String   @map("test_case_id") @db.Uuid
  input          String
  expectedOutput String   @map("expected_output")
  actualOutput   String?  @map("actual_output")
  passed         Boolean
  runtime        Int?
  memory         Int?
  errorMessage   String?  @map("error_message")

  submission Submission @relation(fields: [submissionId], references: [id])
  testCase   TestCase   @relation(fields: [testCaseId], references: [id])

  @@map("submission_test_cases")
}
```

**在 Submission 模型新增反向关系**（在 `problem Problem` 行之后插入）:
```prisma
  testCaseResults SubmissionTestCase[]
```

- [ ] **Step 2: 运行数据库迁移**

```bash
cd server && npx prisma migrate dev --name add_std_code_and_submission_test_cases
```

Expected: 迁移成功，数据库中新增 `std_code`、`std_language` 列和 `submission_test_cases` 表。

- [ ] **Step 3: 验证 schema 有效性**

```bash
cd server && npx prisma validate && npx prisma generate
```

Expected: Schema is valid, Prisma Client 重新生成。

- [ ] **Step 4: Commit**

```bash
git add server/prisma/schema.prisma server/prisma/migrations/
git commit -m "feat: add Problem.stdCode/stdLanguage and SubmissionTestCase table"
```

---

### Task 2: Dockerfile — 评测沙箱镜像

**Files:**
- Create: `server/Dockerfile.judge`

**Interfaces:**
- Produces: `algo-arena-judge` Docker 镜像，包含 g++、python3、nodejs、openjdk21

- [ ] **Step 1: 创建 Dockerfile.judge**

```dockerfile
FROM alpine:3.21

RUN apk add --no-cache \
    g++ \
    make \
    python3 \
    py3-pip \
    nodejs \
    npm \
    openjdk21 \
    bash \
    coreutils \
    diffutils

# 创建非 root 用户用于执行
RUN adduser -D -s /bin/bash judge

# 创建工作目录
RUN mkdir -p /judge && chown judge:judge /judge

WORKDIR /judge
```

- [ ] **Step 2: 构建镜像**

```bash
docker build -t algo-arena-judge -f server/Dockerfile.judge .
```

Expected: 镜像构建成功，`docker images | grep algo-arena-judge` 可见。

- [ ] **Step 3: 验证镜像包含全部运行时**

```bash
docker run --rm algo-arena-judge sh -c "g++ --version && python3 --version && node --version && java --version"
```

Expected: 四个运行时版本号均正常输出。

- [ ] **Step 4: Commit**

```bash
git add server/Dockerfile.judge
git commit -m "feat: add Dockerfile.judge for sandbox judging"
```

---

### Task 3: 语言配置 + 编译/执行命令模板

**Files:**
- Create: `server/src/services/judge/languageConfig.ts`

**Interfaces:**
- Produces: `LanguageConfig` 类型，`getLanguageConfig(language: string): LanguageConfig` 函数
- `LanguageConfig` 包含: `compile: { command: string, args: string[], timeout: number } | null`, `run: { command: string, args: string[], timeout: number }`, `sourceFile: string`, `executableFile?: string`
- 被 `dockerJudge.ts` 消费

- [ ] **Step 1: 创建 languageConfig.ts**

```typescript
export interface LanguageConfig {
  sourceFile: string;
  executableFile?: string;
  compile: {
    command: string;
    args: string[];
    timeout: number; // seconds
  } | null;
  run: {
    command: string;
    args: string[];
  };
}

const configs: Record<string, LanguageConfig> = {
  cpp: {
    sourceFile: 'solution.cpp',
    executableFile: 'solution',
    compile: {
      command: 'g++',
      args: ['-O2', '-o', 'solution', 'solution.cpp'],
      timeout: 15,
    },
    run: {
      command: './solution',
      args: [],
    },
  },
  python: {
    sourceFile: 'solution.py',
    compile: null,
    run: {
      command: 'python3',
      args: ['solution.py'],
    },
  },
  java: {
    sourceFile: 'Main.java',
    executableFile: 'Main.class',
    compile: {
      command: 'javac',
      args: ['Main.java'],
      timeout: 15,
    },
    run: {
      command: 'java',
      args: ['Main'],
    },
  },
  javascript: {
    sourceFile: 'solution.js',
    compile: null,
    run: {
      command: 'node',
      args: ['solution.js'],
    },
  },
};

export function getLanguageConfig(language: string): LanguageConfig {
  const config = configs[language];
  if (!config) {
    throw new Error(`Unsupported language: ${language}`);
  }
  return config;
}
```

- [ ] **Step 2: 编写单元测试 — 创建 languageConfig.test.ts**

```typescript
// server/src/__tests__/unit/languageConfig.test.ts
import { getLanguageConfig } from '../../services/judge/languageConfig';

describe('languageConfig', () => {
  it('should return cpp config with compile step', () => {
    const config = getLanguageConfig('cpp');
    expect(config.sourceFile).toBe('solution.cpp');
    expect(config.compile).not.toBeNull();
    expect(config.compile!.command).toBe('g++');
  });

  it('should return python config with no compile step', () => {
    const config = getLanguageConfig('python');
    expect(config.compile).toBeNull();
    expect(config.run.command).toBe('python3');
  });

  it('should return java config', () => {
    const config = getLanguageConfig('java');
    expect(config.sourceFile).toBe('Main.java');
    expect(config.compile).not.toBeNull();
  });

  it('should return javascript config', () => {
    const config = getLanguageConfig('javascript');
    expect(config.compile).toBeNull();
    expect(config.run.command).toBe('node');
  });

  it('should throw for unsupported language', () => {
    expect(() => getLanguageConfig('ruby')).toThrow('Unsupported language');
  });
});
```

- [ ] **Step 3: 运行测试**

```bash
cd server && npm test -- --testPathPattern="languageConfig"
```

Expected: 5 tests PASS.

- [ ] **Step 4: Commit**

```bash
git add server/src/services/judge/languageConfig.ts server/src/__tests__/unit/languageConfig.test.ts
git commit -m "feat: add language config for 4 languages (compile/run commands)"
```

---

### Task 4: 核心评测逻辑 — Docker 编译 + 执行 + 比对

**Files:**
- Create: `server/src/services/judge/dockerJudge.ts`

**Interfaces:**
- Produces: `judge(options: JudgeOptions): Promise<JudgeResult>`
- `JudgeOptions`: `{ language: string, code: string, testCases: Array<{ input: string, expectedOutput: string }>, timeLimit: number, memoryLimit: number }`
- `JudgeResult`: `{ compileError: string | null, results: Array<{ input: string, expectedOutput: string, actualOutput: string | null, passed: boolean, runtime: number | null, errorMessage: string | null }>, summary: { passed: number, total: number } }`
- 被 `submissionService.runSample()` 和 `judgeWorker.ts` 消费

- [ ] **Step 1: 创建 dockerJudge.ts**

```typescript
import { execSync, execFileSync } from 'child_process';
import { randomUUID } from 'crypto';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import { getLanguageConfig, LanguageConfig } from './languageConfig';

interface TestCase {
  input: string;
  expectedOutput: string;
}

interface TestCaseResult {
  input: string;
  expectedOutput: string;
  actualOutput: string | null;
  passed: boolean;
  runtime: number | null;
  memory: number | null;
  errorMessage: string | null;
}

interface JudgeResult {
  compileError: string | null;
  results: TestCaseResult[];
  summary: { passed: number; total: number };
}

function runDocker(args: string[], timeout: number, memoryLimit: number): string {
  return execFileSync('docker', [
    'run', '--rm',
    '--network=none',
    `--memory=${memoryLimit}m`,
    '--cpus=0.5',
    '--read-only',
    ...args,
  ], {
    timeout: timeout * 1000,
    encoding: 'utf-8',
    maxBuffer: 10 * 1024 * 1024,
  });
}

export async function judge(options: {
  language: string;
  code: string;
  testCases: TestCase[];
  timeLimit: number;
  memoryLimit: number;
}): Promise<JudgeResult> {
  const { language, code, testCases, timeLimit, memoryLimit } = options;
  const config = getLanguageConfig(language);
  const workDir = path.join(os.tmpdir(), 'judge', randomUUID());

  try {
    fs.mkdirSync(workDir, { recursive: true });

    // 写入源代码
    fs.writeFileSync(path.join(workDir, config.sourceFile), code, 'utf-8');

    // 编译（如果需要）
    let compileError: string | null = null;
    if (config.compile) {
      try {
        const compileArgs = [
          '--tmpfs=/tmp:exec',
          `-v=${workDir}:/judge:ro`,
          `-w=/judge`,
          'algo-arena-judge',
          config.compile.command,
          ...config.compile.args,
        ];
        runDocker(compileArgs, config.compile.timeout, 256);
      } catch (err: any) {
        compileError = err.stderr || err.message || 'Compilation failed';
        return {
          compileError,
          results: [],
          summary: { passed: 0, total: testCases.length },
        };
      }
    }

    // 执行每个测试用例
    const results: TestCaseResult[] = [];
    for (const tc of testCases) {
      try {
        const inputFile = path.join(workDir, 'input.txt');
        fs.writeFileSync(inputFile, tc.input, 'utf-8');

        const startTime = Date.now();
        const runArgs = [
          '--tmpfs=/tmp:exec',
          `-v=${workDir}:/judge:ro`,
          `-w=/judge`,
          '-i', // stdin 来自文件
          'algo-arena-judge',
          config.run.command,
          ...config.run.args,
        ];

        const actualOutput = execFileSync('docker', [
          'run', '--rm',
          '--network=none',
          `--memory=${memoryLimit}m`,
          '--cpus=0.5',
          '--read-only',
          '--tmpfs=/tmp:exec',
          `-v=${workDir}:/judge:ro`,
          `-w=/judge`,
          'algo-arena-judge',
          config.run.command,
          ...config.run.args,
        ], {
          input: tc.input,
          timeout: (timeLimit * 2) * 1000,
          encoding: 'utf-8',
          maxBuffer: 10 * 1024 * 1024,
        });

        const runtime = Date.now() - startTime;

        // 标准化比对（trim 尾部空白）
        const expected = tc.expectedOutput.trim().replace(/\r\n/g, '\n');
        const actual = actualOutput.trim().replace(/\r\n/g, '\n');
        const passed = expected === actual;

        results.push({
          input: tc.input,
          expectedOutput: tc.expectedOutput,
          actualOutput: actualOutput,
          passed,
          runtime,
          memory: null, // Docker 内存统计较复杂，先留空
          errorMessage: null,
        });
      } catch (err: any) {
        const isTimeout = err.killed || (err.message && err.message.includes('timed out'));
        results.push({
          input: tc.input,
          expectedOutput: tc.expectedOutput,
          actualOutput: err.stdout || null,
          passed: false,
          runtime: null,
          memory: null,
          errorMessage: isTimeout ? 'Time Limit Exceeded' : (err.stderr || err.message),
        });
      }
    }

    return {
      compileError: null,
      results,
      summary: {
        passed: results.filter(r => r.passed).length,
        total: testCases.length,
      },
    };
  } finally {
    // 清理临时文件
    try { fs.rmSync(workDir, { recursive: true, force: true }); } catch {}
  }
}
```

- [ ] **Step 2: 编写单元测试 — 创建 dockerJudge.test.ts**

```typescript
// server/src/__tests__/unit/dockerJudge.test.ts
import { judge } from '../../services/judge/dockerJudge';

// 仅在有 Docker 时运行
const hasDocker = (() => {
  try {
    require('child_process').execSync('docker info', { stdio: 'ignore' });
    return true;
  } catch { return false; }
})();

const describeIf = hasDocker ? describe : describe.skip;

describeIf('dockerJudge', () => {
  it('should compile and run C++ code successfully', async () => {
    const code = `#include <iostream>
using namespace std;
int main() {
    int a, b;
    cin >> a >> b;
    cout << a + b << endl;
    return 0;
}`;
    const result = await judge({
      language: 'cpp',
      code,
      testCases: [
        { input: '1 2', expectedOutput: '3' },
        { input: '5 3', expectedOutput: '8' },
      ],
      timeLimit: 1000,
      memoryLimit: 128,
    });
    expect(result.compileError).toBeNull();
    expect(result.results).toHaveLength(2);
    expect(result.results[0].passed).toBe(true);
    expect(result.summary.passed).toBe(2);
  }, 30000);

  it('should return compile error for invalid C++ code', async () => {
    const code = `#include <iostream>
int main() {
    cout << "missing namespace" << endl;
}`;
    const result = await judge({
      language: 'cpp',
      code,
      testCases: [{ input: '', expectedOutput: '' }],
      timeLimit: 1000,
      memoryLimit: 128,
    });
    expect(result.compileError).not.toBeNull();
  }, 30000);

  it('should detect wrong answer', async () => {
    const code = `#include <iostream>
using namespace std;
int main() {
    int a, b;
    cin >> a >> b;
    cout << a * b << endl;  // wrong: multiply instead of add
    return 0;
}`;
    const result = await judge({
      language: 'cpp',
      code,
      testCases: [{ input: '2 3', expectedOutput: '5' }],
      timeLimit: 1000,
      memoryLimit: 128,
    });
    expect(result.results[0].passed).toBe(false);
    expect(result.results[0].actualOutput).toBe('6');
  }, 30000);
});
```

- [ ] **Step 3: 运行测试**

```bash
cd server && npm test -- --testPathPattern="dockerJudge"
```

Expected: 有 Docker 时测试 PASS，无 Docker 时 skip。

- [ ] **Step 4: Commit**

```bash
git add server/src/services/judge/dockerJudge.ts server/src/__tests__/unit/dockerJudge.test.ts
git commit -m "feat: add core Docker judge logic (compile + execute + compare)"
```

---

### Task 5: BullMQ 队列 + Worker 进程

**Files:**
- Create: `server/src/queues/judgeQueue.ts`
- Create: `server/src/workers/judgeWorker.ts`
- Modify: `server/package.json`
- Modify: `docker-compose.dev.yml`

**Interfaces:**
- Produces: `judgeQueue` (BullMQ Queue), `addJudgeTask(submissionId: string): Promise<Job>` 函数
- Worker 消费队列，调用 `dockerJudge.judge()` → 写入 SubmissionTestCase + 更新 Submission
- 被 `submissionService.ts` 和 `judgeWorker.ts` 消费

- [ ] **Step 1: 安装依赖**

```bash
cd server && npm install bullmq ioredis
```

- [ ] **Step 2: 创建 judgeQueue.ts**

```typescript
import { Queue } from 'bullmq';
import { getRedisConfig } from '../../utils/redis';

const redisConfig = getRedisConfig();

export const judgeQueue = new Queue('judge', {
  connection: redisConfig,
  defaultJobOptions: {
    attempts: 3,
    backoff: { type: 'exponential', delay: 2000 },
    removeOnComplete: 100,
    removeOnFail: 200,
  },
});

export async function addJudgeTask(submissionId: string) {
  return judgeQueue.add('judge', { submissionId });
}
```

- [ ] **Step 3: 创建 judgeWorker.ts**

```typescript
import { Worker } from 'bullmq';
import * as fs from 'fs';
import { getRedisConfig } from '../utils/redis';
import { judge } from '../services/judge/dockerJudge';
import { prisma } from '../utils/prisma';

const redisConfig = getRedisConfig();

const worker = new Worker('judge', async (job) => {
  const { submissionId } = job.data;

  // 获取提交记录
  const submission = await prisma.submission.findUnique({
    where: { id: submissionId },
    include: {
      problem: {
        include: { testCases: true },
      },
    },
  });

  if (!submission) {
    throw new Error(`Submission ${submissionId} not found`);
  }

  // 更新状态为 judging
  await prisma.submission.update({
    where: { id: submissionId },
    data: { status: 'judging' },
  });

  // 执行评测
  const result = await judge({
    language: submission.language,
    code: submission.sourceCode,
    testCases: submission.problem.testCases.map(tc => ({
      input: tc.input,
      expectedOutput: tc.expectedOutput,
    })),
    timeLimit: submission.problem.timeLimit,
    memoryLimit: submission.problem.memoryLimit,
  });

  // 写入 SubmissionTestCase 记录
  if (result.results.length > 0) {
    await prisma.submissionTestCase.createMany({
      data: result.results.map((r, i) => ({
        submissionId: submission.id,
        testCaseId: submission.problem.testCases[i].id,
        input: r.input,
        expectedOutput: r.expectedOutput,
        actualOutput: r.actualOutput,
        passed: r.passed,
        runtime: r.runtime,
        memory: r.memory,
        errorMessage: r.errorMessage,
      })),
    });
  }

  // 确定最终状态
  let finalStatus: string;
  if (result.compileError) {
    finalStatus = 'compile_error';
  } else {
    const allPassed = result.results.every(r => r.passed);
    finalStatus = allPassed ? 'accepted' : 'wrong_answer';
  }

  const totalRuntime = result.results.reduce((sum, r) => sum + (r.runtime || 0), 0);
  const maxRuntime = result.results.reduce((max, r) => Math.max(max, r.runtime || 0), 0);

  // 更新提交记录
  await prisma.submission.update({
    where: { id: submissionId },
    data: {
      status: finalStatus,
      executionTime: maxRuntime,
      score: result.summary.total > 0
        ? Math.round((result.summary.passed / result.summary.total) * 100)
        : 0,
    },
  });

  // AC 时触发积分和成就
  if (finalStatus === 'accepted') {
    await prisma.problem.update({
      where: { id: submission.problemId },
      data: { solveCount: { increment: 1 } },
    });

    const { addPoints, POINT_RULES } = await import('../services/gamification/points');
    const basePoints = POINT_RULES.SOLVE_PROBLEM.base;
    const difficultyMultiplier =
      POINT_RULES.SOLVE_PROBLEM.difficultyMultiplier[submission.problem.difficulty] || 1;
    const points = Math.floor(basePoints * difficultyMultiplier);

    await addPoints(
      submission.userId,
      points,
      'solve',
      `完成题目: ${submission.problem.title}`,
      submission.problemId
    );

    const { checkAchievements } = await import('../services/gamification/achievements');
    await checkAchievements(submission.userId);
  }
}, {
  connection: redisConfig,
  concurrency: 2, // 限制并发数，避免 Docker 资源耗尽
});

console.log('Judge worker started (concurrency: 2)');

process.on('SIGTERM', async () => {
  await worker.close();
  process.exit(0);
});
```

- [ ] **Step 4: 更新 package.json 添加 worker 启动脚本**

在 `package.json` 的 `scripts` 中新增:
```json
"workers:judge": "ts-node src/workers/judgeWorker.ts"
```

- [ ] **Step 5: 更新 docker-compose.dev.yml 添加 judge-worker 服务**

在 `docker-compose.dev.yml` 的 `services` 中新增:
```yaml
  judge-worker:
    image: algo-arena-judge
    container_name: algo-arena-judge-worker
    command: ["tail", "-f", "/dev/null"]  # 占位，实际通过 npm 脚本启动
    volumes:
      - ./server/src:/app/src:ro
    depends_on:
      - redis
```

- [ ] **Step 6: 编写单元测试 — 创建 judgeQueue.test.ts**

```typescript
// server/src/__tests__/unit/judgeQueue.test.ts
import { judgeQueue, addJudgeTask } from '../../queues/judgeQueue';

describe('judgeQueue', () => {
  it('should add a job to the queue', async () => {
    const job = await addJudgeTask('test-submission-id');
    expect(job).toBeDefined();
    expect(job.data.submissionId).toBe('test-submission-id');
    await job.remove();
  });
});
```

- [ ] **Step 7: 运行测试**

```bash
cd server && npm test -- --testPathPattern="judgeQueue"
```

Expected: 测试 PASS（需要 Redis 运行中）。

- [ ] **Step 8: Commit**

```bash
git add server/src/queues/judgeQueue.ts server/src/workers/judgeWorker.ts server/package.json server/package-lock.json docker-compose.dev.yml server/src/__tests__/unit/judgeQueue.test.ts
git commit -m "feat: add BullMQ judge queue, worker, and docker-compose service"
```

---

### Task 6: submissionService 重构 — 对接真实评测

**Files:**
- Modify: `server/src/services/submissionService.ts`

**Interfaces:**
- Consumes: `addJudgeTask` from `judgeQueue.ts`
- Produces: 修改后的 `createSubmission()` — 用 `addJudgeTask()` 替代 `simulateJudge()`
- 新增: `runSample(problemId, language, code): Promise<{ compileError, results }>`

- [ ] **Step 1: 重构 submissionService.ts**

将 `server/src/services/submissionService.ts` 中的 `simulateJudge` 调用替换为 `addJudgeTask`：

**修改 createSubmission 函数**（替换 `// TODO: 将评测任务加入队列` 及之后的模拟评测逻辑）:

```typescript
  // 将评测任务加入队列
  const { addJudgeTask } = await import('../queues/judgeQueue');
  await addJudgeTask(submission.id);

  // 开发环境无 Docker 时降级为模拟评测
  // if (process.env.NODE_ENV === 'development') {
  //   simulateJudge(submission.id, problem);
  // }
```

**注意**: 保留 `simulateJudge` 函数，开发环境通过环境变量 `JUDGE_MODE=simulate` 控制是否使用模拟评测。

**新增 runSample 函数**:

```typescript
import { judge } from './judge/dockerJudge';

export async function runSample(data: {
  problemId: string;
  language: string;
  sourceCode: string;
}) {
  const problem = await prisma.problem.findUnique({
    where: { id: data.problemId },
    include: {
      testCases: {
        where: { isSample: true },
      },
    },
  });

  if (!problem) {
    throw new NotFoundError('题目不存在');
  }

  if (problem.testCases.length === 0) {
    return { compileError: null, results: [] };
  }

  const result = await judge({
    language: data.language,
    code: data.sourceCode,
    testCases: problem.testCases.map(tc => ({
      input: tc.input,
      expectedOutput: tc.expectedOutput,
    })),
    timeLimit: problem.timeLimit,
    memoryLimit: problem.memoryLimit,
  });

  return {
    compileError: result.compileError,
    results: result.results,
  };
}
```

- [ ] **Step 2: 更新单元测试**

```typescript
// server/src/__tests__/unit/submissionService.test.ts
// 新增测试用例：

describe('runSample', () => {
  it('should run sample test cases and return results', async () => {
    // 需要 mock judge 函数
    const mockJudge = jest.fn().mockResolvedValue({
      compileError: null,
      results: [{
        input: '1 2',
        expectedOutput: '3',
        actualOutput: '3',
        passed: true,
        runtime: 12,
        memory: null,
        errorMessage: null,
      }],
    });
    jest.mock('../../services/judge/dockerJudge', () => ({
      judge: mockJudge,
    }));

    const result = await runSample({
      problemId: 'test-problem-id',
      language: 'cpp',
      sourceCode: '...',
    });

    expect(result.compileError).toBeNull();
    expect(result.results).toHaveLength(1);
    expect(result.results[0].passed).toBe(true);
  });
});
```

- [ ] **Step 3: 运行测试**

```bash
cd server && npm test -- --testPathPattern="submissionService"
```

Expected: 全部测试 PASS。

- [ ] **Step 4: Commit**

```bash
git add server/src/services/submissionService.ts server/src/__tests__/unit/submissionService.test.ts
git commit -m "feat: connect submissionService to BullMQ judge queue, add runSample"
```

---

### Task 7: run-sample API 端点

**Files:**
- Modify: `server/src/routes/submissions.ts`
- Modify: `server/src/controllers/submissionController.ts`

**Interfaces:**
- Consumes: `submissionService.runSample()`
- Produces: `POST /api/submissions/run-sample` — 接受 `{ problemId, language, sourceCode }` → 返回 `{ compileError, results: [{ input, expectedOutput, actualOutput, passed, runtime }] }`

- [ ] **Step 1: 在 submissionController 中新增 runSample controller**

```typescript
// 在 server/src/controllers/submissionController.ts 中新增：

export async function runSample(req: AuthRequest, res: Response) {
  const { problemId, language, sourceCode } = req.body;

  const result = await submissionService.runSample({
    problemId,
    language,
    sourceCode,
  });

  res.json({
    success: true,
    data: result,
  });
}
```

- [ ] **Step 2: 在 routes 中注册 run-sample 路由**

在 `server/src/routes/submissions.ts` 中新增：

```typescript
const runSampleSchema = Joi.object({
  problemId: Joi.string().uuid().required(),
  language: Joi.string().valid('cpp', 'java', 'python', 'javascript').required(),
  sourceCode: Joi.string().min(1).max(50000).required(),
});

// 在 router.get('/:id/status', ...) 之前插入：
router.post(
  '/run-sample',
  authenticate,
  validate(runSampleSchema),
  submissionController.runSample
);
```

- [ ] **Step 3: 编写集成测试**

```typescript
// server/src/__tests__/integration/runSample.test.ts
import request from 'supertest';
import app from '../../app';

describe('POST /api/submissions/run-sample', () => {
  it('should return 401 without auth', async () => {
    const res = await request(app)
      .post('/api/submissions/run-sample')
      .send({ problemId: 'some-uuid', language: 'cpp', sourceCode: '...' });
    expect(res.status).toBe(401);
  });
});
```

- [ ] **Step 4: 运行测试**

```bash
cd server && npm test -- --testPathPattern="runSample"
```

Expected: 测试 PASS。

- [ ] **Step 5: Commit**

```bash
git add server/src/routes/submissions.ts server/src/controllers/submissionController.ts server/src/__tests__/integration/runSample.test.ts
git commit -m "feat: add POST /api/submissions/run-sample endpoint"
```

---

### Task 8: 前端 — 提交后轮询 + 运行样例按钮

**Files:**
- Modify: `frontend/src/services/submissions.ts`
- Modify: `frontend/src/pages/Problems/ProblemDetail.tsx`
- Modify: `frontend/src/pages/Problems/ProblemDetail.css`
- Modify: `frontend/src/types/index.ts`

**Interfaces:**
- Consumes: `POST /api/submissions/run-sample`, `GET /api/submissions/:id/status`
- Produces: 前端轮询逻辑、运行样例按钮 + 结果面板

- [ ] **Step 1: 新增前端类型**

在 `frontend/src/types/index.ts` 中新增：

```typescript
export interface TestCaseResult {
  input: string;
  expectedOutput: string;
  actualOutput: string | null;
  passed: boolean;
  runtime: number | null;
  errorMessage: string | null;
}

export interface RunSampleResponse {
  compileError: string | null;
  results: TestCaseResult[];
}
```

- [ ] **Step 2: 新增前端 API 调用**

在 `frontend/src/services/submissions.ts` 中新增：

```typescript
export async function runSample(
  problemId: number,
  data: { language: string; code: string }
): Promise<RunSampleResponse> {
  const res = await request.post<ApiResponse<RunSampleResponse>>(
    '/submissions/run-sample',
    { problemId, language: data.language, sourceCode: data.code }
  );
  return res.data.data;
}

export async function getSubmissionStatus(id: number): Promise<{
  id: number;
  status: SubmissionStatus;
  executionTime?: number;
  memoryUsed?: number;
  score: number;
}> {
  const res = await request.get<ApiResponse<any>>(`/submissions/${id}/status`);
  return res.data.data;
}
```

- [ ] **Step 3: 前端提交后轮询改造**

在 `ProblemDetail.tsx` 中修改 `handleSubmit`：

```typescript
const handleSubmit = async () => {
  if (!problemId || submitting) return;
  setSubmitting(true);
  setResult({ status: 'judging' });
  try {
    const res = await submitCode(problemId, {
      language: selectedLang.id as any,
      code,
    });
    // 开始轮询
    const submissionId = res.submissionId;
    const interval = setInterval(async () => {
      try {
        const status = await getSubmissionStatus(submissionId);
        if (status.status !== 'pending' && status.status !== 'judging') {
          clearInterval(interval);
          setResult({
            status: status.status,
            runtime: status.executionTime,
            memory: status.memoryUsed,
            testCasesPassed: status.score ? Math.round(status.score / 100 * 10) : 0,
            totalTestCases: 10,
          });
        }
      } catch {
        clearInterval(interval);
        setResult({ status: 'runtime_error', errorMessage: '获取评测结果失败' });
      }
    }, 1000);
    // 30s 超时兜底
    setTimeout(() => clearInterval(interval), 30000);
  } catch {
    setResult({ status: 'runtime_error', errorMessage: '提交失败，请重试' });
  } finally {
    setSubmitting(false);
  }
};
```

- [ ] **Step 4: 新增运行样例按钮 + 结果面板**

在 `ProblemDetail.tsx` 中新增状态：
```typescript
const [runSampleResult, setRunSampleResult] = useState<RunSampleResponse | null>(null);
const [runSampleLoading, setRunSampleLoading] = useState(false);
```

新增 `handleRunSample` 函数：
```typescript
const handleRunSample = async () => {
  if (!problemId || runSampleLoading) return;
  setRunSampleLoading(true);
  setRunSampleResult(null);
  try {
    const res = await runSample(problemId, {
      language: selectedLang.id,
      code,
    });
    setRunSampleResult(res);
  } catch {
    setRunSampleResult({ compileError: '运行失败，请重试', results: [] });
  } finally {
    setRunSampleLoading(false);
  }
};
```

在 submit bar 上方新增 Run Sample 按钮（在 `pd-submit-bar` 的 `pd-submit-btn` 之前）：
```tsx
<button
  className="pd-run-sample-btn"
  onClick={handleRunSample}
  disabled={runSampleLoading || submitting}
>
  <Play size={16} />
  {runSampleLoading ? '运行中...' : '运行样例'}
</button>
```

Run Sample 结果面板（在 `pd-submit-bar` 之前插入）：
```tsx
{runSampleResult && (
  <div className="pd-run-sample-result">
    <div className="pd-run-sample-result-header">
      <h3>运行样例结果</h3>
      <button onClick={() => setRunSampleResult(null)}>×</button>
    </div>
    {runSampleResult.compileError ? (
      <pre className="pd-result-error">{runSampleResult.compileError}</pre>
    ) : (
      runSampleResult.results.map((r, i) => (
        <div key={i} className={`pd-sample-card ${r.passed ? 'pd-sample-card--pass' : 'pd-sample-card--fail'}`}>
          <div className="pd-sample-card-header">
            <span>样例 {i + 1}</span>
            {r.passed ? <CheckCircle2 size={16} /> : <XCircle size={16} />}
            <span>{r.passed ? '通过' : '未通过'} {r.runtime != null && `(${r.runtime}ms)`}</span>
          </div>
          <div className="pd-sample-card-io">
            <div><span>输入</span><pre>{r.input}</pre></div>
            <div><span>预期输出</span><pre>{r.expectedOutput}</pre></div>
            <div><span>实际输出</span><pre>{r.actualOutput || '-'}</pre></div>
          </div>
        </div>
      ))
    )}
  </div>
)}
```

- [ ] **Step 5: 新增 CSS 样式**

在 `ProblemDetail.css` 中新增：

```css
/* Run Sample Button */
.pd-run-sample-btn {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 10px;
  background: transparent;
  color: var(--text-secondary);
  border: 1px solid var(--border-light);
  border-radius: var(--radius-lg);
  font-size: 14px;
  font-weight: 500;
  transition: all var(--transition-base);
  margin-bottom: 8px;
}

.pd-run-sample-btn:hover {
  background: var(--bg-tertiary);
  color: var(--text-primary);
}

/* Run Sample Result Panel */
.pd-run-sample-result {
  max-height: 40%;
  overflow-y: auto;
  padding: 16px;
  border-top: 1px solid var(--border-light);
  background: var(--bg-card);
}

.pd-run-sample-result-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}

.pd-run-sample-result-header h3 {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
}

.pd-run-sample-result-header button {
  font-size: 18px;
  color: var(--text-muted);
  padding: 2px 6px;
  border-radius: var(--radius-sm);
}

.pd-run-sample-result-header button:hover {
  background: var(--bg-tertiary);
  color: var(--text-primary);
}

/* Sample Result Card */
.pd-sample-card {
  border: 1px solid var(--border-light);
  border-radius: var(--radius-lg);
  padding: 12px;
  margin-bottom: 8px;
}

.pd-sample-card--pass { border-color: var(--success-200); }
.pd-sample-card--fail { border-color: var(--danger-200); }

.pd-sample-card-header {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  font-weight: 600;
  margin-bottom: 8px;
}

.pd-sample-card--pass .pd-sample-card-header { color: var(--success-600); }
.pd-sample-card--fail .pd-sample-card-header { color: var(--danger-600); }

.pd-sample-card-io {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.pd-sample-card-io > div {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.pd-sample-card-io > div > span {
  font-size: 11px;
  font-weight: 600;
  color: var(--text-muted);
  text-transform: uppercase;
}

.pd-sample-card-io pre {
  background: var(--bg-tertiary);
  padding: 8px 10px;
  border-radius: var(--radius-md);
  font-family: var(--font-mono);
  font-size: 12px;
  color: var(--text-primary);
  overflow-x: auto;
  margin: 0;
}
```

- [ ] **Step 6: 运行前端测试**

```bash
cd frontend && npm test
```

Expected: 全部测试 PASS。

- [ ] **Step 7: Commit**

```bash
git add frontend/src/services/submissions.ts frontend/src/pages/Problems/ProblemDetail.tsx frontend/src/pages/Problems/ProblemDetail.css frontend/src/types/index.ts
git commit -m "feat: add frontend polling, run-sample button, and result panel"
```

---

### Task 9: 全量测试 + 验证

**Files:**
- 无新增文件，运行全量测试

- [ ] **Step 1: 运行 Server 全量测试**

```bash
cd server && npm test
```

Expected: 全部测试 PASS（包括新增的 7 个 judge 相关测试）。

- [ ] **Step 2: 运行前端全量测试**

```bash
cd frontend && npm test && npx tsc --noEmit
```

Expected: 全部测试 PASS，TypeScript 编译无错误。

- [ ] **Step 3: 运行 E2E 测试**

```bash
npx playwright test --project=chromium
```

Expected: 全部 E2E 测试 PASS。

- [ ] **Step 4: 更新 PROJECT.md**

更新 `PROJECT.md` 中 "2026-07-08（本次开发中）" 的评测系统条目为已完成，更新测试统计。

- [ ] **Step 5: 最终提交**

```bash
git add PROJECT.md
git commit -m "feat: Docker sandbox judge system complete"
```