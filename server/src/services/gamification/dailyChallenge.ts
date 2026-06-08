import { prisma } from '../../utils/prisma';
import { redis } from '../../utils/redis';
import { addPoints, POINT_RULES } from './points';
import { checkAchievements } from './achievements';

// 获取今日挑战
export async function getTodayChallenge() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let challenge = await prisma.dailyChallenge.findUnique({
    where: { challengeDate: today },
    include: {
      problem: {
        include: {
          tags: {
            include: { tag: true },
          },
        },
      },
    },
  });

  // 如果今天没有挑战，创建一个
  if (!challenge) {
    challenge = await createDailyChallenge(today);
  }

  return challenge;
}

// 创建每日挑战
async function createDailyChallenge(date: Date) {
  // 随机选择一道中等难度的题目
  const problems = await prisma.problem.findMany({
    where: {
      difficulty: { gte: 2, lte: 4 },
      isPublic: true,
    },
    include: {
      tags: {
        include: { tag: true },
      },
    },
  });

  if (problems.length === 0) {
    throw new Error('No problems available for daily challenge');
  }

  // 根据日期选择题目（确保每天不同但可重现）
  const dayOfYear = Math.floor(
    (date.getTime() - new Date(date.getFullYear(), 0, 0).getTime()) / 86400000
  );
  const problemIndex = dayOfYear % problems.length;
  const selectedProblem = problems[problemIndex];

  // 计算奖励积分（难度越高奖励越多）
  const bonusPoints = 30 + selectedProblem.difficulty * 10;

  return prisma.dailyChallenge.create({
    data: {
      problemId: selectedProblem.id,
      challengeDate: date,
      bonusPoints,
    },
    include: {
      problem: {
        include: {
          tags: {
            include: { tag: true },
          },
        },
      },
    },
  });
}

// 完成每日挑战
export async function completeDailyChallenge(
  userId: string,
  submissionId: string
) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const challenge = await prisma.dailyChallenge.findUnique({
    where: { challengeDate: today },
  });

  if (!challenge) {
    throw new Error('No daily challenge for today');
  }

  // 检查是否已经完成
  const existing = await prisma.dailyChallengeCompletion.findUnique({
    where: {
      userId_challengeId: {
        userId,
        challengeId: challenge.id,
      },
    },
  });

  if (existing) {
    throw new Error('Already completed today\'s challenge');
  }

  // 获取提交信息
  const submission = await prisma.submission.findUnique({
    where: { id: submissionId },
  });

  if (!submission || submission.status !== 'accepted') {
    throw new Error('Invalid submission');
  }

  // 计算用时（秒）
  const timeTaken = Math.floor(
    (new Date().getTime() - submission.submittedAt.getTime()) / 1000
  );

  // 记录完成
  const completion = await prisma.dailyChallengeCompletion.create({
    data: {
      userId,
      challengeId: challenge.id,
      timeTaken,
    },
  });

  // 计算连续天数奖励
  const streakDays = await getDailyChallengeStreak(userId);
  const streakBonus = streakDays * POINT_RULES.DAILY_CHALLENGE_STREAK_BONUS;

  // 添加积分
  const totalPoints = challenge.bonusPoints + streakBonus;
  await addPoints(
    userId,
    totalPoints,
    'daily_challenge',
    `完成每日挑战，连续${streakDays}天`
  );

  // 检查成就
  await checkAchievements(userId);

  return {
    completion,
    pointsEarned: totalPoints,
    streakDays,
    streakBonus,
  };
}

// 获取每日挑战连续天数
export async function getDailyChallengeStreak(userId: string): Promise<number> {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let streak = 0;
  let checkDate = new Date(today);

  while (true) {
    const challenge = await prisma.dailyChallenge.findUnique({
      where: { challengeDate: checkDate },
    });

    if (!challenge) break;

    const completion = await prisma.dailyChallengeCompletion.findUnique({
      where: {
        userId_challengeId: {
          userId,
          challengeId: challenge.id,
        },
      },
    });

    if (!completion) break;

    streak++;
    checkDate.setDate(checkDate.getDate() - 1);
  }

  return streak;
}

// 获取每日挑战历史
export async function getDailyChallengeHistory(
  userId: string,
  page: number = 1,
  limit: number = 7
) {
  const skip = (page - 1) * limit;

  const completions = await prisma.dailyChallengeCompletion.findMany({
    where: { userId },
    include: {
      challenge: {
        include: {
          problem: {
            select: {
              id: true,
              title: true,
              difficulty: true,
            },
          },
        },
      },
    },
    orderBy: { completedAt: 'desc' },
    skip,
    take: limit,
  });

  const total = await prisma.dailyChallengeCompletion.count({
    where: { userId },
  });

  return {
    history: completions,
    total,
    streak: await getDailyChallengeStreak(userId),
  };
}

// 获取每日任务列表
export async function getDailyTasks(userId: string) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // 获取用户今日的提交
  const todaySubmissions = await prisma.submission.findMany({
    where: {
      userId,
      submittedAt: {
        gte: today,
      },
    },
  });

  const acceptedToday = todaySubmissions.filter(
    (s) => s.status === 'accepted'
  ).length;

  // 获取每日挑战状态
  const challenge = await prisma.dailyChallenge.findUnique({
    where: { challengeDate: today },
  });

  let dailyChallengeCompleted = false;
  if (challenge) {
    const completion = await prisma.dailyChallengeCompletion.findUnique({
      where: {
        userId_challengeId: {
          userId,
          challengeId: challenge.id,
        },
      },
    });
    dailyChallengeCompleted = !!completion;
  }

  // 获取登录连续天数
  const loginStreak = await prisma.loginStreak.findFirst({
    where: { userId },
    orderBy: { loginDate: 'desc' },
  });

  const tasks = [
    {
      id: 'daily_solve',
      title: '今日解题',
      description: '完成3道题目',
      current: acceptedToday,
      target: 3,
      reward: 30,
      completed: acceptedToday >= 3,
    },
    {
      id: 'daily_challenge',
      title: '每日挑战',
      description: '完成今日挑战题目',
      current: dailyChallengeCompleted ? 1 : 0,
      target: 1,
      reward: 50,
      completed: dailyChallengeCompleted,
    },
    {
      id: 'daily_hard',
      title: '挑战困难题',
      description: '完成一道难度4以上的题目',
      current: todaySubmissions.filter(
        (s) => s.status === 'accepted' && s.score >= 80
      ).length > 0 ? 1 : 0,
      target: 1,
      reward: 40,
      completed: todaySubmissions.some(
        (s) => s.status === 'accepted' && s.score >= 80
      ),
    },
    {
      id: 'daily_login',
      title: '每日登录',
      description: '今日登录网站',
      current: 1,
      target: 1,
      reward: 5,
      completed: true,
    },
    {
      id: 'daily_streak',
      title: '连续登录',
      description: '保持连续登录',
      current: loginStreak?.streakDays || 0,
      target: 7,
      reward: loginStreak && loginStreak.streakDays >= 7 ? 50 : 0,
      completed: loginStreak ? loginStreak.streakDays >= 7 : false,
    },
  ];

  return {
    tasks,
    totalCompleted: tasks.filter((t) => t.completed).length,
    totalRewards: tasks
      .filter((t) => t.completed)
      .reduce((sum, t) => sum + t.reward, 0),
  };
}
