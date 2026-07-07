# 游戏化页面 UI 改造 v3 — 设计规格

> 日期: 2026-07-07
> 来源: todo-frontend-2026-07-07.md 第四条
> 设计方向: 混合路线 — CSS 变量外壳 + 玻璃态卡片，对标 LeaderboardPage

---

## 1. 设计决策

| 决策点 | 选择 |
|--------|------|
| 设计方向 | **C. 混合路线** — 页面外壳用 CSS 变量（同 LeaderboardPage），内容卡片保留玻璃态 |
| 内容宽度 | **B. 按内容密度分级** — Hub/Points 800px，Achievements/DailyChallenge/VirtualItems 1000px |
| 视觉音量 | **B. 保留渐变标题+玻璃态卡片，去掉装饰光斑** |
| 配色策略 | **B. 保留各页面专属色调，降低饱和度** |

### 设计原则

- 页面外壳统一对标 LeaderboardPage：CSS 变量内联样式，max-width 居中，简洁层次
- 内容卡片保留玻璃态（bg-white/70 backdrop-blur border-white/40），但去掉多层渐变遮罩
- 去掉所有装饰光斑（绝对定位模糊圆）
- 统计数字区用纯色渐变卡片（对标 LeaderboardPage 排名卡片）
- 字号从 v2 的 text-5xl 体系回落到更克制的尺寸

---

## 2. 共享设计系统

### 2.1 页面外壳

```css
/* 所有页面统一 */
minHeight: '100vh'
background: 'var(--bg-secondary)'
padding: '32px 0'

/* 内容容器 */
maxWidth: 800-1000 (按页面)
margin: '0 auto'
padding: '0 24px'
```

### 2.2 配色（各页面专属，降低饱和度）

| 页面 | 强调色 | 用途 |
|------|--------|------|
| GamificationHub | 蓝紫 `var(--primary-600)` | 统计卡片、链接 |
| Achievements | 琥珀 `#D97706` (amber-600) | 统计卡片渐变 |
| DailyChallenge | 翠绿 `#059669` (emerald-600) | 统计卡片、挑战卡片背景 |
| Points | 靛蓝 `#4F46E5` (indigo-600) | 统计卡片渐变 |
| VirtualItems | 紫色 `#7C3AED` (violet-600) | 统计卡片、Tab 激活态 |

### 2.3 卡片体系

**统计卡片**（纯色渐变，对标 LeaderboardPage）:
```css
background: 'linear-gradient(135deg, [页面强调色], [深色变体])'
borderRadius: 'var(--radius-lg)'
padding: 24
boxShadow: 'var(--shadow-md)'
color: 'white'
/* 数字: fontSize: 36, fontWeight: 700 */
/* 标签: fontSize: 13, opacity: 0.8 */
```

**内容卡片**（玻璃态，降噪版）:
```css
background: 'rgba(255,255,255,0.7)'
backdropFilter: 'blur(12px)'
border: '1px solid rgba(255,255,255,0.4)'
borderRadius: 'var(--radius-lg)'
boxShadow: 'var(--shadow-md)'
/* 无渐变遮罩、无光斑 */
```

### 2.4 字号体系

| 层级 | 值 |
|------|-----|
| 页面标题 | `fontSize: 28, fontWeight: 700, color: var(--text-primary)` |
| 副标题 | `fontSize: 14, color: var(--text-secondary), marginTop: 8` |
| 统计数字 | `fontSize: 36, fontWeight: 700` |
| 统计标签 | `fontSize: 13, opacity: 0.8` |
| 卡片标题 | `fontSize: 16, fontWeight: 600, color: var(--text-primary)` |
| 正文/描述 | `fontSize: 14, color: var(--text-secondary)` |
| 辅助文字 | `fontSize: 13, color: var(--text-muted)` |

### 2.5 间距体系

| 区域 | 值 |
|------|-----|
| 页面标题 → 统计区 | `marginBottom: 32` |
| 统计卡片之间 | `gap: 16` |
| 统计区 → 主内容 | `marginBottom: 32` |
| 内容区内部间距 | `marginBottom: 24` |
| 卡片网格 | `gap: 16` |

### 2.6 状态覆盖（统一模式）

