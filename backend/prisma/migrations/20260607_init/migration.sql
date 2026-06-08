-- ============================================================
-- Algo OJ - Initial Database Migration
-- ============================================================
-- Created: 2026-06-07
-- Description: Creates all tables for the algorithm
--              competition learning platform.
-- Tables: 22 total
--   users, achievements, user_achievements
--   problems, tags, problem_tags, test_cases, submissions
--   contests, contest_problems, contest_participants
--   posts, comments
--   learning_paths, learning_modules, module_problems, learning_progress
--   point_history, daily_challenges, daily_challenge_completions
--   login_streaks, virtual_items, user_virtual_items
--   friendships, notifications
-- ============================================================

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================
-- 1. Users
-- ============================================================

CREATE TABLE "users" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "username" VARCHAR(50) NOT NULL,
    "email" VARCHAR(100) NOT NULL,
    "password_hash" VARCHAR(255) NOT NULL,
    "avatar_url" VARCHAR(500),
    "bio" TEXT,
    "rating" INTEGER NOT NULL DEFAULT 1500,
    "experience_points" INTEGER NOT NULL DEFAULT 0,
    "level" INTEGER NOT NULL DEFAULT 1,
    "role" VARCHAR(20) NOT NULL DEFAULT 'user',
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "last_login_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "users_username_key" ON "users"("username");
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");
CREATE INDEX "users_rating_idx" ON "users"("rating");
CREATE INDEX "users_experience_points_idx" ON "users"("experience_points");
CREATE INDEX "users_created_at_idx" ON "users"("created_at");
CREATE INDEX "users_role_idx" ON "users"("role");

-- ============================================================
-- 2. Achievements
-- ============================================================

CREATE TABLE "achievements" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" VARCHAR(100) NOT NULL,
    "description" TEXT NOT NULL,
    "icon_url" VARCHAR(500),
    "category" VARCHAR(50) NOT NULL,
    "condition" TEXT NOT NULL,
    "points" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "achievements_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "achievements_name_key" ON "achievements"("name");
CREATE INDEX "achievements_category_idx" ON "achievements"("category");

-- ============================================================
-- 3. User Achievements
-- ============================================================

CREATE TABLE "user_achievements" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "achievement_id" UUID NOT NULL,
    "unlocked_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_achievements_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "user_achievements_user_id_achievement_id_key" ON "user_achievements"("user_id", "achievement_id");

-- ============================================================
-- 4. Tags
-- ============================================================

CREATE TABLE "tags" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" VARCHAR(50) NOT NULL,
    "category" VARCHAR(50),

    CONSTRAINT "tags_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "tags_name_key" ON "tags"("name");
CREATE INDEX "tags_category_idx" ON "tags"("category");

-- ============================================================
-- 5. Problems
-- ============================================================

CREATE TABLE "problems" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "title" VARCHAR(200) NOT NULL,
    "description" TEXT NOT NULL,
    "input_format" TEXT,
    "output_format" TEXT,
    "sample_input" TEXT,
    "sample_output" TEXT,
    "hint" TEXT,
    "difficulty" SMALLINT NOT NULL,
    "time_limit" INTEGER NOT NULL DEFAULT 1000,
    "memory_limit" INTEGER NOT NULL DEFAULT 256,
    "author_id" UUID,
    "is_public" BOOLEAN NOT NULL DEFAULT true,
    "solve_count" INTEGER NOT NULL DEFAULT 0,
    "submit_count" INTEGER NOT NULL DEFAULT 0,
    "source" VARCHAR(200),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "problems_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "problems_difficulty_idx" ON "problems"("difficulty");
CREATE INDEX "problems_is_public_idx" ON "problems"("is_public");
CREATE INDEX "problems_author_id_idx" ON "problems"("author_id");
CREATE INDEX "problems_created_at_idx" ON "problems"("created_at");
CREATE INDEX "problems_difficulty_is_public_idx" ON "problems"("difficulty", "is_public");

