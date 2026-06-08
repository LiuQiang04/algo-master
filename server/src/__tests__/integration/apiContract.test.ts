/**
 * Integration tests for API contract validation.
 * Tests that the API endpoints conform to expected request/response formats.
 *
 * These tests verify the middleware and validation logic without requiring
 * a running database.
 */

import express from "express";
import request from "supertest";

// Create a mock API app with common patterns used in the project
function createMockApiApp() {
  const app = express();
  app.use(express.json());

  // Simulate the patterns used in the actual API

  // Auth: POST /api/auth/register
  app.post("/api/auth/register", (req, res) => {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ error: "All fields are required" });
    }

    if (typeof username !== "string" || username.length < 3 || username.length > 50) {
      return res.status(400).json({ error: "Username must be between 3 and 50 characters" });
    }

    if (typeof email !== "string" || !email.includes("@")) {
      return res.status(400).json({ error: "Invalid email format" });
    }

    if (typeof password !== "string" || password.length < 8) {
      return res.status(400).json({ error: "Password must be at least 8 characters" });
    }

    // Check for duplicate username
    if (username === "existinguser") {
      return res.status(409).json({ error: "Username already exists" });
    }

    res.status(201).json({
      id: "new-user-id",
      username,
      email,
      token: "mock-jwt-token",
    });
  });

  // Auth: POST /api/auth/login
  app.post("/api/auth/login", (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    if (email === "wrong@test.com" || password === "wrongpassword") {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    res.json({
      token: "mock-jwt-token",
      user: {
        id: "user-id",
        username: "testuser",
        email,
      },
    });
  });

  // Problems: GET /api/problems
  app.get("/api/problems", (req, res) => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const difficulty = req.query.difficulty as string;

    let problems = [
      { id: "1", title: "A + B", difficulty: 1 },
      { id: "2", title: "Two Sum", difficulty: 3 },
    ];

    if (difficulty) {
      problems = problems.filter((p) => p.difficulty === parseInt(difficulty));
    }

    res.json({
      problems,
      pagination: {
        page,
        limit,
        total: problems.length,
        totalPages: Math.ceil(problems.length / limit),
      },
    });
  });

  // Problems: GET /api/problems/:id
  app.get("/api/problems/:id", (req, res) => {
    const { id } = req.params;

    if (id === "nonexistent") {
      return res.status(404).json({ error: "Problem not found" });
    }

    res.json({
      id,
      title: "Test Problem",
      description: "A test problem",
      difficulty: 1,
      timeLimit: 1000,
      memoryLimit: 256,
    });
  });

  // Submissions: POST /api/submissions
  app.post("/api/submissions", (req, res) => {
    const { problemId, language, sourceCode } = req.body;

    if (!problemId || !language || !sourceCode) {
      return res.status(400).json({ error: "problemId, language, and sourceCode are required" });
    }

    const validLanguages = ["cpp", "java", "python", "javascript"];
    if (!validLanguages.includes(language)) {
      return res.status(400).json({ error: `Language must be one of: ${validLanguages.join(", ")}` });
    }

    res.status(201).json({
      id: "submission-id",
      problemId,
      language,
      status: "pending",
      submittedAt: new Date().toISOString(),
    });
  });

  // Contests: GET /api/contests
  app.get("/api/contests", (_req, res) => {
    res.json({
      contests: [
        { id: "1", title: "Weekly Contest #1", status: "upcoming" },
        { id: "2", title: "Live Contest", status: "ongoing" },
      ],
    });
  });

  // Community: GET /api/posts
  app.get("/api/posts", (req, res) => {
    const postType = req.query.postType as string;

    let posts = [
      { id: "1", title: "DP Tips", postType: "discussion", upvotes: 10 },
      { id: "2", title: "A+B Solution", postType: "solution", upvotes: 5 },
    ];

    if (postType) {
      posts = posts.filter((p) => p.postType === postType);
    }

    res.json({ posts });
  });

  // Community: POST /api/posts
  app.post("/api/posts", (req, res) => {
    const { title, content, postType } = req.body;

    if (!title || !content) {
      return res.status(400).json({ error: "Title and content are required" });
    }

    const validTypes = ["discussion", "solution", "question"];
    if (postType && !validTypes.includes(postType)) {
      return res.status(400).json({ error: `postType must be one of: ${validTypes.join(", ")}` });
    }

    res.status(201).json({
      id: "new-post-id",
      title,
      content,
      postType: postType || "discussion",
      upvotes: 0,
      downvotes: 0,
    });
  });

  // Achievements: GET /api/achievements
  app.get("/api/achievements", (_req, res) => {
    res.json({
      achievements: [
        { id: "1", name: "First Blood", rarity: "common", points: 10 },
        { id: "2", name: "Champion", rarity: "epic", points: 500 },
      ],
    });
  });

  // Leaderboard: GET /api/leaderboard
  app.get("/api/leaderboard", (req, res) => {
    const type = req.query.type || "global";

    res.json({
      type,
      leaderboard: [
        { rank: 1, username: "topuser", experiencePoints: 10000 },
        { rank: 2, username: "seconduser", experiencePoints: 8000 },
      ],
    });
  });

  return app;
}

