import { Worker } from 'bullmq';
import { getRedisConfig } from '../utils/redis';
import { judge } from '../services/judge/dockerJudge';
import { prisma } from '../utils/prisma';
import { addPoints, POINT_RULES } from '../services/gamification/points';
import { checkAchievements } from '../services/gamification/achievements';

const redisConfig = getRedisConfig();

const worker = new Worker(
  'judge',
  async (job) => {
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
      testCases: submission.problem.testCases.map((tc) => ({
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
      const allPassed = result.results.every((r) => r.passed);
      finalStatus = allPassed ? 'accepted' : 'wrong_answer';
    }

    const maxRuntime = result.results.reduce(
      (max, r) => Math.max(max, r.runtime || 0),
      0,
    );

    // 更新提交记录
    await prisma.submission.update({
      where: { id: submissionId },
      data: {
        status: finalStatus,
        executionTime: maxRuntime,
        score:
          result.summary.total > 0
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

      const basePoints = POINT_RULES.SOLVE_PROBLEM.base;
      const difficultyMultiplier =
        POINT_RULES.SOLVE_PROBLEM.difficultyMultiplier[
          submission.problem.difficulty
        ] || 1;
      const points = Math.floor(basePoints * difficultyMultiplier);

      await addPoints(
        submission.userId,
        points,
        'solve',
        `完成题目: ${submission.problem.title}`,
        submission.problemId,
      );

      await checkAchievements(submission.userId);
    }
  },
  {
    connection: redisConfig,
    concurrency: 2, // 限制并发数，避免 Docker 资源耗尽
  },
);

console.log('Judge worker started (concurrency: 2)');

process.on('SIGTERM', async () => {
  await worker.close();
  process.exit(0);
});
