# 题目详情页功能增强 — 实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 增强题目详情页（`/problems/:id`）的 6 个功能模块：Markdown 渲染、代码模板、代码草稿、运行样例、评测结果细化、题目统计，并优化布局确保提交按钮始终在首屏可见。

**Architecture:** 前端为主，复用现有 MarkdownRenderer 组件，新增 useCodeDraft hook（localStorage），后端新增统计字段和 run-sample API。结果面板采用 max-height: 40% + overflow-y: auto 约束，配合压缩间距（节省约 54px）确保提交按钮在视口内。

**Tech Stack:** React 19 + TypeScript + Tailwind CSS v4 + Vite 8, react-markdown + remark-gfm + Prism, localStorage

**依赖 plan:** `docs/superpowers/plans/2026-07-08-judge-system-plan.md`（Task 1 DB 迁移、Task 7 run-sample API、Task 8 前端轮询）
**依赖 spec:** `docs/superpowers/specs/2026-07-08-problem-detail-enhancement-design.md`

## Global Constraints

- 复用现有 `MarkdownRenderer` 组件（`frontend/src/components/common/MarkdownRenderer.tsx`），不新建渲染组件
- 草稿 key 格式: `algo_draft_{problemId}_{language}`，debounce 1s 自动保存
- 提交成功后清除草稿，切换题目/语言时自动恢复草稿
- 结果面板 max-height: 40%，溢出滚动，默认折叠
- 布局优化：标题 28px→24px，header padding 24px→16px，tab padding 12px→8px，submit bar padding 12px→10px
- 题目统计字段：acceptanceRate、totalSubmissions、totalAccepted

---

### Task 1: Markdown 渲染 — 替换题面 4 处纯文本渲染

**Files:**
- Modify: `frontend/src/pages/Problems/ProblemDetail.tsx`
- Modify: `frontend/src/pages/Problems/ProblemDetail.css`

**Interfaces:**
- Consumes: `MarkdownRenderer` from `@/components/common/MarkdownRenderer`
- 替换 `problem.description`、`problem.inputFormat`、`problem.outputFormat`、`problem.hint` 的纯文本渲染

- [ ] **Step 1: 引入 MarkdownRenderer**

在 `ProblemDetail.tsx` 顶部新增 import：
```typescript
import MarkdownRenderer from '@/components/common/MarkdownRenderer';
```

- [ ] **Step 2: 替换 4 处文本渲染**

**① description** — 替换 `{problem.description.split('\n').map(...)}`:
```tsx
<div className="pd-section">
  <h3>题目描述</h3>
  <div className="pd-text">
    <MarkdownRenderer content={problem.description} />
  </div>
</div>
```

**② inputFormat** — 替换 `{problem.inputFormat.split('\n').map(...)}`:
```tsx
{problem.inputFormat && (
  <div className="pd-section">
    <h3>输入格式</h3>
    <div className="pd-text">
      <MarkdownRenderer content={problem.inputFormat} />
    </div>
  </div>
)}
```

**③ outputFormat** — 替换 `{problem.outputFormat.split('\n').map(...)}`:
```tsx
{problem.outputFormat && (
  <div className="pd-section">
    <h3>输出格式</h3>
    <div className="pd-text">
      <MarkdownRenderer content={problem.outputFormat} />
    </div>
  </div>
)}
```

**④ hint** — 替换现有 hint 渲染块:
```tsx
{problem.hint && (
  <div className="pd-section">
    <h3>提示</h3>
    <div className="pd-text">
      <MarkdownRenderer content={problem.hint} />
    </div>
  </div>
)}
```

- [ ] **Step 3: 清理 CSS — 删除不再需要的 `.pd-text p` 样式**

在 `ProblemDetail.css` 中删除 `.pd-text p` 规则（因为 MarkdownRenderer 自带内联样式）:
```css
/* 删除以下： */
.pd-text p {
  margin-bottom: 8px;
}
```

- [ ] **Step 4: 运行前端测试**

```bash
cd frontend && npm test
```

Expected: 全部测试 PASS。

- [ ] **Step 5: Commit**

