/**
 * E2E test fixtures - shared test data for Playwright tests.
 */

export const TEST_USERS = {
  valid: {
    username: "e2etestuser",
    email: "e2etest@algoarena.test",
    password: "E2ETest@123456",
  },
  admin: {
    username: "e2eadmin",
    email: "e2eadmin@algoarena.test",
    password: "E2EAdmin@123456",
  },
};

export const URLS = {
  home: "/",
  login: "/login",
  register: "/register",
  problems: "/problems",
  contests: "/contests",
  community: "/community",
  leaderboard: "/leaderboard",
};

export const TIMEOUTS = {
  navigation: 10000,
  action: 5000,
  assertion: 3000,
};
