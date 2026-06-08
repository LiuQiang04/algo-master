import { prisma } from '../../utils/prisma';
import { redis } from '../../utils/redis';

// 积分规则配置
export const POINT_RULES = {
  // 解题相关
  SOLVE_PROBLEM: {
    base: 10,
    difficultyMultiplier: [0, 1, 1.5, 2, 3, 5], // 难度1-5的倍数
  },
  FIRST_SOLVE: 50,        // 首次解出某题
  DAILY_FIRST_SOLVE: 20,  // 每天第一次解题

  // 竞赛相关
  CONTEST_PARTICIPATE: 30,
  CONTEST_TOP_3: [100, 70, 50], // 前3名额外积分
  CONTEST_TOP_10: 20,

  // 社区相关
  POST_CREATE: 5,
  COMMENT_CREATE: 2,
  RECEIVE_UPVOTE: 3,
  SOLUTION_ACCEPTED: 20,

  // 每日挑战
  DAILY_CHALLENGE_COMPLETE: 50,
  DAILY_CHALLENGE_STREAK_BONUS: 10, // 连续天数额外积分

  // 成就相关
  ACHIEVEMENT_UNLOCK: {
    common: 10,
    rare: 30,
    epic: 50,
    legendary: 100,
  },

  // 登录相关
  DAILY_LOGIN: 5,
  LOGIN_STREAK_7: 50,
  LOGIN_STREAK_30: 200,
};

// 等级经验值配置
export const LEVEL_CONFIG = {
  baseExp: 100,        // 1级所需经验
  growthRate: 1.5,     // 增长率
  maxLevel: 100,
};

// 计算升级所需经验值
export function getExpForLevel(level: number): number {
  return Math.floor(LEVEL_CONFIG.baseExp * Math.pow(LEVEL_CONFIG.growthRate, level - 1));
}

// 计算当前等级和进度
export function calculateLevel(experiencePoints: number): {
  level: number;
  currentExp: number;
  nextLevelExp: number;
  progress: number;
} {
  let level = 1;
  let totalExp = 0;

  while (level < LEVEL_CONFIG.maxLevel) {
    const expForLevel = getExpForLevel(level);
    if (totalExp + expForLevel > experiencePoints) {
      break;
    }
    totalExp += expForLevel;
    level++;
  }

  const currentExp = experiencePoints - totalExp;
  const nextLevelExp = getExpForLevel(level);
  const progress = Math.floor((currentExp / nextLevelExp) * 100);

  return { level, currentExp, nextLevelExp, progress };
}

// 添加积分
export async function addPoints(
  userId: string,
  points: number,
  type: string,
  description?: string,
  relatedId?: string
): Promise<{ newTotal: number; levelUp: boolean; newLevel?: number }> {
  // 获取用户当前信息
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { experiencePoints: true, level: true },
  });

  if (!user) {
    throw new Error('User not found');
  }

  const oldLevel = calculateLevel(user.experiencePoints);
  const newExpTotal = user.experiencePoints + points;
  const newLevelInfo = calculateLevel(newExpTotal);

  // 更新用户积分和等级
  await prisma.user.update({
    where: { id: userId },
    data: {
      experiencePoints: newExpTotal,
      level: newLevelInfo.level,
    },
  });

  // 记录积分历史
  await prisma.pointHistory.create({
    data: {
      userId,
      points,
      type,
      description,
      relatedId,
    },
  });

  // 更新排行榜缓存
  await redis.zAdd('leaderboard:global', {
    score: newExpTotal,
    value: userId,
  });

  const levelUp = newLevelInfo.level > oldLevel.level;

  // 如果升级了，触发升级奖励
  if (levelUp) {
    await handleLevelUp(userId, newLevelInfo.level);
  }

  return {
    newTotal: newExpTotal,
    levelUp,
    newLevel: levelUp ? newLevelInfo.level : undefined,
  };
}

// 升级处理
async function handleLevelUp(userId: string, newLevel: number) {
  // 发送升级通知
  await prisma.notification.create({
    data: {
      userId,
      type: 'level_up',
      title: '恭喜升级!',
      content: `你已升级到 ${newLevel} 级!`,
      relatedId: null,
    },
  });

  // 检查是否有等级相关成就
  const levelAchievements = await prisma.achievement.findMany({
    where: {
      category: 'level',
      isActive: true,
    },
  });

  for (const achievement of levelAchievements) {
    const req = achievement.requirement as any;
    if (req.type === 'reach_level' && newLevel >= req.value) {
      await unlockAchievement(userId, achievement.id);
    }
  }
}

// 解锁成就
export async function unlockAchievement(userId: string, achievementId: string) {
  const existing = await prisma.userAchievement.findUnique({
    where: {
      userId_achievementId: { userId, achievementId },
    },
  });

  if (existing) return; // 已经解锁

  const achievement = await prisma.achievement.findUnique({
    where: { id: achievementId },
  });

  if (!achievement) return;

  await prisma.userAchievement.create({
    data: {
      userId,
      achievementId,
      progress: 100,
    },
  });

  // 添加成就积分
  const points = POINT_RULES.ACHIEVEMENT_UNLOCK[
    achievement.rarity as keyof typeof POINT_RULES.ACHIEVEMENT_UNLOCK
  ] || 10;

  await addPoints(
    userId,
    points,
    'achievement',
    `解锁成就: ${achievement.name}`
  );

  // 发送通知
  await prisma.notification.create({
    data: {
      userId,
      type: 'achievement',
      title: '成就解锁!',
      content: `你解锁了成就「${achievement.name}」!`,
      relatedId: achievementId,
    },
  });
}

// 获取用户积分历史
export async function getPointHistory(
  userId: string,
  page: number = 1,
  limit: number = 20
) {
  const skip = (page - 1) * limit;

  const [history, total] = await Promise.all([
    prisma.pointHistory.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    }),
    prisma.pointHistory.count({ where: { userId } }),
  ]);

  return {
    history,
    total,
    page,
    totalPages: Math.ceil(total / limit),
  };
}
