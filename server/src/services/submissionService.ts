import { prisma } from '../utils/prisma';
import { NotFoundError, BadRequestError } from '../utils/errors';

// 提交代码
export async function createSubmission(data: {
  userId: string;
  problemId: string;
  language: string;
  sourceCode: string;
  contestId?: string;
}) {
  // 验证题目存在
  const problem = await prisma.problem.findUnique({
    where: { id: data.problemId },
    include: {
      testCases: true,
    },
  });

  if (!problem) {
    throw new NotFoundError('题目不存在');
  }

  // 验证语言支持
  const supportedLanguages = ['cpp', 'java', 'python', 'javascript'];
  if (!supportedLanguages.includes(data.language)) {
    throw new BadRequestError(`不支持的语言: ${data.language}`);
  }

  // 创建提交记录
  const submission = await prisma.submission.create({
    data: {
      userId: data.userId,
      problemId: data.problemId,
      language: data.language,
      sourceCode: data.sourceCode,
      status: 'pending',
      contestId: data.contestId,
    },
  });

  // 更新题目提交计数
  await prisma.problem.update({
    where: { id: data.problemId },
    data: { submitCount: { increment: 1 } },
  });

  // TODO: 将评测任务加入队列
  // await judgeQueue.add({ submissionId: submission.id });

  // 模拟评测（开发环境）
  if (process.env.NODE_ENV === 'development') {
    simulateJudge(submission.id, problem);
  }

  return submission;
}

// 模拟评测（开发环境使用）
async function simulateJudge(submissionId: string, problem: any) {
  // 模拟评测延迟
  await new Promise((resolve) => setTimeout(resolve, 1000));

  const random = Math.random();
  let status: string;
  let score = 0;

  if (random > 0.5) {
    status = 'accepted';
    score = 100;
  } else if (random > 0.3) {
    status = 'wrong_answer';
    score = Math.floor(random * 50);
  } else if (random > 0.2) {
    status = 'time_limit_exceeded';
  } else {
    status = 'runtime_error';
  }

  await prisma.submission.update({
    where: { id: submissionId },
    data: {
      status,
      score,
      executionTime: Math.floor(Math.random() * 1000),
      memoryUsed: Math.floor(Math.random() * 100000),
    },
  });

  // 如果AC，更新题目解题计数和用户积分
  if (status === 'accepted') {
    const submission = await prisma.submission.findUnique({
      where: { id: submissionId },
    });

    if (submission) {
      await prisma.problem.update({
        where: { id: submission.problemId },
        data: { solveCount: { increment: 1 } },
      });

      // 添加积分
      const { addPoints, POINT_RULES } = await import('./gamification/points');
      const basePoints = POINT_RULES.SOLVE_PROBLEM.base;
      const difficultyMultiplier =
        POINT_RULES.SOLVE_PROBLEM.difficultyMultiplier[problem.difficulty] || 1;
      const points = Math.floor(basePoints * difficultyMultiplier);

      await addPoints(
        submission.userId,
        points,
        'solve',
        `完成题目: ${problem.title}`,
        submission.problemId
      );

      // 检查成就
      const { checkAchievements } = await import('./gamification/achievements');
      await checkAchievements(submission.userId);
    }
  }
}

// 获取提交记录
export async function getSubmissions(params: {
  userId?: string;
  problemId?: string;
  status?: string;
  language?: string;
  page?: number;
  limit?: number;
}) {
  const { userId, problemId, status, language, page = 1, limit = 20 } = params;
  const skip = (page - 1) * limit;

  const where: any = {};
  if (userId) where.userId = userId;
  if (problemId) where.problemId = problemId;
  if (status) where.status = status;
  if (language) where.language = language;

  const [submissions, total] = await Promise.all([
    prisma.submission.findMany({
      where,
      select: {
        id: true,
        status: true,
        language: true,
        executionTime: true,
        memoryUsed: true,
        score: true,
        submittedAt: true,
        user: {
          select: { id: true, username: true },
        },
        problem: {
          select: { id: true, title: true, difficulty: true },
        },
      },
      skip,
      take: limit,
      orderBy: { submittedAt: 'desc' },
    }),
    prisma.submission.count({ where }),
  ]);

  return {
    submissions,
    total,
    page,
    totalPages: Math.ceil(total / limit),
  };
}

// 获取提交详情
export async function getSubmissionById(submissionId: string, userId?: string) {
  const submission = await prisma.submission.findUnique({
    where: { id: submissionId },
    include: {
      user: {
        select: { id: true, username: true },
      },
      problem: {
        select: {
          id: true,
          title: true,
          difficulty: true,
          timeLimit: true,
          memoryLimit: true,
        },
      },
    },
  });

  if (!submission) {
    throw new NotFoundError('提交记录不存在');
  }

  // 非本人提交不显示源代码
  if (userId && submission.userId !== userId) {
    return {
      ...submission,
      sourceCode: '// 仅提交者可查看源代码',
    };
  }

  return submission;
}

// 获取评测状态
export async function getSubmissionStatus(submissionId: string) {
  const submission = await prisma.submission.findUnique({
    where: { id: submissionId },
    select: {
      id: true,
      status: true,
      executionTime: true,
      memoryUsed: true,
      score: true,
    },
  });

  if (!submission) {
    throw new NotFoundError('提交记录不存在');
  }

  return submission;
}
