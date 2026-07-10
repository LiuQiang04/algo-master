/**
 * Unit tests for the user service.
 * Tests user profile, stats, update, and search functionality.
 */

import { prisma } from '../../utils/prisma';

// Mock prisma
const mockUserFindUnique = jest.fn();
const mockUserFindFirst = jest.fn();
const mockUserFindMany = jest.fn();
const mockUserCount = jest.fn();
const mockUserUpdate = jest.fn();
const mockSubmissionFindMany = jest.fn();
const mockSubmissionCount = jest.fn();
const mockProblemGroupBy = jest.fn();
const mockParticipantCount = jest.fn();
const mockAchievementCount = jest.fn();

jest.mock('../../utils/prisma', () => ({
  prisma: {
    user: {
      findUnique: mockUserFindUnique,
      findFirst: mockUserFindFirst,
      findMany: mockUserFindMany,
      count: mockUserCount,
      update: mockUserUpdate,
    },
    submission: {
      findMany: mockSubmissionFindMany,
      count: mockSubmissionCount,
    },
    problem: {
      groupBy: mockProblemGroupBy,
    },
    contestParticipant: {
      count: mockParticipantCount,
    },
    userAchievement: {
      count: mockAchievementCount,
    },
  },
}));

jest.mock('../../utils/logger', () => ({
  logger: { info: jest.fn(), warn: jest.fn(), error: jest.fn() },
  createModuleLogger: jest.fn(() => ({ info: jest.fn(), warn: jest.fn(), error: jest.fn() })),
}));

import { getUserById, getUserStats, updateUser, searchUsers } from '../../services/userService';
import { NotFoundError, BadRequestError } from '../../utils/errors';

const mockUser = {
  id: 'user-1',
  username: 'testuser',
  email: 'test@example.com',
  passwordHash: 'hashed_password',
  avatarUrl: 'https://example.com/avatar.png',
  bio: 'A test user',
  rating: 1200,
  experiencePoints: 500,
  level: 5,
  role: 'USER',
  region: 'US',
  title: 'Newbie',
  createdAt: new Date('2026-01-01'),
  updatedAt: new Date('2026-06-01'),
};

const mockSelectedUser = {
  id: 'user-1',
  username: 'testuser',
  email: 'test@example.com',
  avatarUrl: 'https://example.com/avatar.png',
  bio: 'A test user',
  rating: 1200,
  experiencePoints: 500,
  level: 5,
  region: 'US',
  title: 'Newbie',
  createdAt: new Date('2026-01-01'),
  _count: {
    submissions: 10,
    posts: 3,
    achievements: 2,
  },
};

describe('userService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getUserById', () => {
    it('should return user profile when user exists', async () => {
      mockUserFindUnique.mockResolvedValue(mockSelectedUser);

      const result = await getUserById('user-1');

      expect(result.id).toBe('user-1');
      expect(result.username).toBe('testuser');
      expect(result._count.submissions).toBe(10);
      expect(mockUserFindUnique).toHaveBeenCalledWith(
        expect.objectContaining({ where: { id: 'user-1' } })
      );
    });

    it('should throw NotFoundError when user does not exist', async () => {
      mockUserFindUnique.mockResolvedValue(null);

      await expect(getUserById('nonexistent')).rejects.toThrow(NotFoundError);
    });
  });

  describe('getUserStats', () => {
    const mockSubmission = { problemId: 'prob-1' };
    const mockDifficultyStats = [{ difficulty: 1, _count: 5 }];

    it('should return full user stats', async () => {
      mockUserFindUnique.mockResolvedValue(mockUser);
      mockSubmissionFindMany
        .mockResolvedValueOnce([mockSubmission]); // submission.findMany for solved
      mockSubmissionCount
        .mockResolvedValueOnce(10) // total submissions
        .mockResolvedValueOnce(8); // accepted submissions
      mockParticipantCount
        .mockResolvedValueOnce(3) // contest count
        .mockResolvedValueOnce(1); // contest top 3
      mockAchievementCount
        .mockResolvedValueOnce(2); // achievement count
      mockProblemGroupBy.mockResolvedValue(mockDifficultyStats);

      const stats = await getUserStats('user-1');

      expect(stats.userId).toBe('user-1');
      expect(stats.problems.totalSolved).toBe(1);
      expect(stats.submissions.total).toBe(10);
      expect(stats.submissions.accepted).toBe(8);
      expect(stats.submissions.acceptanceRate).toBe(80);
      expect(stats.contests.participated).toBe(3);
      expect(stats.contests.top3Finishes).toBe(1);
      expect(stats.achievements).toBe(2);
      expect(stats.level).toBeDefined();
    });

    it('should throw NotFoundError when user does not exist', async () => {
      mockUserFindUnique.mockResolvedValue(null);

      await expect(getUserStats('nonexistent')).rejects.toThrow(NotFoundError);
    });
  });

  describe('updateUser', () => {
    const mockUserUpdatedUser = {
      id: 'user-1',
      username: 'newusername',
      email: 'test@example.com',
      avatarUrl: 'https://example.com/new-avatar.png',
      bio: 'Updated bio',
      rating: 1200,
      experiencePoints: 500,
      level: 5,
      region: 'US',
      title: 'Newbie',
    };

    it('should update user profile successfully', async () => {
      mockUserFindFirst.mockResolvedValue(null); // no duplicate username
      mockUserUpdate.mockResolvedValue(mockUserUpdatedUser);

      const result = await updateUser('user-1', {
        username: 'newusername',
        bio: 'Updated bio',
      });

      expect(result.username).toBe('newusername');
      expect(result.bio).toBe('Updated bio');
      expect(mockUserUpdate).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'user-1' },
          data: { username: 'newusername', bio: 'Updated bio' },
        })
      );
    });

    it('should throw BadRequestError when username is taken', async () => {
      mockUserFindFirst.mockResolvedValue({ id: 'other-user' });

      await expect(
        updateUser('user-1', { username: 'takenname' })
      ).rejects.toThrow(BadRequestError);

      expect(mockUserUpdate).not.toHaveBeenCalled();
    });
  });

  describe('searchUsers', () => {
    const mockSearchResults = [
      { id: 'user-1', username: 'testuser', avatarUrl: null, level: 5, rating: 1200 },
      { id: 'user-2', username: 'testuser2', avatarUrl: null, level: 3, rating: 800 },
    ];

    it('should return users matching the query', async () => {
      mockUserFindMany.mockResolvedValue(mockSearchResults);
      mockUserCount.mockResolvedValue(2);

      const result = await searchUsers('test');

      expect(result.users).toHaveLength(2);
      expect(result.total).toBe(2);
      expect(mockUserFindMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            OR: expect.arrayContaining([
              expect.objectContaining({ username: { contains: 'test', mode: 'insensitive' } }),
            ]),
          },
        })
      );
    });

    it('should return empty array when no users match', async () => {
      mockUserFindMany.mockResolvedValue([]);
      mockUserCount.mockResolvedValue(0);

      const result = await searchUsers('nonexistentquery');

      expect(result.users).toHaveLength(0);
      expect(result.total).toBe(0);
    });

    it('should support pagination', async () => {
      mockUserFindMany.mockResolvedValue([]);
      mockUserCount.mockResolvedValue(0);

      await searchUsers('test', 2, 10);

      expect(mockUserFindMany).toHaveBeenCalledWith(
        expect.objectContaining({ skip: 10, take: 10 })
      );
    });
  });
});
