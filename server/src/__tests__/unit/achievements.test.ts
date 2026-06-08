/**
 * Unit tests for the achievements service.
 * Tests achievement definitions and their structure.
 */

// Mock modules before importing
jest.mock("../../utils/prisma", () => ({
  prisma: {
    user: { findUnique: jest.fn() },
    achievement: { findMany: jest.fn(), findUnique: jest.fn(), upsert: jest.fn() },
    userAchievement: { findMany: jest.fn(), findUnique: jest.fn(), create: jest.fn() },
    submission: { count: jest.fn(), findMany: jest.fn() },
    problem: { count: jest.fn() },
    contestParticipant: { count: jest.fn(), findFirst: jest.fn() },
    loginStreak: { findFirst: jest.fn() },
    dailyChallengeCompletion: { count: jest.fn() },
    post: { count: jest.fn(), aggregate: jest.fn() },
    friendship: { count: jest.fn() },
    notification: { create: jest.fn() },
    pointHistory: { create: jest.fn() },
  },
}));

jest.mock("../../utils/redis", () => ({
  redis: { zAdd: jest.fn(), get: jest.fn(), setEx: jest.fn() },
}));

jest.mock("../../utils/logger", () => ({
  logger: { info: jest.fn(), warn: jest.fn(), error: jest.fn() },
  createModuleLogger: jest.fn(() => ({ info: jest.fn(), warn: jest.fn(), error: jest.fn() })),
}));

import { ACHIEVEMENT_DEFINITIONS } from "../../services/gamification/achievements";

describe("Achievements Service", () => {
  describe("ACHIEVEMENT_DEFINITIONS", () => {
    it("should have at least one achievement defined", () => {
      expect(ACHIEVEMENT_DEFINITIONS.length).toBeGreaterThan(0);
    });

    it("should have all required fields for each achievement", () => {
      for (const achievement of ACHIEVEMENT_DEFINITIONS) {
        expect(achievement).toHaveProperty("name");
        expect(achievement).toHaveProperty("description");
        expect(achievement).toHaveProperty("category");
        expect(achievement).toHaveProperty("rarity");
        expect(achievement).toHaveProperty("points");
        expect(achievement).toHaveProperty("requirement");

        expect(typeof achievement.name).toBe("string");
        expect(typeof achievement.description).toBe("string");
        expect(typeof achievement.category).toBe("string");
        expect(typeof achievement.rarity).toBe("string");
        expect(typeof achievement.points).toBe("number");
        expect(typeof achievement.requirement).toBe("object");
      }
    });

    it("should have unique achievement names", () => {
      const names = ACHIEVEMENT_DEFINITIONS.map((a) => a.name);
      const uniqueNames = new Set(names);
      expect(uniqueNames.size).toBe(names.length);
    });

    it("should have valid rarity values", () => {
      const validRarities = ["common", "rare", "epic", "legendary"];
      for (const achievement of ACHIEVEMENT_DEFINITIONS) {
        expect(validRarities).toContain(achievement.rarity);
      }
    });

    it("should have valid category values", () => {
      const validCategories = ["problem", "contest", "learning", "social", "special", "level"];
      for (const achievement of ACHIEVEMENT_DEFINITIONS) {
        expect(validCategories).toContain(achievement.category);
      }
    });

    it("should have positive point values", () => {
      for (const achievement of ACHIEVEMENT_DEFINITIONS) {
        expect(achievement.points).toBeGreaterThan(0);
      }
    });

    it("should have requirement with type and value", () => {
      for (const achievement of ACHIEVEMENT_DEFINITIONS) {
        const req = achievement.requirement as any;
        expect(req).toHaveProperty("type");
        if (req.type !== "fast_solve" && req.type !== "diverse_solve") {
          expect(req).toHaveProperty("value");
          expect(typeof req.value).toBe("number");
        }
      }
    });
  });

  describe("Problem achievements", () => {
    const problemAchievements = ACHIEVEMENT_DEFINITIONS.filter(
      (a) => a.category === "problem"
    );

    it("should have problem-solving achievements", () => {
      expect(problemAchievements.length).toBeGreaterThan(0);
    });

    it("should have increasing solve count requirements", () => {
      const solveCountAchievements = problemAchievements
        .filter((a) => (a.requirement as any).type === "solve_count")
        .sort((a, b) => (a.requirement as any).value - (b.requirement as any).value);

      expect(solveCountAchievements.length).toBeGreaterThan(1);

      for (let i = 1; i < solveCountAchievements.length; i++) {
        expect((solveCountAchievements[i].requirement as any).value).toBeGreaterThan(
          (solveCountAchievements[i - 1].requirement as any).value
        );
      }
    });
  });

  describe("Contest achievements", () => {
    const contestAchievements = ACHIEVEMENT_DEFINITIONS.filter(
      (a) => a.category === "contest"
    );

    it("should have contest achievements", () => {
      expect(contestAchievements.length).toBeGreaterThan(0);
    });

    it("should have a contest participation achievement", () => {
      const participation = contestAchievements.find(
        (a) => (a.requirement as any).type === "contest_count"
      );
      expect(participation).toBeDefined();
    });
  });

  describe("Social achievements", () => {
    const socialAchievements = ACHIEVEMENT_DEFINITIONS.filter(
      (a) => a.category === "social"
    );

    it("should have social achievements", () => {
      expect(socialAchievements.length).toBeGreaterThan(0);
    });

    it("should have a post count achievement", () => {
      const postAchievement = socialAchievements.find(
        (a) => (a.requirement as any).type === "post_count"
      );
      expect(postAchievement).toBeDefined();
    });
  });

  describe("Learning achievements", () => {
    const learningAchievements = ACHIEVEMENT_DEFINITIONS.filter(
      (a) => a.category === "learning"
    );

    it("should have learning achievements", () => {
      expect(learningAchievements.length).toBeGreaterThan(0);
    });

    it("should have login streak achievements", () => {
      const streakAchievements = learningAchievements.filter(
        (a) => (a.requirement as any).type === "login_streak"
      );
      expect(streakAchievements.length).toBeGreaterThan(0);
    });
  });
});
