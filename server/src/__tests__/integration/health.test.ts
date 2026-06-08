/**
 * Integration tests for the health check endpoint.
 */

import request from "supertest";
import express from "express";

// Create a minimal test app for health check testing
function createHealthApp() {
  const app = express();
  app.use(express.json());

  app.get("/health", (_req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  return app;
}

describe("Health Check API", () => {
  let app: express.Application;

  beforeAll(() => {
    app = createHealthApp();
  });

  describe("GET /health", () => {
    it("should return 200 status code", async () => {
      const response = await request(app).get("/health");
      expect(response.status).toBe(200);
    });

    it("should return status ok", async () => {
      const response = await request(app).get("/health");
      expect(response.body.status).toBe("ok");
    });

    it("should return a valid timestamp", async () => {
      const response = await request(app).get("/health");
      expect(response.body.timestamp).toBeDefined();
      const timestamp = new Date(response.body.timestamp);
      expect(timestamp.getTime()).not.toBeNaN();
    });

    it("should return JSON content type", async () => {
      const response = await request(app).get("/health");
      expect(response.headers["content-type"]).toMatch(/json/);
    });
  });
});
