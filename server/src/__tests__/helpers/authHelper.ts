/**
 * Authentication test helper.
 * Utilities for generating tokens and auth headers in tests.
 */

import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

const JWT_SECRET = process.env.JWT_SECRET || "test-jwt-secret-key-for-testing-only";

export interface TestUser {
  id: string;
  username: string;
  email: string;
  passwordHash: string;
}

/**
 * Generate a JWT token for a test user.
 */
export function generateToken(user: { id: string; username: string; email: string }): string {
  return jwt.sign(
    { id: user.id, username: user.username, email: user.email },
    JWT_SECRET,
    { expiresIn: "1h" }
  );
}

/**
 * Generate an Authorization header value for a test user.
 */
export function authHeader(user: { id: string; username: string; email: string }): string {
  return `Bearer ${generateToken(user)}`;
}

/**
 * Hash a password for test user creation.
 */
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

/**
 * Create default test user data.
 */
export function createTestUserData(overrides: Partial<TestUser> = {}): TestUser {
  return {
    id: overrides.id || "test-user-id-001",
    username: overrides.username || "testuser",
    email: overrides.email || "test@example.com",
    passwordHash: overrides.passwordHash || "$2b$10$abcdefghijklmnopqrstuuABCDEFGHIJKLMNOPQRSTUVWXYZ12", // placeholder
  };
}

/**
 * Generate an expired JWT token (for testing token expiration).
 */
export function generateExpiredToken(user: { id: string; username: string; email: string }): string {
  return jwt.sign(
    { id: user.id, username: user.username, email: user.email },
    JWT_SECRET,
    { expiresIn: "0s" }
  );
}

/**
 * Generate an invalid token (for testing invalid token handling).
 */
export function generateInvalidToken(): string {
  return "invalid.token.value";
}
