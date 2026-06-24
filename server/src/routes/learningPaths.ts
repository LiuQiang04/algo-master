import { Router, Response } from 'express';
import { authenticate, AuthRequest } from '../middleware/auth';
import {
  getAllPaths,
  getPathDetail,
  getUserPathProgress,
  startPath,
} from '../services/learningPathService';

const router = Router();

// 获取所有学习路径列表
router.get('/', async (req, res: Response) => {
  try {
    // 可选：从 token 中获取 userId 以显示用户进度
    let userId: string | undefined;
    const authHeader = req.headers.authorization;
    if (authHeader?.startsWith('Bearer ')) {
      try {
        // 尝试解析 token 获取 userId（不强制认证）
        const { verifyToken } = require('../utils/jwt');
        const token = authHeader.substring(7);
        const decoded = verifyToken(token);
        userId = decoded.id;
      } catch {
        // token 无效或不存在，忽略
      }
    }

    const paths = await getAllPaths(userId);
    res.json(paths);
  } catch (error) {
    console.error('Failed to fetch learning paths:', error);
    res.status(500).json({ error: 'Failed to fetch learning paths' });
  }
});

// 获取学习路径详情
router.get('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    const path = await getPathDetail(id, userId);
    if (!path) {
      return res.status(404).json({ error: 'Learning path not found' });
    }

    res.json(path);
  } catch (error) {
    console.error('Failed to fetch learning path detail:', error);
    res.status(500).json({ error: 'Failed to fetch learning path detail' });
  }
});

// 获取用户在指定路径的进度
router.get('/:id/progress', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;

    const progress = await getUserPathProgress(userId, id);
    res.json(progress);
  } catch (error) {
    console.error('Failed to fetch user progress:', error);
    res.status(500).json({ error: 'Failed to fetch user progress' });
  }
});

// 开始学习路径
router.post('/:id/start', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;

    const progress = await startPath(userId, id);
    res.json(progress);
  } catch (error: any) {
    if (error.message === 'Learning path not found') {
      return res.status(404).json({ error: error.message });
    }
    console.error('Failed to start learning path:', error);
    res.status(500).json({ error: 'Failed to start learning path' });
  }
});

export default router;
