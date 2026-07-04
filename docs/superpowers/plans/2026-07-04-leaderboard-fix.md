# 排行榜页面修复与 UI 改造实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use subagent-driven-development or executing-plans to implement this plan task-by-task.

**Goal:** 修复排行榜页面的数据读取 bug，将 UI 改为 CSS 变量内联样式，补充 seed 数据和前端测试

**Architecture:** 全栈改动集中在 frontend 和 backend seed，不碰 server 路由/服务。前端使用 CSS 变量（var(--primary-600)等）内联样式，与 LoginPage 模式一致。

**Tech Stack:** React 19 + TypeScript + Tailwind CSS v4 + Prisma + Jest

## Global Constraints

- 不改动 server/ 目录下的路由、服务、测试文件
- 不改动 frontend/src/routes.tsx、api/、types/ 文件
- UI 使用 CSS 变量内联样式，不写 Tailwind 类名
- 颜色从 LoginPage.tsx 模式复制：var(--bg-card), var(--bg-secondary), var(--primary-600), var(--text-primary), var(--text-secondary), var(--text-muted), var(--border-light), var(--danger-50), var(--danger-700)
- 测试使用 jest.mock 模拟 API，不依赖真实后端

---

### Task 1: 修复 useUserRank 数据读取 bug

**Files:**
- Modify: `frontend/src/hooks/useGamification.ts:130`

**Interfaces:**
- Consumes: `leaderboardApi.getMyRank()` 返回 `{ global: number, friends: number }`
- Produces: `useUserRank()` 返回 `{ ranks: {global, friends} | null, loading }`

- [ ] **Step 1: 定位并修复 bug**

当前代码（第 130 行）：
```ts
setRanks(response.data.data);
```

服务器 `GET /api/leaderboard/rank/me` 返回：
```json
{"global": 1, "friends": 3}
```

axios 中 `response.data` 就是 `{global: 1, friends: 3}`，不需要 `.data`。

改为：
```ts
setRanks(response.data);
```

- [ ] **Step 2: 运行测试确保不破坏**

```bash
cd frontend && npm test -- --testPathPattern="Leaderboard|Gamification" 2>&1 | tail -20
```

- [ ] **Step 3: 提交**

```bash
git add frontend/src/hooks/useGamification.ts
git commit -m "fix: 修复 useUserRank 数据读取 bug（response.data.data → response.data）"
```

---

### Task 2: 改造 LeaderboardTable 组件为 CSS 变量内联样式

**Files:**
- Rewrite: `frontend/src/components/gamification/LeaderboardTable.tsx`

**Interfaces:**
- Consumes: `LeaderboardEntry[]`, `currentUserId?`, `showFriendIndicator?`
- Produces: 纯展示组件，无副作用

- [ ] **Step 1: 重写 LeaderboardTable.tsx**

完整替换为 CSS 变量内联样式：