```bash
git add frontend/src/pages/Problems/ProblemDetail.tsx frontend/src/pages/Problems/ProblemDetail.css
git commit -m "feat: replace plain text rendering with MarkdownRenderer in problem detail"
```

---

### Task 2: 代码模板 — 改进 4 种语言的 defaultCode

**Files:**
- Modify: `frontend/src/pages/Problems/ProblemDetail.tsx`

**Interfaces:**
- 修改 `languages` 数组的 `defaultCode` 字段
- 被 Task 3（useCodeDraft）消费

- [ ] **Step 1: 替换 languages 数组的 defaultCode**

```typescript
const languages = [
  {
    id: 'cpp',
    label: 'C++',
    defaultCode: `#include <bits/stdc++.h>
using namespace std;

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    
    // TODO: 在此编写代码
    
    return 0;
}`,
  },
  {
    id: 'python',
    label: 'Python',
    defaultCode: `import sys
from typing import List

def solve() -> None:
    # TODO: 在此编写代码
    pass

if __name__ == '__main__':
    solve()`,
  },
  {
    id: 'java',
    label: 'Java',
    defaultCode: `import java.util.*;
import java.io.*;

public class Solution {
    public static void main(String[] args) throws IOException {
        BufferedReader br = new BufferedReader(new InputStreamReader(System.in));
        // TODO: 在此编写代码
    }
}`,
  },
  {
    id: 'javascript',
    label: 'JavaScript',
    defaultCode: `const readline = require('readline');
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

// TODO: 在此编写代码`,
  },
];
```

- [ ] **Step 2: 运行前端测试**

```bash
cd frontend && npm test
```

Expected: 全部测试 PASS。

- [ ] **Step 3: Commit**

```bash
git add frontend/src/pages/Problems/ProblemDetail.tsx
git commit -m "feat: improve default code templates for 4 languages"
```

---

### Task 3: 代码草稿 — localStorage 自动保存/恢复

**Files:**
- Create: `frontend/src/hooks/useCodeDraft.ts`
- Modify: `frontend/src/pages/Problems/ProblemDetail.tsx`

**Interfaces:**
- Produces: `useCodeDraft(problemId: number, language: string): { draft: string | null, saveDraft: (code: string) => void, clearDraft: () => void }`
- 被 `ProblemDetail.tsx` 消费

- [ ] **Step 1: 创建 useCodeDraft hook**

```typescript
// frontend/src/hooks/useCodeDraft.ts
import { useState, useEffect, useCallback, useRef } from 'react';

const DRAFT_PREFIX = 'algo_draft_';

function getKey(problemId: number, language: string): string {
  return `${DRAFT_PREFIX}${problemId}_${language}`;
}

export function useCodeDraft(problemId: number, language: string) {
  const [draft, setDraft] = useState<string | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // 切换题目/语言时恢复草稿
  useEffect(() => {
    const key = getKey(problemId, language);
    const saved = localStorage.getItem(key);
    setDraft(saved);
  }, [problemId, language]);

  // debounce 1s 保存
  const saveDraft = useCallback((code: string) => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    timerRef.current = setTimeout(() => {
      const key = getKey(problemId, language);
      localStorage.setItem(key, code);
    }, 1000);
  }, [problemId, language]);

  // 清除草稿
  const clearDraft = useCallback(() => {
    const key = getKey(problemId, language);
    localStorage.removeItem(key);
    setDraft(null);
  }, [problemId, language]);

  // 清理 timer
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  return { draft, saveDraft, clearDraft };
}
```

- [ ] **Step 2: 编写单元测试 — 创建 useCodeDraft.test.ts**

```typescript
// frontend/src/__tests__/hooks/useCodeDraft.test.ts
import { renderHook, act } from '@testing-library/react';
import { useCodeDraft } from '../../hooks/useCodeDraft';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: jest.fn((key: string) => store[key] || null),
    setItem: jest.fn((key: string, value: string) => { store[key] = value; }),
    removeItem: jest.fn((key: string) => { delete store[key]; }),
    clear: jest.fn(() => { store = {}; }),
    get length() { return Object.keys(store).length; },
    key: jest.fn((i: number) => Object.keys(store)[i] || null),
    __store: store,
  };
})();
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

