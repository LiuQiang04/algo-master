# Spec A: 题库页面对接 — 去掉 Mock 数据

> 日期: 2026-07-10
> 状态: 设计稿

## 背景

前端 3 个 service 文件通过 `VITE_USE_MOCK=true` 环境变量使用内联 mock 数据。项目已接近完成（96%），后端所有 API 均已实现，mock 不再需要。题库模块（ProblemList + ProblemDetail）是第一个对接的模块。

## 涉及文件

| 文件 | 改动类型 |
|------|---------|
| `frontend/src/services/problems.ts` | 响应格式映射修正 + 删 mock 数据和 useMock |
| `frontend/src/pages/Problems/ProblemList.tsx` | 参数名对齐（keyword→search, difficulty 值映射） |
| `frontend/src/pages/Problems/ProblemDetail.tsx` | 可能不需改（已兼容） |

## 改动详情

### 1. `services/problems.ts`

**删除：**
- 整个 `mockProblems` 数组（20 道假题）
- 整个 `mockTags` 数组
- `const useMock = ...` 行
- 每个函数的 `if (useMock) { ... }` 分支

**修正 `getProblems()` 的 else 分支：**

当前代码已正确映射：
- `apiData.problems[]` → `items[]`
- `solveCount` → `solvedCount`，`submitCount` → `submissionCount`
- `tags: t.name` → 字符串数组

但参数传递需要对齐 Server 期望：
- 前端传 `keyword` → Server 期望 `search`
- 前端传 `difficulty='easy'` → Server 期望 `difficulty=1`（数字）
- 前端传 `status` → Server 不支持，忽略

这些在 service 层处理比较合适：
```ts
const serverParams: any = { ...params };
if (serverParams.keyword) {
  serverParams.search = serverParams.keyword;
  delete serverParams.keyword;
}
if (serverParams.difficulty) {
  // 'easy'→1, 'medium'→3, 'hard'→5
  const diffMap: Record<string, number> = { easy: 1, medium: 3, hard: 5 };
  serverParams.difficulty = diffMap[serverParams.difficulty as string] || undefined;
}
delete serverParams.status; // Server 不支持
delete serverParams.pageSize; // 已在下面转成 limit
serverParams.limit = params?.pageSize;
```

**修正 `getProblemTags()`：**
```ts
// Server 返回 [{id, name, category, problemCount}]
// 前端期望 string[]
return (res.data.data || []).map((t: any) => t.name);
```

**`getProblemById()`** — 不修改，现有 else 分支已正确处理。

### 2. `ProblemList.tsx`

只需确认参数通过 mock 分支后的映射正确。因为 service 层会处理参数转换，页面代码可以不修改。但如果把难度值转换放在 service 层，页面传 `'easy'` 就行。

当前页面传参：
```ts
params.keyword = searchQuery;
params.difficulty = difficultyFilter;  // 'easy'|'medium'|'hard'
params.tag = selectedTags.join(',');
params.status = statusFilter;  // 会被 service 忽略
```

在 service 层 map 后，页面无需改。如果后续发现 `status` 参数引起 Server 报错（传了不支持的参数），届时再修。

### 3. `ProblemDetail.tsx`

不修改。页面已兼容：
- `difficulty` 作为数字（1-5）处理
- 标签作为对象 `{id, name}` 处理
- ID 作为 UUID 字符串处理

## 验证方案

### 单元测试
- 前端已有 `ProblemList.test.tsx`（18 个测试），均用 `jest.mock()` 手动 mock，不受影响
- 无需新增测试

### E2E 测试
- `e2e/problems/problemList.spec.ts`（5 个）
- `e2e/problems/problemDetail.spec.ts`（8 个）
- 共 13 个 E2E 测试，需全部通过

### 手动验证
- 启动 dev server，打开题库页确认题目列表加载正常
- 筛选（难度、标签、搜索）功能正常
- 题目详情页正常
- 加载空数据/错误状态正常

## 风险

- **无 seed 数据**：如果数据库没有题目，页面会显示空列表。届时需要跑 `seed` 脚本填充数据
- **难度 filter 传值转换**：如果 Server 用 enum 而非数字，需调整映射表
