# 题目详情页功能增强 — 设计规格

> 日期: 2026-07-08
> 状态: 待实施

## 一、背景

题目详情页（`/problems/:id`）是项目中使用频率最高的页面，当前功能较为基础。本次从 6 个方向增强用户体验。

## 二、模块设计

### 2.1 题面 Markdown 渲染

**现状**：`problem.description` 用 `\n` 分割，逐行包 `<p>` 标签，不支持任何富文本格式。

**方案**：复用现有 `MarkdownRenderer` 组件（`frontend/src/components/common/MarkdownRenderer.tsx`），替换 4 处文本渲染：

- `problem.description` → `<MarkdownRenderer content={problem.description} />`
- `problem.inputFormat` → `<MarkdownRenderer content={problem.inputFormat} />`
- `problem.outputFormat` → `<MarkdownRenderer content={problem.outputFormat} />`
- `problem.hint` → `<MarkdownRenderer content={problem.hint} />`

**改动文件**：
- `frontend/src/pages/Problems/ProblemDetail.tsx` — 替换渲染逻辑，引入 MarkdownRenderer
- `frontend/src/pages/Problems/ProblemDetail.css` — 删除不再需要的 `.pd-text p` 样式

**影响**：题目描述支持标题、列表、表格、代码块、引用、图片、链接等 Markdown 语法。

---

### 2.2 代码模板

**现状**：每种语言的 `defaultCode` 过于简陋（仅空壳）。

**方案**：改进为更实用的模板，包含常用导入和标准输入/输出框架。

```cpp
// C++
#include <bits/stdc++.h>
using namespace std;

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    
    // TODO: 在此编写代码
    
    return 0;
}
```

```python
# Python
import sys
from typing import List

def solve() -> None:
    # TODO: 在此编写代码
    pass

if __name__ == '__main__':
    solve()
```

```java
// Java
import java.util.*;
import java.io.*;

public class Solution {
    public static void main(String[] args) throws IOException {
        BufferedReader br = new BufferedReader(new InputStreamReader(System.in));
        // TODO: 在此编写代码
    }
}
```

```javascript
// JavaScript
const readline = require('readline');
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

// TODO: 在此编写代码
```

**改动文件**：仅 `frontend/src/pages/Problems/ProblemDetail.tsx` 中 `languages` 数组的 `defaultCode`。

---

### 2.3 代码草稿（localStorage）

**方案**：用 `localStorage` 按 `algo_draft_{problemId}_{language}` 为 key 自动保存/恢复代码。

**行为**：
- 用户编辑代码时，debounce 1s 后自动保存到 localStorage
- 切换题目时，自动恢复该题目对应语言的草稿
- 切换语言时，自动恢复该语言的草稿（有草稿则用草稿，否则用代码模板）
- 提交成功后，清除该题目的草稿

**改动文件**：
- `frontend/src/pages/Problems/ProblemDetail.tsx` — 新增 `useEffect` 监听 code 变化，debounce 保存
- 新增 `frontend/src/hooks/useCodeDraft.ts` — 草稿存取 hook

**接口**：
```typescript
function useCodeDraft(problemId: number, language: string): {
  draft: string | null;        // 恢复的草稿（null = 无草稿）
  saveDraft: (code: string) => void;  // 保存草稿
  clearDraft: () => void;             // 清除草稿
}
```

---

### 2.4 运行样例（Run Sample）

**前端**：编辑区下方新增"运行样例"按钮，点击后调用后端 run-sample API，展示结果面板。

**按钮样式**：与"提交代码"并列，用次要按钮样式（outline），区别于提交按钮的绿色渐变。

**结果面板**：展示每个样例用例的卡片。

```
┌─────────────────────────────────────────┐
│ 样例 1  ✅ 通过 (12ms)                    │
│ ┌─ 输入 ───────────────────────────────┐ │
│ │ 1 2                                  │ │
│ ├─ 预期输出 ───────────────────────────┤ │
│ │ 3                                    │ │
│ ├─ 实际输出 ───────────────────────────┤ │
│ │ 3                                    │ │
│ └──────────────────────────────────────┘ │
│                                          │
│ 样例 2  ❌ 未通过 (15ms)                  │
│ ┌─ 输入 ───────────────────────────────┐ │
│ │ 5 3                                  │ │
│ ├─ 预期输出 ───────────────────────────┤ │
│ │ 8                                    │ │
│ ├─ 实际输出 ───────────────────────────┤ │
│ │ 10                                   │ │
│ └──────────────────────────────────────┘ │
└─────────────────────────────────────────┘
```

