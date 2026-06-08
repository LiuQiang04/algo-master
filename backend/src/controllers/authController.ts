import { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import prisma from "../lib/prisma.js";
import { config } from "../config/index.js";
import { sendSuccess, sendError } from "../utils/response.js";
import logger from "../utils/logger.js";

export async function register(req: Request, res: Response) {
  try {
    const { username, email, password } = req.body;

    // Check if user already exists
    const existing = await prisma.user.findFirst({
      where: { OR: [{ username }, { email }] },
    });
    if (existing) {
      return sendError(res, "Username or email already exists", 409);
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const user = await prisma.user.create({
      data: { username, email, passwordHash },
      select: { id: true, username: true, email: true, createdAt: true },
    });

    // Create default notification settings
    await prisma.notificationSetting.create({
      data: { userId: user.id },
    });

    const token = jwt.sign(
      { id: user.id, username: user.username, email: user.email, role: "user" },
      config.jwt.secret,
      { expiresIn: "7d" } as any
    );

    logger.info(`User registered: ${username}`);
    return sendSuccess(res, { user, token }, "Registration successful", 201);
  } catch (err) {
    logger.error("Registration failed", { error: (err as Error).message });
    return sendError(res, "Registration failed", 500);
  }
}

export async function login(req: Request, res: Response) {
  try {
    const { login: loginField, password } = req.body;

    const user = await prisma.user.findFirst({
      where: { OR: [{ username: loginField }, { email: loginField }] },
    });
    if (!user) {
      return sendError(res, "Invalid credentials", 401);
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      return sendError(res, "Invalid credentials", 401);
    }

    const token = jwt.sign(
      { id: user.id, username: user.username, email: user.email, role: user.role },
      config.jwt.secret,
      { expiresIn: "7d" } as any
    );

    logger.info(`User logged in: ${user.username}`);
    return sendSuccess(res, {
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        avatarUrl: user.avatarUrl,
        bio: user.bio,
        rating: user.rating,
        level: user.level,
        role: user.role,
      },
      token,
    });
  } catch (err) {
    logger.error("Login failed", { error: (err as Error).message });
    return sendError(res, "Login failed", 500);
  }
}

export async function getMe(req: Request, res: Response) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      select: {
        id: true,
        username: true,
        email: true,
        avatarUrl: true,
        bio: true,
        rating: true,
        experiencePoints: true,
        level: true,
        role: true,
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
    return sendSuccess(res, user);
  } catch (err) {
    return sendError(res, "Failed to fetch user info", 500);
  }
}
