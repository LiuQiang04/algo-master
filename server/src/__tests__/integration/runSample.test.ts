/**
 * Integration tests for POST /api/submissions/run-sample.
 *
 * These tests verify the auth guard works correctly. The full flow
 * (Docker-based judging) is not tested here since Docker may not be
 * available in the test environment.
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

jest.mock("../../services/submissionService", () => ({
  runSample: jest.fn(),
}));

import { authenticate, AuthRequest } from "../../middleware/auth";
import { runSample } from "../../controllers/submissionController";
import { prisma } from "../../utils/prisma";
import { verifyToken } from "../../utils/jwt";
import { errorHandler } from "../../middleware/errorHandler";

const mockPrisma = prisma as jest.Mocked<typeof prisma>;
const mockVerifyToken = verifyToken as jest.MockedFunction<typeof verifyToken>;

describe("POST /api/submissions/run-sample", () => {
  let app: express.Application;

  const testUser = {
    id: "test-user-id",
    username: "testuser",
    email: "test@example.com",
    role: "user",
  };

  beforeAll(() => {
    app = express();
    app.use(express.json());

    app.post(
      "/api/submissions/run-sample",
      async (req, res, next) => {
        try {
          await authenticate(req as AuthRequest, res as any, (err?: any) => {
            if (err) {
              return next(err);
            }
            runSample(req as AuthRequest, res as any);
          });
        } catch (error) {
          next(error);
        }
      }
    );

    app.use(errorHandler);
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Authentication guard", () => {
    it("should return 401 without authorization header", async () => {
      const res = await request(app)
        .post("/api/submissions/run-sample")
        .send({
          problemId: "00000000-0000-0000-0000-000000000001",
          language: "cpp",
          sourceCode: '#include <iostream>\nint main() { std::cout << "ok"; }',
        });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it("should return 401 with invalid Bearer token", async () => {
      mockVerifyToken.mockImplementation(() => {
        throw new Error("Invalid token");
      });

      const res = await request(app)
        .post("/api/submissions/run-sample")
        .set("Authorization", "Bearer invalid.token.here")
        .send({
          problemId: "00000000-0000-0000-0000-000000000001",
          language: "cpp",
          sourceCode: '#include <iostream>\nint main() { std::cout << "ok"; }',
        });

      expect(res.status).toBe(401);
    });

    it("should return 401 when user not found in database", async () => {
      mockVerifyToken.mockReturnValue({
        id: "nonexistent",
        username: "ghost",
        email: "ghost@test.com",
        role: "user",
      });
      (mockPrisma.user.findUnique as jest.Mock).mockResolvedValue(null);

      const res = await request(app)
        .post("/api/submissions/run-sample")
        .set("Authorization", "Bearer validtoken")
        .send({
          problemId: "00000000-0000-0000-0000-000000000001",
          language: "cpp",
          sourceCode: '#include <iostream>\nint main() { std::cout << "ok"; }',
        });

      expect(res.status).toBe(401);
    });
  });
});
