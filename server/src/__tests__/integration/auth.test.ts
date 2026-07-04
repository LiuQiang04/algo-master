/**
 * Integration tests for authentication API endpoints.
 *
 * These tests verify the auth middleware works correctly in an Express context.
 * They use mocked Prisma and JWT utilities to avoid database dependencies.
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
import { prisma } from "../../utils/prisma";
import { verifyToken } from "../../utils/jwt";
import jwt from "jsonwebtoken";

const mockPrisma = prisma as jest.Mocked<typeof prisma>;
const mockVerifyToken = verifyToken as jest.MockedFunction<typeof verifyToken>;

// Create test app with auth middleware
function createAuthTestApp() {
  const app = express();
  app.use(express.json());

  // Protected route
  app.get("/api/protected", async (req, res, next) => {
    try {
      await authenticate(req as AuthRequest, res, (err?: any) => {
        if (err) {
          return res.status(err.statusCode || 401).json({ error: err.message });
        }
        res.json({ message: "Access granted", user: (req as AuthRequest).user });
      });
    } catch (error: any) {
      res.status(error.statusCode || 401).json({ error: error.message });
    }
  });

  // Optional auth route
  app.get("/api/optional", async (req, res, next) => {
    await optionalAuth(req as AuthRequest, res, () => {
      res.json({ message: "OK", user: (req as AuthRequest).user || null });
    });
  });

  return app;
}

describe("Auth API Integration", () => {
  let app: express.Application;

  const testUser = {
    id: "integration-test-user",
    username: "inttestuser",
    email: "inttest@example.com",
    role: "user",
  };

  beforeAll(() => {
    app = createAuthTestApp();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Protected routes", () => {
    it("should reject requests without authorization header", async () => {
      const response = await request(app).get("/api/protected");

      expect(response.status).toBe(401);
      expect(response.body.error).toBeDefined();
    });

    it("should reject requests with invalid token", async () => {
      mockVerifyToken.mockImplementation(() => {
        throw new Error("Invalid token");
      });

      const response = await request(app)
        .get("/api/protected")
        .set("Authorization", "Bearer invalid.token.here");

      expect(response.status).toBe(401);
    });

    it("should reject when user not found in database", async () => {
      mockVerifyToken.mockReturnValue({
        id: "nonexistent",
        username: "ghost",
        email: "ghost@test.com",
        role: "user",
      });
      (mockPrisma.user.findUnique as jest.Mock).mockResolvedValue(null);

      const response = await request(app)
        .get("/api/protected")
        .set("Authorization", "Bearer validtoken");

      expect(response.status).toBe(401);
    });

    it("should grant access with valid token and existing user", async () => {
      mockVerifyToken.mockReturnValue({
        id: testUser.id,
        username: testUser.username,
        email: testUser.email,
        role: testUser.role,
      });
      (mockPrisma.user.findUnique as jest.Mock).mockResolvedValue(testUser);

      const response = await request(app)
        .get("/api/protected")
        .set("Authorization", "Bearer validtoken");

      expect(response.status).toBe(200);
      expect(response.body.message).toBe("Access granted");
      expect(response.body.user).toEqual(testUser);
    });

    it("should not accept token without Bearer prefix", async () => {
      const response = await request(app)
        .get("/api/protected")
        .set("Authorization", "validtoken");

      expect(response.status).toBe(401);
    });
  });

  describe("Optional auth routes", () => {
    it("should allow access without token", async () => {
      const response = await request(app).get("/api/optional");

      expect(response.status).toBe(200);
      expect(response.body.user).toBeNull();
    });

    it("should set user when valid token is provided", async () => {
      mockVerifyToken.mockReturnValue({
        id: testUser.id,
        username: testUser.username,
        email: testUser.email,
        role: testUser.role,
      });
      (mockPrisma.user.findUnique as jest.Mock).mockResolvedValue(testUser);

      const response = await request(app)
        .get("/api/optional")
        .set("Authorization", "Bearer validtoken");

      expect(response.status).toBe(200);
      expect(response.body.user).toEqual(testUser);
    });

    it("should not set user when token is invalid", async () => {
      mockVerifyToken.mockImplementation(() => {
        throw new Error("Invalid token");
      });

      const response = await request(app)
        .get("/api/optional")
        .set("Authorization", "Bearer invalid.token");

      expect(response.status).toBe(200);
      expect(response.body.user).toBeNull();
    });
  });
});
