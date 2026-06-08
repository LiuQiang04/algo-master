import { Router, Response } from 'express';
import { authenticate, AuthRequest } from '../middleware/auth';
import {
  getTodayChallenge,
  completeDailyChallenge,
  getDailyChallengeStreak,
  getDailyChallengeHistory,
  getDailyTasks,
} from '../services/gamification/dailyChallenge';

const router = Router();

// 获取今日挑战
router.get('/today', async (req, res) => {
  try {
    const challenge = await getTodayChallenge();
    res.json(challenge);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch daily challenge' });
  }
});

// 完成每日挑战
router.post('/complete', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { submissionId } = req.body;
    const result = await completeDailyChallenge(req.user!.id, submissionId);
    res.json(result);
  } catch (error: any) {
    if (error.message.includes('Already completed')) {
      return res.status(400).json({ error: error.message });
    }
    res.status(500).json({ error: 'Failed to complete daily challenge' });
  }
});

// 获取连续天数
router.get('/streak', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const streak = await getDailyChallengeStreak(req.user!.id);
    res.json({ streak });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch streak' });
  }
});

// 获取历史记录
router.get('/history', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 7;
    const history = await getDailyChallengeHistory(req.user!.id, page, limit);
    res.json(history);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch history' });
  }
});

// 获取每日任务
router.get('/tasks', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const tasks = await getDailyTasks(req.user!.id);
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch daily tasks' });
  }
});

export default router;
