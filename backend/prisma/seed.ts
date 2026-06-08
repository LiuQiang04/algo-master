/**
 * ============================================================
 * Algo OJ - Database Seed Script
 * ============================================================
 * Creates sample data for development and testing:
 *   - 5 users (1 admin, 1 moderator, 3 regular users)
 *   - 20 tags across 4 categories
 *   - 10 problems with test cases
 *   - 5 achievements
 *   - 2 contests with participants
 *   - Sample posts and comments
 *   - Learning paths with modules
 *   - Virtual items
 *   - Point history entries
 *
 * Usage: npm run db:seed
 * ============================================================
 */

import { PrismaClient } from "@prisma/client";
import * as bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  console.log("Starting database seed...\n");

  // ============================================================
  // 1. Clean existing data (in correct order for FK constraints)
  // ============================================================
  console.log("[1/9] Cleaning existing data...");
  await prisma.notification.deleteMany();
  await prisma.friendship.deleteMany();
  await prisma.userVirtualItem.deleteMany();
  await prisma.virtualItem.deleteMany();
  await prisma.loginStreak.deleteMany();
  await prisma.dailyChallengeCompletion.deleteMany();
  await prisma.dailyChallenge.deleteMany();
  await prisma.pointHistory.deleteMany();
  await prisma.learningProgress.deleteMany();
  await prisma.moduleProblem.deleteMany();
  await prisma.learningModule.deleteMany();
  await prisma.learningPath.deleteMany();
  await prisma.userAchievement.deleteMany();
  await prisma.achievement.deleteMany();
  await prisma.comment.deleteMany();
  await prisma.post.deleteMany();
  await prisma.contestParticipant.deleteMany();
  await prisma.contestProblem.deleteMany();
  await prisma.contest.deleteMany();
  await prisma.submission.deleteMany();
  await prisma.testCase.deleteMany();
  await prisma.problemTag.deleteMany();
  await prisma.problem.deleteMany();
  await prisma.tag.deleteMany();
  await prisma.user.deleteMany();

  // ============================================================
  // 2. Create Users
  // ============================================================
  console.log("[2/9] Creating users...");
  const passwordHash = await bcrypt.hash("password123", 10);

  const users = await Promise.all([
    prisma.user.create({
      data: {
        username: "admin",
        email: "admin@algo-oj.com",
        passwordHash,
        bio: "System administrator",
        rating: 3000,
        experiencePoints: 50000,
        level: 50,
        role: "admin",
      },
    }),
    prisma.user.create({
      data: {
        username: "moderator",
        email: "mod@algo-oj.com",
        passwordHash,
        bio: "Community moderator and problem setter",
        rating: 2500,
        experiencePoints: 30000,
        level: 35,
        role: "moderator",
      },
    }),
    prisma.user.create({
      data: {
        username: "alice_wang",
        email: "alice@example.com",
        passwordHash,
        bio: "Competitive programming enthusiast",
        rating: 2100,
        experiencePoints: 15000,
        level: 20,
      },
    }),
    prisma.user.create({
      data: {
        username: "bob_zhang",
        email: "bob@example.com",
        passwordHash,
        bio: "Beginner learning algorithms",
        rating: 1200,
        experiencePoints: 3000,
        level: 5,
      },
    }),
    prisma.user.create({
      data: {
        username: "charlie_li",
        email: "charlie@example.com",
        passwordHash,
        bio: "Data structure lover",
        rating: 1800,
        experiencePoints: 8000,
        level: 12,
      },
    }),
  ]);

  const [admin, moderator, alice, bob, charlie] = users;
  console.log(`  Created ${users.length} users`);

  // ============================================================
  // 3. Create Tags
  // ============================================================
  console.log("[3/9] Creating tags...");

  const tagData = [
    // Algorithm category
    { name: "Sorting", category: "algorithm" },
    { name: "Binary Search", category: "algorithm" },
    { name: "Dynamic Programming", category: "algorithm" },
    { name: "Greedy", category: "algorithm" },
    { name: "DFS", category: "algorithm" },
    { name: "BFS", category: "algorithm" },
    { name: "Two Pointers", category: "algorithm" },
    { name: "Divide and Conquer", category: "algorithm" },
    // Data structure category
    { name: "Array", category: "data_structure" },
    { name: "Linked List", category: "data_structure" },
    { name: "Stack", category: "data_structure" },
    { name: "Queue", category: "data_structure" },
    { name: "Tree", category: "data_structure" },
    { name: "Graph", category: "data_structure" },
    { name: "Hash Table", category: "data_structure" },
    { name: "Heap", category: "data_structure" },
    // Math category
    { name: "Number Theory", category: "math" },
    { name: "Combinatorics", category: "math" },
    // Topic category
    { name: "String", category: "topic" },
    { name: "Simulation", category: "topic" },
  ];

  const tags = await Promise.all(
    tagData.map((t) => prisma.tag.create({ data: t }))
  );
  console.log(`  Created ${tags.length} tags`);

  // ============================================================
  // 4. Create Problems with Test Cases
  // ============================================================
  console.log("[4/9] Creating problems...");

  const problems = await Promise.all([
    // Problem 1: A+B (beginner)
    prisma.problem.create({
      data: {
        title: "A+B Problem",
        description:
          "Given two integers A and B, compute and output A+B.\n\nThis is the most classic introductory problem in competitive programming.",
        inputFormat:
          "The input contains two integers A and B separated by a space (-1000 <= A, B <= 1000).",
        outputFormat: "Output a single integer representing A+B.",
        sampleInput: "1 2",
        sampleOutput: "3",
        hint: "Use standard input/output to read two numbers and print their sum.",
        difficulty: 1,
        timeLimit: 1000,
        memoryLimit: 256,
        authorId: admin.id,
        testCases: {
          create: [
            {
              input: "1 2",
              expectedOutput: "3",
              isSample: true,
              score: 10,
              order: 1,
            },
            {
              input: "0 0",
              expectedOutput: "0",
              isSample: true,
              score: 10,
              order: 2,
            },
            {
              input: "-1 1",
              expectedOutput: "0",
              isSample: false,
              score: 20,
              order: 3,
            },
            {
              input: "999 1",
              expectedOutput: "1000",
              isSample: false,
              score: 20,
              order: 4,
            },
            {
              input: "-500 -500",
              expectedOutput: "-1000",
              isSample: false,
              score: 40,
              order: 5,
            },
          ],
        },
      },
    }),
    // Problem 2: Fibonacci
    prisma.problem.create({
      data: {
        title: "Fibonacci Number",
        description:
          "The Fibonacci sequence is defined as: F(0) = 0, F(1) = 1, F(n) = F(n-1) + F(n-2) for n >= 2.\n\nGiven n, compute F(n).",
        inputFormat: "A single integer n (0 <= n <= 45).",
        outputFormat: "Output F(n).",
        sampleInput: "10",
        sampleOutput: "55",
        hint: "Use dynamic programming or iteration to avoid exponential time complexity.",
        difficulty: 2,
        timeLimit: 1000,
        memoryLimit: 256,
        authorId: moderator.id,
        testCases: {
          create: [
            {
              input: "0",
              expectedOutput: "0",
              isSample: true,
              score: 10,
              order: 1,
            },
            {
              input: "1",
              expectedOutput: "1",
              isSample: true,
              score: 10,
              order: 2,
            },
            {
              input: "10",
              expectedOutput: "55",
              isSample: true,
              score: 20,
              order: 3,
            },
            {
              input: "20",
              expectedOutput: "6765",
              isSample: false,
              score: 20,
              order: 4,
            },
            {
              input: "45",
              expectedOutput: "1134903170",
              isSample: false,
              score: 40,
              order: 5,
            },
          ],
        },
      },
    }),
    // Problem 3: Maximum Subarray Sum
    prisma.problem.create({
      data: {
        title: "Maximum Subarray Sum",
        description:
          "Given an array of n integers (may include negative numbers), find the contiguous subarray with the largest sum and output that sum.",
        inputFormat:
          "First line: integer n (1 <= n <= 10^5). Second line: n integers separated by spaces (-10^4 <= each <= 10^4).",
        outputFormat: "Output the maximum subarray sum.",
        sampleInput: "5\n-2 1 -3 4 -1 2 1 -5 4",
        sampleOutput: "6",
        hint: "Kadane algorithm: maintain a running sum and reset it to 0 when it becomes negative.",
        difficulty: 3,
        timeLimit: 1000,
        memoryLimit: 256,
        authorId: admin.id,
        testCases: {
          create: [
            {
              input: "9\n-2 1 -3 4 -1 2 1 -5 4",
              expectedOutput: "6",
              isSample: true,
              score: 20,
              order: 1,
            },
            {
              input: "1\n-1",
              expectedOutput: "-1",
              isSample: false,
              score: 20,
              order: 2,
            },
            {
              input: "5\n1 2 3 4 5",
              expectedOutput: "15",
              isSample: false,
              score: 20,
              order: 3,
            },
            {
              input: "5\n-1 -2 -3 -4 -5",
              expectedOutput: "-1",
              isSample: false,
              score: 40,
              order: 4,
            },
          ],
        },
      },
    }),
    // Problem 4: Binary Search
    prisma.problem.create({
      data: {
        title: "Binary Search",
        description:
          "Given a sorted array of n integers and q queries. For each query integer x, determine if x exists in the array. Output YES or NO for each query.",
        inputFormat:
          "First line: n and q. Second line: n sorted integers. Next q lines: one integer per query.",
        outputFormat: "For each query, output YES or NO on a new line.",
        sampleInput: "5 3\n1 3 5 7 9\n3\n4\n9",
        sampleOutput: "YES\nNO\nYES",
        hint: "Implement standard binary search with O(log n) per query.",
        difficulty: 2,
        timeLimit: 1000,
        memoryLimit: 256,
        authorId: moderator.id,
        testCases: {
          create: [
            {
              input: "5 3\n1 3 5 7 9\n3\n4\n9",
              expectedOutput: "YES\nNO\nYES",
              isSample: true,
              score: 25,
              order: 1,
            },
            {
              input: "1 1\n42\n42",
              expectedOutput: "YES",
              isSample: false,
              score: 25,
              order: 2,
            },
            {
              input: "3 3\n10 20 30\n5\n15\n30",
              expectedOutput: "NO\nNO\nYES",
              isSample: false,
              score: 50,
              order: 3,
            },
          ],
        },
      },
    }),
    // Problem 5: Linked List Reversal
    prisma.problem.create({
      data: {
        title: "Reverse a Linked List",
        description:
          "Given a singly linked list, reverse it and return the reversed list. Input is given as an array of values followed by the position of the head node.",
        inputFormat:
          "First line: n (number of nodes). Second line: n values. Third line: head position (0-indexed).",
        outputFormat: "Output the values of the reversed list separated by spaces.",
        sampleInput: "5\n1 2 3 4 5\n0",
        sampleOutput: "5 4 3 2 1",
        hint: "Use three pointers: prev, current, next to reverse the links.",
        difficulty: 2,
        timeLimit: 1000,
        memoryLimit: 256,
        authorId: alice.id,
        testCases: {
          create: [
            {
              input: "5\n1 2 3 4 5\n0",
              expectedOutput: "5 4 3 2 1",
              isSample: true,
              score: 30,
              order: 1,
            },
            {
              input: "1\n42\n0",
              expectedOutput: "42",
              isSample: false,
              score: 30,
              order: 2,
            },
            {
              input: "3\n10 20 30\n0",
              expectedOutput: "30 20 10",
              isSample: false,
              score: 40,
              order: 3,
            },
          ],
        },
      },
    }),
    // Problem 6: Shortest Path (BFS)
    prisma.problem.create({
      data: {
        title: "Shortest Path in Unweighted Graph",
        description:
          "Given an unweighted directed graph with n nodes and m edges, find the shortest path from node 1 to node n. Output -1 if no path exists.",
        inputFormat:
          "First line: n and m. Next m lines: two integers u v representing a directed edge from u to v.",
        outputFormat: "Output the shortest distance from 1 to n, or -1.",
        sampleInput: "5 6\n1 2\n1 3\n2 4\n3 4\n4 5\n3 5",
        sampleOutput: "3",
        hint: "Use BFS to find the shortest path in an unweighted graph.",
        difficulty: 3,
        timeLimit: 1000,
        memoryLimit: 256,
        authorId: moderator.id,
        testCases: {
          create: [
            {
              input: "5 6\n1 2\n1 3\n2 4\n3 4\n4 5\n3 5",
              expectedOutput: "3",
              isSample: true,
              score: 25,
              order: 1,
            },
            {
              input: "3 1\n1 2",
              expectedOutput: "-1",
              isSample: false,
              score: 25,
              order: 2,
            },
            {
              input: "2 1\n1 2",
              expectedOutput: "1",
              isSample: false,
              score: 25,
              order: 3,
            },
            {
              input: "4 0",
              expectedOutput: "-1",
              isSample: false,
              score: 25,
              order: 4,
            },
          ],
        },
      },
    }),
    // Problem 7: Knapsack Problem
    prisma.problem.create({
      data: {
        title: "0/1 Knapsack",
        description:
          "Given n items, each with a weight and a value, determine the maximum value that can be obtained by selecting items whose total weight does not exceed W. Each item can be selected at most once.",
        inputFormat:
          "First line: n and W. Next n lines: weight and value of each item.",
        outputFormat: "Output the maximum value.",
        sampleInput: "4 7\n1 1\n3 4\n4 5\n5 7",
        sampleOutput: "9",
        hint: "Classic dynamic programming. dp[i][w] = max value using first i items with capacity w.",
        difficulty: 3,
        timeLimit: 1000,
        memoryLimit: 256,
        authorId: admin.id,
        testCases: {
          create: [
            {
              input: "4 7\n1 1\n3 4\n4 5\n5 7",
              expectedOutput: "9",
              isSample: true,
              score: 25,
              order: 1,
            },
            {
              input: "1 10\n5 100",
              expectedOutput: "100",
              isSample: false,
              score: 25,
              order: 2,
            },
            {
              input: "3 5\n2 3\n3 4\n4 5",
              expectedOutput: "7",
              isSample: false,
              score: 50,
              order: 3,
            },
          ],
        },
      },
    }),
    // Problem 8: Stack - Valid Parentheses
    prisma.problem.create({
      data: {
        title: "Valid Parentheses",
        description:
          "Given a string containing only '(', ')', '{', '}', '[', ']', determine if the input string is valid. An input string is valid if open brackets are closed by the same type of brackets and in the correct order.",
        inputFormat: "A single line containing the string s (1 <= |s| <= 10^4).",
        outputFormat: "Output YES if valid, NO otherwise.",
        sampleInput: "({[]})",
        sampleOutput: "YES",
        hint: "Use a stack. Push opening brackets, pop and match closing brackets.",
        difficulty: 2,
        timeLimit: 1000,
        memoryLimit: 256,
        authorId: alice.id,
        testCases: {
          create: [
            {
              input: "({[]})",
              expectedOutput: "YES",
              isSample: true,
              score: 20,
              order: 1,
            },
            {
              input: "(]",
              expectedOutput: "NO",
              isSample: true,
              score: 20,
              order: 2,
            },
            {
              input: "()[]{}",
              expectedOutput: "YES",
              isSample: false,
              score: 20,
              order: 3,
            },
            {
              input: "([)]",
              expectedOutput: "NO",
              isSample: false,
              score: 20,
              order: 4,
            },
            {
              input: "",
              expectedOutput: "YES",
              isSample: false,
              score: 20,
              order: 5,
            },
          ],
        },
      },
    }),
    // Problem 9: Greedy - Activity Selection
    prisma.problem.create({
      data: {
        title: "Activity Selection Problem",
        description:
          "Given n activities with start and end times, find the maximum number of non-overlapping activities that can be performed.",
        inputFormat:
          "First line: n. Next n lines: start_time end_time for each activity.",
        outputFormat: "Output the maximum number of activities.",
        sampleInput: "4\n1 3\n2 4\n3 5\n4 6",
        sampleOutput: "2",
        hint: "Greedy: always pick the activity with the earliest end time.",
        difficulty: 3,
        timeLimit: 1000,
        memoryLimit: 256,
        authorId: moderator.id,
        testCases: {
          create: [
            {
              input: "4\n1 3\n2 4\n3 5\n4 6",
              expectedOutput: "2",
              isSample: true,
              score: 25,
              order: 1,
            },
            {
              input: "3\n1 10\n2 3\n4 5",
              expectedOutput: "2",
              isSample: false,
              score: 25,
              order: 2,
            },
            {
              input: "1\n1 100",
              expectedOutput: "1",
              isSample: false,
              score: 25,
              order: 3,
            },
            {
              input: "5\n1 2\n2 3\n3 4\n4 5\n5 6",
              expectedOutput: "5",
              isSample: false,
              score: 25,
              order: 4,
            },
          ],
        },
      },
    }),
    // Problem 10: DP - Longest Common Subsequence
    prisma.problem.create({
      data: {
        title: "Longest Common Subsequence",
        description:
          "Given two strings, find the length of their longest common subsequence.",
        inputFormat: "Two lines, each containing a string (length <= 1000).",
        outputFormat: "Output the length of the LCS.",
        sampleInput: "abcde\nace",
        sampleOutput: "3",
        hint: "Classic 2D DP. dp[i][j] = LCS length of first i chars of s1 and first j chars of s2.",
        difficulty: 4,
        timeLimit: 2000,
        memoryLimit: 512,
        authorId: admin.id,
        testCases: {
          create: [
            {
              input: "abcde\nace",
              expectedOutput: "3",
              isSample: true,
              score: 25,
              order: 1,
            },
            {
              input: "abc\nabc",
              expectedOutput: "3",
              isSample: false,
              score: 25,
              order: 2,
            },
            {
              input: "abc\ndef",
              expectedOutput: "0",
              isSample: false,
              score: 25,
              order: 3,
            },
            {
              input: "abcdef\nacf",
              expectedOutput: "3",
              isSample: false,
              score: 25,
              order: 4,
            },
          ],
        },
      },
    }),
  ]);

  console.log(`  Created ${problems.length} problems with test cases`);

  // Associate tags with problems
  const tagMap = Object.fromEntries(tags.map((t) => [t.name, t.id]));

  const problemTagAssociations = [
    { problemId: problems[0].id, tagId: tagMap["Simulation"] },
    { problemId: problems[1].id, tagId: tagMap["Dynamic Programming"] },
    { problemId: problems[1].id, tagId: tagMap["Array"] },
    { problemId: problems[2].id, tagId: tagMap["Dynamic Programming"] },
    { problemId: problems[2].id, tagId: tagMap["Array"] },
    { problemId: problems[2].id, tagId: tagMap["Two Pointers"] },
    { problemId: problems[3].id, tagId: tagMap["Binary Search"] },
    { problemId: problems[3].id, tagId: tagMap["Array"] },
    { problemId: problems[4].id, tagId: tagMap["Linked List"] },
    { problemId: problems[4].id, tagId: tagMap["Two Pointers"] },
    { problemId: problems[5].id, tagId: tagMap["BFS"] },
    { problemId: problems[5].id, tagId: tagMap["Graph"] },
    { problemId: problems[6].id, tagId: tagMap["Dynamic Programming"] },
    { problemId: problems[7].id, tagId: tagMap["Stack"] },
    { problemId: problems[7].id, tagId: tagMap["String"] },
    { problemId: problems[8].id, tagId: tagMap["Greedy"] },
    { problemId: problems[9].id, tagId: tagMap["Dynamic Programming"] },
    { problemId: problems[9].id, tagId: tagMap["String"] },
  ];

  await prisma.problemTag.createMany({ data: problemTagAssociations });
  console.log(`  Created ${problemTagAssociations.length} problem-tag associations`);

  // ============================================================
  // 5. Create Achievements
  // ============================================================
  console.log("[5/9] Creating achievements...");

  const achievements = await Promise.all([
    prisma.achievement.create({
      data: {
        name: "First Blood",
        description: "Solve your first problem",
        iconUrl: "/icons/first-blood.svg",
        category: "submission",
        condition: JSON.stringify({ type: "solve_count", threshold: 1 }),
        points: 10,
      },
    }),
    prisma.achievement.create({
      data: {
        name: "Problem Solver",
        description: "Solve 10 problems",
        iconUrl: "/icons/problem-solver.svg",
        category: "submission",
        condition: JSON.stringify({ type: "solve_count", threshold: 10 }),
        points: 50,
      },
    }),
    prisma.achievement.create({
      data: {
        name: "Speed Demon",
        description: "Solve a problem in under 100ms execution time",
        iconUrl: "/icons/speed-demon.svg",
        category: "submission",
        condition: JSON.stringify({
          type: "execution_time",
          threshold: 100,
        }),
        points: 30,
      },
    }),
    prisma.achievement.create({
      data: {
        name: "Contest Warrior",
        description: "Participate in 5 contests",
        iconUrl: "/icons/contest-warrior.svg",
        category: "contest",
        condition: JSON.stringify({
          type: "contest_count",
          threshold: 5,
        }),
        points: 40,
      },
    }),
    prisma.achievement.create({
      data: {
        name: "Community Star",
        description: "Create 10 posts or comments",
        iconUrl: "/icons/community-star.svg",
        category: "community",
        condition: JSON.stringify({
          type: "post_count",
          threshold: 10,
        }),
        points: 30,
      },
    }),
  ]);

  console.log(`  Created ${achievements.length} achievements`);

  // Unlock achievements for some users
  await prisma.userAchievement.createMany({
    data: [
      { userId: alice.id, achievementId: achievements[0].id },
      { userId: alice.id, achievementId: achievements[1].id },
      { userId: bob.id, achievementId: achievements[0].id },
      { userId: charlie.id, achievementId: achievements[0].id },
    ],
  });

  // ============================================================
  // 6. Create Contests
  // ============================================================
  console.log("[6/9] Creating contests...");

  const now = new Date();
  const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  const dayAfterTomorrow = new Date(now.getTime() + 48 * 60 * 60 * 1000);
  const lastWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const lastWeekEnd = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000 + 3 * 60 * 60 * 1000);

  const contest1 = await prisma.contest.create({
    data: {
      title: "Weekly Contest #1 - Basics",
      description: "A beginner-friendly contest covering basic algorithms and data structures.",
      startTime: tomorrow,
      endTime: dayAfterTomorrow,
      creatorId: admin.id,
      isPublic: true,
      maxParticipants: 100,
      status: "upcoming",
    },
  });

  const contest2 = await prisma.contest.create({
    data: {
      title: "DP Challenge",
      description: "Test your dynamic programming skills!",
      startTime: lastWeek,
      endTime: lastWeekEnd,
      creatorId: moderator.id,
      isPublic: true,
      status: "ended",
    },
  });

  // Add problems to contests
  await prisma.contestProblem.createMany({
    data: [
      {
        contestId: contest1.id,
        problemId: problems[0].id,
        problemOrder: "A",
        score: 100,
      },
      {
        contestId: contest1.id,
        problemId: problems[1].id,
        problemOrder: "B",
        score: 200,
      },
      {
        contestId: contest1.id,
        problemId: problems[3].id,
        problemOrder: "C",
        score: 300,
      },
      {
        contestId: contest2.id,
        problemId: problems[1].id,
        problemOrder: "A",
        score: 100,
      },
      {
        contestId: contest2.id,
        problemId: problems[6].id,
        problemOrder: "B",
        score: 200,
      },
      {
        contestId: contest2.id,
        problemId: problems[9].id,
        problemOrder: "C",
        score: 300,
      },
    ],
  });

  // Add participants to the ended contest
  await prisma.contestParticipant.createMany({
    data: [
      {
        contestId: contest2.id,
        userId: alice.id,
        totalScore: 500,
        rank: 1,
        penalty: 120,
      },
      {
        contestId: contest2.id,
        userId: charlie.id,
        totalScore: 300,
        rank: 2,
        penalty: 240,
      },
      {
        contestId: contest2.id,
        userId: bob.id,
        totalScore: 100,
        rank: 3,
        penalty: 480,
      },
    ],
  });

  // Add sample submissions
  await prisma.submission.createMany({
    data: [
      {
        userId: alice.id,
        problemId: problems[0].id,
        language: "cpp",
        sourceCode: '#include <iostream>\nint main() { int a, b; std::cin >> a >> b; std::cout << a + b; return 0; }',
        status: "accepted",
        executionTime: 12,
        memoryUsed: 1024,
        score: 100,
      },
      {
        userId: bob.id,
        problemId: problems[0].id,
        language: "python",
        sourceCode: "a, b = map(int, input().split())\nprint(a + b)",
        status: "accepted",
        executionTime: 45,
        memoryUsed: 3072,
        score: 100,
      },
      {
        userId: bob.id,
        problemId: problems[1].id,
        language: "python",
        sourceCode: "n = int(input())\na, b = 0, 1\nfor _ in range(n): a, b = b, a + b\nprint(a)",
        status: "wrong_answer",
        executionTime: 30,
        memoryUsed: 3072,
        score: 0,
        judgeOutput: "Test case 1: Expected 0, got 1",
      },
    ],
  });

  console.log("  Created contests, participants, and submissions");

  // ============================================================
  // 7. Create Community Posts
  // ============================================================
  console.log("[7/9] Creating community posts...");

  const post1 = await prisma.post.create({
    data: {
      userId: alice.id,
      title: "How to approach DP problems?",
      content:
        "I have been struggling with dynamic programming problems. Can anyone share some tips on how to identify DP problems and come up with the recurrence relation?",
      postType: "question",
      upvotes: 15,
      viewCount: 120,
    },
  });

  await prisma.post.create({
    data: {
      userId: moderator.id,
      title: "[Solution] Maximum Subarray Sum - Kadane Algorithm Explained",
      content:
        "In this post, I will explain the Kadane algorithm for finding the maximum subarray sum.\n\nThe key insight is: if the running sum becomes negative, we reset it to 0 because any subarray starting with a negative sum can be improved by starting fresh.",
      problemId: problems[2].id,
      postType: "solution",
      upvotes: 32,
      viewCount: 256,
    },
  });

  await prisma.post.create({
    data: {
      userId: charlie.id,
      title: "Welcome to Algo OJ!",
      content:
        "Welcome everyone! This is the place to discuss algorithms, share solutions, and help each other grow. Feel free to ask questions and share your knowledge.",
      postType: "discussion",
      isPinned: true,
      upvotes: 45,
      viewCount: 500,
    },
  });

  // Add comments
  await prisma.comment.create({
    data: {
      userId: moderator.id,
      postId: post1.id,
      content:
        "Great question! Start by looking for optimal substructure and overlapping subproblems. Try to define the state and transition equation first.",
      upvotes: 8,
    },
  });

  await prisma.comment.create({
    data: {
      userId: bob.id,
      postId: post1.id,
      content: "Thanks! I will practice more DP problems from the problem set.",
      upvotes: 3,
    },
  });

  console.log("  Created posts and comments");

  // ============================================================
  // 8. Create Learning Paths, Virtual Items, Point History
  // ============================================================
  console.log("[8/9] Creating learning paths...");

  const learningPath = await prisma.learningPath.create({
    data: {
      title: "Algorithm Fundamentals",
      description: "A structured path to learn basic algorithms and data structures from scratch.",
      difficulty: 1,
      sortOrder: 1,
      isPublished: true,
    },
  });

  const module1 = await prisma.learningModule.create({
    data: {
      pathId: learningPath.id,
      title: "Basic Data Structures",
      description: "Learn arrays, linked lists, stacks, and queues.",
      sortOrder: 1,
    },
  });

  const module2 = await prisma.learningModule.create({
    data: {
      pathId: learningPath.id,
      title: "Basic Algorithms",
      description: "Learn sorting, binary search, and greedy algorithms.",
      sortOrder: 2,
    },
  });

  await prisma.moduleProblem.createMany({
    data: [
      { moduleId: module1.id, problemId: problems[0].id, sortOrder: 1 },
      { moduleId: module1.id, problemId: problems[4].id, sortOrder: 2 },
      { moduleId: module1.id, problemId: problems[7].id, sortOrder: 3 },
      { moduleId: module2.id, problemId: problems[3].id, sortOrder: 1 },
      { moduleId: module2.id, problemId: problems[8].id, sortOrder: 2 },
      { moduleId: module2.id, problemId: problems[2].id, sortOrder: 3 },
    ],
  });

  // Learning progress for bob (beginner)
  await prisma.learningProgress.create({
    data: {
      userId: bob.id,
      pathId: learningPath.id,
      moduleId: module1.id,
      status: "in_progress",
      progress: 33,
      startedAt: new Date(),
    },
  });

  console.log("  Created learning paths and modules");

  // Virtual items
  console.log("[9/9] Creating virtual items and point history...");

  const virtualItems = await Promise.all([
    prisma.virtualItem.create({
      data: {
        name: "Golden Crown",
        description: "A prestigious golden crown badge for top performers.",
        type: "badge",
        rarity: "legendary",
        iconUrl: "/icons/golden-crown.svg",
        price: 1000,
      },
    }),
    prisma.virtualItem.create({
      data: {
        name: "Bronze Shield",
        description: "A bronze shield badge for dedicated learners.",
        type: "badge",
        rarity: "common",
        iconUrl: "/icons/bronze-shield.svg",
        price: 100,
      },
    }),
    prisma.virtualItem.create({
      data: {
        name: "Code Master Title",
        description: "An exclusive title for coding masters.",
        type: "title",
        rarity: "epic",
        iconUrl: "/icons/code-master.svg",
        price: 500,
      },
    }),
  ]);

  // Give alice some virtual items
  await prisma.userVirtualItem.create({
    data: {
      userId: alice.id,
      itemId: virtualItems[0].id,
      isEquipped: true,
    },
  });

  await prisma.userVirtualItem.create({
    data: {
      userId: bob.id,
      itemId: virtualItems[1].id,
      isEquipped: true,
    },
  });

  // Point history
  await prisma.pointHistory.createMany({
    data: [
      { userId: alice.id, points: 100, type: "solve", description: "Solved A+B Problem" },
      { userId: alice.id, points: 200, type: "contest", description: "DP Challenge - 1st place" },
      { userId: alice.id, points: 50, type: "daily", description: "Daily challenge completed" },
      { userId: bob.id, points: 100, type: "solve", description: "Solved A+B Problem" },
      { userId: bob.id, points: 50, type: "achievement", description: "Unlocked: First Blood" },
      { userId: charlie.id, points: 100, type: "contest", description: "DP Challenge - 2nd place" },
    ],
  });

  // Login streaks
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  await prisma.loginStreak.create({
    data: {
      userId: alice.id,
      loginDate: today,
      streakDays: 7,
    },
  });

  // Notification
  await prisma.notification.create({
    data: {
      userId: bob.id,
      type: "achievement",
      title: "Achievement Unlocked!",
      content: 'You have unlocked the "First Blood" achievement!',
    },
  });

  console.log("  Created virtual items, point history, login streaks, notifications");

  console.log("\nSeed completed successfully!");
  console.log("Summary:");
  console.log(`  Users: ${users.length}`);
  console.log(`  Tags: ${tags.length}`);
  console.log(`  Problems: ${problems.length}`);
  console.log(`  Achievements: ${achievements.length}`);
  console.log("  Contests: 2");
  console.log("  Posts: 3");
  console.log("  Comments: 2");
  console.log("  Learning Paths: 1 (with 2 modules)");
  console.log(`  Virtual Items: ${virtualItems.length}`);
  console.log("  Point History: 6 entries");
  console.log("  Login Streaks: 1");
  console.log("  Notifications: 1");
  console.log("\nDefault password for all users: password123");
}

main()
  .catch((e) => {
    console.error("Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
