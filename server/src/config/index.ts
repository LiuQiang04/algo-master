import dotenv from 'dotenv';

dotenv.config();

export const config = {
  // 服务器配置
  port: parseInt(process.env.PORT || '3001', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  isDev: process.env.NODE_ENV === 'development',
  isProd: process.env.NODE_ENV === 'production',
  isTest: process.env.NODE_ENV === 'test',

  // 数据库配置
  database: {
    url: process.env.DATABASE_URL!,
  },

  // Redis配置
  redis: {
    url: process.env.REDIS_URL || 'redis://localhost:6379',
  },

  // JWT配置
  jwt: {
    secret: process.env.JWT_SECRET || 'default-secret-change-me',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  },

  // 日志配置
  log: {
    level: process.env.LOG_LEVEL || 'info',
  },

  // 密码加密配置
  bcrypt: {
    saltRounds: 10,
  },
} as const;
