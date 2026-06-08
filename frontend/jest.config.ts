import type { Config } from "jest";

const config: Config = {
  preset: "ts-jest/presets/default-esm",
  testEnvironment: "jsdom",
  roots: ["<rootDir>/src"],
  testMatch: [
    "**/__tests__/**/*.test.tsx",
    "**/__tests__/**/*.test.ts",
    "**/*.test.tsx",
    "**/*.test.ts",
  ],
  transform: {
    "^.+\\.tsx?$": [
      "ts-jest",
      {
        useESM: true,
        tsconfig: {
          target: "es2023",
          lib: ["ES2023", "DOM"],
          module: "commonjs",
          moduleResolution: "node",
          jsx: "react-jsx",
          strict: true,
          skipLibCheck: true,
          noEmit: false,
          esModuleInterop: true,
          allowSyntheticDefaultImports: true,
          baseUrl: ".",
          paths: { "@/*": ["src/*"] },
        },
        diagnostics: false,
      },
    ],
  },
  moduleNameMapper: {
    "\\.(css|less|scss|sass)$": "identity-obj-proxy",
    "\\.(jpg|jpeg|png|gif|svg)$": "<rootDir>/src/__tests__/__mocks__/fileMock.ts",
    "^@/(.*)$": "<rootDir>/src/$1",
  },
  setupFilesAfterEnv: [
    "<rootDir>/src/__tests__/setup.ts",
  ],
  extensionsToTreatAsEsm: [".ts", ".tsx"],
  collectCoverageFrom: [
    "src/**/*.{ts,tsx}",
    "!src/**/*.d.ts",
    "!src/__tests__/**",
    "!src/main.tsx",
    "!src/vite-env.d.ts",
  ],
  coverageDirectory: "coverage",
  coverageReporters: ["text", "lcov", "clover"],
  verbose: true,
};

export default config;
