/**
 * Unit tests for submissionService.
 * Tests createSubmission (with queue integration) and runSample.
 *
 * Mocks: prisma (utils/prisma), judgeQueue, dockerJudge, errors (utils/errors)
 */

// Mock modules before importing
jest.mock("../../utils/prisma", () => ({
  prisma: {
    problem: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    submission: {
      create: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
    },
  },
}));

jest.mock("../../utils/logger", () => ({
  logger: { info: jest.fn(), warn: jest.fn(), error: jest.fn() },
  createModuleLogger: jest.fn(() => ({
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  })),
}));

jest.mock("../../queues/judgeQueue", () => ({
  addJudgeTask: jest.fn(),
  judgeQueue: {},
  closeJudgeQueue: jest.fn(),
}));

jest.mock("../../services/judge/dockerJudge", () => ({
  judge: jest.fn(),
  TestCaseResult: {},
}));

import { prisma } from "../../utils/prisma";
import { createSubmission, runSample } from "../../services/submissionService";
import { NotFoundError, BadRequestError } from "../../utils/errors";
import { addJudgeTask } from "../../queues/judgeQueue";
import { judge } from "../../services/judge/dockerJudge";

const mockPrisma = prisma as jest.Mocked<typeof prisma>;
const mockAddJudgeTask = addJudgeTask as jest.Mock;
const mockJudge = judge as jest.Mock;

const mockProblem = {
  id: "problem-1",
  title: "A+B Problem",
  description: "Calculate a + b",
  inputFormat: "a b",
  outputFormat: "a+b",
  sampleInput: "1 2",
  sampleOutput: "3",
  difficulty: 1,
  timeLimit: 1000,
  memoryLimit: 256,
  authorId: "user-1",
  isPublic: true,
  solveCount: 0,
  submitCount: 0,
  stdCode: null,
  stdLanguage: null,
  createdAt: new Date("2026-01-01"),
  updatedAt: new Date("2026-01-01"),
  testCases: [
    {
      id: "tc-1",
      problemId: "problem-1",
      input: "1 2",
      expectedOutput: "3",
      isSample: true,
      score: 1,
    },
    {
      id: "tc-2",
      problemId: "problem-1",
      input: "5 3",
      expectedOutput: "8",
      isSample: false,
      score: 1,
    },
  ],
};

const mockSubmission = {
  id: "sub-1",
  userId: "user-1",
  problemId: "problem-1",
  language: "cpp",
  sourceCode: '#include <iostream>\nint main() { int a,b; std::cin>>a>>b; std::cout<<a+b; }',
  status: "pending",
  executionTime: null,
  memoryUsed: null,
  score: 0,
  submittedAt: new Date("2026-07-09"),
  contestId: null,
};

