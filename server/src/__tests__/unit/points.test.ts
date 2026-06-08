/**
 * Unit tests for the points/gamification service.
 * Tests point calculation, level system, and achievement unlocking logic.
 */

// Mock modules before importing
jest.mock("../../utils/prisma", () => ({
  prisma: {
    user: { findUnique: jest.fn(), update: jest.fn() },
    pointHistory: { create: jest.fn(), findMany: jest.fn(), count: jest.fn() },
    achievement: { findUnique: jest.fn(), findMany: jest.fn() },
    userAchievement: { findUnique: jest.fn(), create: jest.fn() },
    notification: { create: jest.fn() },
  },
}));

jest.mock("../../utils/redis", () => ({
  redis: {
    zAdd: jest.fn(),
    get: jest.fn(),
    setEx: jest.fn(),
    del: jest.fn(),
    keys: jest.fn(),
  },
}));

jest.mock("../../utils/logger", () => ({
  logger: { info: jest.fn(), warn: jest.fn(), error: jest.fn() },
  createModuleLogger: jest.fn(() => ({ info: jest.fn(), warn: jest.fn(), error: jest.fn() })),
}));

import { calculateLevel, getExpForLevel, POINT_RULES, LEVEL_CONFIG } from "../../services/gamification/points";

describe("Points Service", () => {
  describe("getExpForLevel", () => {
    it("should return base experience for level 1", () => {
      const exp = getExpForLevel(1);
      expect(exp).toBe(LEVEL_CONFIG.baseExp); // 100
    });

    it("should increase exponentially with level", () => {
      const exp1 = getExpForLevel(1);
      const exp2 = getExpForLevel(2);
      const exp3 = getExpForLevel(3);

      expect(exp2).toBeGreaterThan(exp1);
      expect(exp3).toBeGreaterThan(exp2);
    });

    it("should use the configured growth rate", () => {
      const exp2 = getExpForLevel(2);
      // 100 * 1.5^1 = 150
      expect(exp2).toBe(Math.floor(LEVEL_CONFIG.baseExp * LEVEL_CONFIG.growthRate));
    });

    it("should handle level 1 correctly", () => {
      const exp = getExpForLevel(1);
      // 100 * 1.5^0 = 100
      expect(exp).toBe(100);
    });
  });

  describe("calculateLevel", () => {
    it("should return level 1 with 0 experience", () => {
      const result = calculateLevel(0);
      expect(result.level).toBe(1);
      expect(result.currentExp).toBe(0);
    });

    it("should return level 1 when experience is less than level 2 requirement", () => {
      const result = calculateLevel(50);
      expect(result.level).toBe(1);
      expect(result.currentExp).toBe(50);
    });

    it("should level up when experience meets requirement", () => {
      const expForLevel2 = getExpForLevel(1); // 100
      const result = calculateLevel(expForLevel2);
      expect(result.level).toBe(2);
    });

    it("should calculate progress percentage correctly", () => {
      // 150 exp = level 2, 50/150 progress
      const result = calculateLevel(150);
      expect(result.level).toBe(2);
      expect(result.currentExp).toBe(50);
      expect(result.nextLevelExp).toBe(getExpForLevel(2));
    });

    it("should never exceed max level", () => {
      const massiveExp = 999999999;
      const result = calculateLevel(massiveExp);
      expect(result.level).toBeLessThanOrEqual(LEVEL_CONFIG.maxLevel);
    });

    it("should return correct level for a known experience value", () => {
      // Level 1: 0-99 exp, Level 2: 100-249 exp, Level 3: 250-...
      const result = calculateLevel(100);
      expect(result.level).toBe(2);
    });
  });

  describe("POINT_RULES", () => {
    it("should have solve problem base points", () => {
      expect(POINT_RULES.SOLVE_PROBLEM.base).toBe(10);
    });

    it("should have difficulty multipliers for all 5 levels", () => {
      expect(POINT_RULES.SOLVE_PROBLEM.difficultyMultiplier).toHaveLength(6); // index 0 unused, 1-5
    });

    it("should have first solve bonus", () => {
      expect(POINT_RULES.FIRST_SOLVE).toBe(50);
    });

    it("should have contest participation points", () => {
      expect(POINT_RULES.CONTEST_PARTICIPATE).toBe(30);
    });

    it("should have community points defined", () => {
      expect(POINT_RULES.POST_CREATE).toBeGreaterThan(0);
      expect(POINT_RULES.COMMENT_CREATE).toBeGreaterThan(0);
      expect(POINT_RULES.RECEIVE_UPVOTE).toBeGreaterThan(0);
    });

    it("should have daily challenge points", () => {
      expect(POINT_RULES.DAILY_CHALLENGE_COMPLETE).toBe(50);
    });

    it("should have achievement unlock points for all rarities", () => {
      expect(POINT_RULES.ACHIEVEMENT_UNLOCK.common).toBeGreaterThan(0);
      expect(POINT_RULES.ACHIEVEMENT_UNLOCK.rare).toBeGreaterThan(0);
      expect(POINT_RULES.ACHIEVEMENT_UNLOCK.epic).toBeGreaterThan(0);
      expect(POINT_RULES.ACHIEVEMENT_UNLOCK.legendary).toBeGreaterThan(0);
    });

    it("should have higher points for rarer achievements", () => {
      expect(POINT_RULES.ACHIEVEMENT_UNLOCK.legendary).toBeGreaterThan(
        POINT_RULES.ACHIEVEMENT_UNLOCK.epic
      );
      expect(POINT_RULES.ACHIEVEMENT_UNLOCK.epic).toBeGreaterThan(
        POINT_RULES.ACHIEVEMENT_UNLOCK.rare
      );
      expect(POINT_RULES.ACHIEVEMENT_UNLOCK.rare).toBeGreaterThan(
        POINT_RULES.ACHIEVEMENT_UNLOCK.common
      );
    });
  });

  describe("LEVEL_CONFIG", () => {
    it("should have a reasonable base experience", () => {
      expect(LEVEL_CONFIG.baseExp).toBeGreaterThan(0);
      expect(LEVEL_CONFIG.baseExp).toBeLessThanOrEqual(1000);
    });

    it("should have a growth rate greater than 1", () => {
      expect(LEVEL_CONFIG.growthRate).toBeGreaterThan(1);
    });

    it("should have a maximum level", () => {
      expect(LEVEL_CONFIG.maxLevel).toBeGreaterThan(0);
    });
  });
});