-- ============================================================
-- 6. Problem Tags (junction table)
-- ============================================================

CREATE TABLE "problem_tags" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "problem_id" UUID NOT NULL,
    "tag_id" UUID NOT NULL,

    CONSTRAINT "problem_tags_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "problem_tags_problem_id_tag_id_key" ON "problem_tags"("problem_id", "tag_id");

-- ============================================================
-- 7. Test Cases
-- ============================================================

CREATE TABLE "test_cases" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "problem_id" UUID NOT NULL,
    "input" TEXT NOT NULL,
    "expected_output" TEXT NOT NULL,
    "is_sample" BOOLEAN NOT NULL DEFAULT false,
    "score" INTEGER NOT NULL DEFAULT 1,
    "order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "test_cases_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "test_cases_problem_id_idx" ON "test_cases"("problem_id");
CREATE INDEX "test_cases_problem_id_is_sample_idx" ON "test_cases"("problem_id", "is_sample");

-- ============================================================
-- 8. Submissions
-- ============================================================

CREATE TABLE "submissions" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "problem_id" UUID NOT NULL,
    "contest_id" UUID,
    "language" VARCHAR(20) NOT NULL,
    "source_code" TEXT NOT NULL,
    "status" VARCHAR(20) NOT NULL DEFAULT 'pending',
    "execution_time" INTEGER,
    "memory_used" INTEGER,
    "score" INTEGER NOT NULL DEFAULT 0,
    "judge_output" TEXT,
    "submitted_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "submissions_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "submissions_user_id_idx" ON "submissions"("user_id");
CREATE INDEX "submissions_problem_id_idx" ON "submissions"("problem_id");
CREATE INDEX "submissions_status_idx" ON "submissions"("status");
CREATE INDEX "submissions_submitted_at_idx" ON "submissions"("submitted_at");
CREATE INDEX "submissions_user_id_problem_id_idx" ON "submissions"("user_id", "problem_id");
CREATE INDEX "submissions_user_id_status_idx" ON "submissions"("user_id", "status");

-- ============================================================
-- 9. Contests
-- ============================================================

CREATE TABLE "contests" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "title" VARCHAR(200) NOT NULL,
    "description" TEXT,
    "start_time" TIMESTAMP(3) NOT NULL,
    "end_time" TIMESTAMP(3) NOT NULL,
    "creator_id" UUID NOT NULL,
    "is_public" BOOLEAN NOT NULL DEFAULT true,
    "max_participants" INTEGER,
    "status" VARCHAR(20) NOT NULL DEFAULT 'upcoming',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "contests_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "contests_start_time_idx" ON "contests"("start_time");
CREATE INDEX "contests_status_idx" ON "contests"("status");
CREATE INDEX "contests_creator_id_idx" ON "contests"("creator_id");
CREATE INDEX "contests_is_public_status_idx" ON "contests"("is_public", "status");

-- ============================================================
-- 10. Contest Problems
-- ============================================================

CREATE TABLE "contest_problems" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "contest_id" UUID NOT NULL,
    "problem_id" UUID NOT NULL,
    "problem_order" CHAR(1) NOT NULL,
    "score" INTEGER NOT NULL DEFAULT 100,

    CONSTRAINT "contest_problems_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "contest_problems_contest_id_problem_id_key" ON "contest_problems"("contest_id", "problem_id");
CREATE UNIQUE INDEX "contest_problems_contest_id_problem_order_key" ON "contest_problems"("contest_id", "problem_order");

-- ============================================================
-- 11. Contest Participants
-- ============================================================

CREATE TABLE "contest_participants" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "contest_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "total_score" INTEGER NOT NULL DEFAULT 0,
    "rank" INTEGER,
    "penalty" INTEGER NOT NULL DEFAULT 0,
    "joined_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "contest_participants_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "contest_participants_contest_id_user_id_key" ON "contest_participants"("contest_id", "user_id");
CREATE INDEX "contest_participants_contest_id_total_score_idx" ON "contest_participants"("contest_id", "total_score");
CREATE INDEX "contest_participants_user_id_idx" ON "contest_participants"("user_id");

