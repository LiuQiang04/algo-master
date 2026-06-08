import { Request, Response } from "express";
import prisma from "../lib/prisma.js";
import { sendSuccess, sendError, sendPaginated } from "../utils/response.js";
import logger from "../utils/logger.js";

function param(req: Request, name: string): string {
  const v = req.params[name];
  return Array.isArray(v) ? v[0] : (v as string);
}

// Create a new post (discussion, solution, or question)
export async function createPost(req: Request, res: Response) {
  try {
    const { title, content, postType, problemId, tagNames } = req.body;
    const userId = req.user!.id;

    const post = await prisma.post.create({
      data: {
        userId,
        title,
        content,
        postType: postType || "discussion",
        problemId: problemId || null,
      },
      include: {
        user: { select: { id: true, username: true, avatarUrl: true } },
      },
    });

    // Handle tags
    if (tagNames && Array.isArray(tagNames) && tagNames.length > 0) {
      for (const tagName of tagNames) {
        let tag = await prisma.tag.findUnique({ where: { name: tagName } });
        if (!tag) {
          tag = await prisma.tag.create({ data: { name: tagName } });
        }
        await prisma.postTag.create({
          data: { postId: post.id, tagId: tag.id },
        });
      }
    }

    // Create activity
    await prisma.activity.create({
      data: {
        userId,
        type: "post",
        targetId: post.id,
        targetType: "post",
        metadata: JSON.stringify({ title, postType }),
      },
    });

    logger.info(`Post created: ${post.id} by ${req.user!.username}`);
    return sendSuccess(res, post, "Post created", 201);
  } catch (err) {
    logger.error("Failed to create post", { error: (err as Error).message });
    return sendError(res, "Failed to create post", 500);
  }
}

// Get posts with filtering and pagination
export async function getPosts(req: Request, res: Response) {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;
    const postType = req.query.postType as string;
    const tag = req.query.tag as string;
    const search = req.query.search as string;
    const sortBy = (req.query.sortBy as string) || "createdAt";
    const problemId = req.query.problemId as string;

    const where: any = {};
    if (postType) where.postType = postType;
    if (problemId) where.problemId = problemId;
    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { content: { contains: search, mode: "insensitive" } },
      ];
    }
    if (tag) {
      where.tags = { some: { tag: { name: tag } } };
    }

    const orderBy: any = sortBy === "upvotes" ? { upvotes: "desc" } : sortBy === "views" ? { viewCount: "desc" } : { createdAt: "desc" };

    const [posts, total] = await Promise.all([
      prisma.post.findMany({
        where,
        include: {
          user: { select: { id: true, username: true, avatarUrl: true } },
          tags: { include: { tag: true } },
          _count: { select: { comments: true } },
        },
        orderBy: [{ isPinned: "desc" }, orderBy],
        skip,
        take: limit,
      }),
      prisma.post.count({ where }),
    ]);

    return sendPaginated(res, posts, total, page, limit);
  } catch (err) {
    return sendError(res, "Failed to fetch posts", 500);
  }
}

// Get a single post with details
export async function getPost(req: Request, res: Response) {
  try {
    const id = param(req, "id");

    const post = await prisma.post.update({
      where: { id },
      data: { viewCount: { increment: 1 } },
      include: {
        user: { select: { id: true, username: true, avatarUrl: true, level: true } },
        tags: { include: { tag: true } },
        _count: { select: { comments: true, votes: true } },
      },
    });

    // Get current user's vote
    let userVote = null;
    if (req.user) {
      userVote = await prisma.vote.findUnique({
        where: { userId_postId: { userId: req.user.id, postId: id } },
      });
    }

    return sendSuccess(res, { ...post, userVote: userVote?.value || 0 });
  } catch (err) {
    return sendError(res, "Failed to fetch post", 500);
  }
}

