import { Request, Response } from "express";
import prisma from "../lib/prisma.js";
import { sendSuccess, sendError, sendPaginated } from "../utils/response.js";
import logger from "../utils/logger.js";

function param(req: Request, name: string): string {
  const v = req.params[name];
  return Array.isArray(v) ? v[0] : (v as string);
}

// Follow a user
export async function followUser(req: Request, res: Response) {
  try {
    const targetId = param(req, "id");
    const userId = req.user!.id;

    if (userId === targetId) {
      return sendError(res, "Cannot follow yourself", 400);
    }

    const targetUser = await prisma.user.findUnique({ where: { id: targetId } });
    if (!targetUser) return sendError(res, "User not found", 404);

    const existing = await prisma.follow.findUnique({
      where: { followerId_followingId: { followerId: userId, followingId: targetId } },
    });

    if (existing) {
      // Unfollow
      await prisma.follow.delete({ where: { id: existing.id } });
      return sendSuccess(res, { isFollowing: false }, "Unfollowed");
    }

    await prisma.follow.create({
      data: { followerId: userId, followingId: targetId },
    });

    // Create activity
    await prisma.activity.create({
      data: {
        userId,
        type: "follow",
        targetId,
        targetType: "user",
      },
    });

    // Notify target user
    await prisma.notification.create({
      data: {
        userId: targetId,
        type: "follow",
        title: "New follower",
        content: `${req.user!.username} started following you`,
        link: `/users/${userId}`,
      },
    });

    return sendSuccess(res, { isFollowing: true }, "Followed", 201);
  } catch (err) {
    return sendError(res, "Failed to follow user", 500);
  }
}

// Get user activity feed
export async function getActivityFeed(req: Request, res: Response) {
  try {
    const userId = req.user!.id;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;

    // Get IDs of users the current user follows
    const follows = await prisma.follow.findMany({
      where: { followerId: userId },
      select: { followingId: true },
    });
    const followingIds = follows.map((f) => f.followingId);
    followingIds.push(userId); // Include own activities

    const [activities, total] = await Promise.all([
      prisma.activity.findMany({
        where: { userId: { in: followingIds } },
        include: {
          user: { select: { id: true, username: true, avatarUrl: true } },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.activity.count({ where: { userId: { in: followingIds } } }),
    ]);

    return sendPaginated(res, activities, total, page, limit);
  } catch (err) {
    return sendError(res, "Failed to fetch activity feed", 500);
  }
}

// Send a private message
export async function sendMessage(req: Request, res: Response) {
  try {
    const { receiverId, content } = req.body;
    const senderId = req.user!.id;

    if (senderId === receiverId) {
      return sendError(res, "Cannot send message to yourself", 400);
    }

    const receiver = await prisma.user.findUnique({ where: { id: receiverId } });
    if (!receiver) return sendError(res, "Receiver not found", 404);

    const message = await prisma.message.create({
      data: { senderId, receiverId, content },
      include: {
        sender: { select: { id: true, username: true, avatarUrl: true } },
        receiver: { select: { id: true, username: true, avatarUrl: true } },
      },
    });

    // Notify receiver
    await prisma.notification.create({
      data: {
        userId: receiverId,
        type: "message",
        title: "New message",
        content: `${req.user!.username} sent you a message`,
        link: `/messages/${senderId}`,
      },
    });

    return sendSuccess(res, message, "Message sent", 201);
  } catch (err) {
    return sendError(res, "Failed to send message", 500);
  }
}

// Get conversation with a user
export async function getConversation(req: Request, res: Response) {
  try {
    const otherUserId = param(req, "userId");
    const userId = req.user!.id;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 50;
    const skip = (page - 1) * limit;

    const where = {
      OR: [
        { senderId: userId, receiverId: otherUserId },
        { senderId: otherUserId, receiverId: userId },
      ],
    };

    const [messages, total] = await Promise.all([
      prisma.message.findMany({
        where,
        include: {
          sender: { select: { id: true, username: true, avatarUrl: true } },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.message.count({ where }),
    ]);

    // Mark messages as read
    await prisma.message.updateMany({
      where: { senderId: otherUserId, receiverId: userId, isRead: false },
      data: { isRead: true },
    });

    return sendPaginated(res, messages.reverse(), total, page, limit);
  } catch (err) {
    return sendError(res, "Failed to fetch conversation", 500);
  }
}

// Get message inbox (list of conversations)
export async function getInbox(req: Request, res: Response) {
  try {
    const userId = req.user!.id;

    // Get latest message for each conversation
    const conversations = await prisma.$queryRaw`
      SELECT DISTINCT ON (other_user_id)
        other_user_id,
        last_message,
        last_message_at,
        unread_count
      FROM (
        SELECT
          CASE WHEN sender_id = ${userId} THEN receiver_id ELSE sender_id END as other_user_id,
          content as last_message,
          created_at as last_message_at,
          CASE WHEN receiver_id = ${userId} AND is_read = false THEN 1 ELSE 0 END as unread_count
        FROM messages
        WHERE sender_id = ${userId} OR receiver_id = ${userId}
        ORDER BY created_at DESC
      ) sub
      ORDER BY other_user_id, last_message_at DESC
    ` as any[];

    // Enrich with user info
    const enriched = await Promise.all(
      conversations.map(async (conv: any) => {
        const user = await prisma.user.findUnique({
          where: { id: conv.other_user_id },
          select: { id: true, username: true, avatarUrl: true },
        });
        return {
          user,
          lastMessage: conv.last_message,
          lastMessageAt: conv.last_message_at,
          unreadCount: Number(conv.unread_count),
        };
      })
    );

    // Sort by last message time
    enriched.sort((a, b) => new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime());

    return sendSuccess(res, enriched);
  } catch (err) {
    logger.error("Failed to fetch inbox", { error: (err as Error).message });
    return sendError(res, "Failed to fetch inbox", 500);
  }
}

// Get unread message count
export async function getUnreadCount(req: Request, res: Response) {
  try {
    const userId = req.user!.id;
    const count = await prisma.message.count({
      where: { receiverId: userId, isRead: false },
    });
    return sendSuccess(res, { count });
  } catch (err) {
    return sendError(res, "Failed to fetch unread count", 500);
  }
}
