/* ============================================
   Algorithm Arena - TypeScript Type Definitions
   ============================================ */

// User Types
export interface User {
  id: number;
  username: string;
  email: string;
  avatar?: string;
  bio?: string;
  rating: number;
  rank: string;
  solvedCount: number;
  submissionCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface UserProfile extends User {
  recentSubmissions: Submission[];
  solvedProblems: number[];
  contestHistory: ContestParticipation[];
}

// Problem Types
export type Difficulty = 'easy' | 'medium' | 'hard';
export type ProblemStatus = 'solved' | 'attempted' | 'todo';

export interface Problem {
  id: number;
  title: string;
  slug: string;
  description: string;
  inputFormat: string;
  outputFormat: string;
  sampleInput: string;
  sampleOutput: string;
  hint?: string;
  difficulty: Difficulty;
  timeLimit: number;
  memoryLimit: number;
  tags: string[];
  solvedCount: number;
  submissionCount: number;
  acceptanceRate: number;
  createdAt: string;
}

export interface ProblemListItem {
  id: number;
  title: string;
  slug: string;
  difficulty: Difficulty;
  tags: string[];
  solvedCount: number;
  submissionCount: number;
  acceptanceRate: number;
  status?: ProblemStatus;
}

// Submission Types
export type SubmissionStatus =
  | 'pending'
  | 'judging'
  | 'accepted'
  | 'wrong_answer'
  | 'time_limit_exceeded'
  | 'memory_limit_exceeded'
  | 'runtime_error'
  | 'compile_error';

export type Language = 'cpp' | 'java' | 'python' | 'javascript';

export interface Submission {
  id: number;
  problemId: number;
  userId: number;
  language: Language;
  code: string;
  status: SubmissionStatus;
  executionTime?: number;
  memoryUsed?: number;
  testCasesPassed: number;
  totalTestCases: number;
  errorMessage?: string;
  submittedAt: string;
}

export interface SubmissionResult {
  submissionId: number;
  status: SubmissionStatus;
  executionTime?: number;
  memoryUsed?: number;
  testCasesPassed: number;
  totalTestCases: number;
  errorMessage?: string;
}

// Contest Types
export type ContestStatus = 'upcoming' | 'running' | 'ended';
export type ContestType = 'rated' | 'unrated';

export interface Contest {
  id: number;
  title: string;
  description: string;
  startTime: string;
  endTime: string;
  status: ContestStatus;
  type: ContestType;
  problemCount: number;
  participantCount: number;
  problems?: ContestProblem[];
}

export interface ContestProblem {
  id: number;
  contestId: number;
  problemId: number;
  label: string;
  points: number;
  problem?: ProblemListItem;
}

export interface ContestParticipation {
  contestId: number;
  contestTitle: string;
  rank: number;
  score: number;
  ratingChange: number;
  participatedAt: string;
}

export interface ContestStanding {
  rank: number;
  userId: number;
  username: string;
  score: number;
  penalty: number;
  problems: {
    label: string;
    status: 'solved' | 'attempted' | 'none';
    attempts: number;
    time?: number;
  }[];
}

// API Types
export interface ApiResponse<T> {
  code: number;
  message: string;
  data: T;
}

export interface PaginatedData<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface PaginationParams {
  page?: number;
  pageSize?: number;
}

// Auth Types
export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

// UI Types
export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
  id: string;
  type: ToastType;
  message: string;
  duration?: number;
}

export interface SelectOption {
  label: string;
  value: string | number;
}
