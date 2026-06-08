import { Request, Response, NextFunction } from 'express';
import { redis } from '../utils/redis';
import { RateLimitError } from '../utils/errors';

interface RateLimiterOptions {
  windowMs: number;  // 时间窗口（毫秒）
  max: number;       // 最大请求数
  keyGenerator?: (req: Request) => string;
  message?: string;
}

// 默认key生成器
function defaultKeyGenerator(req: Request): string {
  return `rate_limit:${req.ip}:${req.path}`;
}

// 速率限制中间件
export function rateLimiter(options: RateLimiterOptions) {
  const {
    windowMs,
    max,
    keyGenerator = defaultKeyGenerator,
    message = '请求过于频繁，请稍后再试',
  } = options;

  return async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    const key = keyGenerator(req);
    const now = Date.now();
    const windowStart = now - windowMs;

    try {
      // 使用Redis Sorted Set实现滑动窗口
      const multi = redis.multi();

      // 清除窗口外的记录
      multi.zRemRangeByScore(key, 0, windowStart);
      // 添加当前请求
      multi.zAdd(key, { score: now, value: `${now}-${Math.random()}` });
      // 获取窗口内的请求数
      multi.zCard(key);
      // 设置key过期时间
      multi.expire(key, Math.ceil(windowMs / 1000));

      const results = await multi.exec();
      const count = results[2] as number;

      // 设置响应头
      _res.setHeader('X-RateLimit-Limit', max);
      _res.setHeader('X-RateLimit-Remaining', Math.max(0, max - count));
      _res.setHeader('X-RateLimit-Reset', new Date(now + windowMs).toISOString());

      if (count > max) {
        throw new RateLimitError(message);
      }

      next();
    } catch (error) {
      if (error instanceof RateLimitError) {
        throw error;
      }
      // Redis错误时放行
      next();
    }
  };
}

// 预定义的速率限制器
export const authLimiter = rateLimiter({
  windowMs: 15 * 60 * 1000, // 15分钟
  max: 10, // 最多10次尝试
  keyGenerator: (req) => `rate_limit:auth:${req.ip}`,
  message: '登录尝试过于频繁，请15分钟后再试',
});

export const apiLimiter = rateLimiter({
  windowMs: 60 * 1000, // 1分钟
  max: 60, // 每分钟60次
  keyGenerator: (req) => `rate_limit:api:${req.ip}`,
});

export const submissionLimiter = rateLimiter({
  windowMs: 60 * 1000, // 1分钟
  max: 5, // 每分钟5次提交
  keyGenerator: (req) => `rate_limit:submit:${(req as any).user?.id || req.ip}`,
  message: '提交过于频繁，请稍后再试',
});
