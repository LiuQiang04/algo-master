import { Router, Response } from 'express';
import { authenticate, AuthRequest } from '../middleware/auth';
import { getLeaderboard, getUserRank, LeaderboardType } from '../services/gamification/leaderboard';

const router = Router();

// 获取排行榜
router.get('/:type', async (req: AuthRequest, res: Response) => {
  try {
    const { type } = req.params;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 50;

    if (!['global', 'friends', 'region'].includes(type)) {
      return res.status(400).json({ error: 'Invalid leaderboard type' });
    }

    const leaderboard = await getLeaderboard(
      type as LeaderboardType,
      req.user?.id,
      page,
      limit
    );

    res.json(leaderboard);
  } catch (error: any) {
    if (error.message === 'User ID required for friends leaderboard') {
      return res.status(401).json({ error: error.message });
    }
    res.status(500).json({ error: 'Failed to fetch leaderboard' });
  }
});

// 获取用户排名
router.get('/rank/me', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const [globalRank, friendsRank] = await Promise.all([
      getUserRank(req.user!.id, 'global'),
      getUserRank(req.user!.id, 'friends'),
    ]);

    res.json({
      global: globalRank,
      friends: friendsRank,
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch user rank' });
  }
});

export default router;
