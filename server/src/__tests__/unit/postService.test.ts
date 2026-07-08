/**
 * Unit tests for postService.updateComment.
 * Tests the comment editing functionality.
 *
 * Mocks: prisma (utils/prisma), errors (utils/errors)
 */

// Mock modules before importing
jest.mock("../../utils/prisma", () => ({
  prisma: {
    comment: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
  },
}));

jest.mock("../../utils/logger", () => ({
  logger: { info: jest.fn(), warn: jest.fn(), error: jest.fn() },
  createModuleLogger: jest.fn(() => ({ info: jest.fn(), warn: jest.fn(), error: jest.fn() })),
}));

import { prisma } from "../../utils/prisma";
import { updateComment } from "../../services/postService";
import { NotFoundError, ForbiddenError, BadRequestError } from "../../utils/errors";

const mockPrisma = prisma as jest.Mocked<typeof prisma>;

describe("postService.updateComment", () => {
  const mockComment = {
    id: "comment-1",
    userId: "user-1",
    postId: "post-1",
    parentCommentId: null,
    content: "Original comment content",
    createdAt: new Date("2026-01-01"),
  };

  const mockUpdatedComment = {
    ...mockComment,
    content: "Updated comment content",
  };

  const mockCommentWithUser = {
    ...mockUpdatedComment,
    user: {
      id: "user-1",
      username: "testuser",
      avatarUrl: "https://example.com/avatar.png",
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("should update comment successfully when user is the owner", async () => {
    mockPrisma.comment.findUnique.mockResolvedValue(mockComment);
    mockPrisma.comment.update.mockResolvedValue(mockCommentWithUser);

    const result = await updateComment("comment-1", "user-1", "Updated comment content");

    expect(mockPrisma.comment.findUnique).toHaveBeenCalledWith({
      where: { id: "comment-1" },
    });
    expect(mockPrisma.comment.update).toHaveBeenCalledWith({
      where: { id: "comment-1" },
      data: { content: "Updated comment content" },
      include: {
        user: {
          select: { id: true, username: true, avatarUrl: true },
        },
      },
    });
    expect(result).toEqual(mockCommentWithUser);
  });

  test("should throw NotFoundError when comment does not exist", async () => {
    mockPrisma.comment.findUnique.mockResolvedValue(null);

    await expect(updateComment("nonexistent", "user-1", "Content")).rejects.toThrow(NotFoundError);
    expect(mockPrisma.comment.update).not.toHaveBeenCalled();
  });

  test("should throw ForbiddenError when user is not the owner", async () => {
    mockPrisma.comment.findUnique.mockResolvedValue(mockComment);

    await expect(updateComment("comment-1", "other-user", "Content")).rejects.toThrow(ForbiddenError);
    expect(mockPrisma.comment.update).not.toHaveBeenCalled();
  });

  test("should throw BadRequestError when content is empty", async () => {
    mockPrisma.comment.findUnique.mockResolvedValue(mockComment);

    await expect(updateComment("comment-1", "user-1", "")).rejects.toThrow(BadRequestError);
    expect(mockPrisma.comment.update).not.toHaveBeenCalled();
  });

  test("should throw BadRequestError when content is only whitespace", async () => {
    mockPrisma.comment.findUnique.mockResolvedValue(mockComment);

    await expect(updateComment("comment-1", "user-1", "   ")).rejects.toThrow(BadRequestError);
    expect(mockPrisma.comment.update).not.toHaveBeenCalled();
  });

  test("should throw BadRequestError when content exceeds 10000 characters", async () => {
    mockPrisma.comment.findUnique.mockResolvedValue(mockComment);
    const longContent = "a".repeat(10001);

    await expect(updateComment("comment-1", "user-1", longContent)).rejects.toThrow(BadRequestError);
    expect(mockPrisma.comment.update).not.toHaveBeenCalled();
  });

  test("should allow content up to 10000 characters", async () => {
    mockPrisma.comment.findUnique.mockResolvedValue(mockComment);
    mockPrisma.comment.update.mockResolvedValue(mockCommentWithUser);
    const maxContent = "a".repeat(10000);

    const result = await updateComment("comment-1", "user-1", maxContent);

    expect(mockPrisma.comment.update).toHaveBeenCalled();
    expect(result).toEqual(mockCommentWithUser);
  });
});
