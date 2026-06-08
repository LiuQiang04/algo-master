-- ============================================================
-- Algo OJ - Database Initialization Script
-- ============================================================
-- This script runs automatically when the PostgreSQL container
-- starts for the first time. It creates extensions and sets
-- up the database configuration.
-- ============================================================

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Enable trigram extension for fuzzy text search
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Create custom types
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('user', 'admin', 'moderator');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE submission_status AS ENUM (
        'pending', 'judging', 'accepted', 'wrong_answer',
        'time_limit', 'memory_limit', 'runtime_error', 'compile_error'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE contest_status AS ENUM ('upcoming', 'running', 'ended');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE post_type AS ENUM ('discussion', 'solution', 'question');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Set default configuration
ALTER DATABASE algo_oj SET timezone TO 'Asia/Shanghai';
ALTER DATABASE algo_oj SET default_text_search_config TO 'english';
