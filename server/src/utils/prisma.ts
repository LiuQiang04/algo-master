import { PrismaClient } from '@prisma/client';
import { config } from '../config';
import { logger } from './logger';

// 创建Prisma客户端实例
export const prisma = new PrismaClient({
  log: config.isDev
    ? [
        { emit: 'event', level: 'query' },
        { emit: 'event', level: 'error' },
        { emit: 'event', level: 'info' },
        { emit: 'event', level: 'warn' },
      ]
    : [
        { emit: 'event', level: 'error' },
      ],
});

// 开发环境记录慢查询
if (config.isDev) {
  prisma.$on('query', (e) => {
    if (e.duration > 100) { // 超过100ms的查询
      logger.warn(`Slow query (${e.duration}ms): ${e.query}`);
    }
  });
}

// 记录数据库错误
prisma.$on('error', (e) => {
  logger.error('Prisma error:', e);
});

// 连接数据库
export async function connectDatabase(): Promise<void> {
  try {
    await prisma.$connect();
    logger.info('Database connected successfully');
  } catch (error) {
    logger.error('Failed to connect to database:', error);
    throw error;
  }
}

// 断开数据库连接
export async function disconnectDatabase(): Promise<void> {
  try {
    await prisma.$disconnect();
    logger.info('Database disconnected');
  } catch (error) {
    logger.error('Failed to disconnect from database:', error);
    throw error;
  }
}

// 健康检查
export async function checkDatabaseHealth(): Promise<boolean> {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return true;
  } catch {
    return false;
  }
}
