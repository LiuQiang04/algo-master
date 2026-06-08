#!/bin/bash
# Database initialization script
# Runs automatically on first postgres container start

set -e

echo "Initializing AlgoArena database..."

# Create extensions
psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-EOSQL
    CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
    CREATE EXTENSION IF NOT EXISTS "pg_trgm";

    -- Create indexes for full-text search (future use)
    -- These will be used by Prisma migrations

    \echo 'Database extensions created successfully'
EOSQL

echo "Database initialization complete."
