/**
 * Test database seed script.
 * Populates the test database with consistent test data.
 *
 * Usage:
 *   DATABASE_URL="postgresql://postgres:postgres@localhost:5432/algo_arena_test?schema=public" npx tsx scripts/seed-test-db.ts
 */

import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding test database...");

  // Clean existing data
  await cleanDatabase();

  // Seed users
  const users = await seedUsers();
  console.log(`  Created ${users.length} users`);

  // Seed tags
  const tags = await seedTags();
  console.log(`  Created ${tags.length} tags`);

  // Seed problems
  const problems = await seedProblems(users.admin.id);
  console.log(`  Created ${problems.length} problems`);

  // Link tags to problems
  await seedProblemTags(problems, tags);
  console.log("  Linked tags to problems");

  // Seed test cases
  const testCases = await seedTestCases(problems);
  console.log(`  Created ${testCases.length} test cases`);

  // Seed achievements
  const achievements = await seedAchievements();
  console.log(`  Created ${achievements.length} achievements`);

  // Seed virtual items
  const virtualItems = await seedVirtualItems();
  console.log(`  Created ${virtualItems.length} virtual items`);

  // Seed contests
  const contests = await seedContests(users.admin.id);
  console.log(`  Created ${contests.length} contests`);

  // Seed posts
  const posts = await seedPosts(users.regular.id);
  console.log(`  Created ${posts.length} posts`);

  console.log("Test database seeding complete!");
}

async function cleanDatabase() {
  const tables = [
    "notifications",
    "daily_challenge_completions",
    "daily_challenges",
    "login_streaks",
    "user_virtual_items",
    "virtual_items",
    "friendships",
    "contest_participants",
    "contest_problems",
    "contests",
    "submissions",
    "test_cases",
    "problem_tags",
    "tags",
    "problems",
    "point_history",
    "user_achievements",
    "achievements",
    "comments",
    "posts",
    "users",
  ];

  for (const table of tables) {
    await prisma.$executeRawUnsafe(`DELETE FROM "${table}"`);
  }
}

async function seedUsers() {
  const passwordHash = await bcrypt.hash("Test@123456", 10);

  const admin = await prisma.user.create({
    data: {
      username: "testadmin",
      email: "admin@test.algoarena",
      passwordHash,
      rating: 2200,
      level: 15,
      experiencePoints: 8000,
    },
  });

  const regular = await prisma.user.create({
    data: {
      username: "testuser",
      email: "user@test.algoarena",
      passwordHash,
      rating: 1500,
      level: 3,
      experiencePoints: 500,
    },
  });

  const moderator = await prisma.user.create({
    data: {
      username: "testmod",
      email: "mod@test.algoarena",
      passwordHash,
      rating: 1800,
      level: 8,
      experiencePoints: 3000,
    },
  });

  return { admin, regular, moderator };
}

async function seedTags() {
  const tagData = [
    { name: "Array", category: "data-structure" },
    { name: "Hash Table", category: "data-structure" },
    { name: "Dynamic Programming", category: "algorithm" },
    { name: "Binary Search", category: "algorithm" },
    { name: "Sorting", category: "algorithm" },
    { name: "Greedy", category: "algorithm" },
    { name: "Graph", category: "data-structure" },
    { name: "Tree", category: "data-structure" },
    { name: "String", category: "data-structure" },
    { name: "Math", category: "topic" },
  ];

  const tags = [];
  for (const td of tagData) {
    tags.push(await prisma.tag.create({ data: td }));
  }
  return tags;
}

async function seedProblems(authorId: string) {
  const easy = await prisma.problem.create({
    data: {
      title: "A + B Problem",
      description: "Calculate the sum of two integers A and B.",
      inputFormat: "Two integers A and B separated by a space.",
      outputFormat: "Output the sum A + B.",
      sampleInput: "1 2",
      sampleOutput: "3",
      difficulty: 1,
      timeLimit: 1000,
      memoryLimit: 256,
      authorId,
      isPublic: true,
    },
  });

  const medium = await prisma.problem.create({
    data: {
      title: "Two Sum",
      description:
        "Given an array of integers nums and an integer target, return indices of the two numbers that add up to target.",
      inputFormat: "First line: n. Second line: n integers. Third line: target.",
      outputFormat: "Two indices separated by space.",
      sampleInput: "4\n2 7 11 15\n9",
      sampleOutput: "0 1",
      difficulty: 3,
      timeLimit: 2000,
      memoryLimit: 256,
      authorId,
      isPublic: true,
    },
  });

  const hard = await prisma.problem.create({
    data: {
      title: "Median of Two Sorted Arrays",
      description: "Find the median of two sorted arrays.",
      inputFormat: "First line: m n. Second line: m integers. Third line: n integers.",
      outputFormat: "The median as a float.",
      sampleInput: "2 1\n1 3\n2",
      sampleOutput: "2.0",
      difficulty: 5,
      timeLimit: 3000,
      memoryLimit: 512,
      authorId,
      isPublic: true,
    },
  });

  return { easy, medium, hard };
}

async function seedProblemTags(problems: any, tags: any[]) {
  // A+B: Math
  await prisma.problemTag.create({
    data: { problemId: problems.easy.id, tagId: tags[9].id }, // Math
  });
  // Two Sum: Array, Hash Table
  await prisma.problemTag.create({
    data: { problemId: problems.medium.id, tagId: tags[0].id }, // Array
  });
  await prisma.problemTag.create({
    data: { problemId: problems.medium.id, tagId: tags[1].id }, // Hash Table
  });
  // Median: Binary Search, Array
  await prisma.problemTag.create({
    data: { problemId: problems.hard.id, tagId: tags[3].id }, // Binary Search
  });
  await prisma.problemTag.create({
    data: { problemId: problems.hard.id, tagId: tags[0].id }, // Array
  });
}

