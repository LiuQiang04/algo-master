import { prisma } from '../utils/prisma';
import { NotFoundError, BadRequestError } from '../utils/errors';
import { calculateLevel } from './gamification/points';

// 获取用户公开信息
export async function getUserById(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      username: true,
      email: true,
      avatarUrl: true,
      bio: true,
      rating: true,
      experiencePoints: true,
      level: true,
      region: true,
      title: true,
      createdAt: true,
      _count: {
        select: {
          submissions: true,
          posts: true,
          achievements: true,
        },
      },
    },
  });

  if (!user) {
    throw new NotFoundError('用户不存在');
  }

  return user;
}

// 获取用户统计信息
export async function getUserStats(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      rating: true,
      experiencePoints: true,
      level: true,
    },
  });

  if (!user) {
    throw new NotFoundError('用户不存在');
  }

  // 解题统计
  const solvedProblems = await prisma.submission.findMany({
    where: {
      userId,
      status: 'accepted',
    },
    select: { problemId: true },
    distinct: ['problemId'],
  });

  const totalSolved = solvedProblems.length;

  // 按难度统计
  const difficultyStats = await prisma.problem.groupBy({
    by: ['difficulty'],
    where: {
      id: { in: solvedProblems.map((s) => s.problemId) },
    },
    _count: true,
  });

  // 提交统计
  const totalSubmissions = await prisma.submission.count({
    where: { userId },
  });

  const acceptedSubmissions = await prisma.submission.count({
    where: {
      userId,
      status: 'accepted',
    },
  });

  // 竞赛统计
  const contestCount = await prisma.contestParticipant.count({
    where: { userId },
  });

  const contestTop3 = await prisma.contestParticipant.count({
    where: {
      userId,
      rank: { lte: 3 },
    },
  });

  // 成就统计
  const achievementCount = await prisma.userAchievement.count({
    where: { userId },
  });

  // 等级信息
  const levelInfo = calculateLevel(user.experiencePoints);

  return {
    userId: user.id,
    rating: user.rating,
    level: levelInfo,
    problems: {
      totalSolved,
      byDifficulty: difficultyStats.reduce((acc, d) => {
        acc[d.difficulty] = d._count;
        return acc;
      }, {} as Record<number, number>),
    },
    submissions: {
      total: totalSubmissions,
      accepted: acceptedSubmissions,
      acceptanceRate: totalSubmissions > 0
        ? Math.round((acceptedSubmissions / totalSubmissions) * 100)
        : 0,
    },
    contests: {
      participated: contestCount,
      top3Finishes: contestTop3,
    },
    achievements: achievementCount,
  };
}

// 更新用户信息
export async function updateUser(
  userId: string,
  data: {
    username?: string;
    avatarUrl?: string;
    bio?: string;
    region?: string;
  }
) {
  // 如果更新用户名，检查是否已存在
  if (data.username) {
    const existing = await prisma.user.findFirst({
      where: {
        username: data.username,
        id: { not: userId },
      },
    });
    if (existing) {
      throw new BadRequestError('用户名已存在');
    }
  }

  const user = await prisma.user.update({
    where: { id: userId },
    data,
    select: {
      id: true,
      username: true,
      email: true,
      avatarUrl: true,
      bio: true,
      rating: true,
      experiencePoints: true,
      level: true,
      region: true,
      title: true,
    },
  });

  return user;
}

// 搜索用户
export async function searchUsers(query: string, page: number = 1, limit: number = 20) {
  const skip = (page - 1) * limit;

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where: {
        OR: [
          { username: { contains: query, mode: 'insensitive' } },
          { email: { contains: query, mode: 'insensitive' } },
        ],
      },
      select: {
        id: true,
        username: true,
        avatarUrl: true,
        level: true,
        rating: true,
      },
      skip,
      take: limit,
      orderBy: { experiencePoints: 'desc' },
    }),
    prisma.user.count({
      where: {
        OR: [
          { username: { contains: query, mode: 'insensitive' } },
          { email: { contains: query, mode: 'insensitive' } },
        ],
      },
    }),
  ]);

  return {
    users,
    total,
    page,
    totalPages: Math.ceil(total / limit),
  };
}

// 获取用户列表（管理员）
export async function getUsers(page: number = 1, limit: number = 20) {
  const skip = (page - 1) * limit;

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      select: {
        id: true,
        username: true,
        email: true,
        avatarUrl: true,
        level: true,
        rating: true,
        role: true,
        createdAt: true,
      },
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.user.count(),
  ]);

  return {
    users,
    total,
    page,
    totalPages: Math.ceil(total / limit),
  };
}
