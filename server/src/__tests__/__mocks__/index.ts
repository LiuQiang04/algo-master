/**
 * Mock for the main server index module.
 * Provides mock Prisma client and Redis client for unit tests.
 */

export const prisma = {
  user: {
    findUnique: jest.fn(),
    findMany: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    count: jest.fn(),
    groupBy: jest.fn(),
  },
  achievement: {
    findUnique: jest.fn(),
    findMany: jest.fn(),
    create: jest.fn(),
    upsert: jest.fn(),
    count: jest.fn(),
    groupBy: jest.fn(),
  },
  userAchievement: {
    findUnique: jest.fn(),
    findMany: jest.fn(),
    create: jest.fn(),
    count: jest.fn(),
    groupBy: jest.fn(),
  },
  pointHistory: {
    findMany: jest.fn(),
    create: jest.fn(),
    count: jest.fn(),
  },
  submission: {
    findMany: jest.fn(),
    create: jest.fn(),
    count: jest.fn(),
  },
  problem: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    create: jest.fn(),
    count: jest.fn(),
  },
  contest: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    create: jest.fn(),
  },
  contestParticipant: {
    findMany: jest.fn(),
    findFirst: jest.fn(),
    create: jest.fn(),
    count: jest.fn(),
  },
  friendship: {
    findMany: jest.fn(),
    count: jest.fn(),
  },
  post: {
    findMany: jest.fn(),
    create: jest.fn(),
    count: jest.fn(),
    aggregate: jest.fn(),
  },
  comment: {
    findMany: jest.fn(),
    create: jest.fn(),
    count: jest.fn(),
  },
  notification: {
    create: jest.fn(),
  },
  loginStreak: {
    findFirst: jest.fn(),
  },
  dailyChallengeCompletion: {
    count: jest.fn(),
  },
  $disconnect: jest.fn(),
  $executeRawUnsafe: jest.fn(),
};

export const redis = {
  get: jest.fn(),
  set: jest.fn(),
  setEx: jest.fn(),
  del: jest.fn(),
  keys: jest.fn(),
  zAdd: jest.fn(),
  connect: jest.fn(),
  disconnect: jest.fn(),
  multi: jest.fn(() => ({
    zAdd: jest.fn(),
    exec: jest.fn(),
  })),
};
