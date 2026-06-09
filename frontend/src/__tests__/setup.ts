/**
 * Jest setup file for frontend tests.
 * Runs after the test environment is installed.
 */

import "@testing-library/jest-dom";

// Polyfill TextEncoder/TextDecoder for jsdom (required by react-router-dom v7)
import { TextEncoder, TextDecoder } from "util";

Object.assign(globalThis, {
  TextEncoder,
  TextDecoder,
});

// Mock import.meta.env for Vite environment variables
Object.defineProperty(globalThis, 'import', {
  value: {
    meta: {
      env: {
        VITE_USE_MOCK: 'false',
        VITE_API_BASE_URL: 'http://localhost:3001',
      },
    },
  },
  writable: true,
  configurable: true,
});