```tsx
import React from 'react';
import type { LeaderboardEntry } from '../../types/gamification';

interface LeaderboardTableProps {
  entries: LeaderboardEntry[];
  currentUserId?: string;
  showFriendIndicator?: boolean;
}

const LeaderboardTable: React.FC<LeaderboardTableProps> = ({
  entries,
  currentUserId,
  showFriendIndicator = false,
}) => {
  const getRankBadge = (rank: number) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return `#${rank}`;
  };

  if (entries.length === 0) {
    return (
      <div
        style={{
          background: 'var(--bg-card)',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border-light)',
          padding: 48,
          textAlign: 'center',
        }}
      >
        <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>暂无数据</p>
      </div>
    );
  }

  return (
    <div
      style={{
        background: 'var(--bg-card)',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--border-light)',
        overflow: 'hidden',
      }}
    >
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr
            style={{
              background: 'var(--bg-secondary)',
              borderBottom: '1px solid var(--border-light)',
            }}
          >
            {['排名', '用户', '等级', '经验值', '评分'].map((h) => (
              <th
                key={h}
                style={{
                  padding: '12px 16px',
                  textAlign: 'left',
                  fontSize: 12,
                  fontWeight: 600,
                  color: 'var(--text-muted)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                }}
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody style={{ fontSize: 14 }}>
          {entries.map((entry, idx) => {
            const isCurrentUser = entry.id === currentUserId;
            return (
              <tr
                key={entry.id}
                style={{
                  borderBottom: idx < entries.length - 1 ? '1px solid var(--border-light)' : 'none',
                  background: isCurrentUser ? 'var(--primary-50, #EFF6FF)' : 'transparent',
                  outline: isCurrentUser ? '2px solid var(--primary-600)' : 'none',
                  outlineOffset: -2,
                  transition: 'background 0.15s',
                }}
                onMouseEnter={(e) => { if (!isCurrentUser) e.currentTarget.style.background = 'var(--hover-bg, #F9FAFB)'; }}
                onMouseLeave={(e) => { if (!isCurrentUser) e.currentTarget.style.background = 'transparent'; }}
              >
                <td style={{ padding: '12px 16px', whiteSpace: 'nowrap' }}>
                  <span style={{ fontSize: 18 }}>{getRankBadge(entry.rank)}</span>
                </td>
                <td style={{ padding: '12px 16px', whiteSpace: 'nowrap' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, var(--primary-500), var(--accent, #7C3AED))',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}
                    >
                      {entry.avatarUrl ? (
                        <img
                          src={entry.avatarUrl}
                          alt={entry.username}
                          style={{ width: 32, height: 32, borderRadius: '50%' }}
                        />
                      ) : (
                        <span style={{ color: 'white', fontSize: 13, fontWeight: 600 }}>
                          {entry.username.charAt(0).toUpperCase()}
                        </span>
                      )}
                    </div>
                    <div>
                      <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>
                        {entry.username}
                        {isCurrentUser && (
                          <span style={{ marginLeft: 6, fontSize: 12, color: 'var(--primary-600)' }}>(你)</span>
                        )}
                        {showFriendIndicator && entry.isFriend && (
                          <span style={{ marginLeft: 6, fontSize: 12, color: 'var(--success, #059669)' }}>好友</span>
                        )}
                      </span>
                      {entry.title && (
                        <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>{entry.title}</div>
                      )}
                    </div>
                  </div>
                </td>
                <td style={{ padding: '12px 16px', whiteSpace: 'nowrap' }}>
                  <span
                    style={{
                      display: 'inline-block',
                      padding: '2px 10px',
                      borderRadius: 'var(--radius-full, 999px)',
                      fontSize: 12,
                      fontWeight: 600,
                      background: 'var(--primary-100)',
                      color: 'var(--primary-700)',
                    }}
                  >
                    Lv.{entry.level}
                  </span>
                </td>
                <td style={{ padding: '12px 16px', whiteSpace: 'nowrap', color: 'var(--text-primary)' }}>
                  {entry.experiencePoints.toLocaleString()}
                </td>
                <td style={{ padding: '12px 16px', whiteSpace: 'nowrap', color: 'var(--text-primary)' }}>
                  {entry.rating}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default LeaderboardTable;
```

- [ ] **Step 2: 运行 lint + 类型检查**

```bash
cd frontend && npm run lint && npx tsc --noEmit 2>&1 | tail -20
```

- [ ] **Step 3: 提交**

```bash
git add frontend/src/components/gamification/LeaderboardTable.tsx
git commit -m "feat: 改造 LeaderboardTable 为 CSS 变量内联样式"
```

---

### Task 3: 改造 LeaderboardPage 页面为 CSS 变量内联样式

**Files:**
- Rewrite: `frontend/src/pages/Gamification/LeaderboardPage.tsx`

**Interfaces:**
- Consumes: `useLeaderboard(type)`, `useUserRank()` hooks
- Produces: 路由 `/leaderboard` 渲染的页面组件

- [ ] **Step 1: 重写 LeaderboardPage.tsx**

完整替换为 CSS 变量内联样式：

```tsx
import React, { useState } from 'react';
import { useLeaderboard, useUserRank } from '../../hooks/useGamification';
import LeaderboardTable from '../../components/gamification/LeaderboardTable';

const TABS = [
  { id: 'global' as const, label: '全球排行', icon: '🌍' },
  { id: 'friends' as const, label: '好友排行', icon: '👥' },
  { id: 'region' as const, label: '地区排行', icon: '📍' },
];

const LeaderboardPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'global' | 'friends' | 'region'>('global');
  const { entries, loading, error, hasMore, loadMore } = useLeaderboard(activeTab);
  const { ranks } = useUserRank();

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-secondary)', padding: '32px 0' }}>
      <div style={{ maxWidth: 800, margin: '0 auto', padding: '0 24px' }}>
        {/* 页面标题 */}
        <div style={{ marginBottom: 32 }}>
          <h1 style={{ fontSize: 28, fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
            排行榜
          </h1>
          <p style={{ margin: '8px 0 0', color: 'var(--text-secondary)', fontSize: 14 }}>
            查看你在全球用户中的排名，与好友一较高下！
          </p>
        </div>

        {/* 用户排名卡片 */}
        {ranks && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 32 }}>
            <div
              style={{
                background: 'linear-gradient(135deg, var(--primary-600), #1D4ED8)',
                borderRadius: 'var(--radius-lg)',
                padding: 24,
                boxShadow: 'var(--shadow-md)',
                color: 'white',
              }}
            >
              <p style={{ fontSize: 13, opacity: 0.8, margin: 0 }}>全球排名</p>
              <p style={{ fontSize: 36, fontWeight: 700, margin: '8px 0' }}>#{ranks.global}</p>
              <p style={{ fontSize: 13, opacity: 0.8, margin: 0 }}>全球用户中的位置</p>
            </div>
            <div
              style={{
                background: 'linear-gradient(135deg, #7C3AED, #6D28D9)',
                borderRadius: 'var(--radius-lg)',
                padding: 24,
                boxShadow: 'var(--shadow-md)',
                color: 'white',
              }}
            >
              <p style={{ fontSize: 13, opacity: 0.8, margin: 0 }}>好友排名</p>
              <p style={{ fontSize: 36, fontWeight: 700, margin: '8px 0' }}>#{ranks.friends}</p>
              <p style={{ fontSize: 13, opacity: 0.8, margin: 0 }}>好友中的位置</p>
            </div>
          </div>
        )}

        {/* 标签页 */}
        <div
          style={{
            display: 'flex',
            gap: 4,
            background: 'var(--bg-secondary)',
            padding: 4,
            borderRadius: 'var(--radius-lg)',
            marginBottom: 24,
            border: '1px solid var(--border-light)',
          }}
        >
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                padding: '10px 16px',
                border: 'none',
                borderRadius: 'var(--radius-md)',
                fontSize: 14,
                fontWeight: 500,
                cursor: 'pointer',
                background: activeTab === tab.id ? 'var(--bg-card)' : 'transparent',
                color: activeTab === tab.id ? 'var(--text-primary)' : 'var(--text-muted)',
                boxShadow: activeTab === tab.id ? 'var(--shadow-sm)' : 'none',
                transition: 'all 0.15s',
              }}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* 错误提示 */}
        {error && (
          <div
            style={{
              padding: '12px 16px',
              borderRadius: 'var(--radius-md)',
              background: 'var(--danger-50)',
              color: 'var(--danger-700)',
              border: '1px solid var(--danger-200)',
              marginBottom: 24,
              fontSize: 14,
            }}
          >
            {error}
          </div>
        )}

        {/* 加载/内容 */}
        {loading && entries.length === 0 ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: 48 }}>
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: '50%',
                border: '3px solid var(--border-light)',
                borderTopColor: 'var(--primary-600)',
                animation: 'spin 0.8s linear infinite',
              }}
            />
          </div>
        ) : (
          <>
            <LeaderboardTable
              entries={entries as any}
              showFriendIndicator={activeTab === 'friends'}
            />
            {hasMore && (
              <div style={{ textAlign: 'center', marginTop: 24 }}>
                <button
                  onClick={loadMore}
                  disabled={loading}
                  style={{
                    padding: '10px 24px',
                    background: 'var(--primary-600)',
                    color: 'white',
                    border: 'none',
                    borderRadius: 'var(--radius-md)',
                    fontSize: 14,
                    fontWeight: 600,
                    cursor: loading ? 'not-allowed' : 'pointer',
                    opacity: loading ? 0.7 : 1,
                    transition: 'opacity 0.15s',
                  }}
                >
                  {loading ? '加载中...' : '加载更多'}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default LeaderboardPage;
```

- [ ] **Step 2: 检查 CSS 动画定义**

确保 spinner 动画存在于全局 CSS 中。检查 `frontend/src/index.css` 或 `frontend/src/App.css`：

```bash
grep -r "keyframes spin" frontend/src/ 2>/dev/null || echo "No @keyframes spin found"
```

如果没有，在 `frontend/src/index.css` 添加：
```css
@keyframes spin {
  to { transform: rotate(360deg); }
}
```

- [ ] **Step 3: 运行 lint + 类型检查**

```bash
cd frontend && npm run lint && npx tsc --noEmit 2>&1 | tail -20
```

- [ ] **Step 4: 提交**

```bash
git add frontend/src/pages/Gamification/LeaderboardPage.tsx frontend/src/index.css
git commit -m "feat: 改造 LeaderboardPage 为 CSS 变量内联样式"
```

---

### Task 4: 为 seed 用户添加 region 字段

**Files:**
- Modify: `backend/prisma/seed.ts:64-121`

- [ ] **Step 1: 为用户添加 region**

在 backend/prisma/seed.ts 中，给 5 个用户各添加 `region` 字段：

- admin: 北京
- moderator: 上海
- alice_wang: 上海
- bob_zhang: 深圳
- charlie_li: 杭州

例如 admin 用户改为：
```ts
prisma.user.create({
  data: {
    username: "admin",
    email: "admin@algo-oj.com",
    passwordHash,
    bio: "System administrator",
    rating: 3000,
    experiencePoints: 50000,
    level: 50,
    role: "admin",
    region: "北京",
  },
}),
```

其他用户类似添加 `region`。

- [ ] **Step 2: 提交**

```bash
git add backend/prisma/seed.ts
git commit -m "feat: 为 seed 用户添加 region 数据支持地区排行榜"
```

---

### Task 5: 编写 LeaderboardPage 前端单元测试

**Files:**
- Create: `frontend/src/__tests__/components/LeaderboardPage.test.tsx`

- [ ] **Step 1: 创建测试文件 `LeaderboardPage.test.tsx`**

```tsx
/**
 * Unit tests for the LeaderboardPage component.
 * Tests rendering, loading, error, and data display.
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import LeaderboardPage from '../../pages/Gamification/LeaderboardPage';

// Mock the hooks
const mockUseLeaderboard = jest.fn();
const mockUseUserRank = jest.fn();

jest.mock('../../hooks/useGamification', () => ({
  useLeaderboard: (...args: any[]) => mockUseLeaderboard(...args),
  useUserRank: (...args: any[]) => mockUseUserRank(...args),
}));

// Mock LeaderboardTable as simple render
jest.mock('../../components/gamification/LeaderboardTable', () => ({
  __esModule: true,
  default: ({ entries }: any) => (
    <div data-testid="leaderboard-table">
      {entries.length > 0 ? (
        entries.map((e: any) => (
          <div key={e.id} data-testid="entry-row">
            {e.username}
          </div>
        ))
      ) : (
        <div data-testid="empty-table">暂无数据</div>
      )}
    </div>
  ),
}));

describe('LeaderboardPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const renderPage = () => render(<LeaderboardPage />, { wrapper: BrowserRouter });

  it('renders page title', () => {
    mockUseLeaderboard.mockReturnValue({
      entries: [],
      loading: false,
      error: null,
      hasMore: false,
      loadMore: jest.fn(),
    });
    mockUseUserRank.mockReturnValue({ ranks: null, loading: false });

    renderPage();
    expect(screen.getByText('排行榜')).toBeInTheDocument();
  });

  it('shows loading spinner when loading', () => {
    mockUseLeaderboard.mockReturnValue({
      entries: [],
      loading: true,
      error: null,
      hasMore: false,
      loadMore: jest.fn(),
    });
    mockUseUserRank.mockReturnValue({ ranks: null, loading: false });

    renderPage();
    // Should show spinner (the animated div)
    const container = document.querySelector('div[style*="animation"]');
    expect(container).toBeInTheDocument();
  });

  it('displays error message when error occurs', () => {
    mockUseLeaderboard.mockReturnValue({
      entries: [],
      loading: false,
      error: 'Failed to load leaderboard',
      hasMore: false,
      loadMore: jest.fn(),
    });
    mockUseUserRank.mockReturnValue({ ranks: null, loading: false });

    renderPage();
    expect(screen.getByText('Failed to load leaderboard')).toBeInTheDocument();
  });

  it('renders user rank cards when ranks are available', () => {
    mockUseLeaderboard.mockReturnValue({
      entries: [],
      loading: false,
      error: null,
      hasMore: false,
      loadMore: jest.fn(),
    });
    mockUseUserRank.mockReturnValue({
      ranks: { global: 1, friends: 3 },
      loading: false,
    });

    renderPage();
    expect(screen.getByText('#1')).toBeInTheDocument();
    expect(screen.getByText('#3')).toBeInTheDocument();
  });

  it('renders leaderboard entries', () => {
    mockUseLeaderboard.mockReturnValue({
      entries: [
        { id: '1', username: 'alice', rank: 1, level: 20, experiencePoints: 15000, rating: 2100, avatarUrl: null, title: null },
        { id: '2', username: 'bob', rank: 2, level: 10, experiencePoints: 8000, rating: 1800, avatarUrl: null, title: null },
      ],
      loading: false,
      error: null,
      hasMore: false,
      loadMore: jest.fn(),
    });
    mockUseUserRank.mockReturnValue({ ranks: null, loading: false });

    renderPage();
    expect(screen.getByText('alice')).toBeInTheDocument();
    expect(screen.getByText('bob')).toBeInTheDocument();
  });

  it('switches tabs and calls useLeaderboard with different type', async () => {
    mockUseLeaderboard.mockReturnValue({
      entries: [],
      loading: false,
      error: null,
      hasMore: false,
      loadMore: jest.fn(),
    });
    mockUseUserRank.mockReturnValue({ ranks: null, loading: false });

    renderPage();

    // Click "好友排行" tab
    fireEvent.click(screen.getByText('好友排行'));

    // The hook should have been called with 'friends'
    await waitFor(() => {
      expect(mockUseLeaderboard).toHaveBeenCalledWith('friends');
    });
  });

  it('shows load more button when hasMore is true', () => {
    mockUseLeaderboard.mockReturnValue({
      entries: [
        { id: '1', username: 'alice', rank: 1, level: 20, experiencePoints: 15000, rating: 2100, avatarUrl: null, title: null },
      ],
      loading: false,
      error: null,
      hasMore: true,
      loadMore: jest.fn(),
    });
    mockUseUserRank.mockReturnValue({ ranks: null, loading: false });

    renderPage();
    expect(screen.getByText('加载更多')).toBeInTheDocument();
  });

  it('calls loadMore when load more button is clicked', () => {
    const mockLoadMore = jest.fn();
    mockUseLeaderboard.mockReturnValue({
      entries: [
        { id: '1', username: 'alice', rank: 1, level: 20, experiencePoints: 15000, rating: 2100, avatarUrl: null, title: null },
      ],
      loading: false,
      error: null,
      hasMore: true,
      loadMore: mockLoadMore,
    });
    mockUseUserRank.mockReturnValue({ ranks: null, loading: false });

    renderPage();
    fireEvent.click(screen.getByText('加载更多'));
    expect(mockLoadMore).toHaveBeenCalled();
  });
});
```

- [ ] **Step 2: 运行测试**

```bash
cd frontend && npm test -- --testPathPattern="LeaderboardPage" 2>&1 | tail -30
```

- [ ] **Step 3: 提交**

```bash
git add frontend/src/__tests__/components/LeaderboardPage.test.tsx
git commit -m "test: 添加 LeaderboardPage 组件单元测试"
```

---

### Task 6: 验证完整测试套件

- [ ] **Step 1: 运行前端全部测试**

```bash
cd frontend && npm test 2>&1 | tail -20
```

- [ ] **Step 2: 运行 Server 测试**

```bash
cd server && npm test 2>&1 | tail -20
```

- [ ] **Step 3: 运行前端 lint 和类型检查**

```bash
cd frontend && npm run lint && npx tsc --noEmit 2>&1 | tail -20
```

- [ ] **Step 4: 最终提交**

```bash
git add -A
git commit -m "feat: 排行榜页面修复和 UI 改造完成"
```

---

## 执行顺序

1. Task 1: 修 bug（最小改动）
2. Task 2: 改 LeaderboardTable 组件
3. Task 3: 改 LeaderboardPage 页面
4. Task 4: 加 seed region 数据
5. Task 5: 加测试
6. Task 6: 全量验证
