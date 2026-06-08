import { Request, Response } from 'express';
import * as authService from '../services/authService';

// 注册
export async function register(req: Request, res: Response) {
  const { username, email, password } = req.body;
  const result = await authService.register({ username, email, password });
  res.status(201).json({
    success: true,
    data: result,
  });
}

// 登录
export async function login(req: Request, res: Response) {
  const { email, password } = req.body;
  const result = await authService.login({ email, password });
  res.json({
    success: true,
    data: result,
  });
}

// 刷新令牌
export async function refreshToken(req: Request, res: Response) {
  const { refreshToken } = req.body;
  const result = await authService.refreshToken(refreshToken);
  res.json({
    success: true,
    data: result,
  });
}

// 修改密码
export async function changePassword(req: Request, res: Response) {
  const userId = (req as any).user.id;
  const { oldPassword, newPassword } = req.body;
  const result = await authService.changePassword(userId, oldPassword, newPassword);
  res.json({
    success: true,
    data: result,
  });
}

// 忘记密码
export async function forgotPassword(req: Request, res: Response) {
  const { email } = req.body;
  const result = await authService.forgotPassword(email);
  res.json({
    success: true,
    data: result,
  });
}

// 获取当前用户信息
export async function getCurrentUser(req: Request, res: Response) {
  const userId = (req as any).user.id;
  const { prisma } = await import('../utils/prisma');

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      username: true,
      email: true,
      avatarUrl: true,
      bio: true,
      rating: true,
      experiencePoints: true,
      level: true,
      region: true,
      title: true,
      role: true,
      createdAt: true,
    },
  });

  res.json({
    success: true,
    data: user,
  });
}
