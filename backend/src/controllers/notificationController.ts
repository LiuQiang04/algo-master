import { Request, Response } from "express";
import prisma from "../lib/prisma.js";
import { sendSuccess, sendError, sendPaginated } from "../utils/response.js";

function param(req: Request, name: string): string {
  const v = req.params[name];
  return Array.isArray(v) ? v[0] : (v as string);
}

// Get user notifications
export async function getNotifications(req: Request, res: Response) {
  try {
    const userId = req.user!.id;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;
    const type = req.query.type as string;

    const where: any = { userId };
    if (type) where.type = type;

    const [notifications, total] = await Promise.all([
      prisma.notification.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.notification.count({ where }),
    ]);

    return sendPaginated(res, notifications, total, page, limit);
  } catch (err) {
    return sendError(res, "Failed to fetch notifications", 500);
  }
}

// Mark notification as read
export async function markAsRead(req: Request, res: Response) {
  try {
    const id = param(req, "id");
    const userId = req.user!.id;

    const notification = await prisma.notification.findUnique({ where: { id } });
    if (!notification) return sendError(res, "Notification not found", 404);
    if (notification.userId !== userId) return sendError(res, "Not authorized", 403);

    await prisma.notification.update({
      where: { id },
      data: { isRead: true },
    });

    return sendSuccess(res, null, "Marked as read");
  } catch (err) {
    return sendError(res, "Failed to mark notification", 500);
  }
}

// Mark all notifications as read
export async function markAllAsRead(req: Request, res: Response) {
  try {
    const userId = req.user!.id;
    await prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true },
    });
    return sendSuccess(res, null, "All notifications marked as read");
  } catch (err) {
    return sendError(res, "Failed to mark notifications", 500);
  }
}

// Get unread notification count
export async function getUnreadCount(req: Request, res: Response) {
  try {
    const userId = req.user!.id;
    const count = await prisma.notification.count({
      where: { userId, isRead: false },
    });
    return sendSuccess(res, { count });
  } catch (err) {
    return sendError(res, "Failed to fetch unread count", 500);
  }
}

// Get notification settings
export async function getSettings(req: Request, res: Response) {
  try {
    const userId = req.user!.id;
    let settings = await prisma.notificationSetting.findUnique({
      where: { userId },
    });
    if (!settings) {
      settings = await prisma.notificationSetting.create({
        data: { userId },
      });
    }
    return sendSuccess(res, settings);
  } catch (err) {
    return sendError(res, "Failed to fetch settings", 500);
  }
}

// Update notification settings
export async function updateSettings(req: Request, res: Response) {
  try {
    const userId = req.user!.id;
    const { emailNotification, followNotification, commentNotification, voteNotification, messageNotification, systemNotification } = req.body;

    const settings = await prisma.notificationSetting.upsert({
      where: { userId },
      update: {
        ...(emailNotification !== undefined && { emailNotification }),
        ...(followNotification !== undefined && { followNotification }),
        ...(commentNotification !== undefined && { commentNotification }),
        ...(voteNotification !== undefined && { voteNotification }),
        ...(messageNotification !== undefined && { messageNotification }),
        ...(systemNotification !== undefined && { systemNotification }),
      },
      create: {
        userId,
        emailNotification,
        followNotification,
        commentNotification,
        voteNotification,
        messageNotification,
        systemNotification,
      },
    });

    return sendSuccess(res, settings, "Settings updated");
  } catch (err) {
    return sendError(res, "Failed to update settings", 500);
  }
}
