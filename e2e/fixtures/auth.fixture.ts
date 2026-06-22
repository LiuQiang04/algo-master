/**
 * Authentication fixture for Playwright E2E tests.
 * Provides an authenticated page that reuses the saved session state.
 * This avoids logging in before every test, preventing rate limiter issues.
 */

import { test as base, expect } from "@playwright/test";

/**
 * Extended test with authentication support.
 * Use test.use({ storageState: ".auth/user.json" }) in your test files
 * to enable authentication for all tests in that file.
 */
export const test = base;

export { expect } from "@playwright/test";
