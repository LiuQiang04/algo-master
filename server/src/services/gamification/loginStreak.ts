import { prisma } from '../../utils/prisma';
import { addPoints, POINT_RULES } from './points';
import { checkAchievements } from './achievements';

// 记录登录并更新连续天数
export async function recordLogin(userId: string) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  // 检查今天是否已记录
  const todayRecord = await prisma.loginStreak.findUnique({
    where: {
      userId_loginDate: {
        userId,
        loginDate: today,
      },
    },
  });

  if (todayRecord) {
    return todayRecord; // 今天已记录
  }

  // 检查昨天的记录
  const yesterdayRecord = await prisma.loginStreak.findUnique({
    where: {
      userId_loginDate: {
        userId,
        loginDate: yesterday,
      },
    },
  });

  // 计算连续天数
  const streakDays = yesterdayRecord ? yesterdayRecord.streakDays + 1 : 1;

  // 创建今天的记录
  const loginRecord = await prisma.loginStreak.create({
    data: {
      userId,
      loginDate: today,
      streakDays,
    },
  });

  // 添加每日登录积分
  await addPoints(
    userId,
    POINT_RULES.DAILY_LOGIN,
    'login',
    `每日登录 (连续${streakDays}天)`
  );

  // 检查连续登录奖励
  if (streakDays === 7) {
    await addPoints(
      userId,
      POINT_RULES.LOGIN_STREAK_7,
      'login_streak',
      '连续登录7天奖励'
    );
  } else if (streakDays === 30) {
    await addPoints(
      userId,
      POINT_RULES.LOGIN_STREAK_30,
      'login_streak',
      '连续登录30天奖励'
    );
  }

  // 检查成就
  await checkAchievements(userId);

  return loginRecord;
}

// 获取用户登录连续天数信息
export async function getLoginStreakInfo(userId: string) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // 获取最近的记录
  const latestRecord = await prisma.loginStreak.findFirst({
    where: { userId },
    orderBy: { loginDate: 'desc' },
  });

  // 检查是否今天登录过
  const todayRecord = await prisma.loginStreak.findUnique({
    where: {
      userId_loginDate: {
        userId,
        loginDate: today,
      },
    },
  });

  // 获取最长连续天数
  const maxStreak = await prisma.loginStreak.aggregate({
    where: { userId },
    _max: { streakDays: true },
  });

  // 获取最近30天的登录记录
  const thirtyDaysAgo = new Date(today);
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const recentLogins = await prisma.loginStreak.findMany({
    where: {
      userId,
      loginDate: {
        gte: thirtyDaysAgo,
      },
    },
    orderBy: { loginDate: 'asc' },
  });

  return {
    currentStreak: latestRecord?.streakDays || 0,
    maxStreak: maxStreak._max.streakDays || 0,
    isLoggedInToday: !!todayRecord,
    recentLogins: recentLogins.map((r) => ({
      date: r.loginDate,
      streakDays: r.streakDays,
    })),
  };
}

// 获取连续登录日历数据
export async function getLoginCalendar(userId: string, month: number, year: number) {
  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 0);

  const logins = await prisma.loginStreak.findMany({
    where: {
      userId,
      loginDate: {
        gte: startDate,
        lte: endDate,
      },
    },
    orderBy: { loginDate: 'asc' },
  });

  // 生成日历数据
  const calendar: {
    date: Date;
    isLoggedIn: boolean;
    streakDays: number;
  }[] = [];

  const currentDate = new Date(startDate);
  while (currentDate <= endDate) {
    const loginRecord = logins.find(
      (l) =>
        l.loginDate.getFullYear() === currentDate.getFullYear() &&
        l.loginDate.getMonth() === currentDate.getMonth() &&
        l.loginDate.getDate() === currentDate.getDate()
    );

    calendar.push({
      date: new Date(currentDate),
      isLoggedIn: !!loginRecord,
      streakDays: loginRecord?.streakDays || 0,
    });

    currentDate.setDate(currentDate.getDate() + 1);
  }

  return calendar;
}