async function seedTestCases(problems: any) {
  const testCases = [];

  // A + B test cases
  const abCases = [
    { problemId: problems.easy.id, input: "1 2", expectedOutput: "3", isSample: true, score: 20 },
    { problemId: problems.easy.id, input: "0 0", expectedOutput: "0", isSample: false, score: 20 },
    { problemId: problems.easy.id, input: "-1 1", expectedOutput: "0", isSample: false, score: 20 },
    { problemId: problems.easy.id, input: "100 200", expectedOutput: "300", isSample: false, score: 20 },
    { problemId: problems.easy.id, input: "-50 -50", expectedOutput: "-100", isSample: false, score: 20 },
  ];

  for (const tc of abCases) {
    testCases.push(await prisma.testCase.create({ data: tc }));
  }

  // Two Sum test cases
  const tsCases = [
    { problemId: problems.medium.id, input: "4\n2 7 11 15\n9", expectedOutput: "0 1", isSample: true, score: 34 },
    { problemId: problems.medium.id, input: "3\n3 2 4\n6", expectedOutput: "1 2", isSample: false, score: 33 },
    { problemId: problems.medium.id, input: "2\n3 3\n6", expectedOutput: "0 1", isSample: false, score: 33 },
  ];

  for (const tc of tsCases) {
    testCases.push(await prisma.testCase.create({ data: tc }));
  }

  return testCases;
}

async function seedAchievements() {
  const achievementData = [
    {
      name: "First Blood",
      description: "Solve your first problem.",
      category: "problem",
      rarity: "common",
      points: 10,
      requirement: { type: "solve_count", value: 1 },
    },
    {
      name: "Getting Started",
      description: "Solve 10 problems.",
      category: "problem",
      rarity: "common",
      points: 50,
      requirement: { type: "solve_count", value: 10 },
    },
    {
      name: "Problem Crusher",
      description: "Solve 100 problems.",
      category: "problem",
      rarity: "rare",
      points: 200,
      requirement: { type: "solve_count", value: 100 },
    },
    {
      name: "Champion",
      description: "Win a contest.",
      category: "contest",
      rarity: "epic",
      points: 500,
      requirement: { type: "contest_win", value: 1 },
    },
    {
      name: "Social Butterfly",
      description: "Make 50 community posts.",
      category: "social",
      rarity: "rare",
      points: 150,
      requirement: { type: "post_count", value: 50 },
    },
    {
      name: "Streak Master",
      description: "Maintain a 30-day login streak.",
      category: "special",
      rarity: "legendary",
      points: 1000,
      requirement: { type: "login_streak", value: 30 },
    },
  ];

  const achievements = [];
  for (const ad of achievementData) {
    achievements.push(await prisma.achievement.create({ data: ad }));
  }
  return achievements;
}

async function seedVirtualItems() {
  const itemData = [
    { name: "Bronze Badge", description: "A bronze badge for beginners.", type: "badge", rarity: "common", price: 0 },
    { name: "Silver Badge", description: "A silver badge for intermediate users.", type: "badge", rarity: "common", price: 100 },
    { name: "Gold Badge", description: "A gold badge for advanced users.", type: "badge", rarity: "rare", price: 500 },
    { name: "Code Master Title", description: "Exclusive title for top coders.", type: "title", rarity: "epic", price: 1000 },
    { name: "Avatar Frame - Fire", description: "A fiery avatar frame.", type: "frame", rarity: "rare", price: 300 },
  ];

  const items = [];
  for (const id of itemData) {
    items.push(await prisma.virtualItem.create({ data: id }));
  }
  return items;
}

async function seedContests(creatorId: string) {
  const now = new Date();

  const upcoming = await prisma.contest.create({
    data: {
      title: "Weekly Contest #1",
      description: "A weekly algorithm contest for beginners.",
      startTime: new Date(now.getTime() + 24 * 60 * 60 * 1000),
      endTime: new Date(now.getTime() + 25 * 60 * 60 * 1000),
      creatorId,
      isPublic: true,
      maxParticipants: 100,
    },
  });

  const ongoing = await prisma.contest.create({
    data: {
      title: "Live Practice Contest",
      description: "An ongoing practice contest.",
      startTime: new Date(now.getTime() - 60 * 60 * 1000),
      endTime: new Date(now.getTime() + 60 * 60 * 1000),
      creatorId,
      isPublic: true,
      maxParticipants: 50,
    },
  });

  return { upcoming, ongoing };
}

async function seedPosts(authorId: string) {
  const postData = [
    {
      userId: authorId,
      title: "How to approach DP problems?",
      content: "I'm struggling with dynamic programming. Any tips on how to get started?",
      postType: "discussion",
    },
    {
      userId: authorId,
      title: "A + B Problem - Python Solution",
      content: "Here is a simple Python solution:\n```python\na, b = map(int, input().split())\nprint(a + b)\n```",
      postType: "solution",
    },
  ];

  const posts = [];
  for (const pd of postData) {
    posts.push(await prisma.post.create({ data: pd }));
  }
  return posts;
}

main()
  .catch((e) => {
    console.error("Error seeding test database:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
