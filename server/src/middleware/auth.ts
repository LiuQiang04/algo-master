import { Request, Response, NextFunction } from 'express';
import { verifyToken, JwtPayload } from '../utils/jwt';
import { prisma } from '../utils/prisma';
import { UnauthorizedError, ForbiddenError } from '../utils/errors';

// 扩展Request接口
export interface AuthRequest extends Request {
  user?: {
    id: string;
    username: string;
    email: string;
    role: string;
  };
}

// 认证中间件
export async function authenticate(
  req: AuthRequest,
  _res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedError('未提供认证令牌');
    }

    const token = authHeader.split(' ')[1];
    const decoded = verifyToken(token);

    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: { id: true, username: true, email: true, role: true },
    });

    if (!user) {
      throw new UnauthorizedError('用户不存在');
    }

    req.user = user;
    next();
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      throw error;
    }
    throw new UnauthorizedError('无效的认证令牌');
  }
}

// 可选认证中间件（不强制要求登录）
export async function optionalAuth(
  req: AuthRequest,
  _res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      const decoded = verifyToken(token);

      const user = await prisma.user.findUnique({
        where: { id: decoded.id },
        select: { id: true, username: true, email: true, role: true },
      });

      if (user) {
        req.user = user;
      }
    }
    next();
  } catch {
    // 忽略错误，继续处理
    next();
  }
}

// 角色授权中间件
export function authorize(...roles: string[]) {
  return (req: AuthRequest, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      throw new UnauthorizedError('请先登录');
    }

    if (!roles.includes(req.user.role)) {
      throw new ForbiddenError('没有权限执行此操作');
    }

    next();
  };
}

// 管理员授权
export const adminOnly = authorize('ADMIN');

// 管理员或版主
export const moderatorOrAdmin = authorize('ADMIN', 'MODERATOR');
