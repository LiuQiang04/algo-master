/**
 * Unit tests for the gamification system (legacy tests, consolidated).
 */

// Mock modules before importing
jest.mock("../../utils/prisma", () => ({
  prisma: {
    user: { findUnique: jest.fn(), update: jest.fn() },
    pointHistory: { create: jest.fn() },
    achievement: { findMany: jest.fn() },
    userAchievement: { findUnique: jest.fn(), create: jest.fn() },
    notification: { create: jest.fn() },
  },
}));

jest.mock("../../utils/redis", () => ({
  redis: { zAdd: jest.fn() },
}));

jest.mock("../../utils/logger", () => ({
  logger: { info: jest.fn(), warn: jest.fn(), error: jest.fn() },
  createModuleLogger: jest.fn(() => ({ info: jest.fn(), warn: jest.fn(), error: jest.fn() })),
}));

import { calculateLevel, getExpForLevel, POINT_RULES } from "../../services/gamification/points";

describe("Gamification System", () => {
  describe("Points System", () => {
    test("should calculate correct exp for level", () => {
      expect(getExpForLevel(1)).toBe(100);
      expect(getExpForLevel(2)).toBe(150);
      expect(getExpForLevel(3)).toBe(225);
    });

    test("should calculate correct level from exp", () => {
      const result1 = calculateLevel(0);
      expect(result1.level).toBe(1);
      expect(result1.progress).toBe(0);

      const result2 = calculateLevel(100);
      expect(result2.level).toBe(2);
      expect(result2.progress).toBe(0);

      const result3 = calculateLevel(250);
      expect(result3.level).toBe(3);
    });

    test("should have correct point rules", () => {
      expect(POINT_RULES.SOLVE_PROBLEM.base).toBe(10);
      expect(POINT_RULES.DAILY_LOGIN).toBe(5);
      expect(POINT_RULES.LOGIN_STREAK_7).toBe(50);
      expect(POINT_RULES.LOGIN_STREAK_30).toBe(200);
    });

    test("should have difficulty multipliers", () => {
      expect(POINT_RULES.SOLVE_PROBLEM.difficultyMultiplier[1]).toBe(1);
      expect(POINT_RULES.SOLVE_PROBLEM.difficultyMultiplier[2]).toBe(1.5);
      expect(POINT_RULES.SOLVE_PROBLEM.difficultyMultiplier[3]).toBe(2);
      expect(POINT_RULES.SOLVE_PROBLEM.difficultyMultiplier[4]).toBe(3);
      expect(POINT_RULES.SOLVE_PROBLEM.difficultyMultiplier[5]).toBe(5);
    });
  });

  describe("Level Progress", () => {
    test("should calculate progress percentage correctly", () => {
      // Level 1 needs 100 exp, 50 exp = 50% progress
      const result = calculateLevel(50);
      expect(result.level).toBe(1);
      expect(result.progress).toBe(50);
    });

    test("should handle max level", () => {
      const result = calculateLevel(1000000);
      expect(result.level).toBeLessThanOrEqual(100);
    });
  });
});
