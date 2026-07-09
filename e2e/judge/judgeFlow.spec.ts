/**
 * E2E tests for the judge system (Docker sandbox).
 * Tests the complete code submission and judging flow from the user's perspective.
 * Uses real Docker sandbox (algo-arena-judge) for actual compilation and execution.
 * Uses storageState to reuse login state.
 */

import { test, expect } from "@playwright/test";
import { URLS } from "../fixtures/test-data";

// Use saved authentication state for all tests in this file
test.use({ storageState: ".auth/user.json" });

/**
 * Correct C++ solution for "A + B Problem" — passes all 4 test cases.
 */
const CPP_CORRECT = `#include <iostream>
using namespace std;
int main() {
    int a, b;
    cin >> a >> b;
    cout << a + b << endl;
    return 0;
}`;

/**
 * Wrong C++ solution — multiply instead of add, fails all test cases.
 */
const CPP_WRONG = `#include <iostream>
using namespace std;
int main() {
    int a, b;
    cin >> a >> b;
    cout << a * b << endl;
    return 0;
}`;

/**
 * Set code in Monaco Editor via the exposed testing API.
 */
async function setMonacoCode(page: any, code: string) {
  await page.evaluate((c: string) => {
    if ((window as any).__monacoSetValue) {
      (window as any).__monacoSetValue(c);
    }
  }, code);
  // Wait for React state to update
  await page.waitForTimeout(500);
}

test.describe("Judge System — A+B Problem (Docker sandbox)", () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to problems list
    await page.goto(URLS.problems);
    await page.waitForLoadState("networkidle");

    // Click the last problem link ("A + B Problem" is last, ordered by createdAt desc)
    const problemLinks = page.locator(".pl-td-title a");
    await expect(problemLinks.first()).toBeVisible({ timeout: 10000 });
    await problemLinks.last().click();
    await page.waitForLoadState("networkidle");
  });

  test("should load problem detail page with all elements", async ({ page }) => {
    await expect(page.locator("h1.pd-title")).toBeVisible({ timeout: 10000 });
    await expect(page.locator("[class*='difficulty-badge']").first()).toBeVisible();
    await expect(page.locator(".pd-meta")).toBeVisible();
    await expect(page.locator(".pd-tags")).toBeVisible();
    await expect(page.locator(".pd-editor")).toBeVisible();
    await expect(page.locator(".pd-run-sample-btn")).toBeVisible();
    await expect(page.locator(".pd-submit-btn")).toBeVisible();
  });

  test("run sample — correct C++ code should pass", async ({ page }) => {
    await setMonacoCode(page, CPP_CORRECT);

    // Click "运行样例"
    await page.locator(".pd-run-sample-btn").click();

    // Wait for run sample result panel to appear (Docker compile + execute ~5-15s)
    await expect(page.locator(".pd-run-sample-result")).toBeVisible({ timeout: 60000 });

    // Wait for Docker results to render (results appear after the API call completes)
    await expect(page.locator(".pd-sample-card--pass").first()).toBeVisible({ timeout: 60000 });

    // Should have passing cards and NO failing cards
    const failCards = page.locator(".pd-sample-card--fail");
    const failCount = await failCards.count();
    expect(failCount).toBe(0);
  });

  test("run sample — wrong C++ code should show failure", async ({ page }) => {
    await setMonacoCode(page, CPP_WRONG);

    // Click "运行样例"
    await page.locator(".pd-run-sample-btn").click();

    // Wait for result panel
    await expect(page.locator(".pd-run-sample-result")).toBeVisible({ timeout: 60000 });

    // Wait for failing card
    await expect(page.locator(".pd-sample-card--fail").first()).toBeVisible({ timeout: 60000 });

    // Actual output should show "2" (1*2 instead of 1+2)
    const actualOutput = page.locator(".pd-sample-card-io div:nth-child(3) pre");
    await expect(actualOutput.first()).toContainText("2");
  });

  test("submit correct C++ code and get accepted", async ({ page }) => {
    await setMonacoCode(page, CPP_CORRECT);

    // Click "提交代码"
    await page.locator(".pd-submit-btn").click();

    // Should see "评测中" status first
    await expect(page.locator(".pd-result-loading")).toBeVisible({ timeout: 5000 });

    // Wait for judging to complete (polling every 1s, Docker takes ~5-20s total)
    // The result panel should show "通过" (accepted)
    const resultStatus = page.locator(".pd-result-status");
    await expect(resultStatus).toHaveText("通过", { timeout: 120000 });

    // Should show execution time
    const resultText = await page.locator(".pd-result-details").textContent();
    expect(resultText).toContain("ms");
  });

  test("submit wrong C++ code and get wrong_answer", async ({ page }) => {
    await setMonacoCode(page, CPP_WRONG);

    // Submit
    await page.locator(".pd-submit-btn").click();

    // Wait for judging
    await expect(page.locator(".pd-result-loading")).toBeVisible({ timeout: 5000 });

    // Should show "答案错误" (wrong_answer)
    const resultStatus = page.locator(".pd-result-status");
    await expect(resultStatus).toHaveText("答案错误", { timeout: 120000 });
  });

  test("submissions tab shows submission history after submitting", async ({ page }) => {
    await setMonacoCode(page, CPP_CORRECT);

    // Submit code and wait for accepted
    await page.locator(".pd-submit-btn").click();
    await expect(page.locator(".pd-result-status")).toHaveText("通过", { timeout: 120000 });

    // Switch to "提交记录" tab
    await page.locator(".pd-tab").filter({ hasText: "提交记录" }).click();

    // Wait for submissions list
    await page.waitForLoadState("networkidle");

    // Should show submission history table with "通过" status
    const submissionTable = page.locator(".pd-submissions-table");
    await expect(submissionTable).toBeVisible({ timeout: 10000 });
    const firstStatus = page.locator(".pd-submissions-table tbody tr:first-child .sub-status");
    await expect(firstStatus).toContainText("通过");
  });
});