-- ============================================================
-- 12. Posts
-- ============================================================

CREATE TABLE "posts" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "title" VARCHAR(200) NOT NULL,
    "content" TEXT NOT NULL,
    "problem_id" UUID,
    "post_type" VARCHAR(20) NOT NULL,
    "upvotes" INTEGER NOT NULL DEFAULT 0,
    "downvotes" INTEGER NOT NULL DEFAULT 0,
    "view_count" INTEGER NOT NULL DEFAULT 0,
    "is_pinned" BOOLEAN NOT NULL DEFAULT false,
    "is_locked" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "posts_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "posts_user_id_idx" ON "posts"("user_id");
CREATE INDEX "posts_post_type_idx" ON "posts"("post_type");
CREATE INDEX "posts_problem_id_idx" ON "posts"("problem_id");
CREATE INDEX "posts_created_at_idx" ON "posts"("created_at");
CREATE INDEX "posts_upvotes_idx" ON "posts"("upvotes");

-- ============================================================
-- 13. Comments
-- ============================================================

CREATE TABLE "comments" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "post_id" UUID NOT NULL,
    "parent_comment_id" UUID,
    "content" TEXT NOT NULL,
    "upvotes" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "comments_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "comments_user_id_idx" ON "comments"("user_id");
CREATE INDEX "comments_post_id_idx" ON "comments"("post_id");
CREATE INDEX "comments_parent_comment_id_idx" ON "comments"("parent_comment_id");
CREATE INDEX "comments_created_at_idx" ON "comments"("created_at");

-- ============================================================
-- 14. Learning Paths
-- ============================================================

CREATE TABLE "learning_paths" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "title" VARCHAR(200) NOT NULL,
    "description" TEXT NOT NULL,
    "cover_url" VARCHAR(500),
    "difficulty" SMALLINT NOT NULL,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "is_published" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "learning_paths_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "learning_paths_difficulty_idx" ON "learning_paths"("difficulty");
CREATE INDEX "learning_paths_is_published_idx" ON "learning_paths"("is_published");

-- ============================================================
-- 15. Learning Modules
-- ============================================================

CREATE TABLE "learning_modules" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "path_id" UUID NOT NULL,
    "title" VARCHAR(200) NOT NULL,
    "description" TEXT NOT NULL,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "learning_modules_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "learning_modules_path_id_idx" ON "learning_modules"("path_id");

-- ============================================================
-- 16. Module Problems
-- ============================================================

CREATE TABLE "module_problems" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "module_id" UUID NOT NULL,
    "problem_id" UUID NOT NULL,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "is_required" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "module_problems_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "module_problems_module_id_problem_id_key" ON "module_problems"("module_id", "problem_id");

-- ============================================================
-- 17. Learning Progress
-- ============================================================

CREATE TABLE "learning_progress" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "path_id" UUID NOT NULL,
    "module_id" UUID,
    "status" VARCHAR(20) NOT NULL DEFAULT 'not_started',
    "progress" INTEGER NOT NULL DEFAULT 0,
    "started_at" TIMESTAMP(3),
    "completed_at" TIMESTAMP(3),
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "learning_progress_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "learning_progress_user_id_path_id_module_id_key" ON "learning_progress"("user_id", "path_id", "module_id");
CREATE INDEX "learning_progress_user_id_idx" ON "learning_progress"("user_id");
CREATE INDEX "learning_progress_path_id_idx" ON "learning_progress"("path_id");
CREATE INDEX "learning_progress_user_id_status_idx" ON "learning_progress"("user_id", "status");

-- ============================================================
-- 18. Point History
-- ============================================================

CREATE TABLE "point_history" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "points" INTEGER NOT NULL,
    "type" VARCHAR(50) NOT NULL,
    "description" TEXT,
    "related_id" UUID,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "point_history_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "point_history_user_id_created_at_idx" ON "point_history"("user_id", "created_at");

