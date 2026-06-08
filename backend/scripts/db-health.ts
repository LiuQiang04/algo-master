/**
 * ============================================================
 * Algo OJ - Database Health Check Script
 * ============================================================
 * Checks database connectivity, table existence, and basic stats.
 * Usage: npm run db:health
 * ============================================================
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

interface TableInfo {
  table_name: string;
  row_count: bigint;
}

async function main() {
  console.log("=== Algo OJ Database Health Check ===\n");

  // 1. Connection test
  console.log("[1] Testing database connection...");
  try {
    await prisma.$queryRaw`SELECT 1`;
    console.log("  PASS: Database connection successful\n");
  } catch (error) {
    console.error("  FAIL: Cannot connect to database");
    console.error(`  Error: ${error}\n`);
    process.exit(1);
  }

  // 2. PostgreSQL version
  console.log("[2] PostgreSQL version...");
  const versionResult = await prisma.$queryRaw<[{ version: string }]>`SELECT version()`;
  console.log(`  ${versionResult[0].version}\n`);

  // 3. Table existence check
  console.log("[3] Checking tables...");
  const expectedTables = [
    "users",
    "achievements",
    "user_achievements",
    "problems",
    "tags",
    "problem_tags",
    "submissions",
    "test_cases",
    "contests",
    "contest_problems",
    "contest_participants",
    "posts",
    "comments",
    "learning_paths",
    "learning_modules",
    "module_problems",
    "learning_progress",
    "point_history",
    "daily_challenges",
    "daily_challenge_completions",
    "login_streaks",
    "virtual_items",
    "user_virtual_items",
    "friendships",
    "notifications",
  ];

  const existingTables = await prisma.$queryRaw<{ table_name: string }[]>`
    SELECT table_name
    FROM information_schema.tables
    WHERE table_schema = 'public'
    AND table_type = 'BASE TABLE'
    ORDER BY table_name
  `;

  const existingNames = existingTables.map((t) => t.table_name);
  let allPresent = true;

  for (const table of expectedTables) {
    const exists = existingNames.includes(table);
    console.log(`  ${exists ? "PASS" : "MISSING"}: ${table}`);
    if (!exists) allPresent = false;
  }
  console.log();

  if (!allPresent) {
    console.log("  WARNING: Some tables are missing. Run 'npm run db:migrate' first.\n");
  }

  // 4. Row counts
  console.log("[4] Table row counts...");
  const tables = [
    "users", "problems", "tags", "submissions", "test_cases",
    "contests", "contest_problems", "contest_participants",
    "posts", "comments", "achievements", "user_achievements",
    "learning_paths", "learning_modules", "module_problems", "learning_progress",
    "point_history", "daily_challenges", "daily_challenge_completions",
    "login_streaks", "virtual_items", "user_virtual_items",
    "friendships", "notifications",
  ];

  for (const table of tables) {
    try {
      const result = await prisma.$queryRawUnsafe<{ count: bigint }[]>(
        `SELECT COUNT(*) as count FROM "${table}"`
      );
      console.log(`  ${table}: ${result[0].count} rows`);
    } catch {
      console.log(`  ${table}: N/A (table does not exist)`);
    }
  }
  console.log();

  // 5. Index check
  console.log("[5] Index information...");
  const indexes = await prisma.$queryRaw<{ tablename: string; indexname: string }[]>`
    SELECT tablename, indexname
    FROM pg_indexes
    WHERE schemaname = 'public'
    ORDER BY tablename, indexname
  `;

  const indexByTable: Record<string, string[]> = {};
  for (const idx of indexes) {
    if (!indexByTable[idx.tablename]) indexByTable[idx.tablename] = [];
    indexByTable[idx.tablename].push(idx.indexname);
  }

  for (const [table, idxList] of Object.entries(indexByTable)) {
    console.log(`  ${table}: ${idxList.length} indexes`);
  }
  console.log();

  // 6. Database size
  console.log("[6] Database size...");
  const sizeResult = await prisma.$queryRaw<[{ db_size: string }]>`
    SELECT pg_size_pretty(pg_database_size(current_database())) as db_size
  `;
  console.log(`  Total size: ${sizeResult[0].db_size}\n`);

  // 7. Connection stats
  console.log("[7] Connection stats...");
  const connStats = await prisma.$queryRaw<[{ total: bigint; active: bigint; idle: bigint }]>`
    SELECT
      COUNT(*) as total,
      COUNT(*) FILTER (WHERE state = 'active') as active,
      COUNT(*) FILTER (WHERE state = 'idle') as idle
    FROM pg_stat_activity
    WHERE datname = current_database()
  `;
  console.log(`  Total: ${connStats[0].total}, Active: ${connStats[0].active}, Idle: ${connStats[0].idle}\n`);

  console.log("=== Health check complete ===");
}

main()
  .catch((e) => {
    console.error("Health check failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
