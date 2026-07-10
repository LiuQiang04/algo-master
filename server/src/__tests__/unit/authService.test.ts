/**
 * Unit tests for authService.
 * Covers: register, login, refreshToken, changePassword, forgotPassword.
 *
 * Mocks: prisma (utils/prisma), password (utils/password), jwt (utils/jwt)
 * Error classes are NOT mocked — we assert against real implementations.
 */

// Mock modules before imports
jest.mock("../../utils/prisma", () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    loginStreak: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
  },
}));

jest.mock("../../utils/password", () => ({
  hashPassword: jest.fn(),
  comparePassword: jest.fn(),
  validatePasswordStrength: jest.fn(),
}));

jest.mock("../../utils/jwt", () => ({
  generateToken: jest.fn(),
  generateRefreshToken: jest.fn(),
  verifyToken: jest.fn(),
}));

import { prisma } from "../../utils/prisma";
import { hashPassword, comparePassword, validatePasswordStrength } from "../../utils/password";
import { generateToken, generateRefreshToken, verifyToken } from "../../utils/jwt";
import {
  register,
  login,
  refreshToken,
  changePassword,
  forgotPassword,
} from "../../services/authService";
import {
  BadRequestError,
  UnauthorizedError,
  ConflictError,
  NotFoundError,
} from "../../utils/errors";

// ==================== Helpers ====================

/**
 * Create a full mock user matching the Prisma User model.
 * All fields are present to prevent partial-mock anti-pattern.
 */
function createMockUser(overrides: Record<string, unknown> = {}) {
  return {
    id: "user-id-123",
    username: "testuser",
    email: "test@example.com",
    passwordHash: "hashed_password_abc123",
    avatarUrl: null,
    bio: null,
    rating: 1500,
    experiencePoints: 0,
    level: 1,
    role: "user",
    region: null,
    title: null,
    createdAt: new Date("2026-01-01T00:00:00.000Z"),
    updatedAt: new Date("2026-01-06T00:00:00.000Z"),
    ...overrides,
  };
}

// ==================== Tests ====================

