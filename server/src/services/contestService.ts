import { prisma } from '../utils/prisma';
import { NotFoundError, BadRequestError, ForbiddenError } from '../utils/errors';

// 获取竞赛列表
export async function getContests(params: {
  page?: number;
  limit?: number;
  status?: 'upcoming' | 'ongoing' | 'ended';
  isPublic?: boolean;
}) {
  const { page = 1, limit = 20, status, isPublic = true } = params;
  const skip = (page - 1) * limit;

  const now = new Date();
  const where: any = { isPublic };

  if (status === 'upcoming') {
    where.startTime = { gt: now };
  } else if (status === 'ongoing') {
    where.startTime = { lte: now };
    where.endTime = { gte: now };
  } else if (status === 'ended') {
    where.endTime = { lt: now };
  }

  const [contests, total] = await Promise.all([
    prisma.contest.findMany({
      where,
      select: {
        id: true,
        title: true,
        description: true,
        startTime: true,
        endTime: true,
        isPublic: true,
        maxParticipants: true,
        type: true,
        creator: {
          select: { id: true, username: true },
        },
        _count: {
          select: {
            participants: true,
            problems: true,
          },
        },
      },
      skip,
      take: limit,
      orderBy: { startTime: 'desc' },
    }),
    prisma.contest.count({ where }),
  ]);

  return {
    contests: contests.map((c) => ({
      ...c,
      participantCount: c._count.participants,
      problemCount: c._count.problems,
      status: getContestStatus(c.startTime, c.endTime),
    })),
    total,
    page,
    totalPages: Math.ceil(total / limit),
  };
}

// 获取竞赛详情
export async function getContestById(contestId: string, userId?: string) {
  const contest = await prisma.contest.findUnique({
    where: { id: contestId },
    include: {
      creator: {
        select: { id: true, username: true },
      },
      problems: {
        select: {
          id: true,
          problemOrder: true,
          score: true,
          problem: {
            select: {
              id: true,
              title: true,
              difficulty: true,
            },
          },
        },
        orderBy: { problemOrder: 'asc' },
      },
      _count: {
        select: { participants: true },
      },
    },
  });

  if (!contest) {
    throw new NotFoundError('竞赛不存在');
  }

  // 检查用户是否已参加
  let isParticipating = false;
  let userRank: number | null = null;

  if (userId) {
    const participation = await prisma.contestParticipant.findUnique({
      where: {
        contestId_userId: { contestId, userId },
      },
    });
    isParticipating = !!participation;
    userRank = participation?.rank || null;
  }

  return {
    ...contest,
    status: getContestStatus(contest.startTime, contest.endTime),
    participantCount: contest._count.participants,
    isParticipating,
    userRank,
  };
}

// 创建竞赛
export async function createContest(data: {
  title: string;
  description?: string;
  startTime: Date;
  endTime: Date;
  isPublic?: boolean;
  maxParticipants?: number;
  creatorId: string;
  problemIds?: { problemId: string; order: string; score: number }[];
}) {
  if (data.startTime >= data.endTime) {
    throw new BadRequestError('结束时间必须晚于开始时间');
  }

  if (data.startTime < new Date()) {
    throw new BadRequestError('开始时间不能早于当前时间');
  }

  const contest = await prisma.contest.create({
    data: {
      title: data.title,
      description: data.description,
      startTime: data.startTime,
      endTime: data.endTime,
      isPublic: data.isPublic ?? true,
      maxParticipants: data.maxParticipants,
      creatorId: data.creatorId,
      problems: data.problemIds
        ? {
            create: data.problemIds.map((p) => ({
              problemId: p.problemId,
              problemOrder: p.order,
              score: p.score,
            })),
          }
        : undefined,
    },
    include: {
      problems: true,
    },
  });

  return contest;
}

// 加入竞赛
export async function joinContest(contestId: string, userId: string) {
  const contest = await prisma.contest.findUnique({
    where: { id: contestId },
    include: {
      _count: { select: { participants: true } },
    },
  });

  if (!contest) {
    throw new NotFoundError('竞赛不存在');
  }

  const now = new Date();
  if (contest.endTime < now) {
    throw new BadRequestError('竞赛已结束');
  }

  if (contest.maxParticipants && contest._count.participants >= contest.maxParticipants) {
    throw new BadRequestError('竞赛人数已满');
  }

  // 检查是否已参加
  const existing = await prisma.contestParticipant.findUnique({
    where: {
      contestId_userId: { contestId, userId },
    },
  });

  if (existing) {
    throw new BadRequestError('你已参加该竞赛');
  }

  const participant = await prisma.contestParticipant.create({
    data: {
      contestId,
      userId,
    },
  });

  // 添加参加竞赛积分
  const { addPoints, POINT_RULES } = await import('./gamification/points');
  await addPoints(userId, POINT_RULES.CONTEST_PARTICIPATE, 'contest', '参加竞赛');

  return participant;
}

