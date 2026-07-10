# Spec C: 首页对接 — 去掉 Mock 数据

> 日期: 2026-07-10
> 状态: 设计稿

## 背景

`frontend/src/services/home.ts` 是 3 个含 mock 数据的 service 中的最后一个。首页 HomePage 使用 `getPopularProblems()` 和 `getUpcomingContests()` 展示热门题目和竞赛预告。

## 涉及文件

| 文件 | 改动类型 |
|------|---------|
| `frontend/src/services/home.ts` | 参数对齐 + 响应映射 + 删 mock 数据和 useMock |
| `frontend/src/pages/Home/Home.tsx` | difficulty 显示兼容数字类型 |

## 改动详情

### 1. `frontend/src/services/home.ts` — 删 mock，加响应映射

**删除：**
- `mockProblems` 数组（4 道假题）
- `mockContests` 数组（2 个假竞赛）
- `const useMock = ...` 行
- 每个函数的 `if (useMock) { ... }` 分支

**修正 `getPopularProblems()`：**

当前调用：
```ts
const res = await request.get<ApiResponse<PaginatedData<ProblemListItem>>>('/problems', {
  params: { limit, sort: 'popular', page: 1, pageSize: limit },
});
return res.data.data.items;
```

三个问题：
1. `sort: 'popular'` — Server 不支持，去掉
2. `res.data.data.items` — Server 返回 `{ problems, ... }` 而非 `{ items, ... }`
3. `sort` 参数被 Server 忽略但不报错，可以留着

修正后：
```ts
export async function getPopularProblems(limit = 4): Promise<ProblemListItem[]> {
  const res = await request.get<ApiResponse<any>>('/problems', {
    params: { limit, page: 1 },
  });
  const apiData = res.data.data;
  return (apiData.problems || []).map((p: any) => ({
    ...p,
    solvedCount: p.solveCount ?? 0,
    submissionCount: p.submitCount ?? 0,
    tags: (p.tags || []).map((t: any) => t.name || t),
  }));
}
```

**关于 difficulty：** Server 返回数字（1-5），但 Home.tsx 中使用 `problem.difficulty === 'easy'` 做字符串比较。这个不兼容在页面层修复（见下方第 2 点），Service 层保持返回数字，与其他页面一致。

**修正 `getUpcomingContests()`：**

```ts
export async function getUpcomingContests(limit = 2): Promise<Contest[]> {
  const res = await request.get<ApiResponse<any>>('/contests', {
    params: { status: 'upcoming', limit, page: 1 },
  });
  const apiData = res.data.data;
  return (apiData.contests || []).map((c: any) => ({
    ...c,
    status: c.status === 'ongoing' ? 'running' : c.status,
    type: c.type || 'rated',
  }));
}
```

### 2. `frontend/src/pages/Home/Home.tsx` — difficulty 显示兼容

当前代码第 216-217 行：
```tsx
<span className={`difficulty difficulty--${problem.difficulty}`}>
  {problem.difficulty === 'easy' ? '简单' : problem.difficulty === 'medium' ? '中等' : '困难'}
</span>
```

Server 返回的数字 1-5 无法匹配这些字符串比较和 CSS 类名。需要改为与其他页面一致的映射方式：

```tsx
{/* 在组件内或文件顶部加映射常量 */}
{/* const difficultyMap: Record<number, string> = { 1: 'easy', 2: 'easy', 3: 'medium', 4: 'hard', 5: 'hard' }; */}
{/* const diffKey = typeof problem.difficulty === 'number' ? difficultyMap[problem.difficulty] || 'medium' : problem.difficulty; */}

<span className={`difficulty difficulty--${diffKey}`}>
  {diffKey === 'easy' ? '简单' : diffKey === 'medium' ? '中等' : '困难'}
</span>
```

但有个更方便的做法——因为 `problem.difficulty` 在 `getPopularProblems()` 中已经可以从数字映射到字符串。不过权衡后保持与 problems.ts 一致（返回数字），在页面层处理。

## 验证方案

### 单元测试
- 前端有 `Home.test.tsx`（11 个测试），用 `jest.mock()` 手动 mock，不受影响
- 但 difficulty 映射改动可能需更新测试断言，看测试是否 mock 了数字或字符串的 difficulty

### E2E 测试
- 首页没有独立的 E2E 测试文件
- 可以在 `navigation.spec.ts` 的首页访问步骤中确认渲染无报错

### 手动验证
- 启动 dev server，首页热门题目列表渲染正常
- 难度标签和颜色正确
- 竞赛预告卡片渲染正常
- 空数据/加载状态正常
