import { Request, Response } from "express";
import prisma from "../lib/prisma.js";
import { sendSuccess, sendError, sendPaginated } from "../utils/response.js";

function param(req: Request, name: string): string {
  const v = req.params[name];
  return Array.isArray(v) ? v[0] : (v as string);
}

export async function getUserProfile(req: Request, res: Response) {
  try {
    const id = param(req, "id");
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        username: true,
        avatarUrl: true,
        bio: true,
        rating: true,
        level: true,
        createdAt: true,
        _count: {
          select: {
            posts: true,
            comments: true,
            followers: true,
            following: true,
          },
        },
      },
    });
    if (!user) return sendError(res, "User not found", 404);

    // Check if current user follows this user
    let isFollowing = false;
    if (req.user) {
      const follow = await prisma.follow.findUnique({
        where: {
          followerId_followingId: {
            followerId: req.user.id,
            followingId: id,
          },
        },
      });
      isFollowing = !!follow;
    }

    return sendSuccess(res, { ...user, isFollowing });
  } catch (err) {
    return sendError(res, "Failed to fetch user profile", 500);
  }
}

export async function updateProfile(req: Request, res: Response) {
  try {
    const { username, bio, avatarUrl } = req.body;
    const userId = req.user!.id;

    if (username) {
      const existing = await prisma.user.findFirst({
        where: { username, NOT: { id: userId } },
      });
      if (existing) return sendError(res, "Username already taken", 409);
    }

    const user = await prisma.user.update({
      where: { id: userId },
      data: { ...(username && { username }), ...(bio !== undefined && { bio }), ...(avatarUrl && { avatarUrl }) },
      select: { id: true, username: true, email: true, avatarUrl: true, bio: true },
    });

    return sendSuccess(res, user, "Profile updated");
  } catch (err) {
    return sendError(res, "Failed to update profile", 500);
  }
}

export async function getUserPosts(req: Request, res: Response) {
  try {
    const id = param(req, "id");
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;

    const [posts, total] = await Promise.all([
      prisma.post.findMany({
        where: { userId: id },
        include: {
          user: { select: { id: true, username: true, avatarUrl: true } },
          tags: { include: { tag: true } },
          _count: { select: { comments: true } },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.post.count({ where: { userId: id } }),
    ]);

    return sendPaginated(res, posts, total, page, limit);
  } catch (err) {
    return sendError(res, "Failed to fetch user posts", 500);
  }
}

export async function getFollowers(req: Request, res: Response) {
  try {
    const id = param(req, "id");
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;

    const [followers, total] = await Promise.all([
      prisma.follow.findMany({
        where: { followingId: id },
        include: {
          follower: {
            select: { id: true, username: true, avatarUrl: true, bio: true, level: true },
          },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.follow.count({ where: { followingId: id } }),
    ]);

    return sendPaginated(
      res,
      followers.map((f) => f.follower),
      total,
      page,
      limit
    );
  } catch (err) {
    return sendError(res, "Failed to fetch followers", 500);
  }
}

export async function getFollowing(req: Request, res: Response) {
  try {
    const id = param(req, "id");
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;

    const [following, total] = await Promise.all([
      prisma.follow.findMany({
        where: { followerId: id },
        include: {
          following: {
            select: { id: true, username: true, avatarUrl: true, bio: true, level: true },
          },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.follow.count({ where: { followerId: id } }),
    ]);

    return sendPaginated(
      res,
      following.map((f) => f.following),
      total,
      page,
      limit
    );
  } catch (err) {
    return sendError(res, "Failed to fetch following", 500);
  }
}
