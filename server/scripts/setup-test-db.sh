#!/bin/bash
# Setup test database for algo-arena
# Run this script to create and configure the test database

set -e

echo "Setting up test database..."

# Create test database if it doesn't exist
psql -h localhost -U postgres -tc "SELECT 1 FROM pg_database WHERE datname = 'algo_arena_test'" | grep -q 1 || \
  psql -h localhost -U postgres -c "CREATE DATABASE algo_arena_test"

echo "Test database 'algo_arena_test' created (or already exists)."

# Run Prisma migrations on test database
cd "$(dirname "$0")/.."
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/algo_arena_test?schema=public" npx prisma db push --force-reset

echo "Test database schema pushed."

# Seed test data
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/algo_arena_test?schema=public" npx tsx scripts/seed-test-db.ts

echo "Test database seeded."
echo "Setup complete!"
