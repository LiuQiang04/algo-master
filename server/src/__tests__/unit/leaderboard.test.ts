/**
 * Unit tests for the leaderboard service.
 * Tests leaderboard functionality and caching.
 */

import { getLeaderboard } from '../../services/gamification/leaderboard';

// Mock dependencies
jest.mock('../../utils/prisma', () => ({
  prisma: {
    user: {
      findMany: jest.fn(),
      groupBy: jest.fn(),
    },
    friendship: {
      findMany: jest.fn(),
    },
  },
}));

jest.mock('../../utils/redis', () => ({
  redis: {
    get: jest.fn(),
    setEx: jest.fn(),
  },
}));

describe('Leaderboard Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getLeaderboard', () => {
    it('should return global leaderboard from cache', async () => {
      const cachedData = [
        { rank: 1, id: 'user1', username: 'alice', experiencePoints: 1000 },
        { rank: 2, id: 'user2', username: 'bob', experiencePoints: 800 },
      ];

      const { redis } = require('../../utils/redis');
      redis.get.mockResolvedValue(JSON.stringify(cachedData));

      const result = await getLeaderboard('global');

      expect(result).toEqual(cachedData);
      expect(redis.get).toHaveBeenCalledWith('leaderboard:global:1');
    });

    it('should fetch global leaderboard from database when cache is empty', async () => {
      const { redis } = require('../../utils/redis');
      const { prisma } = require('../../utils/prisma');

      redis.get.mockResolvedValue(null);
      prisma.user.findMany.mockResolvedValue([
        { id: 'user1', username: 'alice', experiencePoints: 1000, level: 5, rating: 1500 },
        { id: 'user2', username: 'bob', experiencePoints: 800, level: 4, rating: 1400 },
      ]);

      const result = await getLeaderboard('global');

      expect(result).toEqual([
        { rank: 1, id: 'user1', username: 'alice', experiencePoints: 1000, level: 5, rating: 1500 },
        { rank: 2, id: 'user2', username: 'bob', experiencePoints: 800, level: 4, rating: 1400 },
      ]);
      expect(prisma.user.findMany).toHaveBeenCalledWith({
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
        skip: 0,
        take: 50,
      });
    });

    it('should cache global leaderboard after fetching', async () => {
      const { redis } = require('../../utils/redis');
      const { prisma } = require('../../utils/prisma');

      redis.get.mockResolvedValue(null);
      prisma.user.findMany.mockResolvedValue([
        { id: 'user1', username: 'alice', experiencePoints: 1000 },
      ]);

      await getLeaderboard('global');

      expect(redis.setEx).toHaveBeenCalledWith(
        'leaderboard:global:1',
        300,
        expect.any(String)
      );
    });

    it('should throw error for friends leaderboard without userId', async () => {
      await expect(getLeaderboard('friends')).rejects.toThrow('User ID required for friends leaderboard');
    });

    it('should return friends leaderboard', async () => {
      const { prisma } = require('../../utils/prisma');

      prisma.friendship.findMany.mockResolvedValue([
        { userId: 'user1', friendId: 'user2' },
        { userId: 'user3', friendId: 'user1' },
      ]);
      prisma.user.findMany.mockResolvedValue([
        { id: 'user1', username: 'alice', experiencePoints: 1000 },
        { id: 'user2', username: 'bob', experiencePoints: 800 },
        { id: 'user3', username: 'charlie', experiencePoints: 600 },
      ]);

      const result = await getLeaderboard('friends', 'user1');

      expect(result).toHaveLength(3);
      expect(prisma.friendship.findMany).toHaveBeenCalledWith({
        where: {
          OR: [
            { userId: 'user1', status: 'accepted' },
            { friendId: 'user1', status: 'accepted' },
          ],
        },
        select: {
          userId: true,
          friendId: true,
        },
      });
    });

    it('should return region leaderboard', async () => {
      const { prisma } = require('../../utils/prisma');

      prisma.user.groupBy.mockResolvedValue([
        { region: 'Beijing', _count: 10, _avg: { experiencePoints: 800 } },
        { region: 'Shanghai', _count: 8, _avg: { experiencePoints: 750 } },
      ]);

      const result = await getLeaderboard('region');

      expect(result).toHaveLength(2);
      expect(prisma.user.groupBy).toHaveBeenCalled();
    });

    it('should handle pagination correctly', async () => {
      const { redis } = require('../../utils/redis');
      const { prisma } = require('../../utils/prisma');

      redis.get.mockResolvedValue(null);
      prisma.user.findMany.mockResolvedValue([]);

      await getLeaderboard('global', undefined, 2, 10);

      expect(prisma.user.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          skip: 10,
          take: 10,
        })
      );
    });

    it('should use default pagination values', async () => {
      const { redis } = require('../../utils/redis');
      const { prisma } = require('../../utils/prisma');

      redis.get.mockResolvedValue(null);
      prisma.user.findMany.mockResolvedValue([]);

      await getLeaderboard('global');

      expect(prisma.user.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          skip: 0,
          take: 50,
        })
      );
    });

    it('should handle cache miss for friends leaderboard', async () => {
      const { prisma } = require('../../utils/prisma');

      prisma.friendship.findMany.mockResolvedValue([]);
      prisma.user.findMany.mockResolvedValue([]);

      const result = await getLeaderboard('friends', 'user1');

      expect(result).toEqual([]);
    });

    it('should handle database errors gracefully', async () => {
      const { redis } = require('../../utils/redis');
      const { prisma } = require('../../utils/prisma');

      redis.get.mockResolvedValue(null);
      prisma.user.findMany.mockRejectedValue(new Error('Database error'));

      await expect(getLeaderboard('global')).rejects.toThrow('Database error');
    });
  });
});
