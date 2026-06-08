import { Request, Response, NextFunction } from 'express';
import { AppError, ValidationError, ErrorResponse } from '../utils/errors';
import { logger } from '../utils/logger';
import { config } from '../config';

// 全局错误处理中间件
export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction
): void {
  // 记录错误
  logger.error('Error:', {
    message: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
    ip: req.ip,
  });

  // 应用自定义错误
  if (err instanceof AppError) {
    const response: ErrorResponse = {
      success: false,
      error: {
        code: err.code,
        message: err.message,
        ...(err instanceof ValidationError && { details: err.errors }),
        ...(config.isDev && { stack: err.stack }),
      },
    };
    res.status(err.statusCode).json(response);
    return;
  }

  // Prisma错误处理
  if (err.name === 'PrismaClientKnownRequestError') {
    const prismaError = err as any;
    switch (prismaError.code) {
      case 'P2002':
        res.status(409).json({
          success: false,
          error: {
            code: 'DUPLICATE_ENTRY',
            message: '记录已存在',
            details: { field: prismaError.meta?.target || [] },
          },
        });
        return;
      case 'P2025':
        res.status(404).json({
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: '记录不存在',
          },
        });
        return;
      default:
        res.status(400).json({
          success: false,
          error: {
            code: 'DATABASE_ERROR',
            message: config.isDev ? prismaError.message : '数据库操作失败',
          },
        });
        return;
    }
  }

  // JWT错误处理
  if (err.name === 'JsonWebTokenError') {
    res.status(401).json({
      success: false,
      error: {
        code: 'INVALID_TOKEN',
        message: '无效的认证令牌',
      },
    });
    return;
  }

  if (err.name === 'TokenExpiredError') {
    res.status(401).json({
      success: false,
      error: {
        code: 'TOKEN_EXPIRED',
        message: '认证令牌已过期',
      },
    });
    return;
  }

  // 默认500错误
  res.status(500).json({
    success: false,
    error: {
      code: 'INTERNAL_ERROR',
      message: config.isDev ? err.message : '服务器内部错误',
      ...(config.isDev && { stack: err.stack }),
    },
  });
}

// 404处理中间件
export function notFoundHandler(req: Request, res: Response): void {
  res.status(404).json({
    success: false,
    error: {
      code: 'NOT_FOUND',
      message: `路由 ${req.method} ${req.path} 不存在`,
    },
  });
}
