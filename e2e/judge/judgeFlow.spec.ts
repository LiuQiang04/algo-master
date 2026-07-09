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

test.describe("Judge System — A+B Problem (Docker sandbox)", () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to problems list and click the first problem ("A + B Problem")
    await page.goto(URLS.problems);
    await page.waitForLoadState("networkidle");

    // The problem list shows problems ordered by createdAt desc.
    // "A + B Problem" is the first created problem, so it's last in the list.
    // Scroll to the bottom of the table to find it, or just click the last one.
    const problemLinks = page.locator(".pl-td-title a");
    const linkCount = await problemLinks.count();
    expect(linkCount).toBeGreaterThan(0);

    // Click the "A + B Problem" link (it's the first problem, last in the list)
    await problemLinks.last().click();
    await page.waitForLoadState("networkidle");
  });

  test("should load problem detail page with all elements", async ({ page }) => {
    // Problem title
    await expect(page.locator("h1.pd-title")).toBeVisible({ timeout: 10000 });

    // Difficulty badge
    await expect(page.locator("[class*='difficulty-badge']").first()).toBeVisible();

    // Time and memory meta
    await expect(page.locator(".pd-meta")).toBeVisible();

    // Tags
    await expect(page.locator(".pd-tags")).toBeVisible();

    // Code editor
    await expect(page.locator(".pd-editor")).toBeVisible();

    // Run Sample button
    await expect(page.locator(".pd-run-sample-btn")).toBeVisible();

    // Submit button
    await expect(page.locator(".pd-submit-btn")).toBeVisible();
  });

  test("run sample — correct C++ code should pass", async ({ page }) => {
    // Write correct C++ code into editor
    const codeEditor = page.locator(".pd-editor textarea, .pd-editor .monaco-editor");
    // The CodeEditor component uses a textarea internally — try to locate it
    const editorTextarea = page.locator(".pd-editor textarea, .pd-editor [contenteditable='true']").first();

    // Clear and fill
    await editorTextarea.click();
    await editorTextarea.fill("");
    // For Monaco Editor, fill may not work — use evaluate as fallback
    await page.evaluate((code) => {
      const ta = document.querySelector(".pd-editor textarea");
      if (ta) {
        const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
          window.HTMLTextAreaElement.prototype, "value"
        )?.set;
        nativeInputValueSetter?.call(ta, code);
        ta.dispatchEvent(new Event("input", { bubbles: true }));
      }
    }, CPP_CORRECT);

    await page.waitForTimeout(500);

    // Click "运行样例" button
    await page.locator(".pd-run-sample-btn").click();

    // Wait for run sample result panel to appear
    await expect(page.locator(".pd-run-sample-result")).toBeVisible({ timeout: 30000 });

    // Wait for results to load (Docker compile ~3-5s)
    await page.waitForTimeout(8000);

    // All sample cards should show "通过" (passed)
    // The A+B Problem has 1 sample test case
    const passCards = page.locator(".pd-sample-card--pass");
    const failCards = page.locator(".pd-sample-card--fail");

    // Should have at least 1 passing card
    await expect(passCards.first()).toBeVisible();
    // Should have no failing cards
    const failCount = await failCards.count();
    expect(failCount).toBe(0);
  });

  test("run sample — wrong C++ code should show failure", async ({ page }) => {
    // Write wrong C++ code (multiply instead of add)
    const editorTextarea = page.locator(".pd-editor textarea, .pd-editor [contenteditable='true']").first();
    await editorTextarea.click();
    await editorTextarea.fill("");

    await page.evaluate((code) => {
      const ta = document.querySelector(".pd-editor textarea");
      if (ta) {
        const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
          window.HTMLTextAreaElement.prototype, "value"
        )?.set;
        nativeInputValueSetter?.call(ta, code);
        ta.dispatchEvent(new Event("input", { bubbles: true }));
      }
    }, CPP_WRONG);

    await page.waitForTimeout(500);

    // Click "运行样例"
    await page.locator(".pd-run-sample-btn").click();

    // Wait for results
    await expect(page.locator(".pd-run-sample-result")).toBeVisible({ timeout: 30000 });
    await page.waitForTimeout(8000);

    // Should have a failing card (actual output: 2, expected: 3 for input "1 2")
    const failCards = page.locator(".pd-sample-card--fail");
    await expect(failCards.first()).toBeVisible();

    // Actual output should show "2" (1*2 instead of 1+2)
    const actualOutput = page.locator(".pd-sample-card-io div:nth-child(3) pre");
    await expect(actualOutput.first()).toContainText("2");
  });

  test("submit correct C++ code and get accepted", async ({ page }) => {
    // Write correct C++ code
    const editorTextarea = page.locator(".pd-editor textarea, .pd-editor [contenteditable='true']").first();
    await editorTextarea.click();
    await editorTextarea.fill("");

    await page.evaluate((code) => {
      const ta = document.querySelector(".pd-editor textarea");
      if (ta) {
        const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
          window.HTMLTextAreaElement.prototype, "value"
        )?.set;
        nativeInputValueSetter?.call(ta, code);
        ta.dispatchEvent(new Event("input", { bubbles: true }));
      }
    }, CPP_CORRECT);

    await page.waitForTimeout(500);

    // Click "提交代码"
    await page.locator(".pd-submit-btn").click();

    // Should see "评测中" status first
    await expect(page.locator(".pd-result-loading")).toBeVisible({ timeout: 5000 });

    // Wait for judging to complete (polling every 1s, Docker takes ~5-15s)
    // The result panel should show "通过" (accepted)
    const resultStatus = page.locator(".pd-result-status");
    await expect(resultStatus).toHaveText("通过", { timeout: 60000 });

    // Should show test case stats
    await expect(page.locator(".pd-result-details")).toBeVisible();

    // Should have execution time
    const resultText = await page.locator(".pd-result-details").textContent();
    expect(resultText).toContain("ms");
  });

  test("submit wrong C++ code and get wrong_answer", async ({ page }) => {
    // Write wrong C++ code (multiply instead of add)
    const editorTextarea = page.locator(".pd-editor textarea, .pd-editor [contenteditable='true']").first();
    await editorTextarea.click();
    await editorTextarea.fill("");

    await page.evaluate((code) => {
      const ta = document.querySelector(".pd-editor textarea");
      if (ta) {
        const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
          window.HTMLTextAreaElement.prototype, "value"
        )?.set;
        nativeInputValueSetter?.call(ta, code);
        ta.dispatchEvent(new Event("input", { bubbles: true }));
      }
    }, CPP_WRONG);

    await page.waitForTimeout(500);

    // Submit
    await page.locator(".pd-submit-btn").click();

    // Wait for judging
    await expect(page.locator(".pd-result-loading")).toBeVisible({ timeout: 5000 });

    // Should show "答案错误" (wrong_answer)
    const resultStatus = page.locator(".pd-result-status");
    await expect(resultStatus).toHaveText("答案错误", { timeout: 60000 });
  });

  test("submissions tab shows submission history after submitting", async ({ page }) => {
    // First submit correct code
    const editorTextarea = page.locator(".pd-editor textarea, .pd-editor [contenteditable='true']").first();
    await editorTextarea.click();
    await editorTextarea.fill("");

    await page.evaluate((code) => {
      const ta = document.querySelector(".pd-editor textarea");
      if (ta) {
        const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
          window.HTMLTextAreaElement.prototype, "value"
        )?.set;
        nativeInputValueSetter?.call(ta, code);
        ta.dispatchEvent(new Event("input", { bubbles: true }));
      }
    }, CPP_CORRECT);

    await page.waitForTimeout(500);

    // Submit code
    await page.locator(".pd-submit-btn").click();

    // Wait for accepted
    await expect(page.locator(".pd-result-status")).toHaveText("通过", { timeout: 60000 });

    // Switch to "提交记录" tab
    await page.locator(".pd-tab").filter({ hasText: "提交记录" }).click();

    // Wait for submissions list to load
    await page.waitForLoadState("networkidle");

    // Should show submission history table
    const submissionTable = page.locator(".pd-submissions-table");
    await expect(submissionTable).toBeVisible({ timeout: 10000 });

    // The first row should show "通过" status
    const firstStatus = page.locator(".pd-submissions-table tbody tr:first-child .sub-status");
    await expect(firstStatus).toContainText("通过");
  });
});
