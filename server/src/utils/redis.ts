import { createClient, RedisClientType } from 'redis';
import { config } from '../config';
import { logger } from './logger';

// 创建Redis客户端
export const redis: RedisClientType = createClient({
  url: config.redis.url,
  socket: {
    reconnectStrategy: (retries) => {
      if (retries > 10) {
        logger.error('Redis: Max reconnection attempts reached');
        return new Error('Max reconnection attempts reached');
      }
      return Math.min(retries * 100, 3000);
    },
  },
});

// 连接事件
redis.on('connect', () => {
  logger.info('Redis connected');
});

redis.on('error', (err) => {
  logger.error('Redis error:', err);
});

redis.on('reconnecting', () => {
  logger.warn('Redis reconnecting...');
});

// 连接Redis
export async function connectRedis(): Promise<void> {
  try {
    await redis.connect();
    logger.info('Redis connected successfully');
  } catch (error) {
    logger.error('Failed to connect to Redis:', error);
    throw error;
  }
}

// 断开Redis连接
export async function disconnectRedis(): Promise<void> {
  try {
    await redis.disconnect();
    logger.info('Redis disconnected');
  } catch (error) {
    logger.error('Failed to disconnect from Redis:', error);
    throw error;
  }
}

// 健康检查
export async function checkRedisHealth(): Promise<boolean> {
  try {
    await redis.ping();
    return true;
  } catch {
    return false;
  }
}

// 缓存工具函数
export const cache = {
  // 获取缓存
  async get<T>(key: string): Promise<T | null> {
    const value = await redis.get(key);
    return value ? JSON.parse(value) : null;
  },

  // 设置缓存
  async set(key: string, value: any, ttl?: number): Promise<void> {
    const serialized = JSON.stringify(value);
    if (ttl) {
      await redis.setEx(key, ttl, serialized);
    } else {
      await redis.set(key, serialized);
    }
  },

  // 删除缓存
  async del(key: string): Promise<void> {
    await redis.del(key);
  },

  // 批量删除
  async delPattern(pattern: string): Promise<void> {
    const keys = await redis.keys(pattern);
    if (keys.length > 0) {
      await redis.del(keys);
    }
  },
};
