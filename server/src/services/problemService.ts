import { prisma } from '../utils/prisma';
import { NotFoundError, BadRequestError, ForbiddenError } from '../utils/errors';

// 获取题目列表
export async function getProblems(params: {
  page?: number;
  limit?: number;
  difficulty?: number;
  tag?: string;
  search?: string;
  isPublic?: boolean;
}) {
  const { page = 1, limit = 20, difficulty, tag, search, isPublic = true } = params;
  const skip = (page - 1) * limit;

  const where: any = { isPublic };

  if (difficulty) {
    where.difficulty = difficulty;
  }

  if (tag) {
    where.tags = {
      some: {
        tag: { name: tag },
      },
    };
  }

  if (search) {
    where.OR = [
      { title: { contains: search, mode: 'insensitive' } },
      { description: { contains: search, mode: 'insensitive' } },
    ];
  }

  const [problems, total] = await Promise.all([
    prisma.problem.findMany({
      where,
      select: {
        id: true,
        title: true,
        difficulty: true,
        timeLimit: true,
        memoryLimit: true,
        solveCount: true,
        submitCount: true,
        tags: {
          select: {
            tag: {
              select: { id: true, name: true, category: true },
            },
          },
        },
      },
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.problem.count({ where }),
  ]);

  return {
    problems: problems.map((p) => ({
      ...p,
      tags: p.tags.map((t) => t.tag),
      acceptanceRate: p.submitCount > 0
        ? Math.round((p.solveCount / p.submitCount) * 100)
        : 0,
    })),
    total,
    page,
    totalPages: Math.ceil(total / limit),
  };
}

// 获取题目详情
export async function getProblemById(problemId: string, userId?: string) {
  const problem = await prisma.problem.findUnique({
    where: { id: problemId },
    include: {
      tags: {
        select: {
          tag: {
            select: { id: true, name: true, category: true },
          },
        },
      },
      testCases: {
        where: { isSample: true },
        select: {
          id: true,
          input: true,
          expectedOutput: true,
          isSample: true,
        },
      },
    },
  });

  if (!problem) {
    throw new NotFoundError('题目不存在');
  }

  // 如果用户已登录，获取其提交记录
  let userSubmissions: any[] = [];
  if (userId) {
    userSubmissions = await prisma.submission.findMany({
      where: {
        userId,
        problemId,
      },
      select: {
        id: true,
        status: true,
        language: true,
        executionTime: true,
        memoryUsed: true,
        score: true,
        submittedAt: true,
      },
      orderBy: { submittedAt: 'desc' },
      take: 10,
    });
  }

  return {
    ...problem,
    tags: problem.tags.map((t) => t.tag),
    userSubmissions,
    acceptanceRate: problem.submitCount > 0
      ? Math.round((problem.solveCount / problem.submitCount) * 100)
      : 0,
  };
}

// 创建题目（管理员）
export async function createProblem(data: {
  title: string;
  description: string;
  inputFormat?: string;
  outputFormat?: string;
  sampleInput?: string;
  sampleOutput?: string;
  difficulty: number;
  timeLimit?: number;
  memoryLimit?: number;
  tags?: string[];
  testCases?: { input: string; expectedOutput: string; isSample?: boolean }[];
  authorId: string;
}) {
  if (data.difficulty < 1 || data.difficulty > 5) {
    throw new BadRequestError('难度必须在1-5之间');
  }

  const problem = await prisma.problem.create({
    data: {
      title: data.title,
      description: data.description,
      inputFormat: data.inputFormat,
      outputFormat: data.outputFormat,
      sampleInput: data.sampleInput,
      sampleOutput: data.sampleOutput,
      difficulty: data.difficulty,
      timeLimit: data.timeLimit || 1000,
      memoryLimit: data.memoryLimit || 256,
      authorId: data.authorId,
      // 创建标签关联
      tags: data.tags
        ? {
            create: await Promise.all(
              data.tags.map(async (tagName) => {
                const tag = await prisma.tag.upsert({
                  where: { name: tagName },
                  update: {},
                  create: { name: tagName },
                });
                return { tagId: tag.id };
              })
            ),
          }
        : undefined,
      // 创建测试用例
      testCases: data.testCases
        ? { create: data.testCases }
        : undefined,
    },
    include: {
      tags: { select: { tag: true } },
      testCases: true,
    },
  });

  return problem;
}

// 更新题目（管理员）
export async function updateProblem(
  problemId: string,
  data: {
    title?: string;
    description?: string;
    inputFormat?: string;
    outputFormat?: string;
    sampleInput?: string;
    sampleOutput?: string;
    difficulty?: number;
    timeLimit?: number;
    memoryLimit?: number;
    isPublic?: boolean;
  }
) {
  const problem = await prisma.problem.findUnique({
    where: { id: problemId },
  });

  if (!problem) {
    throw new NotFoundError('题目不存在');
  }

  if (data.difficulty && (data.difficulty < 1 || data.difficulty > 5)) {
    throw new BadRequestError('难度必须在1-5之间');
  }

  return prisma.problem.update({
    where: { id: problemId },
    data,
  });
}

// 删除题目（管理员）
export async function deleteProblem(problemId: string) {
  const problem = await prisma.problem.findUnique({
    where: { id: problemId },
    include: {
      _count: {
        select: { submissions: true, contestProblems: true },
      },
    },
  });

  if (!problem) {
    throw new NotFoundError('题目不存在');
  }

  if (problem._count.submissions > 0) {
    throw new BadRequestError('该题目已有提交记录，无法删除');
  }

  if (problem._count.contestProblems > 0) {
    throw new BadRequestError('该题目已被关联到竞赛，无法删除');
  }

  await prisma.problem.delete({ where: { id: problemId } });
  return { message: '题目已删除' };
}

// 获取所有标签
export async function getTags() {
  const tags = await prisma.tag.findMany({
    include: {
      _count: {
        select: { problems: true },
      },
    },
    orderBy: { name: 'asc' },
  });

  return tags.map((tag) => ({
    ...tag,
    problemCount: tag._count.problems,
  }));
}

// 获取随机题目
export async function getRandomProblem(difficulty?: number) {
  const where: any = { isPublic: true };
  if (difficulty) {
    where.difficulty = difficulty;
  }

  const count = await prisma.problem.count({ where });
  if (count === 0) {
    throw new NotFoundError('没有可用的题目');
  }

  const skip = Math.floor(Math.random() * count);
  const problem = await prisma.problem.findFirst({
    where,
    skip,
    select: {
      id: true,
      title: true,
      difficulty: true,
    },
  });

  return problem;
}
