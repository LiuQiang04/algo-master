/**
 * General test utilities for backend tests.
 */

import { PrismaClient } from "@prisma/client";

/**
 * Wait for a condition to be met with polling.
 */
export async function waitFor(
  condition: () => Promise<boolean>,
  timeout: number = 5000,
  interval: number = 100
): Promise<void> {
  const start = Date.now();
  while (Date.now() - start < timeout) {
    if (await condition()) return;
    await new Promise((resolve) => setTimeout(resolve, interval));
  }
  throw new Error(`waitFor timed out after ${timeout}ms`);
}

/**
 * Generate a random string of given length.
 */
export function randomString(length: number = 10): string {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

/**
 * Generate a random email address.
 */
export function randomEmail(): string {
  return `test-${randomString(8)}@example.com`;
}

/**
 * Generate a random username.
 */
export function randomUsername(): string {
  return `user_${randomString(8)}`;
}

/**
 * Create a user in the database for testing.
 */
export async function createTestUser(
  prisma: PrismaClient,
  overrides: {
    username?: string;
    email?: string;
    passwordHash?: string;
    rating?: number;
    level?: number;
    experiencePoints?: number;
  } = {}
) {
  const bcrypt = require("bcrypt");
  const passwordHash = overrides.passwordHash || (await bcrypt.hash("Test@123456", 10));

  return prisma.user.create({
    data: {
      username: overrides.username || randomUsername(),
      email: overrides.email || randomEmail(),
      passwordHash,
      rating: overrides.rating ?? 1500,
      level: overrides.level ?? 1,
      experiencePoints: overrides.experiencePoints ?? 0,
    },
  });
}

/**
 * Create a problem in the database for testing.
 */
export async function createTestProblem(
  prisma: PrismaClient,
  authorId: string,
  overrides: {
    title?: string;
    difficulty?: number;
    isPublic?: boolean;
  } = {}
) {
  return prisma.problem.create({
    data: {
      title: overrides.title || `Test Problem ${randomString(5)}`,
      description: "This is a test problem description.",
      inputFormat: "Standard input",
      outputFormat: "Standard output",
      sampleInput: "1",
      sampleOutput: "1",
      difficulty: overrides.difficulty ?? 1,
      timeLimit: 1000,
      memoryLimit: 256,
      authorId,
      isPublic: overrides.isPublic ?? true,
    },
  });
}

/**
 * Create a post in the database for testing.
 */
export async function createTestPost(
  prisma: PrismaClient,
  userId: string,
  overrides: {
    title?: string;
    postType?: string;
  } = {}
) {
  return prisma.post.create({
    data: {
      userId,
      title: overrides.title || `Test Post ${randomString(5)}`,
      content: "This is a test post content.",
      postType: overrides.postType || "discussion",
    },
  });
}

/**
 * Create a submission in the database for testing.
 */
export async function createTestSubmission(
  prisma: PrismaClient,
  userId: string,
  problemId: string,
  overrides: {
    language?: string;
    status?: string;
    score?: number;
  } = {}
) {
  return prisma.submission.create({
    data: {
      userId,
      problemId,
      language: overrides.language || "python",
      sourceCode: "print('hello')",
      status: overrides.status || "pending",
      score: overrides.score ?? 0,
    },
  });
}

/**
 * Assert that a response has expected status and structure.
 */
export function expectSuccessResponse(body: any, statusCode: number = 200) {
  expect(body).toBeDefined();
  // Common success patterns
  if (statusCode === 201) {
    expect(body).toHaveProperty("id");
  }
}

/**
 * Assert that a response is an error response.
 */
export function expectErrorResponse(body: any, statusCode: number) {
  expect(body).toBeDefined();
  expect(body).toHaveProperty("error");
}