-- ============================================================
-- 19. Daily Challenges
-- ============================================================

CREATE TABLE "daily_challenges" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "problem_id" UUID NOT NULL,
    "challenge_date" DATE NOT NULL,
    "bonus_points" INTEGER NOT NULL DEFAULT 50,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "daily_challenges_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "daily_challenges_challenge_date_key" ON "daily_challenges"("challenge_date");

-- ============================================================
-- 20. Daily Challenge Completions
-- ============================================================

CREATE TABLE "daily_challenge_completions" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "challenge_id" UUID NOT NULL,
    "completed_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "time_taken" INTEGER,

    CONSTRAINT "daily_challenge_completions_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "daily_challenge_completions_user_id_challenge_id_key" ON "daily_challenge_completions"("user_id", "challenge_id");

-- ============================================================
-- 21. Login Streaks
-- ============================================================

CREATE TABLE "login_streaks" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "login_date" DATE NOT NULL,
    "streak_days" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "login_streaks_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "login_streaks_user_id_login_date_key" ON "login_streaks"("user_id", "login_date");

-- ============================================================
-- 22. Virtual Items
-- ============================================================

CREATE TABLE "virtual_items" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" VARCHAR(100) NOT NULL,
    "description" TEXT NOT NULL,
    "type" VARCHAR(50) NOT NULL,
    "rarity" VARCHAR(20) NOT NULL DEFAULT 'common',
    "icon_url" VARCHAR(500),
    "price" INTEGER NOT NULL DEFAULT 0,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "virtual_items_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "virtual_items_name_key" ON "virtual_items"("name");

-- ============================================================
-- 23. User Virtual Items
-- ============================================================

CREATE TABLE "user_virtual_items" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "item_id" UUID NOT NULL,
    "is_equipped" BOOLEAN NOT NULL DEFAULT false,
    "acquired_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_virtual_items_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "user_virtual_items_user_id_item_id_key" ON "user_virtual_items"("user_id", "item_id");

-- ============================================================
-- 24. Friendships
-- ============================================================

CREATE TABLE "friendships" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "friend_id" UUID NOT NULL,
    "status" VARCHAR(20) NOT NULL DEFAULT 'pending',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "friendships_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "friendships_user_id_friend_id_key" ON "friendships"("user_id", "friend_id");

-- ============================================================
-- 25. Notifications
-- ============================================================

CREATE TABLE "notifications" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "type" VARCHAR(50) NOT NULL,
    "title" VARCHAR(200) NOT NULL,
    "content" TEXT NOT NULL,
    "is_read" BOOLEAN NOT NULL DEFAULT false,
    "related_id" UUID,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "notifications_user_id_is_read_idx" ON "notifications"("user_id", "is_read");
CREATE INDEX "notifications_created_at_idx" ON "notifications"("created_at");

-- ============================================================
-- Foreign Key Constraints
-- ============================================================

-- User Achievements
ALTER TABLE "user_achievements" ADD CONSTRAINT "user_achievements_user_id_fkey"
    FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "user_achievements" ADD CONSTRAINT "user_achievements_achievement_id_fkey"
    FOREIGN KEY ("achievement_id") REFERENCES "achievements"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Problems
