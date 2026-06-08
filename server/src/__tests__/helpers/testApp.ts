/**
 * Test application helper.
 * Creates an Express app instance for testing without starting the server.
 */

import express from "express";
import cors from "cors";
import { PrismaClient } from "@prisma/client";

export function createTestApp(prisma: PrismaClient) {
  const app = express();

  // Middleware
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Health check
  app.get("/health", (_req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  // Inject prisma into request for route handlers
  app.use((req, _res, next) => {
    (req as any).prisma = prisma;
    next();
  });

  return app;
}
