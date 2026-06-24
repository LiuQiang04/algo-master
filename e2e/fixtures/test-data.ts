/**
 * E2E test fixtures - shared test data for Playwright tests.
 */

export const TEST_USERS = {
  valid: {
    username: "alice",
    email: "alice@example.com",
    password: "Test123456",
  },
  admin: {
    username: "bob",
    email: "bob@example.com",
    password: "Test123456",
  },
};

export const URLS = {
  home: "/",
  login: "/login",
  register: "/register",
  problems: "/problems",
  contests: "/contests",
  community: "/community",
  profile: "/profile",
  leaderboard: "/leaderboard",
};

export const TIMEOUTS = {
  navigation: 10000,
  action: 5000,
  assertion: 3000,
};