describe("submissionService", () => {
  const OLD_ENV = process.env;

  beforeEach(() => {
    jest.clearAllMocks();
    process.env = { ...OLD_ENV };
  });

  afterAll(() => {
    process.env = OLD_ENV;
  });

  describe("createSubmission", () => {
    const createData = {
      userId: "user-1",
      problemId: "problem-1",
      language: "cpp",
      sourceCode: '#include <iostream>\nint main() { int a,b; std::cin>>a>>b; std::cout<<a+b; }',
    };

    it("should create submission and add judge task when JUDGE_MODE is not simulate", async () => {
      delete process.env.JUDGE_MODE;
      mockPrisma.problem.findUnique.mockResolvedValue(mockProblem);
      mockPrisma.submission.create.mockResolvedValue(mockSubmission);
      mockAddJudgeTask.mockResolvedValue(undefined);

      const result = await createSubmission(createData);

      expect(mockPrisma.problem.findUnique).toHaveBeenCalledWith({
        where: { id: "problem-1" },
        include: { testCases: true },
      });
      expect(mockPrisma.submission.create).toHaveBeenCalledWith({
        data: {
          userId: "user-1",
          problemId: "problem-1",
          language: "cpp",
          sourceCode: createData.sourceCode,
          status: "pending",
          contestId: undefined,
        },
      });
      expect(mockPrisma.problem.update).toHaveBeenCalledWith({
        where: { id: "problem-1" },
        data: { submitCount: { increment: 1 } },
      });
      expect(mockAddJudgeTask).toHaveBeenCalledWith("sub-1");
      expect(result).toEqual(mockSubmission);
    });

    it("should create submission without adding judge task when JUDGE_MODE=simulate", async () => {
      process.env.JUDGE_MODE = "simulate";
      mockPrisma.problem.findUnique.mockResolvedValue(mockProblem);
      mockPrisma.submission.create.mockResolvedValue(mockSubmission);

      const result = await createSubmission(createData);

      expect(mockPrisma.submission.create).toHaveBeenCalled();
      expect(mockAddJudgeTask).not.toHaveBeenCalled();
      expect(result).toEqual(mockSubmission);
    });

    it("should throw NotFoundError when problem does not exist", async () => {
      mockPrisma.problem.findUnique.mockResolvedValue(null);

      await expect(createSubmission(createData)).rejects.toThrow(NotFoundError);
      expect(mockPrisma.submission.create).not.toHaveBeenCalled();
    });

    it("should throw BadRequestError for unsupported language", async () => {
      mockPrisma.problem.findUnique.mockResolvedValue(mockProblem);

      await expect(
        createSubmission({ ...createData, language: "rust" })
      ).rejects.toThrow(BadRequestError);
      expect(mockPrisma.submission.create).not.toHaveBeenCalled();
    });
  });

  describe("runSample", () => {
    const sampleData = {
      problemId: "problem-1",
      language: "cpp",
      sourceCode: '#include <iostream>\nint main() { int a,b; std::cin>>a>>b; std::cout<<a+b; }',
    };

    it("should run sample test cases and return results", async () => {
      const problemWithSamples = {
        ...mockProblem,
        testCases: [
          {
            id: "tc-1",
            problemId: "problem-1",
            input: "1 2",
            expectedOutput: "3",
            isSample: true,
            score: 1,
          },
        ],
      };
      mockPrisma.problem.findUnique.mockResolvedValue(problemWithSamples);
      mockJudge.mockResolvedValue({
        compileError: null,
        results: [
          {
            input: "1 2",
            expectedOutput: "3",
            actualOutput: "3",
            passed: true,
            runtime: 12,
            memory: null,
            errorMessage: null,
          },
        ],
        summary: { passed: 1, total: 1 },
      });

      const result = await runSample(sampleData);

      expect(mockPrisma.problem.findUnique).toHaveBeenCalledWith({
        where: { id: "problem-1" },
        include: {
          testCases: {
            where: { isSample: true },
          },
        },
      });
      expect(mockJudge).toHaveBeenCalledWith({
        language: "cpp",
        code: sampleData.sourceCode,
        testCases: [{ input: "1 2", expectedOutput: "3" }],
        timeLimit: 1000,
        memoryLimit: 256,
      });
      expect(result.compileError).toBeNull();
      expect(result.results).toHaveLength(1);
      expect(result.results[0].passed).toBe(true);
      expect(result.results[0].actualOutput).toBe("3");
    });

    it("should return empty results when there are no sample test cases", async () => {
      const problemNoSamples = {
        ...mockProblem,
        testCases: [],
      };
      mockPrisma.problem.findUnique.mockResolvedValue(problemNoSamples);

      const result = await runSample(sampleData);

      expect(mockJudge).not.toHaveBeenCalled();
      expect(result.compileError).toBeNull();
      expect(result.results).toEqual([]);
    });

    it("should throw NotFoundError when problem does not exist", async () => {
      mockPrisma.problem.findUnique.mockResolvedValue(null);

      await expect(runSample(sampleData)).rejects.toThrow(NotFoundError);
      expect(mockJudge).not.toHaveBeenCalled();
    });

    it("should propagate compile errors from judge", async () => {
      const problemWithSamples = {
        ...mockProblem,
        testCases: [
          {
            id: "tc-1",
            problemId: "problem-1",
            input: "1 2",
            expectedOutput: "3",
            isSample: true,
            score: 1,
          },
        ],
      };
      mockPrisma.problem.findUnique.mockResolvedValue(problemWithSamples);
      mockJudge.mockResolvedValue({
        compileError: "Compilation error: syntax error",
        results: [],
        summary: { passed: 0, total: 1 },
      });

      const result = await runSample(sampleData);

      expect(result.compileError).toBe("Compilation error: syntax error");
      expect(result.results).toEqual([]);
    });
  });
});
