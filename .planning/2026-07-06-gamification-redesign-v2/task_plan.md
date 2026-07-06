# Task Plan: Gamification Pages Redesign v2

## Goal

在现有玻璃态基础上全面升级4个 gamification 页面的视觉冲击力：更大字号、更丰富布局、更强层次感。只改前端 UI，不改后端 API。

## Current Phase

全部完成 ✅

## Context

### 现状分析

- 4个页面已完成玻璃态基础改造（`docs/superpowers/specs/2026-07-06-gamification-glassmorphism-design.md`）
- 现有设计问题：页面空旷、字体偏小（text-sm 体系）、卡片缺乏层次
- 用户选择方案 A+C 混合：Hero 驱动布局 + 沉浸式游戏化
- 设计规范已写入 `docs/superpowers/specs/2026-07-06-gamification-redesign-v2.md`

### 关键约束

- 只改前端 UI（10个文件），不改后端 API/类型/hook
- 保留所有现有业务逻辑
- 不改测试文件

## Phases

### Phase 1: 共享设计系统落地 — LevelProgress + PointHistoryList ✅

- [x] 升级 `LevelProgress.tsx`：新增 `xl` 尺寸档，圆/文字/进度条全面放大
- [x] 升级 `PointHistoryList.tsx`：行高/图标/文字/按钮全面升级

- **Status:** complete

### Phase 2: 积分中心页面 ✅

- [x] 升级 `PointsPage.tsx`：Level Hero 使用 xl 尺寸，统计卡片字号升级

- **Status:** complete

### Phase 3: 成就系统页面 ✅

**目标**: 改造 AchievementsPage + AchievementCard

- [x] 升级 `AchievementsPage.tsx`：Hero Banner 替代三统计卡片
- [x] 升级 `AchievementCard.tsx`：放大图标/内边距/进度条，锁定态优化

- **Status:** complete

### Phase 4: 每日挑战页面 ✅

**目标**: 改造 DailyChallengePage + DailyChallengeCard + LoginStreakCalendar

- [x] 升级 `DailyChallengePage.tsx`：Hero Banner 替代四统计卡片
- [x] 升级 `DailyChallengeCard.tsx`：放大卡片/按钮/任务行
- [x] 升级 `LoginStreakCalendar.tsx`：放大日历格子/文字/导航

- **Status:** complete

### Phase 5: 虚拟商店页面 ✅

**目标**: 改造 VirtualItemsPage + VirtualItemCard

- [x] 升级 `VirtualItemsPage.tsx`：Level Banner 放大，Tab/网格间距升级
- [x] 升级 `VirtualItemCard.tsx`：放大图标/按钮/内边距

- **Status:** complete

### Phase 6: 测试与验证 ✅

**目标**: 确保所有测试通过，视觉验收

- [x] 运行 `cd frontend && npm test` — 14 suites, 142 tests ALL PASS
- [x] 运行 `cd frontend && npx tsc --noEmit` — No errors
- [x] 运行 `cd ../server && npm test` — 11 suites, 143 tests ALL PASS

- **Status:** complete

## Key Decisions

| Decision | Rationale |
|----------|-----------|
| 方案 A+C 混合 | Hero 驱动解决空旷感，游戏化增强视觉冲击力 |
| 三统计合并为 Hero Banner | 解决统计卡片和成就网格"同级"问题 |
| 字号从 text-sm 升级到 text-base | 解决字体过小问题 |
| 不改 API/类型/hook | 纯前端 UI 改造，降低风险 |
| LevelProgress 新增 xl 尺寸 | 复用现有组件，不创建新组件 |

## Errors Encountered

| Error | Resolution |
|-------|------------|
|       |            |

## Notes

- 设计规范见 `docs/superpowers/specs/2026-07-06-gamification-redesign-v2.md`
- 现有 glassmorphism 设计见 `docs/superpowers/specs/2026-07-06-gamification-glassmorphism-design.md`
- 测试现状：前端 115 ✅，Server 143 ✅，E2E 68/68 ✅
