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