describe("authService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ---------------------------------------------------------------
  // register
  // ---------------------------------------------------------------
  describe("register", () => {
    const validData = {
      username: "newuser",
      email: "new@example.com",
      password: "StrongPass1",
    };

    it("should register a new user successfully", async () => {
      (validatePasswordStrength as jest.Mock).mockReturnValue({
        valid: true,
        errors: [],
      });
      (prisma.user.findUnique as jest.Mock)
        .mockResolvedValueOnce(null)  // no duplicate username
        .mockResolvedValueOnce(null); // no duplicate email
      (hashPassword as jest.Mock).mockResolvedValue("hashed_strongpass1");
      (prisma.user.create as jest.Mock).mockResolvedValue({
        id: "new-user-id-456",
        username: validData.username,
        email: validData.email,
        avatarUrl: null,
        rating: 1500,
        experiencePoints: 0,
        level: 1,
        createdAt: new Date("2026-01-01T00:00:00.000Z"),
      });
      (generateToken as jest.Mock).mockReturnValue("access-token-abc");
      (generateRefreshToken as jest.Mock).mockReturnValue("refresh-token-xyz");

      const result = await register(validData);

      expect(result).toEqual({
        user: {
          id: "new-user-id-456",
          username: validData.username,
          email: validData.email,
          avatarUrl: null,
          rating: 1500,
          experiencePoints: 0,
          level: 1,
          createdAt: expect.any(Date),
        },
        accessToken: "access-token-abc",
        refreshToken: "refresh-token-xyz",
      });

      // Token payload uses hardcoded role 'USER' for newly registered users
      expect(generateToken as jest.Mock).toHaveBeenCalledWith(
        expect.objectContaining({
          id: "new-user-id-456",
          username: validData.username,
          email: validData.email,
          role: "USER",
        })
      );
    });

    it("should throw ConflictError when username already exists", async () => {
      (validatePasswordStrength as jest.Mock).mockReturnValue({
        valid: true,
        errors: [],
      });
      (prisma.user.findUnique as jest.Mock).mockResolvedValueOnce(
        createMockUser({ username: validData.username })
      );

      await expect(register(validData)).rejects.toThrow(ConflictError);
      expect(prisma.user.create).not.toHaveBeenCalled();
    });

    it("should throw ConflictError when email already exists", async () => {
      (validatePasswordStrength as jest.Mock).mockReturnValue({
        valid: true,
        errors: [],
      });
      (prisma.user.findUnique as jest.Mock)
        .mockResolvedValueOnce(null)  // username check passes
        .mockResolvedValueOnce(
          createMockUser({ email: validData.email })
        ); // email collision

      await expect(register(validData)).rejects.toThrow(ConflictError);
      expect(prisma.user.create).not.toHaveBeenCalled();
    });

    it("should throw BadRequestError when password is weak", async () => {
      (validatePasswordStrength as jest.Mock).mockReturnValue({
        valid: false,
        errors: [
          "密码长度至少为8位",
          "密码必须包含至少一个大写字母",
          "密码必须包含至少一个数字",
        ],
      });

      await expect(register(validData)).rejects.toThrow(BadRequestError);
      // No DB queries should be made if validation fails
      expect(prisma.user.findUnique).not.toHaveBeenCalled();
      expect(prisma.user.create).not.toHaveBeenCalled();
    });
  });

  // ---------------------------------------------------------------
  // login
  // ---------------------------------------------------------------
  describe("login", () => {
    const loginData = { email: "test@example.com", password: "CorrectPass1" };

    it("should login successfully with email", async () => {
      const mockUser = createMockUser({
        id: "user-id-123",
        username: "testuser",
        email: "test@example.com",
        passwordHash: "hashed_correctpass",
        avatarUrl: "https://example.com/avatar.png",
        rating: 1600,
        experiencePoints: 250,
        level: 3,
        role: "user",
      });
      (prisma.user.findFirst as jest.Mock).mockResolvedValue(mockUser);
      (comparePassword as jest.Mock).mockResolvedValue(true);
      // updateLoginStreak internals
      (prisma.loginStreak.findUnique as jest.Mock).mockResolvedValue(null);
      (generateToken as jest.Mock).mockReturnValue("access-token-login");
      (generateRefreshToken as jest.Mock).mockReturnValue("refresh-token-login");

      const result = await login(loginData);

      expect(result).toEqual({
        user: {
          id: "user-id-123",
          username: "testuser",
          email: "test@example.com",
          avatarUrl: "https://example.com/avatar.png",
          rating: 1600,
          experiencePoints: 250,
          level: 3,
          role: "user",
        },
        accessToken: "access-token-login",
        refreshToken: "refresh-token-login",
      });

      // verify findFirst uses OR for email/username
      expect(prisma.user.findFirst).toHaveBeenCalledWith({
        where: {
          OR: [{ email: loginData.email }, { username: loginData.email }],
        },
      });
    });

    it("should login successfully with username instead of email", async () => {
      (prisma.user.findFirst as jest.Mock).mockResolvedValue(
        createMockUser({
          username: loginData.email, // the "email" field contains a username
          email: "real-email@example.com",
        })
      );
      (comparePassword as jest.Mock).mockResolvedValue(true);
      (prisma.loginStreak.findUnique as jest.Mock).mockResolvedValue(null);
      (generateToken as jest.Mock).mockReturnValue("token");
      (generateRefreshToken as jest.Mock).mockReturnValue("token");

      const result = await login(loginData);

      expect(result.user.username).toBe(loginData.email);
      expect(result.user.email).toBe("real-email@example.com");
    });

    it("should throw UnauthorizedError when user does not exist", async () => {
      (prisma.user.findFirst as jest.Mock).mockResolvedValue(null);

      await expect(login(loginData)).rejects.toThrow(UnauthorizedError);
    });

    it("should throw UnauthorizedError when password is wrong", async () => {
      (prisma.user.findFirst as jest.Mock).mockResolvedValue(createMockUser());
      (comparePassword as jest.Mock).mockResolvedValue(false);

      await expect(login(loginData)).rejects.toThrow(UnauthorizedError);
    });
  });

  // ---------------------------------------------------------------
  // refreshToken
  // ---------------------------------------------------------------
  describe("refreshToken", () => {
    it("should return new tokens when refresh token is valid", async () => {
      (verifyToken as jest.Mock).mockReturnValue({
        id: "user-id-123",
        username: "testuser",
        email: "test@example.com",
        role: "user",
      });
      (prisma.user.findUnique as jest.Mock).mockResolvedValue({
        id: "user-id-123",
        username: "testuser",
        email: "test@example.com",
        role: "user",
      });
      (generateToken as jest.Mock).mockReturnValue("new-access-token");
      (generateRefreshToken as jest.Mock).mockReturnValue("new-refresh-token");

      const result = await refreshToken("valid-refresh-token");

      expect(result).toEqual({
        accessToken: "new-access-token",
        refreshToken: "new-refresh-token",
      });
      expect(generateToken as jest.Mock).toHaveBeenCalledWith(
        expect.objectContaining({ id: "user-id-123", role: "user" })
      );
    });

    it("should throw UnauthorizedError when token is invalid", async () => {
      (verifyToken as jest.Mock).mockImplementation(() => {
        throw new Error("jwt malformed");
      });

      await expect(refreshToken("invalid-token")).rejects.toThrow(
        UnauthorizedError
      );
    });

    it("should throw UnauthorizedError when user is not found", async () => {
      (verifyToken as jest.Mock).mockReturnValue({
        id: "nonexistent-id",
        username: "ghost",
        email: "ghost@example.com",
        role: "user",
      });
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(
        refreshToken("token-for-nonexistent-user")
      ).rejects.toThrow(UnauthorizedError);
    });
  });

  // ---------------------------------------------------------------
  // changePassword
  // ---------------------------------------------------------------
  describe("changePassword", () => {
    const userId = "user-id-123";

    it("should change password successfully", async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(
        createMockUser({ passwordHash: "old_hashed_password" })
      );
      (comparePassword as jest.Mock).mockResolvedValue(true);
      (validatePasswordStrength as jest.Mock).mockReturnValue({
        valid: true,
        errors: [],
      });
      (hashPassword as jest.Mock).mockResolvedValue("new_hashed_password");
      (prisma.user.update as jest.Mock).mockResolvedValue({});

      const result = await changePassword(userId, "OldPass1", "NewStrongPass1");

      expect(result).toEqual({ message: "密码修改成功" });
      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: userId },
        data: { passwordHash: "new_hashed_password" },
      });
    });

    it("should throw NotFoundError when user does not exist", async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(
        changePassword(userId, "OldPass1", "NewStrongPass1")
      ).rejects.toThrow(NotFoundError);
      expect(prisma.user.update).not.toHaveBeenCalled();
    });

    it("should throw BadRequestError when old password is wrong", async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(
        createMockUser({ passwordHash: "actual_hashed" })
      );
      (comparePassword as jest.Mock).mockResolvedValue(false);

      await expect(
        changePassword(userId, "WrongOldPass", "NewStrongPass1")
      ).rejects.toThrow(BadRequestError);
      expect(prisma.user.update).not.toHaveBeenCalled();
    });

    it("should throw BadRequestError when new password is weak", async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(
        createMockUser({ passwordHash: "actual_hashed" })
      );
      (comparePassword as jest.Mock).mockResolvedValue(true);
      (validatePasswordStrength as jest.Mock).mockReturnValue({
        valid: false,
        errors: ["密码长度至少为8位"],
      });

      await expect(
        changePassword(userId, "OldPass1", "short")
      ).rejects.toThrow(BadRequestError);
      expect(prisma.user.update).not.toHaveBeenCalled();
    });
  });

  // ---------------------------------------------------------------
  // forgotPassword
  // ---------------------------------------------------------------
  describe("forgotPassword", () => {
    it("should return reset message when user exists", async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(createMockUser());

      const result = await forgotPassword("test@example.com");

      expect(result).toEqual({
        message: "如果该邮箱存在，我们已发送重置链接",
      });
    });

    it("should return the same reset message when user does not exist (no info leak)", async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

      const result = await forgotPassword("nonexistent@example.com");

      expect(result).toEqual({
        message: "如果该邮箱存在，我们已发送重置链接",
      });
    });

    it("should query user by email", async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

      await forgotPassword("query-check@example.com");

      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { email: "query-check@example.com" },
      });
    });
  });
});
