import type { Config } from "jest";

const config: Config = {
  preset: "ts-jest",
  testEnvironment: "node",
  roots: ["<rootDir>/src"],
  testMatch: [
    "**/__tests__/**/*.test.ts",
    "**/__tests__/**/*.spec.ts",
    "**/*.test.ts",
    "**/*.spec.ts",
  ],
  testPathIgnorePatterns: [
    "/node_modules/",
    "/__tests__/__mocks__/",
    "/__tests__/fixtures/",
    "/__tests__/helpers/",
    "/__tests__/setup.ts",
  ],
  transform: {
    "^.+\\.ts$": ["ts-jest", {
      tsconfig: {
        ...require("./tsconfig.json").compilerOptions,
        strict: false,
        noImplicitAny: false,
      },
      diagnostics: false,
    }],
  },
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
    "^(\\.\\./)+index$": "<rootDir>/src/__tests__/__mocks__/index.ts",
  },
  setupFilesAfterEnv: ["<rootDir>/src/__tests__/setup.ts"],
  testTimeout: 30000,
  collectCoverageFrom: [
    "src/**/*.ts",
    "!src/**/*.d.ts",
    "!src/__tests__/**",
    "!src/index.ts",
  ],
  coverageDirectory: "coverage",
  coverageReporters: ["text", "lcov", "clover"],
  verbose: true,
};

export default config;
