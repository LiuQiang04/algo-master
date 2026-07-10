/**
 * Unit tests for contestService.
 *
 * Tests: getContests, getContestById, joinContest, getContestRanking,
 *        getContestProblems
 *
 * Mocks: prisma (utils/prisma), gamification/points (dynamic import)
 */

// Mock modules before importing
jest.mock("../../utils/prisma", () => ({
  prisma: {
    contest: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      count: jest.fn(),
      create: jest.fn(),
    },
    contestParticipant: {
      findUnique: jest.fn(),
      create: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
    },
    submission: {
      findMany: jest.fn(),
    },
    contestProblem: {
      findMany: jest.fn(),
    },
  },
}));

jest.mock("../../services/gamification/points", () => ({
  addPoints: jest.fn(),
  POINT_RULES: { CONTEST_PARTICIPATE: 30 },
}));

import { prisma } from "../../utils/prisma";
import {
  getContests,
  getContestById,
  joinContest,
  getContestRanking,
  getContestProblems,
} from "../../services/contestService";
import { NotFoundError, BadRequestError } from "../../utils/errors";
import { addPoints } from "../../services/gamification/points";

const mockPrisma = prisma as jest.Mocked<typeof prisma>;
const mockAddPoints = addPoints as jest.Mock;

// Fixed current time — must remain constant across all tests
const NOW = new Date("2026-07-15T00:00:00Z");

const mockContest = {
  id: "contest-1",
  title: "Weekly Contest 1",
  description: "Test contest",
  startTime: new Date("2026-07-10T00:00:00Z"),
  endTime: new Date("2026-07-20T00:00:00Z"),
  isPublic: true,
  maxParticipants: 100,
  type: "rated",
  creatorId: "user-1",
  createdAt: new Date("2026-07-01T00:00:00Z"),
};