// Update a post
export async function updatePost(req: Request, res: Response) {
  try {
    const id = param(req, "id");
    const userId = req.user!.id;
    const { title, content, tagNames } = req.body;

    const post = await prisma.post.findUnique({ where: { id } });
    if (!post) return sendError(res, "Post not found", 404);
    if (post.userId !== userId && req.user!.role === "user") {
      return sendError(res, "Not authorized", 403);
    }

    const updated = await prisma.post.update({
      where: { id },
      data: {
        ...(title && { title }),
        ...(content && { content }),
      },
      include: {
        user: { select: { id: true, username: true, avatarUrl: true } },
        tags: { include: { tag: true } },
      },
    });

    // Update tags if provided
    if (tagNames && Array.isArray(tagNames)) {
      await prisma.postTag.deleteMany({ where: { postId: id } });
      for (const tagName of tagNames) {
        let tag = await prisma.tag.findUnique({ where: { name: tagName } });
        if (!tag) {
          tag = await prisma.tag.create({ data: { name: tagName } });
        }
        await prisma.postTag.create({ data: { postId: id, tagId: tag.id } });
      }
    }

    return sendSuccess(res, updated, "Post updated");
  } catch (err) {
    return sendError(res, "Failed to update post", 500);
  }
}

// Delete a post
export async function deletePost(req: Request, res: Response) {
  try {
    const id = param(req, "id");
    const userId = req.user!.id;

    const post = await prisma.post.findUnique({ where: { id } });
    if (!post) return sendError(res, "Post not found", 404);
    if (post.userId !== userId && req.user!.role === "user") {
      return sendError(res, "Not authorized", 403);
    }

    await prisma.post.delete({ where: { id } });
    return sendSuccess(res, null, "Post deleted");
  } catch (err) {
    return sendError(res, "Failed to delete post", 500);
  }
}

// Vote on a post
export async function votePost(req: Request, res: Response) {
  try {
    const id = param(req, "id");
    const { value } = req.body; // 1 for upvote, -1 for downvote
    const userId = req.user!.id;

    if (value !== 1 && value !== -1) {
      return sendError(res, "Vote value must be 1 or -1", 400);
    }

    const post = await prisma.post.findUnique({ where: { id } });
    if (!post) return sendError(res, "Post not found", 404);

    // Check existing vote
    const existingVote = await prisma.vote.findUnique({
      where: { userId_postId: { userId, postId: id } },
    });

    let upvoteDelta = 0;
    let downvoteDelta = 0;

    if (existingVote) {
      if (existingVote.value === value) {
        // Remove vote (toggle off)
        await prisma.vote.delete({ where: { id: existingVote.id } });
        if (value === 1) upvoteDelta = -1;
        else downvoteDelta = -1;
      } else {
        // Change vote
        await prisma.vote.update({
          where: { id: existingVote.id },
          data: { value },
        });
        if (value === 1) {
          upvoteDelta = 1;
          downvoteDelta = -1;
        } else {
          upvoteDelta = -1;
          downvoteDelta = 1;
        }
      }
    } else {
      // New vote
      await prisma.vote.create({ data: { userId, postId: id, value } });
      if (value === 1) upvoteDelta = 1;
      else downvoteDelta = 1;
    }

    const updated = await prisma.post.update({
      where: { id },
      data: { upvotes: { increment: upvoteDelta }, downvotes: { increment: downvoteDelta } },
      select: { id: true, upvotes: true, downvotes: true },
    });

    // Create activity for upvote
    if (value === 1 && !existingVote) {
      await prisma.activity.create({
        data: {
          userId,
          type: "vote",
          targetId: id,
          targetType: "post",
        },
      });

      // Notify post author
      if (post.userId !== userId) {
        await prisma.notification.create({
          data: {
            userId: post.userId,
            type: "vote",
            title: "Your post received an upvote",
            content: `${req.user!.username} upvoted your post "${post.title}"`,
            link: `/posts/${id}`,
          },
        });
      }
    }

    return sendSuccess(res, updated);
  } catch (err) {
    return sendError(res, "Failed to vote", 500);
  }
}

// Get all tags
export async function getTags(_req: Request, res: Response) {
  try {
    const tags = await prisma.tag.findMany({
      include: { _count: { select: { posts: true } } },
      orderBy: { posts: { _count: "desc" } },
    });
    return sendSuccess(res, tags);
  } catch (err) {
    return sendError(res, "Failed to fetch tags", 500);
  }
}
