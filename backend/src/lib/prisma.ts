/**
 * ============================================================
 * Prisma Client Singleton
 * ============================================================
 * Prevents multiple Prisma Client instances in development
 * due to hot-reloading. In production, a single instance is
 * created and reused throughout the application lifecycle.
 * ============================================================
 */

import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "error", "warn"]
        : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

export default prisma;
