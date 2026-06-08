import { prisma } from '../../utils/prisma';
import { unlockAchievement } from './points';

// 成就定义
export const ACHIEVEMENT_DEFINITIONS = [
  // ==================== 解题成就 ====================
  {
    name: '初出茅庐',
    description: '完成第一道题目',
    category: 'problem',
    rarity: 'common',
    iconUrl: '/achievements/first-solve.png',
    points: 10,
    requirement: { type: 'solve_count', value: 1 },
  },
  {
    name: '小试牛刀',
    description: '完成10道题目',
    category: 'problem',
    rarity: 'common',
    iconUrl: '/achievements/solve-10.png',
    points: 20,
    requirement: { type: 'solve_count', value: 10 },
  },
  {
    name: '算法新星',
    description: '完成50道题目',
    category: 'problem',
    rarity: 'rare',
    iconUrl: '/achievements/solve-50.png',
    points: 50,
    requirement: { type: 'solve_count', value: 50 },
  },
  {
    name: '算法达人',
    description: '完成100道题目',
    category: 'problem',
    rarity: 'epic',
    iconUrl: '/achievements/solve-100.png',
    points: 100,
    requirement: { type: 'solve_count', value: 100 },
  },
  {
    name: '算法大师',
    description: '完成500道题目',
    category: 'problem',
    rarity: 'legendary',
    iconUrl: '/achievements/solve-500.png',
    points: 200,
    requirement: { type: 'solve_count', value: 500 },
  },
  {
    name: '困难征服者',
    description: '完成一道难度为5的题目',
    category: 'problem',
    rarity: 'rare',
    iconUrl: '/achievements/hard-solver.png',
    points: 30,
    requirement: { type: 'solve_difficulty', value: 5 },
  },
  {
    name: '动态规划专家',
    description: '完成20道动态规划题目',
    category: 'problem',
    rarity: 'epic',
    iconUrl: '/achievements/dp-expert.png',
    points: 80,
    requirement: { type: 'solve_tag', tag: '动态规划', value: 20 },
  },
  {
    name: '图论高手',
    description: '完成20道图论题目',
    category: 'problem',
    rarity: 'epic',
    iconUrl: '/achievements/graph-expert.png',
    points: 80,
    requirement: { type: 'solve_tag', tag: '图论', value: 20 },
  },

  // ==================== 竞赛成就 ====================
  {
    name: '竞赛新手',
    description: '参加第一次竞赛',
    category: 'contest',
    rarity: 'common',
    iconUrl: '/achievements/contest-newbie.png',
    points: 15,
    requirement: { type: 'contest_count', value: 1 },
  },
  {
    name: '竞赛常客',
    description: '参加10次竞赛',
    category: 'contest',
    rarity: 'rare',
    iconUrl: '/achievements/contest-regular.png',
    points: 50,
    requirement: { type: 'contest_count', value: 10 },
  },
  {
    name: '领奖台',
    description: '在竞赛中获得前3名',
    category: 'contest',
    rarity: 'epic',
    iconUrl: '/achievements/podium.png',
    points: 100,
    requirement: { type: 'contest_rank', value: 3 },
  },
  {
    name: '王者归来',
    description: '在竞赛中获得第1名',
    category: 'contest',
    rarity: 'legendary',
    iconUrl: '/achievements/contest-champion.png',
    points: 200,
    requirement: { type: 'contest_rank', value: 1 },
  },

  // ==================== 学习成就 ====================
  {
    name: '持之以恒',
    description: '连续登录7天',
    category: 'learning',
    rarity: 'common',
    iconUrl: '/achievements/streak-7.png',
    points: 30,
    requirement: { type: 'login_streak', value: 7 },
  },
  {
    name: '月度坚持',
    description: '连续登录30天',
    category: 'learning',
    rarity: 'rare',
    iconUrl: '/achievements/streak-30.png',
    points: 100,
    requirement: { type: 'login_streak', value: 30 },
  },
  {
    name: '年度学霸',
    description: '连续登录365天',
    category: 'learning',
    rarity: 'legendary',
    iconUrl: '/achievements/streak-365.png',
    points: 500,
    requirement: { type: 'login_streak', value: 365 },
  },
  {
    name: '每日挑战者',
    description: '完成7次每日挑战',
    category: 'learning',
    rarity: 'rare',
    iconUrl: '/achievements/daily-7.png',
    points: 50,
    requirement: { type: 'daily_challenge_count', value: 7 },
  },
  {
    name: '等级达人',
    description: '达到10级',
    category: 'level',
    rarity: 'rare',
    iconUrl: '/achievements/level-10.png',
    points: 50,
    requirement: { type: 'reach_level', value: 10 },
  },
  {
    name: '等级大师',
    description: '达到50级',
    category: 'level',
    rarity: 'epic',
    iconUrl: '/achievements/level-50.png',
    points: 150,
    requirement: { type: 'reach_level', value: 50 },
  },
  {
    name: '等级传说',
    description: '达到100级',
    category: 'level',
    rarity: 'legendary',
    iconUrl: '/achievements/level-100.png',
    points: 500,
    requirement: { type: 'reach_level', value: 100 },
  },

  // ==================== 社交成就 ====================
  {
    name: '热心分享',
    description: '发布第一篇题解',
    category: 'social',
    rarity: 'common',
    iconUrl: '/achievements/first-post.png',
    points: 10,
    requirement: { type: 'post_count', value: 1 },
  },
  {
    name: '社区达人',
    description: '发布10篇帖子',
    category: 'social',
    rarity: 'rare',
    iconUrl: '/achievements/community-star.png',
    points: 50,
    requirement: { type: 'post_count', value: 10 },
  },
  {
    name: '受欢迎的人',
    description: '获得50个点赞',
    category: 'social',
    rarity: 'rare',
    iconUrl: '/achievements/popular.png',
    points: 60,
    requirement: { type: 'total_upvotes', value: 50 },
  },
  {
    name: '好友满天下',
    description: '添加20个好友',
    category: 'social',
    rarity: 'rare',
    iconUrl: '/achievements/friends-20.png',
    points: 40,
    requirement: { type: 'friend_count', value: 20 },
  },

  // ==================== 特殊成就 ====================
  {
    name: '速度之王',
    description: '在5分钟内完成一道难度4以上的题目',
    category: 'special',
    rarity: 'epic',
    iconUrl: '/achievements/speed-king.png',
    points: 100,
    requirement: { type: 'fast_solve', difficulty: 4, time: 300 },
  },
  {
    name: '完美主义者',
    description: '一次提交通过所有测试点',
    category: 'special',
    rarity: 'rare',
    iconUrl: '/achievements/perfect.png',
    points: 30,
    requirement: { type: 'perfect_solve', value: 1 },
  },
  {
    name: '全能选手',
    description: '在5个不同算法类别中各完成5道题目',
    category: 'special',
    rarity: 'epic',
    iconUrl: '/achievements/all-rounder.png',
    points: 100,
    requirement: { type: 'diverse_solve', categories: 5, perCategory: 5 },
  },
];