describe('useCodeDraft', () => {
  beforeEach(() => {
    localStorageMock.clear();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should return null when no draft saved', () => {
    const { result } = renderHook(() => useCodeDraft(1, 'cpp'));
    expect(result.current.draft).toBeNull();
  });

  it('should restore saved draft on mount', () => {
    localStorageMock.setItem('algo_draft_1_cpp', 'int main() {}');
    const { result } = renderHook(() => useCodeDraft(1, 'cpp'));
    expect(result.current.draft).toBe('int main() {}');
  });

  it('should save draft after debounce', () => {
    const { result } = renderHook(() => useCodeDraft(1, 'cpp'));
    act(() => { result.current.saveDraft('new code'); });
    // 未到 1s，不应保存
    expect(localStorageMock.getItem('algo_draft_1_cpp')).toBeNull();
    // 快进 1s
    act(() => { jest.advanceTimersByTime(1000); });
    expect(localStorageMock.getItem('algo_draft_1_cpp')).toBe('new code');
  });

  it('should clear draft', () => {
    localStorageMock.setItem('algo_draft_1_cpp', 'old code');
    const { result } = renderHook(() => useCodeDraft(1, 'cpp'));
    act(() => { result.current.clearDraft(); });
    expect(localStorageMock.getItem('algo_draft_1_cpp')).toBeNull();
    expect(result.current.draft).toBeNull();
  });

  it('should use different keys for different languages', () => {
    localStorageMock.setItem('algo_draft_1_cpp', 'cpp code');
    localStorageMock.setItem('algo_draft_1_python', 'python code');
    const { result } = renderHook(() => useCodeDraft(1, 'python'));
    expect(result.current.draft).toBe('python code');
  });
});
```

- [ ] **Step 3: 在 ProblemDetail.tsx 中集成 useCodeDraft**

引入 hook：
```typescript
import { useCodeDraft } from '@/hooks/useCodeDraft';
```

使用 hook（替换 `const [code, setCode] = useState(languages[0].defaultCode)`）:
```typescript
const { draft, saveDraft, clearDraft } = useCodeDraft(problemId, selectedLang.id);

// 初始化 code：有草稿用草稿，否则用模板
const [code, setCode] = useState(() => {
  return draft || languages[0].defaultCode;
});

// 切换语言时恢复草稿或使用模板
const handleLangChange = (langId: string) => {
  const lang = languages.find((l) => l.id === langId)!;
  setSelectedLang(lang);
  const saved = localStorage.getItem(`algo_draft_${problemId}_${langId}`);
  setCode(saved || lang.defaultCode);
};
```

监听 code 变化自动保存：
```typescript
import { useEffect, useRef } from 'react';

// 在组件中添加：
const isFirstRender = useRef(true);
useEffect(() => {
  if (isFirstRender.current) {
    isFirstRender.current = false;
    return;
  }
  saveDraft(code);
}, [code]);
```

提交成功后清除草稿：
```typescript
// 在 handleSubmit 的 AC 分支中：
if (res.status === 'accepted') {
  clearDraft();
}
```

- [ ] **Step 4: 运行前端测试**

```bash
cd frontend && npm test
```

Expected: 全部测试 PASS（包括新增的 5 个 hook 测试）。

- [ ] **Step 5: Commit**

```bash
git add frontend/src/hooks/useCodeDraft.ts frontend/src/__tests__/hooks/useCodeDraft.test.ts frontend/src/pages/Problems/ProblemDetail.tsx
git commit -m "feat: add useCodeDraft hook for localStorage auto-save/restore"
```

---

### Task 4: 运行样例按钮 + 结果面板

> **依赖**: 评测系统 plan 的 Task 7（run-sample API）和 Task 8（前端轮询）。本 task 实现前端 UI 部分。

**Files:**
- Modify: `frontend/src/pages/Problems/ProblemDetail.tsx`
- Modify: `frontend/src/pages/Problems/ProblemDetail.css`
- Modify: `frontend/src/services/submissions.ts`
- Modify: `frontend/src/types/index.ts`

**Interfaces:**
- Consumes: `POST /api/submissions/run-sample`（来自评测系统 plan）
- 新增 `RunSampleResponse` 和 `TestCaseResult` 类型
- 新增 `runSample()` API 函数
- 在 pd-submit-bar 上方显示运行样例按钮 + 结果面板

- [ ] **Step 1: 新增类型定义**（如果评测系统 plan 已实施则跳过，类型已存在）

在 `frontend/src/types/index.ts` 中新增（检查是否已存在）:
```typescript
export interface TestCaseResult {
  input: string;
  expectedOutput: string;
  actualOutput: string | null;
  passed: boolean;
  runtime: number | null;
  errorMessage: string | null;
}

