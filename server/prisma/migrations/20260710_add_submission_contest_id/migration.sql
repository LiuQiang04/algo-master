-- Add contestId to submissions table
ALTER TABLE "submissions" ADD COLUMN "contest_id" UUID REFERENCES "contests"("id");
-- CreateIndex for contestId queries
CREATE INDEX IF NOT EXISTS submissions_contest_id_idx ON "submissions"("contest_id");
