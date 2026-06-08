import { prisma } from '../../utils/prisma';
import { redis } from '../../utils/redis';

export type LeaderboardType = 'global' | 'friends' | 'region';

// 获取排行榜
export async function getLeaderboard(
  type: LeaderboardType,
  userId?: string,
  page: number = 1,
  limit: number = 50
) {
  const cacheKey = `leaderboard:${type}:${page}`;

  // 尝试从缓存获取
  if (type === 'global') {
    const cached = await redis.get(cacheKey);
    if (cached) {
      return JSON.parse(cached);
    }
  }

  let result: any[] = [];

  switch (type) {
    case 'global':
      result = await getGlobalLeaderboard(page, limit);
      break;
    case 'friends':
      if (!userId) throw new Error('User ID required for friends leaderboard');
      result = await getFriendsLeaderboard(userId, page, limit);
      break;
    case 'region':
      result = await getRegionLeaderboard(page, limit);
      break;
  }

  // 缓存全局排行榜5分钟
  if (type === 'global') {
    await redis.setEx(cacheKey, 300, JSON.stringify(result));
  }

  return result;
}

// 全局排行榜
async function getGlobalLeaderboard(page: number, limit: number) {
  const skip = (page - 1) * limit;

  const users = await prisma.user.findMany({
    select: {
      id: true,
      username: true,
      avatarUrl: true,
      level: true,
      experiencePoints: true,
      rating: true,
      title: true,
    },
    orderBy: [
      { experiencePoints: 'desc' },
      { level: 'desc' },
      { rating: 'desc' },
    ],
    skip,
    take: limit,
  });

  return users.map((user, index) => ({
    rank: skip + index + 1,
    ...user,
  }));
}

// 好友排行榜
async function getFriendsLeaderboard(userId: string, page: number, limit: number) {
  // 获取好友ID列表
  const friendships = await prisma.friendship.findMany({
    where: {
      OR: [
        { userId, status: 'accepted' },
        { friendId: userId, status: 'accepted' },
      ],
    },
    select: {
      userId: true,
      friendId: true,
    },
  });

  const friendIds = new Set<string>();
  friendIds.add(userId); // 包含自己
  friendships.forEach((f) => {
    friendIds.add(f.userId);
    friendIds.add(f.friendId);
  });

  const skip = (page - 1) * limit;

  const users = await prisma.user.findMany({
    where: {
      id: { in: Array.from(friendIds) },
    },
    select: {
      id: true,
      username: true,
      avatarUrl: true,
      level: true,
      experiencePoints: true,
      rating: true,
      title: true,
    },
    orderBy: [
      { experiencePoints: 'desc' },
      { level: 'desc' },
    ],
    skip,
    take: limit,
  });

  return users.map((user, index) => ({
    rank: skip + index + 1,
    ...user,
    isFriend: user.id !== userId,
  }));
}

// 地区排行榜
async function getRegionLeaderboard(page: number, limit: number) {
  const skip = (page - 1) * limit;

  // 按地区分组统计
  const regions = await prisma.user.groupBy({
    by: ['region'],
    _count: true,
    _avg: {
      experiencePoints: true,
      level: true,
    },
    where: {
      region: { not: null },
    },
    orderBy: {
      _avg: {
        experiencePoints: 'desc',
      },
    },
    skip,
    take: limit,
  });

  return regions.map((region, index) => ({
    rank: skip + index + 1,
    region: region.region,
    userCount: region._count,
    avgExperience: Math.floor(region._avg.experiencePoints || 0),
    avgLevel: Math.floor(region._avg.level || 0),
  }));
}

// 获取用户排名
export async function getUserRank(
  userId: string,
  type: LeaderboardType
): Promise<number> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { experiencePoints: true, region: true },
  });

  if (!user) return -1;

  switch (type) {
    case 'global': {
      const rank = await prisma.user.count({
        where: {
          experiencePoints: { gt: user.experiencePoints },
        },
      });
      return rank + 1;
    }

    case 'friends': {
      const friendships = await prisma.friendship.findMany({
        where: {
          OR: [
            { userId, status: 'accepted' },
            { friendId: userId, status: 'accepted' },
          ],
        },
        select: {
          userId: true,
          friendId: true,
        },
      });

      const friendIds = new Set<string>();
      friendIds.add(userId);
      friendships.forEach((f) => {
        friendIds.add(f.userId);
        friendIds.add(f.friendId);
      });

      const rank = await prisma.user.count({
        where: {
          id: { in: Array.from(friendIds) },
          experiencePoints: { gt: user.experiencePoints },
        },
      });
      return rank + 1;
    }

    case 'region': {
      if (!user.region) return -1;
      const rank = await prisma.user.count({
        where: {
          region: user.region,
          experiencePoints: { gt: user.experiencePoints },
        },
      });
      return rank + 1;
    }

    default:
      return -1;
  }
}

// 更新排行榜缓存
export async function refreshLeaderboardCache() {
  // 清除所有排行榜缓存
  const keys = await redis.keys('leaderboard:*');
  if (keys.length > 0) {
    await redis.del(keys);
  }

  // 重建全局排行榜缓存
  const users = await prisma.user.findMany({
    select: {
      id: true,
      experiencePoints: true,
    },
    orderBy: { experiencePoints: 'desc' },
    take: 10000, // 最多缓存前10000名
  });

  // 使用Redis Sorted Set存储全局排行榜
  const pipeline = redis.multi();
  for (const user of users) {
    pipeline.zAdd('leaderboard:global', {
      score: user.experiencePoints,
      value: user.id,
    });
  }
  await pipeline.exec();
}
