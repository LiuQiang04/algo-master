/**
 * Unit tests for the login streak service.
 * Tests streak recording, info retrieval, and calendar generation.
 */

const mockFindUnique = jest.fn();
const mockFindFirst = jest.fn();
const mockFindMany = jest.fn();
const mockCreate = jest.fn();
const mockAggregate = jest.fn();
const mockAddPoints = jest.fn();
const mockCheckAchievements = jest.fn();

jest.mock('../../utils/prisma', () => ({
  prisma: {
    loginStreak: {
      findUnique: mockFindUnique,
      findFirst: mockFindFirst,
      findMany: mockFindMany,
      create: mockCreate,
      aggregate: mockAggregate,
    },
  },
}));

jest.mock('../../utils/logger', () => ({
  logger: { info: jest.fn(), warn: jest.fn(), error: jest.fn() },
  createModuleLogger: jest.fn(() => ({ info: jest.fn(), warn: jest.fn(), error: jest.fn() })),
}));

jest.mock('../../services/gamification/points', () => ({
  addPoints: mockAddPoints,
  POINT_RULES: {
    DAILY_LOGIN: 5,
    LOGIN_STREAK_7: 50,
    LOGIN_STREAK_30: 200,
  },
}));

jest.mock('../../services/gamification/achievements', () => ({
  checkAchievements: mockCheckAchievements,
}));

import { recordLogin, getLoginStreakInfo, getLoginCalendar } from '../../services/gamification/loginStreak';

