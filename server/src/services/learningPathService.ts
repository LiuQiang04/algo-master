import { prisma } from '../utils/prisma';

// 获取所有学习路径列表
export async function getAllPaths(userId?: string) {
  const paths = await prisma.learningPath.findMany({
    where: { isPublished: true },
    orderBy: { sortOrder: 'asc' },
    include: {
      modules: {
        include: {
          problems: true,
        },
      },
      userProgress: userId
        ? {
            where: { userId },
            select: { status: true, progress: true },
          }
        : false,
    },
  });

  return paths.map((path) => {
    const totalModules = path.modules.length;
    const totalProblems = path.modules.reduce((sum, m) => sum + m.problems.length, 0);

    // 计算用户进度
    let completedModules = 0;
    let completedProblems = 0;

    if (userId && path.userProgress.length > 0) {
      // 获取每个模块的进度
      const moduleProgresses = path.modules.map((mod) => {
        const progress = path.userProgress.find((p) => p.status === 'completed');
        return progress ? 1 : 0;
      });
      completedModules = moduleProgresses.filter((p) => p === 1).length;
    }

    return {
      id: path.id,
      title: path.title,
      description: path.description,
      coverUrl: path.coverUrl,
      difficulty: path.difficulty,
      totalModules,
      totalProblems,
      completedModules,
      completedProblems,
      estimatedHours: Math.ceil(totalProblems * 1.5), // 估算：每题 1.5 小时
      isPublished: path.isPublished,
      createdAt: path.createdAt,
    };
  });
}

// 获取学习路径详情
export async function getPathDetail(pathId: string, userId?: string) {
  const path = await prisma.learningPath.findUnique({
    where: { id: pathId },
    include: {
      modules: {
        orderBy: { sortOrder: 'asc' },
        include: {
          problems: {
            orderBy: { sortOrder: 'asc' },
            include: {
              problem: {
                select: {
                  id: true,
                  title: true,
                  difficulty: true,
                  solveCount: true,
                  tags: {
                    include: {
                      tag: {
                        select: { name: true },
                      },
                    },
                  },
                },
              },
            },
          },
          userProgress: userId
            ? {
                where: { userId },
                select: { status: true, progress: true },
              }
            : false,
        },
      },
      userProgress: userId
        ? {
            where: { userId, moduleId: null },
            select: { status: true, progress: true },
          }
        : false,
    },
  });

  if (!path) {
    return null;
  }

  // 获取用户已解决的题目
  let solvedProblemIds = new Set<string>();
  if (userId) {
    const solvedSubmissions = await prisma.submission.findMany({
      where: { userId, status: 'accepted' },
      select: { problemId: true },
      distinct: ['problemId'],
    });
    solvedProblemIds = new Set(solvedSubmissions.map((s) => s.problemId));
  }

  // 构建模块数据
  const modules = path.modules.map((mod) => {
    const moduleProgress = mod.userProgress?.[0];
    const moduleStatus = moduleProgress?.status || 'not_started';

    const moduleProblems = mod.problems.map((mp) => ({
      id: mp.problem.id,
      title: mp.problem.title,
      difficulty: mp.problem.difficulty,
      solveCount: mp.problem.solveCount,
      tags: mp.problem.tags.map((t) => t.tag.name),
      completed: solvedProblemIds.has(mp.problem.id),
      isRequired: mp.isRequired,
      sortOrder: mp.sortOrder,
    }));

    const completedCount = moduleProblems.filter((p) => p.completed).length;
    const totalCount = moduleProblems.length;
    const progress = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

    // 确定模块状态：如果所有必做题都完成了，就是 completed
    const requiredProblems = moduleProblems.filter((p) => p.isRequired);
    const allRequiredCompleted = requiredProblems.length > 0 && requiredProblems.every((p) => p.completed);
    const finalStatus = allRequiredCompleted ? 'completed' : moduleStatus;

    return {
      id: mod.id,
      title: mod.title,
      description: mod.description,
      sortOrder: mod.sortOrder,
      status: finalStatus,
      progress,
      completedCount,
      totalCount,
      problems: moduleProblems,
      knowledgePoints: extractKnowledgePoints(mod.description),
    };
  });

  // 计算总体进度
  const totalProblems = modules.reduce((sum, m) => sum + m.totalCount, 0);
  const completedProblems = modules.reduce((sum, m) => sum + m.completedCount, 0);
  const completedModules = modules.filter((m) => m.status === 'completed').length;
  const progressPercent = modules.length > 0
    ? Math.round((completedModules / modules.length) * 100)
    : 0;

  return {
    id: path.id,
    title: path.title,
    description: path.description,
    coverUrl: path.coverUrl,
    difficulty: path.difficulty,
    estimatedHours: Math.ceil(totalProblems * 1.5),
    totalProblems,
    completedProblems,
    completedModules,
    totalModules: modules.length,
    progressPercent,
    objectives: generateObjectives(path.description),
    modules,
    createdAt: path.createdAt,
  };
}