describe("contestService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    jest.setSystemTime(NOW);
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe("getContests", () => {
    const baseContestsData = [
      {
        id: "contest-1",
        title: "Weekly Contest 1",
        description: "Test contest",
        startTime: new Date("2026-07-10T00:00:00Z"),
        endTime: new Date("2026-07-20T00:00:00Z"),
        isPublic: true,
        maxParticipants: 100,
        type: "rated",
        creator: { id: "user-1", username: "testuser" },
        _count: { participants: 5, problems: 4 },
      },
    ];

    it("should return contests with default pagination", async () => {
      mockPrisma.contest.findMany.mockResolvedValue(baseContestsData);
      mockPrisma.contest.count.mockResolvedValue(1);

      const result = await getContests({});

      expect(mockPrisma.contest.findMany).toHaveBeenCalledWith({
        where: { isPublic: true },
        select: expect.any(Object),
        skip: 0,
        take: 20,
        orderBy: { startTime: "desc" },
      });
      expect(mockPrisma.contest.count).toHaveBeenCalledWith({
        where: { isPublic: true },
      });
      expect(result.contests).toHaveLength(1);
      expect(result.total).toBe(1);
      expect(result.page).toBe(1);
      expect(result.totalPages).toBe(1);
      expect(result.contests[0].status).toBe("ongoing");
    });

    it("should filter upcoming contests", async () => {
      const upcomingData = [
        {
          ...baseContestsData[0],
          startTime: new Date("2026-07-20T00:00:00Z"),
          endTime: new Date("2026-07-25T00:00:00Z"),
        },
      ];
      mockPrisma.contest.findMany.mockResolvedValue(upcomingData);
      mockPrisma.contest.count.mockResolvedValue(1);

      const result = await getContests({ status: "upcoming" });

      expect(mockPrisma.contest.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            isPublic: true,
            startTime: { gt: NOW },
          }),
        })
      );
      expect(result.contests[0].status).toBe("upcoming");
    });

    it("should filter ongoing contests", async () => {
      mockPrisma.contest.findMany.mockResolvedValue(baseContestsData);
      mockPrisma.contest.count.mockResolvedValue(1);

      const result = await getContests({ status: "ongoing" });

      expect(mockPrisma.contest.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            isPublic: true,
            startTime: { lte: NOW },
            endTime: { gte: NOW },
          }),
        })
      );
      expect(result.contests[0].status).toBe("ongoing");
    });

    it("should filter ended contests", async () => {
      const endedData = [
        {
          ...baseContestsData[0],
          startTime: new Date("2026-07-01T00:00:00Z"),
          endTime: new Date("2026-07-10T00:00:00Z"),
        },
      ];
      mockPrisma.contest.findMany.mockResolvedValue(endedData);
      mockPrisma.contest.count.mockResolvedValue(1);

      const result = await getContests({ status: "ended" });

      expect(mockPrisma.contest.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            isPublic: true,
            endTime: { lt: NOW },
          }),
        })
      );
      expect(result.contests[0].status).toBe("ended");
    });

    it("should handle custom pagination", async () => {
      mockPrisma.contest.findMany.mockResolvedValue([]);
      mockPrisma.contest.count.mockResolvedValue(50);

      const result = await getContests({ page: 3, limit: 10 });

      expect(mockPrisma.contest.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          skip: 20,
          take: 10,
        })
      );
      expect(result.page).toBe(3);
      expect(result.totalPages).toBe(5);
    });

    it("should return empty contests list when none match", async () => {
      mockPrisma.contest.findMany.mockResolvedValue([]);
      mockPrisma.contest.count.mockResolvedValue(0);

      const result = await getContests({});

      expect(result.contests).toEqual([]);
      expect(result.total).toBe(0);
      expect(result.totalPages).toBe(0);
    });
  });

  describe("getContestById", () => {
    it("should return contest with problems when found", async () => {
      const contestWithProblems = {
        ...mockContest,
        creator: { id: "user-1", username: "testuser" },
        problems: [
          {
            id: "cp-1",
            problemOrder: "A",
            score: 100,
            problem: { id: "prob-1", title: "Problem 1", difficulty: 2 },
          },
        ],
        _count: { participants: 5 },
      };
      mockPrisma.contest.findUnique.mockResolvedValue(contestWithProblems);

      const result = await getContestById("contest-1");

      expect(mockPrisma.contest.findUnique).toHaveBeenCalledWith({
        where: { id: "contest-1" },
        include: {
          creator: { select: { id: true, username: true } },
          problems: {
            select: {
              id: true,
              problemOrder: true,
              score: true,
              problem: { select: { id: true, title: true, difficulty: true } },
            },
            orderBy: { problemOrder: "asc" },
          },
          _count: { select: { participants: true } },
        },
      });
      expect(result.id).toBe("contest-1");
      expect(result.status).toBe("ongoing");
      expect(result.problems).toHaveLength(1);
      expect(result.problems[0].problem.title).toBe("Problem 1");
      expect(result.isParticipating).toBe(false);
      expect(result.userRank).toBeNull();
    });

    it("should check user participation when userId provided", async () => {
      const contestWithProblems = {
        ...mockContest,
        creator: { id: "user-1", username: "testuser" },
        problems: [],
        _count: { participants: 5 },
      };
      mockPrisma.contest.findUnique.mockResolvedValue(contestWithProblems);
      mockPrisma.contestParticipant.findUnique.mockResolvedValue({
        userId: "user-2",
        contestId: "contest-1",
        joinedAt: new Date("2026-07-12T00:00:00Z"),
        totalScore: 100,
        rank: 1,
      });

      const result = await getContestById("contest-1", "user-2");

      expect(result.isParticipating).toBe(true);
      expect(result.userRank).toBe(1);
    });

    it("should set userRank to null when participation found but rank is null", async () => {
      const contestWithProblems = {
        ...mockContest,
        creator: { id: "user-1", username: "testuser" },
        problems: [],
        _count: { participants: 5 },
      };
      mockPrisma.contest.findUnique.mockResolvedValue(contestWithProblems);
      mockPrisma.contestParticipant.findUnique.mockResolvedValue({
        userId: "user-2",
        contestId: "contest-1",
        joinedAt: new Date("2026-07-12T00:00:00Z"),
        totalScore: 0,
        rank: null,
      });

      const result = await getContestById("contest-1", "user-2");

      expect(result.isParticipating).toBe(true);
      expect(result.userRank).toBeNull();
    });

    it("should throw NotFoundError when contest not found", async () => {
      mockPrisma.contest.findUnique.mockResolvedValue(null);

      await expect(getContestById("nonexistent")).rejects.toThrow(NotFoundError);
    });
  });

  describe("joinContest", () => {
    it("should join contest successfully and award points", async () => {
      const contestWithParticipants = {
        ...mockContest,
        _count: { participants: 5 },
      };
      mockPrisma.contest.findUnique.mockResolvedValue(contestWithParticipants);
      mockPrisma.contestParticipant.findUnique.mockResolvedValue(null);
      mockPrisma.contestParticipant.create.mockResolvedValue({
        userId: "user-2",
        contestId: "contest-1",
        joinedAt: NOW,
        totalScore: 0,
        rank: null,
      });

      const result = await joinContest("contest-1", "user-2");

      expect(mockPrisma.contestParticipant.create).toHaveBeenCalledWith({
        data: { contestId: "contest-1", userId: "user-2" },
      });
      expect(mockAddPoints).toHaveBeenCalledWith(
        "user-2",
        30,
        "contest",
        "参加竞赛"
      );
      expect(result.userId).toBe("user-2");
      expect(result.totalScore).toBe(0);
    });

    it("should throw BadRequestError when already joined", async () => {
      const contestWithParticipants = {
        ...mockContest,
        _count: { participants: 5 },
      };
      mockPrisma.contest.findUnique.mockResolvedValue(contestWithParticipants);
      mockPrisma.contestParticipant.findUnique.mockResolvedValue({
        userId: "user-2",
        contestId: "contest-1",
        joinedAt: NOW,
        totalScore: 0,
        rank: null,
      });

      await expect(joinContest("contest-1", "user-2")).rejects.toThrow(
        "你已参加该竞赛"
      );
      expect(mockPrisma.contestParticipant.create).not.toHaveBeenCalled();
    });

    it("should throw BadRequestError when contest is full", async () => {
      const fullContest = {
        ...mockContest,
        maxParticipants: 5,
        _count: { participants: 5 },
      };
      mockPrisma.contest.findUnique.mockResolvedValue(fullContest);

      await expect(joinContest("contest-1", "user-2")).rejects.toThrow(
        "竞赛人数已满"
      );
      expect(mockPrisma.contestParticipant.create).not.toHaveBeenCalled();
    });

    it("should handle zero maxParticipants (unlimited)", async () => {
      const unlimitedContest = {
        ...mockContest,
        maxParticipants: null,
        _count: { participants: 999 },
      };
      mockPrisma.contest.findUnique.mockResolvedValue(unlimitedContest);
      mockPrisma.contestParticipant.findUnique.mockResolvedValue(null);
      mockPrisma.contestParticipant.create.mockResolvedValue({
        userId: "user-2",
        contestId: "contest-1",
        joinedAt: NOW,
        totalScore: 0,
        rank: null,
      });

      const result = await joinContest("contest-1", "user-2");

      expect(result.userId).toBe("user-2");
      expect(mockAddPoints).toHaveBeenCalled();
    });

    it("should throw BadRequestError when contest has ended", async () => {
      const endedContest = {
        ...mockContest,
        endTime: new Date("2026-07-10T00:00:00Z"),
        _count: { participants: 5 },
      };
      mockPrisma.contest.findUnique.mockResolvedValue(endedContest);

      await expect(joinContest("contest-1", "user-2")).rejects.toThrow(
        "竞赛已结束"
      );
      expect(mockPrisma.contestParticipant.create).not.toHaveBeenCalled();
    });

    it("should throw NotFoundError when contest does not exist", async () => {
      mockPrisma.contest.findUnique.mockResolvedValue(null);

      await expect(joinContest("nonexistent", "user-2")).rejects.toThrow(
        NotFoundError
      );
    });
  });

  describe("getContestRanking", () => {
    const contestWithProblems = {
      id: "contest-1",
      title: "Weekly Contest 1",
      startTime: new Date("2026-07-10T00:00:00Z"),
      endTime: new Date("2026-07-20T00:00:00Z"),
      isPublic: true,
      maxParticipants: 100,
      type: "rated",
      creatorId: "user-1",
      createdAt: new Date("2026-07-01T00:00:00Z"),
      problems: [
        { problemOrder: "A", score: 100, problem: { id: "prob-1" } },
        { problemOrder: "B", score: 200, problem: { id: "prob-2" } },
      ],
    };

    it("should return empty ranking when no participants", async () => {
      mockPrisma.contest.findUnique.mockResolvedValue(contestWithProblems);
      mockPrisma.contestParticipant.findMany.mockResolvedValue([]);

      const result = await getContestRanking("contest-1");

      expect(result).toEqual([]);
      expect(mockPrisma.submission.findMany).not.toHaveBeenCalled();
      expect(mockPrisma.contestParticipant.update).not.toHaveBeenCalled();
    });

    it("should compute rankings with submissions and results", async () => {
      const participants = [
        {
          userId: "user-1",
          contestId: "contest-1",
          totalScore: 0,
          rank: null,
          joinedAt: new Date("2026-07-10T10:00:00Z"),
          user: {
            id: "user-1",
            username: "alice",
            avatarUrl: null,
            level: 5,
          },
        },
        {
          userId: "user-2",
          contestId: "contest-1",
          totalScore: 0,
          rank: null,
          joinedAt: new Date("2026-07-10T10:00:00Z"),
          user: {
            id: "user-2",
            username: "bob",
            avatarUrl: null,
            level: 3,
          },
        },
      ];

      // Alice: solved A in 1 attempt (30min), solved B in 2 attempts (60min, 1 wrong)
      const aliceSubmissions = [
        {
          id: "sub-1",
          userId: "user-1",
          problemId: "prob-1",
          contestId: "contest-1",
          status: "accepted",
          score: 100,
          submittedAt: new Date("2026-07-10T10:30:00Z"),
        },
        {
          id: "sub-2",
          userId: "user-1",
          problemId: "prob-2",
          contestId: "contest-1",
          status: "wrong",
          score: 0,
          submittedAt: new Date("2026-07-10T10:45:00Z"),
        },
        {
          id: "sub-3",
          userId: "user-1",
          problemId: "prob-2",
          contestId: "contest-1",
          status: "accepted",
          score: 200,
          submittedAt: new Date("2026-07-10T11:00:00Z"),
        },
      ];

      // Bob: solved A in 2 attempts (90min, 1 wrong), attempted B (1 wrong)
      const bobSubmissions = [
        {
          id: "sub-4",
          userId: "user-2",
          problemId: "prob-1",
          contestId: "contest-1",
          status: "wrong",
          score: 0,
          submittedAt: new Date("2026-07-10T10:20:00Z"),
        },
        {
          id: "sub-5",
          userId: "user-2",
          problemId: "prob-1",
          contestId: "contest-1",
          status: "accepted",
          score: 100,
          submittedAt: new Date("2026-07-10T11:30:00Z"),
        },
        {
          id: "sub-6",
          userId: "user-2",
          problemId: "prob-2",
          contestId: "contest-1",
          status: "wrong",
          score: 0,
          submittedAt: new Date("2026-07-10T11:45:00Z"),
        },
      ];

      mockPrisma.contest.findUnique.mockResolvedValue(contestWithProblems);
      mockPrisma.contestParticipant.findMany.mockResolvedValue(participants);
      // One call per participant (in order)
      mockPrisma.submission.findMany
        .mockResolvedValueOnce(aliceSubmissions)
        .mockResolvedValueOnce(bobSubmissions);
      mockPrisma.contestParticipant.update.mockResolvedValue({});

      const result = await getContestRanking("contest-1");

      expect(result).toHaveLength(2);

      // Alice: totalScore=300, penalty = (630+0) + (660+20*1) = 1310
      expect(result[0].rank).toBe(1);
      expect(result[0].userId).toBe("user-1");
      expect(result[0].username).toBe("alice");
      expect(result[0].level).toBe(5);
      expect(result[0].totalScore).toBe(300);
      expect(result[0].penalty).toBe(1310);
      expect(result[0].problems).toHaveLength(2);
      expect(result[0].problems[0].label).toBe("A");
      expect(result[0].problems[0].status).toBe("solved");
      expect(result[0].problems[0].attempts).toBe(1);
      expect(result[0].problems[0].time).toBe(630);
      expect(result[0].problems[1].label).toBe("B");
      expect(result[0].problems[1].status).toBe("solved");
      expect(result[0].problems[1].attempts).toBe(2);
      expect(result[0].problems[1].time).toBe(660);

      // Bob: totalScore=100, penalty=(690+20*1)=710
      expect(result[1].rank).toBe(2);
      expect(result[1].userId).toBe("user-2");
      expect(result[1].username).toBe("bob");
      expect(result[1].totalScore).toBe(100);
      expect(result[1].penalty).toBe(710);
      expect(result[1].problems[0].label).toBe("A");
      expect(result[1].problems[0].status).toBe("solved");
      expect(result[1].problems[0].attempts).toBe(2);
      expect(result[1].problems[0].time).toBe(690);
      expect(result[1].problems[1].label).toBe("B");
      expect(result[1].problems[1].status).toBe("attempted");
      expect(result[1].problems[1].attempts).toBe(1);

      // Verify batch update of rankings
      expect(mockPrisma.contestParticipant.update).toHaveBeenCalledTimes(2);
      expect(mockPrisma.contestParticipant.update).toHaveBeenCalledWith({
        where: { contestId_userId: { contestId: "contest-1", userId: "user-1" } },
        data: { rank: 1, totalScore: 300 },
      });
    });

    it("should handle participants with no submissions", async () => {
      const singleParticipant = [
        {
          userId: "user-1",
          contestId: "contest-1",
          totalScore: 0,
          rank: null,
          joinedAt: new Date("2026-07-10T10:00:00Z"),
          user: {
            id: "user-1",
            username: "alice",
            avatarUrl: null,
            level: 5,
          },
        },
      ];

      mockPrisma.contest.findUnique.mockResolvedValue(contestWithProblems);
      mockPrisma.contestParticipant.findMany.mockResolvedValue(
        singleParticipant
      );
      // No submissions
      mockPrisma.submission.findMany.mockResolvedValue([]);
      mockPrisma.contestParticipant.update.mockResolvedValue({});

      const result = await getContestRanking("contest-1");

      expect(result).toHaveLength(1);
      expect(result[0].totalScore).toBe(0);
      expect(result[0].penalty).toBe(0);
      expect(result[0].problems[0].status).toBe("none");
      expect(result[0].problems[0].attempts).toBe(0);
    });

    it("should throw NotFoundError when contest does not exist", async () => {
      mockPrisma.contest.findUnique.mockResolvedValue(null);

      await expect(getContestRanking("nonexistent")).rejects.toThrow(
        NotFoundError
      );
    });
  });

  describe("getContestProblems", () => {
    const contestStarted = {
      ...mockContest,
      startTime: new Date("2026-07-10T00:00:00Z"),
    };

    it("should return problems for a started contest", async () => {
      mockPrisma.contest.findUnique.mockResolvedValue(contestStarted);
      mockPrisma.contestProblem.findMany.mockResolvedValue([
        {
          problemOrder: "A",
          score: 100,
          problem: {
            id: "prob-1",
            title: "Problem 1",
            difficulty: 2,
            timeLimit: 1000,
            memoryLimit: 256,
          },
        },
      ]);

      const result = await getContestProblems("contest-1");

      expect(result).toHaveLength(1);
      expect(result[0].order).toBe("A");
      expect(result[0].score).toBe(100);
      expect(result[0].title).toBe("Problem 1");
      expect(result[0].difficulty).toBe(2);
      expect(result[0].userStatus).toBeNull();
    });

    it("should include user submissions when userId provided", async () => {
      mockPrisma.contest.findUnique.mockResolvedValue(contestStarted);
      mockPrisma.contestProblem.findMany.mockResolvedValue([
        {
          problemOrder: "A",
          score: 100,
          problemId: "prob-1",
          problem: {
            id: "prob-1",
            title: "Problem 1",
            difficulty: 2,
            timeLimit: 1000,
            memoryLimit: 256,
          },
        },
      ]);
      mockPrisma.submission.findMany.mockResolvedValue([
        {
          problemId: "prob-1",
          status: "accepted",
          score: 100,
          submittedAt: new Date("2026-07-10T10:30:00Z"),
        },
      ]);

      const result = await getContestProblems("contest-1", "user-1");

      expect(result[0].userStatus).not.toBeNull();
      expect(result[0].userStatus.status).toBe("accepted");
      expect(result[0].userStatus.score).toBe(100);
    });

    it("should throw NotFoundError when contest does not exist", async () => {
      mockPrisma.contest.findUnique.mockResolvedValue(null);

      await expect(getContestProblems("nonexistent")).rejects.toThrow(
        NotFoundError
      );
    });

    it("should throw BadRequestError when contest has not started", async () => {
      const notStartedContest = {
        ...mockContest,
        startTime: new Date("2026-07-20T00:00:00Z"),
      };
      mockPrisma.contest.findUnique.mockResolvedValue(notStartedContest);

      await expect(getContestProblems("contest-1")).rejects.toThrow(
        "竞赛尚未开始"
      );
    });
  });
});
