-- AlterTable
ALTER TABLE "problems" ADD COLUMN     "std_code" TEXT,
ADD COLUMN     "std_language" VARCHAR(20);

-- CreateTable
CREATE TABLE "submission_test_cases" (
    "id" UUID NOT NULL,
    "submission_id" UUID NOT NULL,
    "test_case_id" UUID NOT NULL,
    "input" TEXT NOT NULL,
    "expected_output" TEXT NOT NULL,
    "actual_output" TEXT,
    "passed" BOOLEAN NOT NULL,
    "runtime" INTEGER,
    "memory" INTEGER,
    "error_message" TEXT,

    CONSTRAINT "submission_test_cases_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "submission_test_cases" ADD CONSTRAINT "submission_test_cases_submission_id_fkey" FOREIGN KEY ("submission_id") REFERENCES "submissions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "submission_test_cases" ADD CONSTRAINT "submission_test_cases_test_case_id_fkey" FOREIGN KEY ("test_case_id") REFERENCES "test_cases"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
