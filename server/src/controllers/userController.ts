import { Request, Response } from 'express';
import * as userService from '../services/userService';
import { AuthRequest } from '../middleware/auth';

// 获取用户信息
export async function getUserById(req: Request, res: Response) {
  const { id } = req.params;
  const user = await userService.getUserById(id);
  res.json({
    success: true,
    data: user,
  });
}

// 获取用户统计信息
export async function getUserStats(req: Request, res: Response) {
  const { id } = req.params;
  const stats = await userService.getUserStats(id);
  res.json({
    success: true,
    data: stats,
  });
}

// 更新当前用户信息
export async function updateUser(req: AuthRequest, res: Response) {
  const userId = req.user!.id;
  const { username, avatarUrl, bio, region } = req.body;
  const user = await userService.updateUser(userId, {
    username,
    avatarUrl,
    bio,
    region,
  });
  res.json({
    success: true,
    data: user,
  });
}

// 搜索用户
export async function searchUsers(req: Request, res: Response) {
  const { q, page, limit } = req.query;
  const result = await userService.searchUsers(
    q as string,
    parseInt(page as string) || 1,
    parseInt(limit as string) || 20
  );
  res.json({
    success: true,
    data: result,
  });
}

// 获取用户列表（管理员）
export async function getUsers(req: Request, res: Response) {
  const { page, limit } = req.query;
  const result = await userService.getUsers(
    parseInt(page as string) || 1,
    parseInt(limit as string) || 20
  );
  res.json({
    success: true,
    data: result,
  });
}
