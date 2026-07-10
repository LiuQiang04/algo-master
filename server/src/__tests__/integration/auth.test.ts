/**
 * Integration tests for authentication middleware composition.
 *
 * These tests verify that auth middleware + errorHandler work together
 * to produce correct HTTP responses. They use mocked Prisma and JWT
 * utilities to avoid database dependencies.
 *
 * Unit tests in unit/auth.test.ts cover the middleware logic in isolation
 * (asserting on next() calls). These tests focus on the HTTP response
 * format and middleware composition in a real Express pipeline.
 */

import request from "supertest";
import express from "express";

// Mock modules before importing
jest.mock("../../utils/prisma", () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
    },
  },
}));

jest.mock("../../utils/jwt", () => ({
  verifyToken: jest.fn(),
  generateToken: jest.fn((payload: any) => `token-${payload.id}`),
}));

jest.mock("../../utils/logger", () => ({
  logger: {
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  },
  createModuleLogger: jest.fn(() => ({
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  })),
}));

import { authenticate, optionalAuth, AuthRequest } from "../../middleware/auth";
import { errorHandler } from "../../middleware/errorHandler";
import { prisma } from "../../utils/prisma";
import { verifyToken } from "../../utils/jwt";

const mockPrisma = prisma as jest.Mocked<typeof prisma>;
const mockVerifyToken = verifyToken as jest.MockedFunction<typeof verifyToken>;

const testUser = {
  id: "integration-test-user",
  username: "inttestuser",
  email: "inttest@example.com",
  role: "user",
};

describe("Auth Response Format Integration", () => {
  let app: express.Application;

  beforeEach(() => {
    jest.clearAllMocks();
    app = express();
    app.use(express.json());

    // Set up routes with real middleware composition
    // authenticate + errorHandler work together through Express's error pipeline
    app.get("/api/protected", authenticate, (req, res) => {
      res.json({ success: true, user: (req as AuthRequest).user });
    });
    app.get("/api/optional", optionalAuth, (req, res) => {
      const user = (req as AuthRequest).user || null;
      res.json({ success: true, user });
    });

    // Error handler must be registered last to catch errors from authenticate
    app.use(errorHandler);
  });

  describe("authenticate + errorHandler composition", () => {
    it("should return consistent error shape on 401 without token", async () => {
      const res = await request(app).get("/api/protected");

      expect(res.status).toBe(401);
      expect(res.body).toEqual({
        success: false,
        error: { code: "UNAUTHORIZED", message: expect.any(String) },
      });
    });

    it("should return consistent error shape on 401 with invalid token", async () => {
      mockVerifyToken.mockImplementation(() => {
        throw new Error("Invalid token");
      });

      const res = await request(app)
        .get("/api/protected")
        .set("Authorization", "Bearer invalid.token.here");

      expect(res.status).toBe(401);
      expect(res.body).toEqual({
        success: false,
        error: { code: "UNAUTHORIZED", message: expect.any(String) },
      });
    });

    it("should return consistent error shape when user not found", async () => {
      mockVerifyToken.mockReturnValue({
        id: "nonexistent",
        username: "ghost",
        email: "ghost@test.com",
        role: "user",
      });
      (mockPrisma.user.findUnique as jest.Mock).mockResolvedValue(null);

      const res = await request(app)
        .get("/api/protected")
        .set("Authorization", "Bearer validtoken");

      expect(res.status).toBe(401);
      expect(res.body).toEqual({
        success: false,
        error: { code: "UNAUTHORIZED", message: expect.any(String) },
      });
    });

    it("should return 200 with user data on valid token", async () => {
      mockVerifyToken.mockReturnValue({
        id: testUser.id,
        username: testUser.username,
        email: testUser.email,
        role: testUser.role,
      });
      (mockPrisma.user.findUnique as jest.Mock).mockResolvedValue(testUser);

      const res = await request(app)
        .get("/api/protected")
        .set("Authorization", "Bearer validtoken");

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.user).toEqual(testUser);
    });
  });

  describe("optionalAuth composition", () => {
    it("should return 200 with null user when no token is provided", async () => {
      const res = await request(app).get("/api/optional");

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.user).toBeNull();
    });

    it("should return 200 with user data when valid token is provided", async () => {
      mockVerifyToken.mockReturnValue({
        id: testUser.id,
        username: testUser.username,
        email: testUser.email,
        role: testUser.role,
      });
      (mockPrisma.user.findUnique as jest.Mock).mockResolvedValue(testUser);

      const res = await request(app)
        .get("/api/optional")
        .set("Authorization", "Bearer validtoken");

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.user).toEqual(testUser);
    });

    it("should return 200 with null user when invalid token is provided", async () => {
      mockVerifyToken.mockImplementation(() => {
        throw new Error("Invalid token");
      });

      const res = await request(app)
        .get("/api/optional")
        .set("Authorization", "Bearer invalid.token");

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.user).toBeNull();
    });
  });
});
