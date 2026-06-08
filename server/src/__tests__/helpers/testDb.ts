/**
 * Test database helper.
 * Provides utilities for managing the test database lifecycle.
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
});

/**
 * Clean all tables in the test database.
 * Order matters due to foreign key constraints.
 */
export async function cleanDatabase(): Promise<void> {
  const modelNames = [
    "notification",
    "dailyChallengeCompletion",
    "dailyChallenge",
    "loginStreak",
    "userVirtualItem",
    "virtualItem",
    "friendship",
    "contestParticipant",
    "contestProblem",
    "contest",
    "submission",
    "testCase",
    "problemTag",
    "tag",
    "problem",
    "pointHistory",
    "userAchievement",
    "achievement",
    "comment",
    "post",
    "user",
  ];

  for (const model of modelNames) {
    try {
      await (prisma as any)[model].deleteMany();
    } catch {
      // Model may not exist yet
    }
  }
}

/**
 * Disconnect from the test database.
 */
export async function disconnectDatabase(): Promise<void> {
  await prisma.$disconnect();
}

/**
 * Reset the database to a clean state.
 */
export async function resetDatabase(): Promise<void> {
  await cleanDatabase();
}

export { prisma };
