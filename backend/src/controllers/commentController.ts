import { Request, Response } from "express";
import prisma from "../lib/prisma.js";
import { sendSuccess, sendError, sendPaginated } from "../utils/response.js";
import logger from "../utils/logger.js";

function param(req: Request, name: string): string {
  const v = req.params[name];
  return Array.isArray(v) ? v[0] : (v as string);
}

// Create a comment (supports nested replies)
export async function createComment(req: Request, res: Response) {
  try {
    const postId = param(req, "postId");
    const { content, parentCommentId } = req.body;
    const userId = req.user!.id;

    const post = await prisma.post.findUnique({ where: { id: postId } });
    if (!post) return sendError(res, "Post not found", 404);

    if (parentCommentId) {
      const parent = await prisma.comment.findUnique({ where: { id: parentCommentId } });
      if (!parent || parent.postId !== postId) {
        return sendError(res, "Parent comment not found", 404);
      }
    }

    const comment = await prisma.comment.create({
      data: {
        userId,
        postId,
        content,
        parentCommentId: parentCommentId || null,
      },
      include: {
        user: { select: { id: true, username: true, avatarUrl: true, level: true } },
        _count: { select: { replies: true, votes: true } },
      },
    });

    // Create activity
    await prisma.activity.create({
      data: {
        userId,
        type: "comment",
        targetId: comment.id,
        targetType: "comment",
        metadata: JSON.stringify({ postId }),
      },
    });

    // Notify post author (if not commenting on own post)
    if (post.userId !== userId) {
      await prisma.notification.create({
        data: {
          userId: post.userId,
          type: "comment",
          title: "New comment on your post",
          content: `${req.user!.username} commented on "${post.title}"`,
          link: `/posts/${postId}#comment-${comment.id}`,
        },
      });
    }

    // Notify parent comment author (if replying)
    if (parentCommentId) {
      const parentComment = await prisma.comment.findUnique({
        where: { id: parentCommentId },
      });
      if (parentComment && parentComment.userId !== userId && parentComment.userId !== post.userId) {
        await prisma.notification.create({
          data: {
            userId: parentComment.userId,
            type: "comment",
            title: "Someone replied to your comment",
            content: `${req.user!.username} replied to your comment`,
            link: `/posts/${postId}#comment-${comment.id}`,
          },
        });
      }
    }

    logger.info(`Comment created on post ${postId}`);
    return sendSuccess(res, comment, "Comment created", 201);
  } catch (err) {
    logger.error("Failed to create comment", { error: (err as Error).message });
    return sendError(res, "Failed to create comment", 500);
  }
}

// Get comments for a post (with nested structure)
export async function getComments(req: Request, res: Response) {
  try {
    const postId = param(req, "postId");
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 50;
    const sortBy = (req.query.sortBy as string) || "createdAt";

    const where = { postId, parentCommentId: null, isDeleted: false };
    const orderBy: any = sortBy === "upvotes" ? { upvotes: "desc" } : { createdAt: "asc" };

    const [comments, total] = await Promise.all([
      prisma.comment.findMany({
        where,
        include: {
          user: { select: { id: true, username: true, avatarUrl: true, level: true } },
          replies: {
            where: { isDeleted: false },
            include: {
              user: { select: { id: true, username: true, avatarUrl: true, level: true } },
              _count: { select: { replies: true, votes: true } },
            },
            orderBy: { createdAt: "asc" },
          },
          _count: { select: { replies: true, votes: true } },
        },
        orderBy,
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.comment.count({ where }),
    ]);

    // Attach user votes if authenticated
    let userVotes: Record<string, number> = {};
    if (req.user) {
      const allCommentIds = comments.flatMap((c: any) => [c.id, ...c.replies.map((r: any) => r.id)]);
      const votes = await prisma.commentVote.findMany({
        where: { userId: req.user.id, commentId: { in: allCommentIds } },
      });
      userVotes = Object.fromEntries(votes.map((v) => [v.commentId, v.value]));
    }

    const enriched = comments.map((c: any) => ({
      ...c,
      userVote: userVotes[c.id] || 0,
      replies: c.replies.map((r: any) => ({ ...r, userVote: userVotes[r.id] || 0 })),
    }));

    return sendPaginated(res, enriched, total, page, limit);
  } catch (err) {
    return sendError(res, "Failed to fetch comments", 500);
  }
}

// Vote on a comment
export async function voteComment(req: Request, res: Response) {
  try {
    const commentId = param(req, "commentId");
    const { value } = req.body;
    const userId = req.user!.id;

    if (value !== 1 && value !== -1) {
      return sendError(res, "Vote value must be 1 or -1", 400);
    }

    const comment = await prisma.comment.findUnique({ where: { id: commentId } });
    if (!comment) return sendError(res, "Comment not found", 404);

    const existing = await prisma.commentVote.findUnique({
      where: { userId_commentId: { userId, commentId } },
    });

    let upDelta = 0;
    let downDelta = 0;

    if (existing) {
      if (existing.value === value) {
        await prisma.commentVote.delete({ where: { id: existing.id } });
        if (value === 1) upDelta = -1;
        else downDelta = -1;
      } else {
        await prisma.commentVote.update({ where: { id: existing.id }, data: { value } });
        if (value === 1) { upDelta = 1; downDelta = -1; }
        else { upDelta = -1; downDelta = 1; }
      }
    } else {
      await prisma.commentVote.create({ data: { userId, commentId, value } });
      if (value === 1) upDelta = 1;
      else downDelta = 1;
    }

    const updated = await prisma.comment.update({
      where: { id: commentId },
      data: { upvotes: { increment: upDelta }, downvotes: { increment: downDelta } },
      select: { id: true, upvotes: true, downvotes: true },
    });

    return sendSuccess(res, updated);
  } catch (err) {
    return sendError(res, "Failed to vote on comment", 500);
  }
}

// Delete a comment (soft delete)
export async function deleteComment(req: Request, res: Response) {
  try {
    const commentId = param(req, "commentId");
    const userId = req.user!.id;

    const comment = await prisma.comment.findUnique({ where: { id: commentId } });
    if (!comment) return sendError(res, "Comment not found", 404);
    if (comment.userId !== userId && req.user!.role === "user") {
      return sendError(res, "Not authorized", 403);
    }

    await prisma.comment.update({
      where: { id: commentId },
      data: { content: "[This comment has been deleted]", isDeleted: true },
    });

    return sendSuccess(res, null, "Comment deleted");
  } catch (err) {
    return sendError(res, "Failed to delete comment", 500);
  }
}

// Report a comment
export async function reportComment(req: Request, res: Response) {
  try {
    const commentId = param(req, "commentId");
    const { reason, description } = req.body;
    const userId = req.user!.id;

    const comment = await prisma.comment.findUnique({ where: { id: commentId } });
    if (!comment) return sendError(res, "Comment not found", 404);

    const report = await prisma.report.create({
      data: {
        reporterId: userId,
        commentId,
        reason,
        description,
      },
    });

    return sendSuccess(res, report, "Report submitted", 201);
  } catch (err) {
    return sendError(res, "Failed to submit report", 500);
  }
}