describe('loginStreak', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('recordLogin', () => {
    it('should create first-ever login with streak 1', async () => {
      const today = new Date('2026-07-15');
      jest.setSystemTime(today);

      mockFindUnique
        .mockResolvedValueOnce(null) // no today record
        .mockResolvedValueOnce(null); // no yesterday record

      const mockCreated = {
        userId: 'user-1',
        loginDate: today,
        streakDays: 1,
      };
      mockCreate.mockResolvedValue(mockCreated);
      mockAddPoints.mockResolvedValue(undefined);
      mockCheckAchievements.mockResolvedValue(undefined);

      const result = await recordLogin('user-1');

      expect(result.streakDays).toBe(1);
      expect(mockCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ streakDays: 1 }),
        })
      );
      expect(mockAddPoints).toHaveBeenCalledWith('user-1', 5, 'login', expect.any(String));
      expect(mockCheckAchievements).toHaveBeenCalledWith('user-1');
    });

    it('should increment streak for consecutive day login', async () => {
      const today = new Date('2026-07-15');
      const yesterday = new Date('2026-07-14');
      jest.setSystemTime(today);

      mockFindUnique
        .mockResolvedValueOnce(null) // no today record
        .mockResolvedValueOnce({ userId: 'user-1', loginDate: yesterday, streakDays: 5 }); // yesterday record

      const mockCreated = {
        userId: 'user-1',
        loginDate: today,
        streakDays: 6,
      };
      mockCreate.mockResolvedValue(mockCreated);
      mockAddPoints.mockResolvedValue(undefined);
      mockCheckAchievements.mockResolvedValue(undefined);

      const result = await recordLogin('user-1');

      expect(result.streakDays).toBe(6);
    });

    it('should return existing record when already logged in today', async () => {
      const today = new Date('2026-07-15');
      jest.setSystemTime(today);

      const existingRecord = { userId: 'user-1', loginDate: today, streakDays: 3 };
      mockFindUnique.mockResolvedValue(existingRecord);

      const result = await recordLogin('user-1');

      expect(result).toEqual(existingRecord);
      expect(mockCreate).not.toHaveBeenCalled();
      expect(mockAddPoints).not.toHaveBeenCalled();
    });

    it('should award 7-day streak bonus', async () => {
      const today = new Date('2026-07-15');
      const yesterday = new Date('2026-07-14');
      jest.setSystemTime(today);

      mockFindUnique
        .mockResolvedValueOnce(null) // no today record
        .mockResolvedValueOnce({ userId: 'user-1', loginDate: yesterday, streakDays: 6 });

      mockCreate.mockResolvedValue({ userId: 'user-1', loginDate: today, streakDays: 7 });
      mockAddPoints.mockResolvedValue(undefined);
      mockCheckAchievements.mockResolvedValue(undefined);

      await recordLogin('user-1');

      expect(mockAddPoints).toHaveBeenCalledWith('user-1', 5, 'login', expect.any(String));
      expect(mockAddPoints).toHaveBeenCalledWith('user-1', 50, 'login_streak', expect.any(String));
    });

    it('should award 30-day streak bonus', async () => {
      const today = new Date('2026-07-15');
      const yesterday = new Date('2026-07-14');
      jest.setSystemTime(today);

      mockFindUnique
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce({ userId: 'user-1', loginDate: yesterday, streakDays: 29 });

      mockCreate.mockResolvedValue({ userId: 'user-1', loginDate: today, streakDays: 30 });
      mockAddPoints.mockResolvedValue(undefined);
      mockCheckAchievements.mockResolvedValue(undefined);

      await recordLogin('user-1');

      expect(mockAddPoints).toHaveBeenCalledWith('user-1', 200, 'login_streak', expect.any(String));
    });
  });

  describe('getLoginStreakInfo', () => {
    const mockLatestRecord = {
      userId: 'user-1',
      loginDate: new Date('2026-07-15'),
      streakDays: 7,
    };

    it('should return streak info for a user with streak', async () => {
      const today = new Date('2026-07-15');
      jest.setSystemTime(today);

      mockFindFirst.mockResolvedValue(mockLatestRecord);
      mockFindUnique.mockResolvedValue(mockLatestRecord);
      mockAggregate.mockResolvedValue({ _max: { streakDays: 7 } });
      mockFindMany.mockResolvedValue([mockLatestRecord]);

      const result = await getLoginStreakInfo('user-1');

      expect(result.currentStreak).toBe(7);
      expect(result.maxStreak).toBe(7);
      expect(result.isLoggedInToday).toBe(true);
      expect(result.recentLogins).toHaveLength(1);
    });

    it('should return default values when user has no streak', async () => {
      const today = new Date('2026-07-15');
      jest.setSystemTime(today);

      mockFindFirst.mockResolvedValue(null);
      mockFindUnique.mockResolvedValue(null);
      mockAggregate.mockResolvedValue({ _max: { streakDays: null } });
      mockFindMany.mockResolvedValue([]);

      const result = await getLoginStreakInfo('new-user');

      expect(result.currentStreak).toBe(0);
      expect(result.maxStreak).toBe(0);
      expect(result.isLoggedInToday).toBe(false);
      expect(result.recentLogins).toHaveLength(0);
    });
  });

  describe('getLoginCalendar', () => {
    it('should return calendar array for the specified month', async () => {
      // July 2026 has 31 days
      mockFindMany.mockResolvedValue([]);

      const calendar = await getLoginCalendar('user-1', 7, 2026);

      expect(Array.isArray(calendar)).toBe(true);
      expect(calendar.length).toBe(31);
      expect(calendar[0]).toHaveProperty('date');
      expect(calendar[0]).toHaveProperty('isLoggedIn');
      expect(calendar[0]).toHaveProperty('streakDays');
    });

    it('should mark login days correctly', async () => {
      const loginDate = new Date(2026, 6, 5); // July 5, 2026
      mockFindMany.mockResolvedValue([
        { userId: 'user-1', loginDate, streakDays: 3 },
      ]);

      const calendar = await getLoginCalendar('user-1', 7, 2026);

      expect(calendar[4].isLoggedIn).toBe(true);
      expect(calendar[4].streakDays).toBe(3);
      expect(calendar[0].isLoggedIn).toBe(false);
    });
  });
});