// 初始化成就
export async function initializeAchievements() {
  for (const def of ACHIEVEMENT_DEFINITIONS) {
    await prisma.achievement.upsert({
      where: { name: def.name },
      update: {
        description: def.description,
        category: def.category,
        rarity: def.rarity,
        iconUrl: def.iconUrl,
        points: def.points,
        requirement: def.requirement,
      },
      create: def,
    });
  }
}

// 检查用户成就进度
export async function checkAchievements(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      achievements: {
        include: { achievement: true },
      },
    },
  });

  if (!user) return;

  const unlockedIds = new Set(user.achievements.map((ua) => ua.achievementId));

  // 获取所有活跃成就
  const achievements = await prisma.achievement.findMany({
    where: { isActive: true },
  });

  for (const achievement of achievements) {
    if (unlockedIds.has(achievement.id)) continue;

    const req = achievement.requirement as any;
    const isUnlocked = await checkRequirement(userId, req);

    if (isUnlocked) {
      await unlockAchievement(userId, achievement.id);
    }
  }
}

// 检查单个成就条件
async function checkRequirement(userId: string, requirement: any): Promise<boolean> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { level: true },
  });

  switch (requirement.type) {
    case 'solve_count': {
      const count = await prisma.submission.count({
        where: {
          userId,
          status: 'accepted',
        },
      });
      return count >= requirement.value;
    }

    case 'solve_difficulty': {
      const solved = await prisma.submission.findMany({
        where: {
          userId,
          status: 'accepted',
        },
        select: { problemId: true },
        distinct: ['problemId'],
      });

      const problemIds = solved.map((s) => s.problemId);
      const count = await prisma.problem.count({
        where: {
          id: { in: problemIds },
          difficulty: { gte: requirement.value },
        },
      });
      return count > 0;
    }

    case 'solve_tag': {
      const solved = await prisma.submission.findMany({
        where: {
          userId,
          status: 'accepted',
        },
        select: { problemId: true },
        distinct: ['problemId'],
      });

      const problemIds = solved.map((s) => s.problemId);
      const count = await prisma.problem.count({
        where: {
          id: { in: problemIds },
          tags: {
            some: {
              tag: { name: requirement.tag },
            },
          },
        },
      });
      return count >= requirement.value;
    }

    case 'contest_count': {
      const count = await prisma.contestParticipant.count({
        where: { userId },
      });
      return count >= requirement.value;
    }

    case 'contest_rank': {
      const topRank = await prisma.contestParticipant.findFirst({
        where: {
          userId,
          rank: { lte: requirement.value },
        },
      });
      return !!topRank;
    }

    case 'login_streak': {
      const streak = await prisma.loginStreak.findFirst({
        where: { userId },
        orderBy: { streakDays: 'desc' },
      });
      return streak ? streak.streakDays >= requirement.value : false;
    }

    case 'daily_challenge_count': {
      const count = await prisma.dailyChallengeCompletion.count({
        where: { userId },
      });
      return count >= requirement.value;
    }

    case 'reach_level': {
      return user.level >= requirement.value;
    }

    case 'post_count': {
      const count = await prisma.post.count({
        where: { userId },
      });
      return count >= requirement.value;
    }

    case 'total_upvotes': {
      const posts = await prisma.post.aggregate({
        where: { userId },
        _sum: { upvotes: true },
      });
      return (posts._sum.upvotes || 0) >= requirement.value;
    }

    case 'friend_count': {
      const count = await prisma.friendship.count({
        where: {
          OR: [
            { userId, status: 'accepted' },
            { friendId: userId, status: 'accepted' },
          ],
        },
      });
      return count >= requirement.value;
    }

    case 'perfect_solve': {
      const count = await prisma.submission.count({
        where: {
          userId,
          status: 'accepted',
          score: 100,
        },
      });
      return count >= requirement.value;
    }

    default:
      return false;
  }
}

// 获取用户成就列表
export async function getUserAchievements(userId: string) {
  const userAchievements = await prisma.userAchievement.findMany({
    where: { userId },
    include: {
      achievement: true,
    },
    orderBy: { unlockedAt: 'desc' },
  });

  return userAchievements.map((ua) => ({
    ...ua.achievement,
    unlockedAt: ua.unlockedAt,
    progress: ua.progress,
  }));
}

// 获取成就分类统计
export async function getAchievementStats(userId: string) {
  const total = await prisma.achievement.count({ where: { isActive: true } });
  const unlocked = await prisma.userAchievement.count({ where: { userId } });

  const byCategory = await prisma.achievement.groupBy({
    by: ['category'],
    where: { isActive: true },
    _count: true,
  });

  const userByCategory = await prisma.userAchievement.groupBy({
    by: ['achievement'],
    where: { userId },
    _count: true,
  });

  return {
    total,
    unlocked,
    percentage: total > 0 ? Math.floor((unlocked / total) * 100) : 0,
    byCategory,
  };
}