// 获取竞赛排名
export async function getContestRanking(contestId: string) {
  const contest = await prisma.contest.findUnique({
    where: { id: contestId },
    include: {
      problems: {
        orderBy: { problemOrder: 'asc' },
        include: {
          problem: {
            select: { id: true },
          },
        },
      },
    },
  });

  if (!contest) {
    throw new NotFoundError('竞赛不存在');
  }

  const contestProblemIds = contest.problems.map((cp) => cp.problem.id);

  const participants = await prisma.contestParticipant.findMany({
    where: { contestId },
    include: {
      user: {
        select: {
          id: true,
          username: true,
          avatarUrl: true,
          level: true,
        },
      },
    },
    orderBy: [
      { totalScore: 'desc' },
      { joinedAt: 'asc' },
    ],
  });

  // 为每个参赛者计算各题状态和罚时
  const ranking = await Promise.all(
    participants.map(async (p, index) => {
      // 获取该参赛者在竞赛时间内的提交
      const submissions = await prisma.submission.findMany({
        where: {
          userId: p.user.id,
          problemId: { in: contestProblemIds },
          submittedAt: { gte: contest.startTime, lte: contest.endTime },
        },
        orderBy: { submittedAt: 'asc' },
      });

      // 按题目分组
      const submissionsByProblem: Record<string, typeof submissions> = {};
      for (const sub of submissions) {
        if (!submissionsByProblem[sub.problemId]) {
          submissionsByProblem[sub.problemId] = [];
        }
        submissionsByProblem[sub.problemId].push(sub);
      }

      let totalScore = 0;
      let penalty = 0;
      const problems = contest.problems.map((cp) => {
        const problemId = cp.problem.id;
        const subs = submissionsByProblem[problemId] || [];

        if (subs.length === 0) {
          return { label: cp.problemOrder, status: 'none', attempts: 0 };
        }

        const acceptedSub = subs.find((s) => s.status === 'accepted');
        if (acceptedSub) {
          const attempts = subs.length;
          const solveTimeMinutes = Math.floor(
            (acceptedSub.submittedAt.getTime() - contest.startTime.getTime()) / 60000
          );
          totalScore += cp.score;
          penalty += solveTimeMinutes + 20 * (attempts - 1);
          return {
            label: cp.problemOrder,
            status: 'solved' as const,
            attempts,
            time: solveTimeMinutes,
          };
        }

        return { label: cp.problemOrder, status: 'attempted', attempts: subs.length };
      });

      return {
        rank: index + 1,
        userId: p.user.id,
        username: p.user.username,
        avatarUrl: p.user.avatarUrl,
        level: p.user.level,
        totalScore,
        penalty,
        problems,
        joinedAt: p.joinedAt,
      };
    })
  );

  // 按总分降序、罚时升序排序
  ranking.sort((a, b) => {
    if (b.totalScore !== a.totalScore) return b.totalScore - a.totalScore;
    return a.penalty - b.penalty;
  });

  // 重新分配排名
  ranking.forEach((r, i) => { r.rank = i + 1; });

  // 批量更新排名
  await Promise.all(
    ranking.map((r) =>
      prisma.contestParticipant.update({
        where: {
          contestId_userId: { contestId, userId: r.userId },
        },
        data: { rank: r.rank, totalScore: r.totalScore },
      })
    )
  );

  return ranking;
}

// 获取竞赛题目
export async function getContestProblems(contestId: string, userId?: string) {
  const contest = await prisma.contest.findUnique({
    where: { id: contestId },
  });

  if (!contest) {
    throw new NotFoundError('竞赛不存在');
  }

  // 竞赛未开始时不显示题目
  const now = new Date();
  if (contest.startTime > now) {
    throw new BadRequestError('竞赛尚未开始');
  }

  const problems = await prisma.contestProblem.findMany({
    where: { contestId },
    include: {
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
    orderBy: { problemOrder: 'asc' },
  });

  // 如果用户已参加，获取其各题提交状态
  let userSubmissions: Record<string, any> = {};
  if (userId) {
    const submissions = await prisma.submission.findMany({
      where: {
        userId,
        contestId,
      },
      select: {
        problemId: true,
        status: true,
        score: true,
        submittedAt: true,
      },
      orderBy: { submittedAt: 'desc' },
    });

    submissions.forEach((s) => {
      if (!userSubmissions[s.problemId]) {
        userSubmissions[s.problemId] = s;
      }
    });
  }

  return problems.map((cp) => ({
    order: cp.problemOrder,
    score: cp.score,
    ...cp.problem,
    userStatus: userSubmissions[cp.problemId] || null,
  }));
}

// 辅助函数：获取竞赛状态
function getContestStatus(startTime: Date, endTime: Date): string {
  const now = new Date();
  if (now < startTime) return 'upcoming';
  if (now > endTime) return 'ended';
  return 'ongoing';
}
