import { Router, Response } from 'express';
import { authenticate, AuthRequest } from '../middleware/auth';
import { getPointHistory, calculateLevel, getExpForLevel } from '../services/gamification/points';
import { getLoginStreakInfo, getLoginCalendar, recordLogin } from '../services/gamification/loginStreak';
import { prisma } from '../utils/prisma';

const router = Router();

// 获取积分历史
router.get('/points/history', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;

    const result = await getPointHistory(userId, page, limit);

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch point history' });
  }
});

// 获取用户等级信息
router.get('/level', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        level: true,
        experiencePoints: true,
      },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const levelInfo = calculateLevel(user.experiencePoints);
    const nextLevelExp = getExpForLevel(levelInfo.level);

    res.json({
      success: true,
      data: {
        level: levelInfo.level,
        currentExp: levelInfo.currentExp,
        nextLevelExp: levelInfo.nextLevelExp,
        progress: levelInfo.progress,
        totalExp: user.experiencePoints,
      },
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch level info' });
  }
});

// 获取登录连续天数信息
router.get('/login-streak', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const streakInfo = await getLoginStreakInfo(req.user!.id);

    res.json({
      success: true,
      data: streakInfo,
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch login streak info' });
  }
});

// 获取登录日历
router.get('/login-calendar', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const month = parseInt(req.query.month as string) || new Date().getMonth() + 1;
    const year = parseInt(req.query.year as string) || new Date().getFullYear();

    const calendar = await getLoginCalendar(req.user!.id, month, year);

    res.json({
      success: true,
      data: calendar,
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch login calendar' });
  }
});

// 记录登录（调用此接口更新连续天数）
router.post('/record-login', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const record = await recordLogin(req.user!.id);

    res.json({
      success: true,
      data: record,
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to record login' });
  }
});

// 获取游戏化概览
router.get('/overview', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;

    const [
      user,
      achievementCount,
      completedDailyChallenges,
      loginStreakInfo,
    ] = await Promise.all([
      prisma.user.findUnique({
        where: { id: userId },
        select: {
          level: true,
          experiencePoints: true,
          title: true,
        },
      }),
      prisma.userAchievement.count({
        where: { userId },
      }),
      prisma.dailyChallengeCompletion.count({
        where: { userId },
      }),
      getLoginStreakInfo(userId),
    ]);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const levelInfo = calculateLevel(user.experiencePoints);

    // 获取用户排名
    const globalRank = await prisma.user.count({
      where: {
        experiencePoints: { gt: user.experiencePoints },
      },
    });

    res.json({
      success: true,
      data: {
        level: levelInfo.level,
        currentExp: levelInfo.currentExp,
        nextLevelExp: levelInfo.nextLevelExp,
        progress: levelInfo.progress,
        totalExp: user.experiencePoints,
        title: user.title,
        achievementCount,
        completedDailyChallenges,
        loginStreak: loginStreakInfo.currentStreak,
        maxLoginStreak: loginStreakInfo.maxStreak,
        globalRank: globalRank + 1,
      },
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch gamification overview' });
  }
});

export default router;