ALTER TABLE "problems" ADD CONSTRAINT "problems_author_id_fkey"
    FOREIGN KEY ("author_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Problem Tags
ALTER TABLE "problem_tags" ADD CONSTRAINT "problem_tags_problem_id_fkey"
    FOREIGN KEY ("problem_id") REFERENCES "problems"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "problem_tags" ADD CONSTRAINT "problem_tags_tag_id_fkey"
    FOREIGN KEY ("tag_id") REFERENCES "tags"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Test Cases
ALTER TABLE "test_cases" ADD CONSTRAINT "test_cases_problem_id_fkey"
    FOREIGN KEY ("problem_id") REFERENCES "problems"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Submissions
ALTER TABLE "submissions" ADD CONSTRAINT "submissions_user_id_fkey"
    FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "submissions" ADD CONSTRAINT "submissions_problem_id_fkey"
    FOREIGN KEY ("problem_id") REFERENCES "problems"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Contests
ALTER TABLE "contests" ADD CONSTRAINT "contests_creator_id_fkey"
    FOREIGN KEY ("creator_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Contest Problems
ALTER TABLE "contest_problems" ADD CONSTRAINT "contest_problems_contest_id_fkey"
    FOREIGN KEY ("contest_id") REFERENCES "contests"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "contest_problems" ADD CONSTRAINT "contest_problems_problem_id_fkey"
    FOREIGN KEY ("problem_id") REFERENCES "problems"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Contest Participants
ALTER TABLE "contest_participants" ADD CONSTRAINT "contest_participants_contest_id_fkey"
    FOREIGN KEY ("contest_id") REFERENCES "contests"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "contest_participants" ADD CONSTRAINT "contest_participants_user_id_fkey"
    FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Posts
ALTER TABLE "posts" ADD CONSTRAINT "posts_user_id_fkey"
    FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "posts" ADD CONSTRAINT "posts_problem_id_fkey"
    FOREIGN KEY ("problem_id") REFERENCES "problems"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Comments
ALTER TABLE "comments" ADD CONSTRAINT "comments_user_id_fkey"
    FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "comments" ADD CONSTRAINT "comments_post_id_fkey"
    FOREIGN KEY ("post_id") REFERENCES "posts"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "comments" ADD CONSTRAINT "comments_parent_comment_id_fkey"
    FOREIGN KEY ("parent_comment_id") REFERENCES "comments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Learning Modules
ALTER TABLE "learning_modules" ADD CONSTRAINT "learning_modules_path_id_fkey"
    FOREIGN KEY ("path_id") REFERENCES "learning_paths"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Module Problems
ALTER TABLE "module_problems" ADD CONSTRAINT "module_problems_module_id_fkey"
    FOREIGN KEY ("module_id") REFERENCES "learning_modules"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "module_problems" ADD CONSTRAINT "module_problems_problem_id_fkey"
    FOREIGN KEY ("problem_id") REFERENCES "problems"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Learning Progress
ALTER TABLE "learning_progress" ADD CONSTRAINT "learning_progress_user_id_fkey"
    FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "learning_progress" ADD CONSTRAINT "learning_progress_path_id_fkey"
    FOREIGN KEY ("path_id") REFERENCES "learning_paths"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "learning_progress" ADD CONSTRAINT "learning_progress_module_id_fkey"
    FOREIGN KEY ("module_id") REFERENCES "learning_modules"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Point History
ALTER TABLE "point_history" ADD CONSTRAINT "point_history_user_id_fkey"
    FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Daily Challenges
ALTER TABLE "daily_challenges" ADD CONSTRAINT "daily_challenges_problem_id_fkey"
    FOREIGN KEY ("problem_id") REFERENCES "problems"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Daily Challenge Completions
ALTER TABLE "daily_challenge_completions" ADD CONSTRAINT "daily_challenge_completions_user_id_fkey"
    FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "daily_challenge_completions" ADD CONSTRAINT "daily_challenge_completions_challenge_id_fkey"
    FOREIGN KEY ("challenge_id") REFERENCES "daily_challenges"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Login Streaks
ALTER TABLE "login_streaks" ADD CONSTRAINT "login_streaks_user_id_fkey"
    FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- User Virtual Items
ALTER TABLE "user_virtual_items" ADD CONSTRAINT "user_virtual_items_user_id_fkey"
    FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "user_virtual_items" ADD CONSTRAINT "user_virtual_items_item_id_fkey"
    FOREIGN KEY ("item_id") REFERENCES "virtual_items"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Friendships
ALTER TABLE "friendships" ADD CONSTRAINT "friendships_user_id_fkey"
    FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "friendships" ADD CONSTRAINT "friendships_friend_id_fkey"
    FOREIGN KEY ("friend_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Notifications
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_user_id_fkey"
    FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
