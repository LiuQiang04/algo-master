import express from 'express';
import cors from 'cors';
import { config } from './config';
import { logger } from './utils/logger';
import { prisma, connectDatabase } from './utils/prisma';
import { connectRedis, redis } from './utils/redis';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';
import { metricsMiddleware, metricsEndpoint } from './middleware/metrics';

// 路由导入
import authRoutes from './routes/auth';
import userRoutes from './routes/users';
import problemRoutes from './routes/problems';
import submissionRoutes from './routes/submissions';
import contestRoutes from './routes/contests';
import postRoutes from './routes/posts';
import achievementRoutes from './routes/achievements';
import leaderboardRoutes from './routes/leaderboard';
import dailyChallengeRoutes from './routes/dailyChallenge';
import virtualItemRoutes from './routes/virtualItems';
import gamificationRoutes from './routes/gamification';
import learningPathsRoutes from './routes/learningPaths';

// 创建Express应用
const app = express();

// ==================== 中间件 ====================

// CORS配置
app.use(cors({
  origin: config.isDev
    ? ['http://localhost:3000', 'http://localhost:5173']
    : process.env.ALLOWED_ORIGINS?.split(',') || [],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// 请求解析
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// 请求日志
app.use((req, _res, next) => {
  logger.info(`${req.method} ${req.path}`, {
    ip: req.ip,
    userAgent: req.get('user-agent'),
  });
  next();
});

// Prometheus metrics
app.use(metricsMiddleware);

// ==================== 路由 ====================

// Prometheus metrics endpoint
app.get('/metrics', metricsEndpoint);

// 健康检查
app.get('/health', async (_req, res) => {
  const dbHealthy = await prisma.$queryRaw`SELECT 1`.then(() => true).catch(() => false);
  const redisHealthy = await redis.ping().then(() => true).catch(() => false);

  res.json({
    status: dbHealthy && redisHealthy ? 'ok' : 'degraded',
    timestamp: new Date().toISOString(),
    services: {
      database: dbHealthy ? 'healthy' : 'unhealthy',
      redis: redisHealthy ? 'healthy' : 'unhealthy',
    },
  });
});

// API路由
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/problems', problemRoutes);
app.use('/api/submissions', submissionRoutes);
app.use('/api/contests', contestRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/achievements', achievementRoutes);
app.use('/api/leaderboard', leaderboardRoutes);
app.use('/api/daily-challenge', dailyChallengeRoutes);
app.use('/api/virtual-items', virtualItemRoutes);
app.use('/api/gamification', gamificationRoutes);
app.use('/api/paths', learningPathsRoutes);

// API文档（开发环境）
if (config.isDev) {
  app.get('/api', (_req, res) => {
    res.json({
      message: '算法竞赛学习网站 API',
      version: '1.0.0',
      endpoints: {
        auth: '/api/auth',
        users: '/api/users',
        problems: '/api/problems',
        submissions: '/api/submissions',
        contests: '/api/contests',
        posts: '/api/posts',
        achievements: '/api/achievements',
        leaderboard: '/api/leaderboard',
        dailyChallenge: '/api/daily-challenge',
        virtualItems: '/api/virtual-items',
        gamification: '/api/gamification',
        learningPaths: '/api/paths',
      },
    });
  });
}

// 404处理
app.use(notFoundHandler);

// 全局错误处理
app.use(errorHandler);

// ==================== 启动服务器 ====================

async function main() {
  try {
    // 连接数据库
    await connectDatabase();
    logger.info('Database connected');

    // 连接Redis
    await connectRedis();
    logger.info('Redis connected');

    // 启动服务器
    app.listen(config.port, () => {
      logger.info(`Server running on port ${config.port}`);
      logger.info(`Environment: ${config.nodeEnv}`);
      logger.info(`API: http://localhost:${config.port}/api`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
}

main();

// 优雅关闭
process.on('SIGTERM', async () => {
  logger.info('SIGTERM received. Shutting down...');
  await prisma.$disconnect();
  await redis.disconnect();
  process.exit(0);
});

process.on('SIGINT', async () => {
  logger.info('SIGINT received. Shutting down...');
  await prisma.$disconnect();
  await redis.disconnect();
  process.exit(0);
});

// 未捕获异常处理
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection:', { reason, promise });
});

export { app, prisma, redis };
