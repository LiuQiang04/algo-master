# Spec B: 竞赛页面对接 — 去掉 Mock 数据

> 日期: 2026-07-10
> 状态: 设计稿

## 背景

`frontend/src/services/contests.ts` 是 3 个含 mock 数据的 service 之一。竞赛模块涉及两个页面（ContestList、ContestDetail），前后端格式不匹配较多，是本轮对接中改动最大的模块。

## 涉及文件

| 文件 | 改动类型 |
|------|---------|
| `server/src/routes/contests.ts` | 加 `/standings` 路由别名 |
| `frontend/src/services/contests.ts` | 响应格式映射 + 删 mock 数据和 useMock |
| `frontend/src/pages/Contests/ContestDetail.tsx` | 修复 `Number(id)` 转换、状态值对齐、难度显示 |
| `frontend/src/pages/Contests/ContestList.tsx` | 确认不修改（或极微小调整） |

## 改动详情

### 1. `server/src/routes/contests.ts` — 加 standings 路由别名

当前竞赛排名路由是 `GET /:id/ranking`，前端调用 `GET /:id/standings`。加一个别名路由指向同一 controller：

```ts
router.get('/:id/ranking', contestController.getContestRanking);
router.get('/:id/standings', contestController.getContestRanking);  // 新增
```

### 2. `frontend/src/services/contests.ts` — 删 mock，加响应映射

**删除：**
- `mockContests` 数组（4 个假竞赛）
- `mockStandings` 数组（8 行假排行榜）
- `const useMock = ...` 行
- 每个函数的 `if (useMock) { ... }` 分支

**修正 `getContests()`：**

Server 返回 `{ data: { contests, total, page, totalPages } }`，前端 `PaginatedData<Contest>` 期望 `{ items, total, page, pageSize, totalPages }`。service 层转换：

```ts
export async function getContests(
  params?: PaginationParams & { status?: string }
): Promise<PaginatedData<Contest>> {
  // 参数映射：前端 'running' → Server 'ongoing'
  const serverParams: Record<string, any> = { ...params };
  if (serverParams.status === 'running') {
    serverParams.status = 'ongoing';
  }

  const res = await request.get<ApiResponse<any>>('/contests', {
    params: { ...serverParams, limit: params?.pageSize },
  });
  const apiData = res.data.data;
  return {
    items: apiData.contests || [],
    total: apiData.total || 0,
    page: apiData.page || 1,
    pageSize: params?.pageSize || 20,
    totalPages: apiData.totalPages || 0,
  };
}
```

**修正 `getContestById()`：**

Server 返回 `{ data: { ...contest, status, participantCount, isParticipating, userRank } }`。

问题：
- Server 返回 `status: 'ongoing'`，前端期望 `'running'`
- Server 没有 `type` 字段，需补默认值 `'rated'`

```ts
export async function getContestById(id: number): Promise<Contest> {
  const res = await request.get<ApiResponse<any>>(`/contests/${id}`);
  const raw = res.data.data;
  return {
    ...raw,
    status: raw.status === 'ongoing' ? 'running' : raw.status,
    type: raw.type || 'rated',  // Server 无此字段，补默认值
  };
}
```

**修正 `joinContest()`：**

只需要删 mock 分支，else 体直接升为函数体。无格式问题。

**`getContestStandings()` — 路径和格式双修正：**

Server `GET /contests/:id/ranking` 返回：
```json
[{ "rank": 1, "userId": "uuid", "username": "xx", "avatarUrl": null, "level": 1, "totalScore": 400, "joinedAt": "..." }]
```

前端 `ContestStanding` 期望：
```json
[{ "rank": 1, "userId": 0, "username": "xx", "score": 400, "penalty": 0, "problems": [] }]
```

Service 层转换：
```ts
export async function getContestStandings(id: number): Promise<ContestStanding[]> {
  const res = await request.get<ApiResponse<any[]>>(`/contests/${id}/standings`);
  return (res.data.data || []).map((entry: any) => ({
    rank: entry.rank,
    userId: entry.userId,
    username: entry.username,
    score: entry.totalScore || 0,
    penalty: 0,  // Server 无 penalty 数据
    problems: [], // Server 不返回每题状态
  }));
}
```

### 3. `ContestDetail.tsx` — 修复类型硬伤

**`Number(id)` 转换问题（关键！）：**

Server 的竞赛 ID 是 UUID 字符串（如 `"abc-123-..."`），`Number("abc-123-...")` 结果为 `NaN`，后续所有 API 调用全废。

```ts
// 改前
const { id } = useParams<{ id: string }>();
const contestId = Number(id);

// 改后 — 直接用字符串
const contestId = id ?? '';  // useParams 已返回 string
```

同时所有依赖 `contestId` 的函数入参类型也要放宽。`contests.ts` 中的函数签名从 `(id: number)` 改为 `(id: number | string)`，URL 模板拼接 `/${id}` 不受影响。

**状态值对齐：**

页面中 `contest.status === 'running'` 的比较改为 `contest.status === 'running'`（service 层已在 `getContestById` 中把 `'ongoing'` map 成 `'running'`，所以页面不变）。

但如果 contestList 直接调用 `getContests()`，返回的 `Contest.status` 也需要是 `'running'` 而非 `'ongoing'`。service 层 `getContests()` 的 items 映射需一并处理 status 转换。

**问题列表 difficulty 显示：**

竞赛题目中 `p.problem?.difficulty` 是数字，但页面 CSS 类和文字比较用了字符串。可以在 service 层 `getContestById()` 返回前转换：

```ts
// 在 getContestById 的 return 前
if (raw.problems) {
  raw.problems = raw.problems.map((p: any) => ({
    ...p,
    problem: p.problem ? {
      ...p.problem,
      difficulty: ({ 1: 'easy', 2: 'easy', 3: 'medium', 4: 'hard', 5: 'hard' } as any)[p.problem.difficulty] || 'medium',
    } : undefined,
  }));
}
```

### 4. `ContestList.tsx` — 不修改

- 页面使用 `contest.status`、`contest.type`、`contest.title` 等字段
- `contest.status` 在 service 层已转 `'ongoing'` → `'running'`
- `contest.type` 在 service 层已补默认值 `'rated'`
- `contest.id` 直接用（JSX 渲染 + URL 拼接都兼容字符串）

## 已知差距

| 项 | 现状 | 原因 |
|----|------|------|
| Contest.type | 固定为 `'rated'` | Server Prisma model 无此字段，不改 schema/migration |
| Standing.problems | 返回空数组 `[]` | Server 不返回每题通过状态，需后续增强 |
| Standing.penalty | 返回 `0` | Server 无 penalty 数据 |

这些差距不影响正常使用，只是竞赛详情页的排行榜和标签不如 mock 数据丰富。

## 验证方案

### 单元测试
- 前端已有竞赛测试（ContestList 和 ContestDetail），用 `jest.mock()` mock 整个 service，不受影响

### E2E 测试
- `e2e/contests/contestFlow.spec.ts`（3 个）
- `e2e/contests/contestDetail.spec.ts`（15 个）
- 共 18 个 E2E 测试，需全部通过

### 手动验证
- 启动 dev server，打开竞赛列表确认显示正常
- 竞赛详情页的概览/题目/排行榜标签页
- 如果没有 seed 竞赛数据，页面显示空状态