export interface RunSampleResponse {
  compileError: string | null;
  results: TestCaseResult[];
}
```

- [ ] **Step 2: 新增 API 函数**

在 `frontend/src/services/submissions.ts` 中新增：
```typescript
import type { RunSampleResponse } from '@/types';

export async function runSample(
  problemId: number,
  data: { language: string; code: string }
): Promise<RunSampleResponse> {
  const res = await request.post<ApiResponse<RunSampleResponse>>(
    '/submissions/run-sample',
    { problemId, language: data.language, sourceCode: data.code }
  );
  return res.data.data;
}
```

- [ ] **Step 3: 在 ProblemDetail.tsx 中添加 Run Sample 功能**

新增 import:
```typescript
import { Play } from 'lucide-react';
import { runSample } from '@/services/submissions';
import type { RunSampleResponse } from '@/types';
```

新增状态:
```typescript
const [runSampleResult, setRunSampleResult] = useState<RunSampleResponse | null>(null);
const [runSampleLoading, setRunSampleLoading] = useState(false);
```

新增 handleRunSample 函数:
```typescript
const handleRunSample = async () => {
  if (!problemId || runSampleLoading || submitting) return;
  setRunSampleLoading(true);
  setRunSampleResult(null);
  try {
    const res = await runSample(problemId, {
      language: selectedLang.id,
      code,
    });
    setRunSampleResult(res);
  } catch {
    setRunSampleResult({ compileError: '运行失败，请重试', results: [] });
  } finally {
    setRunSampleLoading(false);
  }
};
```

在 `pd-submit-bar` 的 `pd-submit-btn` 之前插入 Run Sample 按钮:
```tsx
<button
  className="pd-run-sample-btn"
  onClick={handleRunSample}
  disabled={runSampleLoading || submitting}
>
  <Play size={16} />
  {runSampleLoading ? '运行中...' : '运行样例'}
</button>
```

在 `pd-submit-bar` 之前插入 Run Sample 结果面板:
```tsx
{runSampleResult && (
  <div className="pd-run-sample-result">
    <div className="pd-run-sample-result-header">
      <h3>样例运行结果</h3>
      <button
        className="pd-run-sample-result-close"
        onClick={() => setRunSampleResult(null)}
        aria-label="关闭"
      >
        ×
      </button>
    </div>
    {runSampleResult.compileError ? (
      <pre className="pd-result-error">{runSampleResult.compileError}</pre>
    ) : runSampleResult.results.length === 0 ? (
      <p className="pd-run-sample-empty">暂无样例测试用例</p>
    ) : (
      runSampleResult.results.map((r, i) => (
        <div key={i} className={`pd-result-card ${r.passed ? 'pd-result-card--pass' : 'pd-result-card--fail'}`}>
          <div className="pd-result-card-header">
            <span>样例 {i + 1}</span>
            {r.passed ? (
              <CheckCircle2 size={16} className="pd-result-card-icon--pass" />
            ) : (
              <XCircle size={16} className="pd-result-card-icon--fail" />
            )}
            <span className={`pd-result-card-status ${r.passed ? 'pd-result-card-status--pass' : 'pd-result-card-status--fail'}`}>
              {r.passed ? '通过' : '未通过'}{r.runtime != null ? ` (${r.runtime}ms)` : ''}
            </span>
          </div>
          <div className="pd-result-card-body">
            <div className="pd-result-card-field">
              <span className="pd-result-card-label">输入</span>
              <pre>{r.input}</pre>
            </div>
            <div className="pd-result-card-field">
              <span className="pd-result-card-label">预期输出</span>
              <pre>{r.expectedOutput}</pre>
            </div>
            <div className="pd-result-card-field">
              <span className="pd-result-card-label">实际输出</span>
              <pre>{r.actualOutput || '(无输出)'}</pre>
            </div>
            {r.errorMessage && (
              <div className="pd-result-card-field">
                <span className="pd-result-card-label">错误信息</span>
                <pre className="pd-result-error">{r.errorMessage}</pre>
              </div>
            )}
          </div>
        </div>
      ))
    )}
  </div>
)}
```

- [ ] **Step 4: 新增 CSS 样式**

在 `ProblemDetail.css` 中新增：

```css
/* Run Sample Button */
.pd-run-sample-btn {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 10px;
  background: transparent;
  color: var(--text-secondary);
  border: 1px solid var(--border-light);
  border-radius: var(--radius-lg);
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all var(--transition-base);
  margin-bottom: 8px;
}

