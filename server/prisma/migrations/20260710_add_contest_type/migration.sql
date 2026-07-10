-- AlterTable: add type column to contests with default 'rated'
ALTER TABLE "contests" ADD COLUMN "type" VARCHAR(20) NOT NULL DEFAULT 'rated';
