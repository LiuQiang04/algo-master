# 游戏化页面完善 - 设计文档

> 日期: 2026-07-06
> 状态: 已批准

## 目标

修复游戏化前端页面遗留问题，补充单元测试和 E2E 测试覆盖。

## 工作范围

### 1. 修复 AchievementsPage 硬编码 bug

**文件**: `frontend/src/pages/Gamification/AchievementsPage.tsx`

第 133 行 `isUnlocked={true}` 改为动态判断：

```tsx
isUnlocked={!!(achievement as UserAchievement).unlockedAt}
```

API 返回的 `UserAchievement` 中 `unlockedAt` 有值 = 已解锁，`null` = 未解锁（显示灰色锁定态）。

### 2. 新增 4 个单元测试

沿用 `LeaderboardPage.test.tsx` 模式：mock hooks、测试全部状态分支。

| 测试文件 | 覆盖场景 |
|---------|---------|
| `AchievementsPage.test.tsx` | 页面标题、分类筛选切换、统计卡片渲染、加载态 spinner、错误态提示、空数据提示、已解锁/未解锁区分 |
| `DailyChallengePage.test.tsx` | 挑战卡片渲染、连续天数统计、任务列表、登录日历、各 loading 态、null challenge 空态 |
| `VirtualItemsPage.test.tsx` | 4 个标签页切换、购买/装备/卸下按钮、积分不足禁用、加载态、空数据 |
| `PointsPage.test.tsx` | 等级进度、4 个统计卡片、积分历史列表、加载更多、加载态、错误态 |

### 3. 新增 E2E 测试

**文件**: `e2e/gamification/gamificationFlow.spec.ts`

使用已有 `storageState: ".auth/user.json"`（需登录）。覆盖：

- 导航到成就页面 →  验证标题和分类筛选
- 导航到排行榜页面 → 标签页切换（全球/好友/地区）
- 导航到每日挑战页面 → 验证页面加载
- 导航到虚拟商店页面 → 验证标签页切换

**修改** `e2e/fixtures/test-data.ts`：添加游戏化页面 URL。

## 不做

- 不改后端代码
- 不改 UI 样式
- 不改路由配置
- 不改其他页面逻辑
