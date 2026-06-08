#!/bin/bash
# ============================================================
# Algo OJ - Database Reset Script
# ============================================================
# Resets the database to a clean state and re-seeds data.
# WARNING: This will destroy all data!
# Usage: npm run db:reset (via package.json)
# ============================================================

set -euo pipefail

echo "=== Algo OJ Database Reset ==="
echo ""
echo "WARNING: This will destroy ALL data in the database."
read -p "Are you sure? (yes/no): " CONFIRM

if [ "$CONFIRM" != "yes" ]; then
    echo "Reset cancelled."
    exit 0
fi

echo ""
echo "[1/3] Resetting database with Prisma..."
cd "$(dirname "$0")/.."
npx prisma migrate reset --force

echo ""
echo "[2/3] Applying migrations..."
npx prisma migrate deploy

echo ""
echo "[3/3] Seeding database..."
npx tsx prisma/seed.ts

echo ""
echo "=== Database reset complete ==="
