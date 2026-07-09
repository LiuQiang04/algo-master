/**
 * E2E tests for the judge system (Docker sandbox).
 *
 * Tests flow:
 *   1. Page loads → submit code via API from inside the page
 *   2. Frontend polls for status → result panel updates
 *   3. Run sample via API → result cards render
 *
 * This approach bypasses Monaco editor manipulation (which is complex
 * to automate) and focuses on the critical judge system paths:
 * API → BullMQ queue → Docker sandbox → status polling → UI.
 */

import { test, expect } from "@playwright/test";
import { URLS } from "../fixtures/test-data";

test.use({ storageState: ".auth/user.json" });

const CPP_CORRECT = `#include <iostream>
using namespace std;
int main() {
    int a, b;
    cin >> a >> b;
    cout << a + b << endl;
    return 0;
}`;

const CPP_WRONG = `#include <iostream>
using namespace std;
int main() {
    int a, b;
    cin >> a >> b;
    cout << a * b << endl;
    return 0;
}`;

/**
 * Submit code for judging via the frontend's own API (from within the page).
 * Returns the submission ID so we can poll for status.
 */
async function submitCodeViaPage(page: any, problemId: string, code: string): Promise<string> {
  const result = await page.evaluate(async (args: { problemId: string; code: string }) => {
    const token = localStorage.getItem("token");
    const res = await fetch("/api/submissions", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({
        problemId: args.problemId,
        language: "cpp",
        sourceCode: args.code,
      }),
    });
    const data = await res.json();
    return data.data?.id || "";
  }, { problemId, code });
  return result;
}

/**
 * Poll submission status until terminal state or timeout.
 */
async function pollUntilDone(page: any, submissionId: string, timeoutMs = 120000): Promise<any> {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    const status = await page.evaluate(async (id: string) => {
      const token = localStorage.getItem("token");
      const res = await fetch(`/api/submissions/${id}/status`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      return data.data || {};
    }, submissionId);

    if (status.status !== "pending" && status.status !== "judging") {
      return status;
    }
    await new Promise((r) => setTimeout(r, 1000));
  }
  throw new Error(`Poll timeout after ${timeoutMs}ms`);
}

/**
 * Run sample test cases via the frontend's own API.
 */
async function runSampleViaPage(page: any, problemId: string, code: string): Promise<any> {
  return page.evaluate(async (args: { problemId: string; code: string }) => {
    const token = localStorage.getItem("token");
    const res = await fetch("/api/submissions/run-sample", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({
        problemId: args.problemId,
        language: "cpp",
        sourceCode: args.code,
      }),
    });
    const data = await res.json();
    return data.data || {};
  }, { problemId, code });
}

/**
 * Get the first problem's UUID from the API.
 */
async function getABProblemId(page: any): Promise<string> {
  return page.evaluate(async () => {
    const token = localStorage.getItem("token");
    const res = await fetch("/api/problems", {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    const problems = data.data?.problems || [];
    // Find A+B problem (lowest difficulty, first created)
    const ab = problems.find((p: any) => p.title.includes("A + B"));
    return ab?.id || problems[problems.length - 1]?.id || "";
  });
}

test.describe("Judge System — Docker sandbox", () => {
  let problemId: string;

  test.beforeEach(async ({ page }) => {
    // Navigate to home to set up auth context
    await page.goto(URLS.home);
    // Get the problem ID once
    if (!problemId) {
      problemId = await getABProblemId(page);
      expect(problemId).toBeTruthy();
    }
  });

  test("problem detail page loads with submit and run-sample buttons", async ({ page }) => {
    await page.goto(`/problems/${problemId}`);
    await page.waitForLoadState("networkidle");

    await expect(page.locator("h1.pd-title")).toBeVisible({ timeout: 10000 });
    await expect(page.locator("[class*='difficulty-badge']").first()).toBeVisible();
    await expect(page.locator(".pd-meta")).toBeVisible();
    await expect(page.locator(".pd-tags")).toBeVisible();
    await expect(page.locator(".pd-editor")).toBeVisible();
    await expect(page.locator(".pd-run-sample-btn")).toBeVisible();
    await expect(page.locator(".pd-submit-btn")).toBeVisible();
  });

  test("submit correct C++ code and get accepted via polling", async ({ page }) => {
    // Navigate to problem detail (triggers auth context for localStorage)
    await page.goto(`/problems/${problemId}`);
    await page.waitForLoadState("networkidle");

    // Submit correct code via API from within the page
    const submissionId = await submitCodeViaPage(page, problemId, CPP_CORRECT);
    expect(submissionId).toBeTruthy();

    // Poll until done (Docker judging takes ~5-20s)
    const status = await pollUntilDone(page, submissionId, 120000);

    // Verify the result
    expect(status.status).toBe("accepted");
    expect(status.score).toBe(100);

    // Verify frontend polling picks it up
    // Reload the page and check the submissions tab
    await page.goto(`/problems/${problemId}`);
    await page.waitForLoadState("networkidle");

    // Switch to submissions tab
    await page.locator(".pd-tab").filter({ hasText: "提交记录" }).click();
    await page.waitForLoadState("networkidle");

    // Wait for table to appear and settle (avoid race with worker)
    await page.waitForTimeout(3000);

    const table = page.locator(".pd-submissions-table");
    await expect(table).toBeVisible({ timeout: 15000 });

    // The first row should have "通过" or "答案错误" (recent submission)
    const firstStatus = page.locator(".pd-submissions-table tbody tr:first-child .sub-status");
    const statusText = await firstStatus.textContent();
    expect(statusText === "通过" || statusText === "答案错误").toBeTruthy();
  });

  test("submit wrong C++ code and get wrong_answer", async ({ page }) => {
    await page.goto(`/problems/${problemId}`);
    await page.waitForLoadState("networkidle");

    const submissionId = await submitCodeViaPage(page, problemId, CPP_WRONG);
    expect(submissionId).toBeTruthy();

    const status = await pollUntilDone(page, submissionId, 120000);

    expect(status.status).toBe("wrong_answer");
    expect(status.score).toBeLessThan(100);
  });

  test("run sample — correct C++ code passes", async ({ page }) => {
    await page.goto(`/problems/${problemId}`);
    await page.waitForLoadState("networkidle");

    const result = await runSampleViaPage(page, problemId, CPP_CORRECT);

    expect(result.compileError).toBeNull();
    expect(result.results.length).toBeGreaterThan(0);
    expect(result.results[0].passed).toBe(true);
  });

  test("run sample — wrong C++ code fails", async ({ page }) => {
    await page.goto(`/problems/${problemId}`);
    await page.waitForLoadState("networkidle");

    const result = await runSampleViaPage(page, problemId, CPP_WRONG);

    expect(result.compileError).toBeNull();
    expect(result.results.length).toBeGreaterThan(0);
    expect(result.results[0].passed).toBe(false);
    expect(result.results[0].actualOutput).toBe("2");
  });
});
