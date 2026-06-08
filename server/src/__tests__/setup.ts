/**
 * Jest global setup file for backend tests.
 * Runs once before all test suites.
 */

import dotenv from "dotenv";
import path from "path";

// Load test environment variables
dotenv.config({ path: path.resolve(__dirname, "../../.env.test") });

// Set default test environment variables if not loaded
process.env.NODE_ENV = "test";
process.env.JWT_SECRET = process.env.JWT_SECRET || "test-jwt-secret-key-for-testing-only";
process.env.JWT_EXPIRES_IN = "1h";
process.env.PORT = "3002";
