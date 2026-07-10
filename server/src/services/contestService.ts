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
  });

  if (!contest) {
    throw new NotFoundError('竞赛不存在');
  }

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

  // 更新排名
  const ranking = participants.map((p, index) => ({
    rank: index + 1,
    userId: p.user.id,
    username: p.user.username,
    avatarUrl: p.user.avatarUrl,
    level: p.user.level,
    totalScore: p.totalScore,
    joinedAt: p.joinedAt,
  }));

  // 批量更新排名
  await Promise.all(
    ranking.map((r) =>
      prisma.contestParticipant.update({
        where: {
          contestId_userId: { contestId, userId: r.userId },
        },
        data: { rank: r.rank },
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
