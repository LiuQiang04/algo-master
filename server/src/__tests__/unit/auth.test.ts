/**
 * Unit tests for authentication middleware.
 * Tests the authenticate, optionalAuth, and authorize middleware functions.
 *
 * Mocks: prisma (utils/prisma), jwt (utils/jwt), errors (utils/errors)
 */

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
  generateToken: jest.fn(),
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

// Import after mocking
import { authenticate, optionalAuth, authorize, AuthRequest } from "../../middleware/auth";
import { prisma } from "../../utils/prisma";
import { verifyToken } from "../../utils/jwt";
import { UnauthorizedError, ForbiddenError } from "../../utils/errors";
import { Request, Response, NextFunction } from "express";

const mockPrisma = prisma as jest.Mocked<typeof prisma>;
const mockVerifyToken = verifyToken as jest.MockedFunction<typeof verifyToken>;

describe("Auth Middleware", () => {
  let req: Partial<AuthRequest>;
  let res: Partial<Response>;
  let next: NextFunction;

  const testUser = {
    id: "test-user-id",
    username: "testuser",
    email: "test@example.com",
    role: "user",
  };

  beforeEach(() => {
    req = {
      headers: {},
    };
    res = {};
    next = jest.fn();
    jest.clearAllMocks();
  });

  describe("authenticate", () => {
    it("should throw UnauthorizedError when no authorization header is provided", async () => {
      await expect(
        authenticate(req as AuthRequest, res as Response, next)
      ).rejects.toThrow(UnauthorizedError);
    });

    it("should throw UnauthorizedError when header does not start with 'Bearer '", async () => {
      req.headers = { authorization: "Basic sometoken" };

      await expect(
        authenticate(req as AuthRequest, res as Response, next)
      ).rejects.toThrow(UnauthorizedError);
    });

    it("should throw UnauthorizedError when token verification fails", async () => {
      req.headers = { authorization: "Bearer invalidtoken" };
      mockVerifyToken.mockImplementation(() => {
        throw new Error("Invalid token");
      });

      await expect(
        authenticate(req as AuthRequest, res as Response, next)
      ).rejects.toThrow(UnauthorizedError);
    });

    it("should throw UnauthorizedError when user is not found in database", async () => {
      req.headers = { authorization: "Bearer validtoken" };
      mockVerifyToken.mockReturnValue({
        id: "nonexistent",
        username: "ghost",
        email: "ghost@test.com",
        role: "user",
      });
      (mockPrisma.user.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(
        authenticate(req as AuthRequest, res as Response, next)
      ).rejects.toThrow(UnauthorizedError);
    });

    it("should call next and set req.user when authentication succeeds", async () => {
      req.headers = { authorization: "Bearer validtoken" };
      mockVerifyToken.mockReturnValue({
        id: testUser.id,
        username: testUser.username,
        email: testUser.email,
        role: testUser.role,
      });
      (mockPrisma.user.findUnique as jest.Mock).mockResolvedValue(testUser);

      await authenticate(req as AuthRequest, res as Response, next);

      expect(next).toHaveBeenCalled();
      expect(req.user).toEqual(testUser);
    });

    it("should pass the token to verifyToken", async () => {
      req.headers = { authorization: "Bearer mytoken123" };
      mockVerifyToken.mockReturnValue({
        id: testUser.id,
        username: testUser.username,
        email: testUser.email,
        role: testUser.role,
      });
      (mockPrisma.user.findUnique as jest.Mock).mockResolvedValue(testUser);

      await authenticate(req as AuthRequest, res as Response, next);

      expect(mockVerifyToken).toHaveBeenCalledWith("mytoken123");
    });

    it("should query the database with the decoded user id", async () => {
      req.headers = { authorization: "Bearer validtoken" };
      mockVerifyToken.mockReturnValue({
        id: testUser.id,
        username: testUser.username,
        email: testUser.email,
        role: testUser.role,
      });
      (mockPrisma.user.findUnique as jest.Mock).mockResolvedValue(testUser);

      await authenticate(req as AuthRequest, res as Response, next);

      expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: testUser.id },
        select: { id: true, username: true, email: true, role: true },
      });
    });
  });

  describe("optionalAuth", () => {
    it("should call next without setting user when no auth header", async () => {
      await optionalAuth(req as AuthRequest, res as Response, next);

      expect(next).toHaveBeenCalled();
      expect(req.user).toBeUndefined();
    });

    it("should call next without setting user when token is invalid", async () => {
      req.headers = { authorization: "Bearer invalidtoken" };
      mockVerifyToken.mockImplementation(() => {
        throw new Error("Invalid token");
      });

      await optionalAuth(req as AuthRequest, res as Response, next);

      expect(next).toHaveBeenCalled();
      expect(req.user).toBeUndefined();
    });

    it("should set user when valid token is provided", async () => {
      req.headers = { authorization: "Bearer validtoken" };
      mockVerifyToken.mockReturnValue({
        id: testUser.id,
        username: testUser.username,
        email: testUser.email,
        role: testUser.role,
      });
      (mockPrisma.user.findUnique as jest.Mock).mockResolvedValue(testUser);

      await optionalAuth(req as AuthRequest, res as Response, next);

      expect(next).toHaveBeenCalled();
      expect(req.user).toEqual(testUser);
    });

    it("should call next without user when user not found in database", async () => {
      req.headers = { authorization: "Bearer validtoken" };
      mockVerifyToken.mockReturnValue({
        id: "nonexistent",
        username: "ghost",
        email: "ghost@test.com",
        role: "user",
      });
      (mockPrisma.user.findUnique as jest.Mock).mockResolvedValue(null);

      await optionalAuth(req as AuthRequest, res as Response, next);

      expect(next).toHaveBeenCalled();
      expect(req.user).toBeUndefined();
    });
  });

  describe("authorize", () => {
    it("should throw UnauthorizedError when user is not set", () => {
      const middleware = authorize("admin");

      expect(() => {
        middleware(req as AuthRequest, res as Response, next);
      }).toThrow(UnauthorizedError);
    });

    it("should throw ForbiddenError when user role is not allowed", () => {
      req.user = { ...testUser, role: "user" };
      const middleware = authorize("admin");

      expect(() => {
        middleware(req as AuthRequest, res as Response, next);
      }).toThrow(ForbiddenError);
    });

    it("should call next when user role is allowed", () => {
      req.user = { ...testUser, role: "admin" };
      const middleware = authorize("admin");

      middleware(req as AuthRequest, res as Response, next);

      expect(next).toHaveBeenCalled();
    });

    it("should support multiple allowed roles", () => {
      req.user = { ...testUser, role: "moderator" };
      const middleware = authorize("admin", "moderator");

      middleware(req as AuthRequest, res as Response, next);

      expect(next).toHaveBeenCalled();
    });
  });
});