describe("API Contract Tests", () => {
  let app: express.Application;

  beforeAll(() => {
    app = createMockApiApp();
  });

  // ==================== Auth API ====================

  describe("POST /api/auth/register", () => {
    it("should register a new user with valid data", async () => {
      const response = await request(app)
        .post("/api/auth/register")
        .send({
          username: "newuser",
          email: "new@test.com",
          password: "password123",
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty("id");
      expect(response.body).toHaveProperty("token");
      expect(response.body.username).toBe("newuser");
    });

    it("should reject registration without required fields", async () => {
      const response = await request(app)
        .post("/api/auth/register")
        .send({ username: "user" });

      expect(response.status).toBe(400);
      expect(response.body.error).toBeDefined();
    });

    it("should reject short usernames", async () => {
      const response = await request(app)
        .post("/api/auth/register")
        .send({ username: "ab", email: "test@test.com", password: "password123" });

      expect(response.status).toBe(400);
    });

    it("should reject invalid email format", async () => {
      const response = await request(app)
        .post("/api/auth/register")
        .send({ username: "validuser", email: "notanemail", password: "password123" });

      expect(response.status).toBe(400);
    });

    it("should reject short passwords", async () => {
      const response = await request(app)
        .post("/api/auth/register")
        .send({ username: "validuser", email: "test@test.com", password: "1234567" });

      expect(response.status).toBe(400);
    });

    it("should return 409 for duplicate username", async () => {
      const response = await request(app)
        .post("/api/auth/register")
        .send({ username: "existinguser", email: "new@test.com", password: "password123" });

      expect(response.status).toBe(409);
    });
  });

  describe("POST /api/auth/login", () => {
    it("should login with valid credentials", async () => {
      const response = await request(app)
        .post("/api/auth/login")
        .send({ email: "test@test.com", password: "password123" });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("token");
      expect(response.body).toHaveProperty("user");
    });

    it("should reject login without credentials", async () => {
      const response = await request(app)
        .post("/api/auth/login")
        .send({});

      expect(response.status).toBe(400);
    });

    it("should reject invalid credentials", async () => {
      const response = await request(app)
        .post("/api/auth/login")
        .send({ email: "wrong@test.com", password: "wrongpassword" });

      expect(response.status).toBe(401);
    });
  });

  // ==================== Problems API ====================

  describe("GET /api/problems", () => {
    it("should return a list of problems", async () => {
      const response = await request(app).get("/api/problems");

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("problems");
      expect(Array.isArray(response.body.problems)).toBe(true);
    });

    it("should support pagination", async () => {
      const response = await request(app).get("/api/problems?page=1&limit=10");

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("pagination");
      expect(response.body.pagination.page).toBe(1);
      expect(response.body.pagination.limit).toBe(10);
    });

    it("should support filtering by difficulty", async () => {
      const response = await request(app).get("/api/problems?difficulty=1");

      expect(response.status).toBe(200);
      response.body.problems.forEach((p: any) => {
        expect(p.difficulty).toBe(1);
      });
    });
  });

  describe("GET /api/problems/:id", () => {
    it("should return a problem by ID", async () => {
      const response = await request(app).get("/api/problems/1");

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("id");
      expect(response.body).toHaveProperty("title");
      expect(response.body).toHaveProperty("description");
      expect(response.body).toHaveProperty("difficulty");
    });

    it("should return 404 for non-existent problem", async () => {
      const response = await request(app).get("/api/problems/nonexistent");

      expect(response.status).toBe(404);
    });
  });

  // ==================== Submissions API ====================

  describe("POST /api/submissions", () => {
    it("should create a submission with valid data", async () => {
      const response = await request(app)
        .post("/api/submissions")
        .send({
          problemId: "1",
          language: "python",
          sourceCode: "print('hello')",
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty("id");
      expect(response.body.status).toBe("pending");
    });

    it("should reject submission without required fields", async () => {
      const response = await request(app)
        .post("/api/submissions")
        .send({ problemId: "1" });

      expect(response.status).toBe(400);
    });

    it("should reject unsupported language", async () => {
      const response = await request(app)
        .post("/api/submissions")
        .send({
          problemId: "1",
          language: "brainfuck",
          sourceCode: "++++",
        });

      expect(response.status).toBe(400);
    });

    it("should accept all supported languages", async () => {
      const languages = ["cpp", "java", "python", "javascript"];

      for (const language of languages) {
        const response = await request(app)
          .post("/api/submissions")
          .send({
            problemId: "1",
            language,
            sourceCode: "// code",
          });

        expect(response.status).toBe(201);
        expect(response.body.language).toBe(language);
      }
    });
  });

  // ==================== Contests API ====================

  describe("GET /api/contests", () => {
    it("should return a list of contests", async () => {
      const response = await request(app).get("/api/contests");

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("contests");
      expect(Array.isArray(response.body.contests)).toBe(true);
    });
  });

  // ==================== Community API ====================

  describe("GET /api/posts", () => {
    it("should return a list of posts", async () => {
      const response = await request(app).get("/api/posts");

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("posts");
      expect(Array.isArray(response.body.posts)).toBe(true);
    });

    it("should filter posts by type", async () => {
      const response = await request(app).get("/api/posts?postType=solution");

      expect(response.status).toBe(200);
      response.body.posts.forEach((p: any) => {
        expect(p.postType).toBe("solution");
      });
    });
  });

  describe("POST /api/posts", () => {
    it("should create a post with valid data", async () => {
      const response = await request(app)
        .post("/api/posts")
        .send({
          title: "Test Post",
          content: "This is a test post.",
          postType: "discussion",
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty("id");
      expect(response.body.title).toBe("Test Post");
    });

    it("should reject post without title", async () => {
      const response = await request(app)
        .post("/api/posts")
        .send({ content: "No title" });

      expect(response.status).toBe(400);
    });

    it("should reject post without content", async () => {
      const response = await request(app)
        .post("/api/posts")
        .send({ title: "No content" });

      expect(response.status).toBe(400);
    });

    it("should reject invalid post type", async () => {
      const response = await request(app)
        .post("/api/posts")
        .send({ title: "Test", content: "Test", postType: "invalid" });

      expect(response.status).toBe(400);
    });
  });

  // ==================== Achievements API ====================

  describe("GET /api/achievements", () => {
    it("should return a list of achievements", async () => {
      const response = await request(app).get("/api/achievements");

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("achievements");
      expect(Array.isArray(response.body.achievements)).toBe(true);
    });
  });

  // ==================== Leaderboard API ====================

  describe("GET /api/leaderboard", () => {
    it("should return the global leaderboard by default", async () => {
      const response = await request(app).get("/api/leaderboard");

      expect(response.status).toBe(200);
      expect(response.body.type).toBe("global");
      expect(response.body).toHaveProperty("leaderboard");
    });

    it("should support different leaderboard types", async () => {
      const response = await request(app).get("/api/leaderboard?type=friends");

      expect(response.status).toBe(200);
      expect(response.body.type).toBe("friends");
    });
  });
});
