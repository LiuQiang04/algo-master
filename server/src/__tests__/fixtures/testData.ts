/**
 * Test fixtures - seed data for tests.
 * Provides consistent test data across all test suites.
 */

import { hashPassword } from "../helpers/authHelper";

// ==================== Users ====================

export const TEST_USERS = {
  admin: {
    username: "admin",
    email: "admin@algoarena.test",
    password: "Admin@123456",
    role: "admin",
    rating: 2000,
    level: 10,
    experiencePoints: 5000,
  },
  regular: {
    username: "regularuser",
    email: "user@algoarena.test",
    password: "User@123456",
    role: "user",
    rating: 1500,
    level: 1,
    experiencePoints: 0,
  },
  moderator: {
    username: "moderator",
    email: "mod@algoarena.test",
    password: "Mod@123456",
    role: "moderator",
    rating: 1800,
    level: 5,
    experiencePoints: 2000,
  },
};

// ==================== Problems ====================

export const TEST_PROBLEMS = {
  easy: {
    title: "A + B Problem",
    description: "Calculate the sum of two integers A and B.",
    inputFormat: "Two integers A and B separated by a space.",
    outputFormat: "Output the sum A + B.",
    sampleInput: "1 2",
    sampleOutput: "3",
    difficulty: 1,
    timeLimit: 1000,
    memoryLimit: 256,
    isPublic: true,
  },
  medium: {
    title: "Two Sum",
    description:
      "Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.",
    inputFormat:
      "First line: integer n (array size). Second line: n integers. Third line: target integer.",
    outputFormat: "Two indices separated by a space.",
    sampleInput: "4\n2 7 11 15\n9",
    sampleOutput: "0 1",
    difficulty: 3,
    timeLimit: 2000,
    memoryLimit: 256,
    isPublic: true,
  },
  hard: {
    title: "Median of Two Sorted Arrays",
    description:
      "Given two sorted arrays nums1 and nums2, return the median of the two sorted arrays.",
    inputFormat:
      "First line: sizes m and n. Second line: m integers. Third line: n integers.",
    outputFormat: "The median as a floating point number.",
    sampleInput: "2 1\n1 3\n2",
    sampleOutput: "2.0",
    difficulty: 5,
    timeLimit: 3000,
    memoryLimit: 512,
    isPublic: true,
  },
};

// ==================== Tags ====================

export const TEST_TAGS = [
  { name: "Array", category: "data-structure" },
  { name: "Hash Table", category: "data-structure" },
  { name: "Dynamic Programming", category: "algorithm" },
  { name: "Binary Search", category: "algorithm" },
  { name: "Sorting", category: "algorithm" },
  { name: "Greedy", category: "algorithm" },
  { name: "Graph", category: "data-structure" },
  { name: "Tree", category: "data-structure" },
];

// ==================== Test Cases ====================

export const TEST_CASES = {
  abProblem: [
    { input: "1 2", expectedOutput: "3", isSample: true, score: 10 },
    { input: "0 0", expectedOutput: "0", isSample: false, score: 10 },
    { input: "-1 1", expectedOutput: "0", isSample: false, score: 10 },
    { input: "100 200", expectedOutput: "300", isSample: false, score: 10 },
    { input: "-100 -200", expectedOutput: "-300", isSample: false, score: 10 },
  ],
  twoSum: [
    { input: "4\n2 7 11 15\n9", expectedOutput: "0 1", isSample: true, score: 20 },
    { input: "3\n3 2 4\n6", expectedOutput: "1 2", isSample: false, score: 20 },
    { input: "2\n3 3\n6", expectedOutput: "0 1", isSample: false, score: 20 },
  ],
};

// ==================== Submissions ====================

export const TEST_SUBMISSIONS = {
  correctCpp: {
    language: "cpp",
    sourceCode: `#include <iostream>
using namespace std;
int main() {
    int a, b;
    cin >> a >> b;
    cout << a + b << endl;
    return 0;
}`,
    status: "accepted",
  },
  wrongAnswer: {
    language: "python",
    sourceCode: `a, b = map(int, input().split())
print(a - b)  # Wrong: should be a + b`,
    status: "wrong_answer",
  },
  timeLimitExceeded: {
    language: "python",
    sourceCode: `import time
time.sleep(10)  # Deliberate timeout
a, b = map(int, input().split())
print(a + b)`,
    status: "time_limit_exceeded",
  },
};

// ==================== Contests ====================

export const TEST_CONTESTS = {
  upcoming: {
    title: "Weekly Contest #1",
    description: "A weekly algorithm contest for beginners.",
    startTime: new Date(Date.now() + 24 * 60 * 60 * 1000), // tomorrow
    endTime: new Date(Date.now() + 25 * 60 * 60 * 1000), // tomorrow + 1 hour
    isPublic: true,
    maxParticipants: 100,
  },
  ongoing: {
    title: "Live Contest",
    description: "An ongoing contest.",
    startTime: new Date(Date.now() - 60 * 60 * 1000), // 1 hour ago
    endTime: new Date(Date.now() + 60 * 60 * 1000), // 1 hour from now
    isPublic: true,
    maxParticipants: 50,
  },
  ended: {
    title: "Past Contest",
    description: "A completed contest.",
    startTime: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    endTime: new Date(Date.now() - 60 * 60 * 1000), // 1 hour ago
    isPublic: true,
    maxParticipants: 200,
  },
};

// ==================== Achievements ====================

export const TEST_ACHIEVEMENTS = {
  firstSolve: {
    name: "First Blood",
    description: "Solve your first problem.",
    category: "problem",
    rarity: "common",
    points: 10,
    requirement: { type: "solve_count", value: 1 },
    isActive: true,
  },
  tenSolves: {
    name: "Getting Started",
    description: "Solve 10 problems.",
    category: "problem",
    rarity: "common",
    points: 50,
    requirement: { type: "solve_count", value: 10 },
    isActive: true,
  },
  hundredSolves: {
    name: "Problem Crusher",
    description: "Solve 100 problems.",
    category: "problem",
    rarity: "rare",
    points: 200,
    requirement: { type: "solve_count", value: 100 },
    isActive: true,
  },
  contestWinner: {
    name: "Champion",
    description: "Win a contest.",
    category: "contest",
    rarity: "epic",
    points: 500,
    requirement: { type: "contest_win", value: 1 },
    isActive: true,
  },
};

// ==================== Community Posts ====================

export const TEST_POSTS = {
  discussion: {
    title: "How to approach DP problems?",
    content: "I'm struggling with dynamic programming. Any tips on how to get started?",
    postType: "discussion",
  },
  solution: {
    title: "A + B Problem - Python Solution",
    content: "Here is a simple Python solution:\n```python\na, b = map(int, input().split())\nprint(a + b)\n```",
    postType: "solution",
  },
  question: {
    title: "Why does my code get TLE?",
    content: "My solution for Two Sum is getting TLE. Can anyone help?",
    postType: "question",
  },
};

// ==================== Helper: Create full user with hashed password ====================

export async function createFullUserData(
  userKey: keyof typeof TEST_USERS
) {
  const user = TEST_USERS[userKey];
  const passwordHash = await hashPassword(user.password);
  return {
    username: user.username,
    email: user.email,
    passwordHash,
    rating: user.rating,
    level: user.level,
    experiencePoints: user.experiencePoints,
  };
}