```css
/* Loading */
display: 'flex', justifyContent: 'center', padding: 48
spinner: 40px, border: '3px solid var(--border-light)', borderTopColor: '[页面强调色]'

/* Error */
background: 'var(--danger-50)', color: 'var(--danger-700)'
border: '1px solid var(--danger-200)', borderRadius: 'var(--radius-md)'
padding: '12px 16px', fontSize: 14

/* Empty */
textAlign: 'center', padding: 48
color: 'var(--text-muted)', fontSize: 14
```

---

## 3. 逐页布局

### 3.1 GamificationHubPage `/gamification`

**宽度**: 800px

**布局结构**:
```
标题 "游戏化中心" + 副标题
    ↓ 32px
统计卡片 (2列 grid, 纯色渐变):
  [连续登录 X 天] [等级 Lv.X]
    ↓ 16px
经验进度条 (白色玻璃态卡片, h-3 进度条)
    ↓ 32px
导航卡片 (5个, 2-3列 grid, 玻璃态):
  [成就] [排行榜] [每日挑战]
  [积分]   [虚拟道具]
每卡片: 图标+标题+简述+"查看详情 →"
```

**关键改动**:
- 统计区改为纯色渐变卡片（同 LeaderboardPage）
- 去掉装饰光斑
- 去掉超大渐变标题，改为 CSS 变量色标题
- 导航卡片去掉 hover 微动效，只保留阴影变化
- 经验进度条独立为一张卡片

### 3.2 AchievementsPage `/achievements`

**宽度**: 1000px

**布局结构**:
```
标题 "成就系统" + 副标题
    ↓ 32px
统计区 (3列 grid, 纯色渐变卡片):
  [已解锁 12] [总成就 36] [完成度 33% + 进度条]
    ↓ 32px
分类筛选 (flex wrap, 胶囊按钮, 玻璃态):
  [全部] [解题] [竞赛] [学习] [等级] [社交] [特殊]
    ↓ 24px
成就网格 (grid 3-4列, gap 16px)
    ↓
空态/loading/error
```

**AchievementCard 改动**:
- 图标: w-14 h-14 (从 w-16 h-16)
- 内边距: p-6 (从 p-7)
- 标题: fontSize 16 (从 text-lg)
- 稀有度标签: fontSize 13 (从 text-sm)
- 锁定态: opacity 0.5 + 无稀有度边框色
- 去掉 hover:-translate-y-1

### 3.3 DailyChallengePage `/daily-challenge`

**宽度**: 1000px

**布局结构**:
```
标题 "每日挑战" + 副标题
    ↓ 32px
统计区 (4列 grid, 纯色渐变卡片):
  [🔥 连续7天] [🏆 最长30天] [📅 今日✓] [🎯 任务3/5]
    ↓ 32px
双栏布局 (3:1):
  左侧 (65%):
    每日挑战卡片 (紫色渐变背景, p-6)
    每日任务列表 (玻璃态卡片, p-5)
  右侧 (35%):
    登录日历 (玻璃态卡片, p-5)
```

**DailyChallengeCard 改动**:
- 保留紫色渐变背景（页面标识色）
- 标题: fontSize 18 (从 text-xl)
- 按钮: fontSize 16 py-3 (从 text-lg py-4)
- 难度星: w-4 h-4 (从 w-5 h-5)

**DailyTaskList 改动**:
- 行高: min-h-[52px] (从 min-h-[60px])
- 勾选圆: w-6 h-6 (从 w-7 h-7)
- 标题: fontSize 14 (从 text-base)
- 描述: fontSize 13 (从 text-sm)

**LoginStreakCalendar 改动**:
- 格子: min-h-[36px] (从 min-h-[40px])
- 星期头: fontSize 13 (从 text-sm)

### 3.4 PointsPage `/points`

**宽度**: 800px

**布局结构**:
```
标题 "积分中心" + 副标题
    ↓ 32px
LevelProgress (白色玻璃态卡片, p-6)
    ↓ 24px
统计区 (4列 grid, 纯色渐变卡片):
  [总经验] [成就数] [每日挑战] [全球排名]
    ↓ 32px
积分历史列表 (玻璃态卡片)
    ↓
加载更多按钮 / 空态
```