.pd-run-sample-btn:hover:not(:disabled) {
  background: var(--bg-tertiary);
  color: var(--text-primary);
  border-color: var(--primary-300);
}

.pd-run-sample-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Run Sample Result Panel */
.pd-run-sample-result {
  max-height: 40%;
  overflow-y: auto;
  padding: 16px;
  border-top: 1px solid var(--border-light);
  background: var(--bg-card);
}

.pd-run-sample-result-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}

.pd-run-sample-result-header h3 {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
}

.pd-run-sample-result-close {
  font-size: 20px;
  line-height: 1;
  color: var(--text-muted);
  padding: 2px 6px;
  border-radius: var(--radius-sm);
  cursor: pointer;
}

.pd-run-sample-result-close:hover {
  background: var(--bg-tertiary);
  color: var(--text-primary);
}

.pd-run-sample-empty {
  font-size: 13px;
  color: var(--text-muted);
  text-align: center;
  padding: 20px 0;
}

/* Result Card (shared by Run Sample & submission result) */
.pd-result-card {
  border: 1px solid var(--border-light);
  border-radius: var(--radius-lg);
  padding: 12px;
  margin-bottom: 8px;
  background: var(--bg-primary);
}

.pd-result-card--pass {
  border-left: 3px solid var(--success-400);
}

.pd-result-card--fail {
  border-left: 3px solid var(--danger-400);
}

.pd-result-card-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 10px;
}

.pd-result-card-header > span:first-child {
  font-size: 13px;
  font-weight: 600;
  color: var(--text-primary);
}

.pd-result-card-icon--pass { color: var(--success-500); }
.pd-result-card-icon--fail { color: var(--danger-500); }

.pd-result-card-status {
  font-size: 12px;
  font-weight: 500;
}

.pd-result-card-status--pass { color: var(--success-600); }
.pd-result-card-status--fail { color: var(--danger-600); }