// 获取用户在指定路径的进度
export async function getUserPathProgress(userId: string, pathId: string) {
  const progresses = await prisma.learningProgress.findMany({
    where: { userId, pathId },
    include: {
      module: {
        select: { id: true, title: true },
      },
    },
    orderBy: { updatedAt: 'desc' },
  });

  const pathProgress = progresses.find((p) => p.moduleId === null);
  const moduleProgresses = progresses.filter((p) => p.moduleId !== null);

  return {
    pathProgress: pathProgress
      ? {
          status: pathProgress.status,
          progress: pathProgress.progress,
          startedAt: pathProgress.startedAt,
          completedAt: pathProgress.completedAt,
        }
      : null,
    moduleProgresses: moduleProgresses.map((mp) => ({
      moduleId: mp.moduleId,
      moduleName: mp.module?.title,
      status: mp.status,
      progress: mp.progress,
      startedAt: mp.startedAt,
      completedAt: mp.completedAt,
    })),
  };
}

// 开始学习路径
export async function startPath(userId: string, pathId: string) {
  // 检查路径是否存在
  const path = await prisma.learningPath.findUnique({ where: { id: pathId } });
  if (!path) {
    throw new Error('Learning path not found');
  }

  // 创建或更新路径级别的进度
  const existingProgress = await prisma.learningProgress.findFirst({
    where: { userId, pathId, moduleId: null },
  });

  if (existingProgress) {
    return existingProgress;
  }

  return prisma.learningProgress.create({
    data: {
      userId,
      pathId,
      status: 'in_progress',
      progress: 0,
      startedAt: new Date(),
    },
  });
}

// 辅助函数：从描述中提取知识点
function extractKnowledgePoints(description: string): string[] {
  // 简单的知识点提取逻辑
  const keywords = [
    '数组', '链表', '栈', '队列', '哈希表', '堆', '树', '图',
    '排序', '搜索', '递归', '动态规划', '贪心', '分治', '回溯',
    'BFS', 'DFS', '最短路', '最小生成树', '网络流', '二分图',
    '背包', '区间', '数位', '树形', '状态压缩',
  ];

  return keywords.filter((kw) => description.includes(kw));
}

// 辅助函数：生成学习目标
function generateObjectives(description: string): string[] {
  const objectives = [
    '理解核心概念和基本原理',
    '掌握常用的解题模板和技巧',
    '通过实践题目巩固所学知识',
    '能够独立解决中等难度的相关问题',
  ];

  // 根据描述添加特定目标
  if (description.includes('动态规划')) {
    objectives.push('理解状态定义与转移方程的设计方法');
    objectives.push('熟练运用各种DP变体');
  }
  if (description.includes('图论')) {
    objectives.push('掌握图的遍历和最短路径算法');
    objectives.push('理解最小生成树和网络流');
  }
  if (description.includes('数据结构')) {
    objectives.push('理解各种数据结构的原理与应用场景');
    objectives.push('能够选择合适的数据结构解决问题');
  }

  return objectives;
}