**LevelProgress 改动**:
- 统一使用 lg 尺寸: 圆 w-16 h-16, 文字 text-xl, 进度条 h-3
- 去掉 xl 尺寸（不再需要超大展示）

**PointHistoryList 改动**:
- 行高: h-14 (从 h-16)
- 图标: fontSize 20 (从 text-2xl)
- 描述: fontSize 14 (从 text-base)
- 分值: fontSize 16 fontWeight 600 (从 text-lg)

### 3.5 VirtualItemsPage `/virtual-items`

**宽度**: 1000px

**布局结构**:
```
标题 "虚拟商店" + 副标题
    ↓ 32px
LevelProgress (白色玻璃态卡片, p-5, lg 尺寸)
    ↓ 24px
Tab 切换 (玻璃态胶囊, 4项):
  [🏅 徽章] [👑 称号] [🖼️ 头像框] [✨ 装饰]
    ↓ 24px
物品网格 (4-5列, gap 16px)
    ↓
空态/loading
```

**VirtualItemCard 改动**:
- 图标: w-20 h-20 (从 w-24 h-24)
- 内边距: p-6 (从 p-7)
- 标题: fontSize 16 (从 text-lg)
- 按钮: fontSize 14 py-3 (从 text-base py-3.5)
- 去掉 hover:-translate-y-1

**Tab 改动**:
- 字号: fontSize 14 (从 text-base)
- 内边距: py-3 (从 py-4)
- 激活态: 纯色渐变背景 + shadow，不用玻璃态

---

## 4. 改动文件清单

| # | 文件 | 改动类型 |
|---|------|----------|
| 1 | `GamificationHubPage.tsx` | CSS变量外壳, 统计卡片改纯色渐变, 降噪 |
| 2 | `AchievementsPage.tsx` | CSS变量外壳, Hero Banner→纯色渐变卡片, 去光斑 |
| 3 | `AchievementCard.tsx` | 缩小图标/内边距, 去hover动效 |
| 4 | `DailyChallengePage.tsx` | CSS变量外壳, Hero Banner→纯色渐变卡片, 去光斑 |
| 5 | `DailyChallengeCard.tsx` | 缩小字号/按钮, 保留紫色背景 |
| 6 | `LoginStreakCalendar.tsx` | 缩小格子/文字 |
| 7 | `PointsPage.tsx` | CSS变量外壳, 统计卡片改纯色渐变, 去光斑 |
| 8 | `LevelProgress.tsx` | 去掉xl尺寸, lg微调 |
| 9 | `PointHistoryList.tsx` | 缩小行高/图标/文字 |
| 10 | `VirtualItemsPage.tsx` | CSS变量外壳, 去光斑, Tab降噪 |
| 11 | `VirtualItemCard.tsx` | 缩小图标/内边距, 去hover动效 |

**共 11 个文件修改，0 个新文件，不改 API/类型/hook/路由。**

---

## 5. 不改的部分

- 所有后端 API（路由、服务、数据库）
- TypeScript 类型定义（`types/gamification.ts`）
- React hooks（`hooks/useGamification.ts`）
- 路由配置（`routes.tsx`）
- 业务逻辑（筛选、Tab 切换、购买、装备、加载更多等）
- LeaderboardPage 和 LeaderboardTable（已是参考标准）
- 状态处理逻辑（只改样式表达）

---

## 6. 测试策略

- 前端单元测试: 现有测试覆盖组件逻辑，视觉改动不破坏测试
- 每个页面改完后运行 `cd frontend && npm test`
- E2E 测试: 验证页面导航和基本交互
- TypeScript: `npx tsc --noEmit`
- 视觉验证: `webapp-testing` 截图确认 375/768/1920 宽度

---

## 7. 成功标准

1. 5 个页面使用统一的 CSS 变量外壳 + 玻璃态卡片混合风格
2. 对标 LeaderboardPage 的简洁度和层次感
3. 去掉所有装饰光斑
4. 统计卡片统一为纯色渐变风格
5. 字号从 v2 的 text-5xl 体系回落到 fontSize 28/36 体系
6. 各页面保留专属色调但更克制
7. 所有现有功能不变
8. 前端单元测试全通过
9. TypeScript 编译无错误
10. Loading / Error / Empty 状态统一为 LeaderboardPage 模式
