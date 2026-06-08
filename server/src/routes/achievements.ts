import { Router, Response } from 'express';
import { authenticate, AuthRequest } from '../middleware/auth';
import { getUserAchievements, getAchievementStats, ACHIEVEMENT_DEFINITIONS } from '../services/gamification/achievements';
import { prisma } from '../index';

const router = Router();

// 获取所有成就定义
router.get('/', async (req, res) => {
  try {
    const achievements = await prisma.achievement.findMany({
      where: { isActive: true },
      orderBy: [
        { category: 'asc' },
        { rarity: 'asc' },
      ],
    });
    res.json(achievements);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch achievements' });
  }
});

// 获取用户成就
router.get('/me', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const achievements = await getUserAchievements(req.user!.id);
    const stats = await getAchievementStats(req.user!.id);
    res.json({ achievements, stats });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch user achievements' });
  }
});

// 获取指定用户成就
router.get('/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const achievements = await getUserAchievements(userId);
    const stats = await getAchievementStats(userId);
    res.json({ achievements, stats });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch user achievements' });
  }
});

// 获取成就分类
router.get('/categories', async (req, res) => {
  try {
    const categories = await prisma.achievement.groupBy({
      by: ['category'],
      _count: true,
      where: { isActive: true },
    });
    res.json(categories);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

export default router;