.pd-result-card-body {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.pd-result-card-field {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.pd-result-card-label {
  font-size: 11px;
  font-weight: 600;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.pd-result-card-field pre {
  background: var(--bg-tertiary);
  padding: 8px 10px;
  border-radius: var(--radius-md);
  font-family: var(--font-mono);
  font-size: 12px;
  line-height: 1.5;
  color: var(--text-primary);
  overflow-x: auto;
  margin: 0;
  white-space: pre-wrap;
  word-break: break-all;
}

.pd-result-error {
  background: var(--danger-50);
  color: var(--danger-700);
  padding: 10px 12px;
  border-radius: var(--radius-md);
  font-family: var(--font-mono);
  font-size: 12px;
  overflow-x: auto;
  margin: 0;
  white-space: pre-wrap;
}

@media (prefers-color-scheme: dark) {
  .pd-result-error {
    background: rgba(239, 68, 68, 0.1);
    color: var(--danger-400);
  }
}
```

- [ ] **Step 5: 运行前端测试**

```bash
cd frontend && npm test
```

Expected: 全部测试 PASS。

- [ ] **Step 6: Commit**

```bash
git add frontend/src/pages/Problems/ProblemDetail.tsx frontend/src/pages/Problems/ProblemDetail.css frontend/src/services/submissions.ts frontend/src/types/index.ts
git commit -m "feat: add Run Sample button and result panel"
```

---

### Task 5: 评测结果细化 — 展开/折叠测试用例详情

**Files:**
- Modify: `frontend/src/pages/Problems/ProblemDetail.tsx`
- Modify: `frontend/src/pages/Problems/ProblemDetail.css`

**Interfaces:**
- Consumes: `GET /api/submissions/:id` 响应中的 `testCaseResults` 字段（来自评测系统 plan Task 1 DB 迁移 + Task 5 Worker）
- 提交结果面板新增展开/折叠逻辑

- [ ] **Step 1: 扩展 SubmissionResult 类型**

在 `frontend/src/types/index.ts` 中扩展 `SubmissionResult`：
```typescript
export interface SubmissionResult {
  submissionId: number;
  status: SubmissionStatus;
  executionTime?: number;
  memoryUsed?: number;
  testCasesPassed: number;
  totalTestCases: number;
  errorMessage?: string;
  testCaseResults?: TestCaseResult[];  // 新增
}
```

- [ ] **Step 2: 修改结果面板逻辑**

在 `ProblemDetail.tsx` 中新增展开/折叠状态：
```typescript
const [resultExpanded, setResultExpanded] = useState(false);
```

修改结果面板，替换现有的 `pd-result` 内容（在 `result.status !== 'judging'` 分支中）：

```tsx
{result.status !== 'judging' && result.status !== 'pending' ? (
  <>
    <div className="pd-result-header">
      {result.status === 'accepted' ? (
        <CheckCircle2 size={20} />
      ) : (
        <XCircle size={20} />
      )}
      <span className="pd-result-status">
        {statusMessages[result.status]}
      </span>
    </div>
    <div className="pd-result-details">
      {result.testCasesPassed !== undefined && result.totalTestCases !== undefined && (
        <span>通过 {result.testCasesPassed}/{result.totalTestCases} 个测试用例</span>
      )}
      <div className="pd-result-stats">
        {result.runtime !== undefined && <span>执行用时: {result.runtime}ms</span>}
        {result.memory !== undefined && <span>内存消耗: {(result.memory / 1024 / 1024).toFixed(1)}MB</span>}
      </div>
      {result.errorMessage && (
        <pre className="pd-result-error">{result.errorMessage}</pre>
      )}
    </div>

    {/* 用例详情展开/折叠 */}
    {result.testCaseResults && result.testCaseResults.length > 0 && (
      <div className="pd-result-expand">
        <button
          className="pd-result-expand-btn"
          onClick={() => setResultExpanded(!resultExpanded)}
        >
          <span>
            通过 {result.testCaseResults.filter(r => r.passed).length}/{result.testCaseResults.length} 个测试用例
          </span>
          <ChevronDown
            size={16}
            style={{ transform: resultExpanded ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}
          />
        </button>
        {resultExpanded && (
          <div className="pd-result-expand-content">
            {result.testCaseResults.map((r, i) => (
              <div key={i} className={`pd-result-card ${r.passed ? 'pd-result-card--pass' : 'pd-result-card--fail'}`}>
                <div className="pd-result-card-header">
                  <span>测试用例 {i + 1}</span>
                  {r.passed ? (
                    <CheckCircle2 size={16} className="pd-result-card-icon--pass" />
                  ) : (
                    <XCircle size={16} className="pd-result-card-icon--fail" />
                  )}
                  <span className={`pd-result-card-status ${r.passed ? 'pd-result-card-status--pass' : 'pd-result-card-status--fail'}`}>
                    {r.passed ? '通过' : '未通过'}{r.runtime != null ? ` (${r.runtime}ms)` : ''}
                  </span>
                </div>
                {!r.passed && (
                  <div className="pd-result-card-body">
                    <div className="pd-result-card-field">
                      <span className="pd-result-card-label">输入</span>
                      <pre>{r.input}</pre>
                    </div>
                    <div className="pd-result-card-field">
                      <span className="pd-result-card-label">预期输出</span>
                      <pre>{r.expectedOutput}</pre>
                    </div>
                    <div className="pd-result-card-field">
                      <span className="pd-result-card-label">实际输出</span>
                      <pre>{r.actualOutput || '(无输出)'}</pre>
                    </div>
                    {r.errorMessage && (
                      <div className="pd-result-card-field">
                        <span className="pd-result-card-label">错误信息</span>
                        <pre className="pd-result-error">{r.errorMessage}</pre>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    )}
  </>
) : ...}
```

- [ ] **Step 3: 新增展开/折叠 CSS**

在 `ProblemDetail.css` 中新增：

```css
/* Result Expand/Collapse */
.pd-result-expand {
  margin-top: 12px;
  border-top: 1px solid var(--border-light);
  padding-top: 12px;
}

.pd-result-expand-btn {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 0;
  font-size: 13px;
  color: var(--text-secondary);
  cursor: pointer;
  transition: color var(--transition-fast);
}

.pd-result-expand-btn:hover {
  color: var(--text-primary);
}

.pd-result-expand-content {
  margin-top: 8px;
  max-height: 300px;
  overflow-y: auto;
}
```

- [ ] **Step 4: 运行前端测试**

```bash
cd frontend && npm test
```

Expected: 全部测试 PASS。

- [ ] **Step 5: Commit**

```bash
git add frontend/src/pages/Problems/ProblemDetail.tsx frontend/src/pages/Problems/ProblemDetail.css frontend/src/types/index.ts
git commit -m "feat: add submission result expand/collapse with per-test-case details"
```

---

### Task 6: 题目统计 — 后端统计字段 + 前端展示

**Files:**
- Modify: `server/src/services/problemService.ts`
- Modify: `frontend/src/pages/Problems/ProblemDetail.tsx`
- Modify: `frontend/src/types/index.ts`

**Interfaces:**
- Consumes: `Problem` 表已有 `submitCount`、`solveCount` 字段
- 后端 `getProblemById` 响应新增 `totalSubmissions`、`totalAccepted`、`acceptanceRate`
- 前端在标题下方 meta 区展示统计信息

- [ ] **Step 1: 后端 — problemService 新增统计字段**

在 `server/src/services/problemService.ts` 的 `getProblemById` 返回对象中，确认已包含 `acceptanceRate`（当前已有），确保 `totalSubmissions` 和 `totalAccepted` 字段通过别名映射：

```typescript
return {
  ...problem,
  tags: problem.tags.map((t) => t.tag),
  userSubmissions,
  totalSubmissions: problem.submitCount,
  totalAccepted: problem.solveCount,
  acceptanceRate: problem.submitCount > 0
    ? Math.round((problem.solveCount / problem.submitCount) * 100 * 10) / 10
    : 0,
};
```

- [ ] **Step 2: 前端 — 扩展 Problem 类型**

在 `frontend/src/types/index.ts` 的 `Problem` 接口中确认已有 `acceptanceRate`（当前已有），新增：
```typescript
export interface Problem {
  // ... 现有字段
  totalSubmissions: number;  // 新增
  totalAccepted: number;     // 新增
}
```

- [ ] **Step 3: 前端 — 在 meta 区展示统计信息**

在 `ProblemDetail.tsx` 的 `pd-meta` 区域末尾（`pd-meta-item` 之后）新增统计显示：

```tsx
<div className="pd-meta">
  <span className={`difficulty-badge difficulty-badge--${problem.difficulty}`}>
    {difficultyText}
  </span>
  <div className="pd-meta-item">
    <Clock size={14} />
    <span>{problem.timeLimit}ms</span>
  </div>
  <div className="pd-meta-item">
    <Cpu size={14} />
    <span>{problem.memoryLimit}MB</span>
  </div>
  {/* 新增统计信息 */}
  <div className="pd-meta-divider" />
  <div className="pd-meta-stats">
    <CheckCircle2 size={14} />
    <span>{problem.totalAccepted} / {problem.totalSubmissions} 提交</span>
  </div>
  <div className="pd-meta-stats">
    <span>· {problem.acceptanceRate}% 通过率</span>
  </div>
</div>
```

- [ ] **Step 4: 新增统计 CSS**

在 `ProblemDetail.css` 中新增：

```css
.pd-meta-divider {
  width: 1px;
  height: 16px;
  background: var(--border-light);
  margin: 0 4px;
}

.pd-meta-stats {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 13px;
  color: var(--text-muted);
}
```

- [ ] **Step 5: 运行后端测试**

```bash
cd server && npm test
```

Expected: 全部测试 PASS。

- [ ] **Step 6: 运行前端测试**

```bash
cd frontend && npm test
```

Expected: 全部测试 PASS。

- [ ] **Step 7: Commit**

```bash
git add server/src/services/problemService.ts frontend/src/pages/Problems/ProblemDetail.tsx frontend/src/pages/Problems/ProblemDetail.css frontend/src/types/index.ts
git commit -m "feat: add problem statistics (acceptanceRate, submissions) to detail page"
```

---

### Task 7: 布局优化 — 压缩间距 + 结果面板约束

**Files:**
- Modify: `frontend/src/pages/Problems/ProblemDetail.css`

**Interfaces:**
- 纯 CSS 改动，无 JSX 变更
- 目标：节省约 54px 垂直空间，确保提交按钮在首屏可见

- [ ] **Step 1: 压缩标题区域**

```css
.pd-header {
  padding: 16px 20px 0;  /* 原: 24px 24px 0 */
}

.pd-title {
  font-size: 24px;        /* 原: 28px */
  margin-bottom: 8px;     /* 原: 12px */
}

.pd-meta {
  margin-bottom: 8px;     /* 原: 12px */
  gap: 12px;              /* 原: 16px */
}
```

- [ ] **Step 2: 压缩 tabs 区域**

```css
.pd-tab {
  padding: 8px 14px;      /* 原: 12px 16px */
  font-size: 13px;        /* 原: 14px */
}
```

- [ ] **Step 3: 压缩 nav 区域**

```css
.pd-nav {
  padding: 8px 16px;      /* 原: 12px 20px */
}
```

- [ ] **Step 4: 压缩 content 区域**

```css
.pd-content {
  padding: 16px;           /* 原: 24px */
}
```

- [ ] **Step 5: 压缩 submit bar**

```css
.pd-submit-bar {
  padding: 10px 16px;      /* 原: 12px 16px */
}

.pd-submit-btn {
  padding: 10px;           /* 原: 12px */
}
```

- [ ] **Step 6: 结果面板约束（确保已在 Task 4 中设置）**

验证以下样式已存在：
```css
.pd-run-sample-result {
  max-height: 40%;
  overflow-y: auto;
}
```

- [ ] **Step 7: 运行前端测试**

```bash
cd frontend && npm test
```

Expected: 全部测试 PASS。

- [ ] **Step 8: Commit**

```bash
git add frontend/src/pages/Problems/ProblemDetail.css
git commit -m "style: compress problem detail layout spacing (~54px saved)"
```

---

### Task 8: 验证 + 收尾

- [ ] **Step 1: 运行前端全量测试 + 类型检查**

```bash
cd frontend && npm test && npx tsc --noEmit
```

Expected: 全部测试 PASS，类型检查无错误。

- [ ] **Step 2: 运行 Server 全量测试**

```bash
cd server && npm test
```

Expected: 全部测试 PASS。

- [ ] **Step 3: 运行 E2E 测试**

```bash
npx playwright test --project=chromium
```

Expected: 全部 E2E 测试 PASS。

- [ ] **Step 4: 更新 PROJECT.md**

更新 `PROJECT.md` 中 "2026-07-08（本次开发中）" 的题目详情页增强条目为已完成，更新测试统计：
```
- 题目详情页功能增强 — Markdown 题面 + 代码模板 + 草稿 + 运行样例 + 评测结果细化 + 题目统计 ✅
- 题目详情页布局优化 — 压缩间距，提交按钮回到首屏 ✅
```

- [ ] **Step 5: 最终提交**

```bash
git add PROJECT.md
git commit -m "feat: problem detail page enhancement complete (6 modules + layout optimization)"
```