**交互**：
- 运行中显示"运行中..."状态
- 编译错误时显示错误信息
- 不影响当前提交结果面板

**改动文件**：
- `frontend/src/pages/Problems/ProblemDetail.tsx` — 新增按钮、状态、结果面板
- `frontend/src/pages/Problems/ProblemDetail.css` — 新增样式
- `frontend/src/services/submissions.ts` — 新增 `runSample()` API 调用

---

### 2.5 评测结果细化

**前端**：提交结果面板展开后，显示每个测试用例的通过/失败状态（复用 2.4 的卡片样式）。

**数据来源**：`GET /api/submissions/:id` 响应中新增 `testCaseResults` 字段（由评测系统写入 SubmissionTestCase 表）。

**显示逻辑**：
- AC：显示"✅ 全部通过 (N/N 用例)"
- WA/TLE/RTE：展开显示每个用例卡片
- 首次加载时：默认折叠，用户点击展开查看详情

**交互**：
- 折叠状态：显示"通过 X/Y 个测试用例 ▼"
- 展开状态：显示每个用例卡片（复用 Run Sample 结果卡片样式）

**改动文件**：
- `frontend/src/pages/Problems/ProblemDetail.tsx` — 结果面板展开/折叠逻辑
- `frontend/src/pages/Problems/ProblemDetail.css` — 卡片样式
- `frontend/src/types/index.ts` — 新增 `TestCaseResult` 类型

---

### 2.6 题目统计

**后端**：`GET /api/problems/:id` 响应中增加统计字段（复用 DB 已有字段）：

```json
{
  "id": "...",
  "title": "两数之和",
  // ... 现有字段
  "acceptanceRate": 65.5,
  "totalSubmissions": 120,
  "totalAccepted": 78
}
```

**前端**：标题下方 meta 区增加统计信息。

```
简单  ⏱ 1000ms  💾 256MB  |  ✅ 78 / 120 提交  ·  65.5% 通过率
```

**改动文件**：
- `server/src/routes/problems.ts` 或 `server/src/services/problemService.ts` — 计算统计字段
- `frontend/src/pages/Problems/ProblemDetail.tsx` — 新增统计展示
- `frontend/src/types/index.ts` — Problem 类型新增统计字段

---

## 三、文件改动汇总

| 文件 | 改动类型 | 涉及模块 |
|---|---|---|
| `frontend/src/pages/Problems/ProblemDetail.tsx` | 修改 | ①~⑥ 全部 |
| `frontend/src/pages/Problems/ProblemDetail.css` | 修改 | ① ② ④ ⑤ |
| `frontend/src/hooks/useCodeDraft.ts` | **新增** | ③ |
| `frontend/src/services/submissions.ts` | 修改 | ④ `runSample()` |
| `frontend/src/types/index.ts` | 修改 | ⑤ `TestCaseResult` |
| `server/src/routes/submissions.ts` | 修改 | ④ `run-sample` 路由 |
| `server/src/services/problemService.ts` | 修改 | ⑥ 统计字段<br>（如不存在则修改 controller） |

## 四、测试计划

| 测试类型 | 覆盖内容 |
|---|---|
| 单元测试 | `useCodeDraft` hook（保存/恢复/清除/切换语言） |
| 单元测试 | MarkdownRenderer 渲染题目描述 |
| 单元测试 | ProblemDetail 运行样例按钮和状态切换 |
| 单元测试 | ProblemDetail 评测结果展开/折叠 |
| 单元测试 | 题目统计字段渲染 |
| 集成测试 | `POST /api/submissions/run-sample` 接口 |
| 视觉验证 | 3 尺寸截图（375/768/1920）确认各功能正常 |