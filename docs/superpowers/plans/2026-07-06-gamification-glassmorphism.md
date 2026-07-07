# Gamification Glassmorphism Redesign — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use subagent-driven-development (recommended) or executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Redesign 4 gamification pages with light glassmorphism aesthetic — frosted-glass cards, full-width layout, gradient backgrounds. Frontend-only, no API changes.

**Architecture:** Each page (pages/Gamification/*.tsx) wraps its sub-components (components/gamification/*.tsx). We restyle bottom-up: sub-components first, then their parent pages. Each task completes one full page + its sub-components, independently testable.

**Tech Stack:** React 19 + TypeScript + Tailwind CSS v4, no new dependencies.

## Global Constraints
- Zero backend/API changes
- All existing test must pass after each task
- Every loading/error/empty state must also get glassmorphism treatment
- Fully responsive (mobile → desktop)
- No new CSS files — use Tailwind utility classes exclusively

---

### Task 1: AchievementsPage + AchievementCard

**Files:**
- Modify: `frontend/src/components/gamification/AchievementCard.tsx`
- Modify: `frontend/src/pages/Gamification/AchievementsPage.tsx`

**Interfaces:**
- Consumes: `AchievementCardProps` (unchanged), `useAchievements` hook (unchanged)
- Produces: Restyled page + component, no API changes

**Glassmorphism shared patterns (used across all tasks):**
- Background: `bg-gradient-to-br from-indigo-50 via-white to-purple-50`
- Card: `backdrop-blur-xl bg-white/70 border border-white/40 rounded-2xl shadow-lg shadow-purple-500/5`
- Card hover: `hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300`
- Layout: `w-full px-6 lg:px-12 py-8 lg:py-12`

- [ ] **Step 1: Restyle AchievementCard**

Replace the entire return JSX in `AchievementCard.tsx` with glassmorphism styling:

```tsx
// Card wrapper
<div
  className={`relative backdrop-blur-xl bg-white/70 border rounded-2xl p-5 transition-all duration-300 hover:shadow-xl hover:-translate-y-0.5 ${
    isUnlocked || isUserAchievement
      ? rarityBorders[rarity] + ' shadow-lg shadow-purple-500/5'
      : 'border-white/30 opacity-50 grayscale'
  }`}
>
  {/* Rarity tag - glass badge instead of solid gradient */}
  <div
    className={`absolute top-3 right-3 px-2.5 py-1 rounded-full text-xs font-medium backdrop-blur-sm bg-white/80 text-gray-700 border border-white/60 shadow-sm ${
      rarity === 'legendary' ? 'text-amber-600' :
      rarity === 'epic' ? 'text-purple-600' :
      rarity === 'rare' ? 'text-blue-600' :
      'text-gray-500'
    }`}
  >
    {rarityLabels[rarity]}
  </div>

  <div className="flex items-start gap-4">
    {/* Icon - larger, gradient, with glass overlay effect */}
    <div
      className={`w-14 h-14 rounded-xl flex items-center justify-center bg-gradient-to-br shadow-inner ${
        isUnlocked || isUserAchievement
          ? rarityColors[rarity]
          : 'from-gray-300 to-gray-400'
      }`}
    >
      {achievement.iconUrl ? (
        <img src={achievement.iconUrl} alt={achievement.name} className="w-9 h-9 drop-shadow" />
      ) : (
        <svg className="w-7 h-7 text-white drop-shadow" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
        </svg>
      )}
    </div>

    {/* Content */}
    <div className="flex-1">
      <h3 className="font-semibold text-gray-800">{achievement.name}</h3>
      <p className="text-sm text-gray-500 mt-1">{achievement.description}</p>

      {/* Points reward */}
      <div className="flex items-center gap-1.5 mt-2">
        <svg className="w-4 h-4 text-amber-500" fill="currentColor" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
        <span className="text-sm font-medium text-gray-600">+{achievement.points} 积分</span>
      </div>

      {/* Unlock time */}
      {isUserAchievement && (
        <p className="text-xs text-gray-400 mt-1.5">
          解锁于: {new Date((achievement as UserAchievement).unlockedAt).toLocaleDateString()}
        </p>
      )}

      {/* Progress */}
      {showProgress && isUserAchievement && (
        <div className="mt-3">
          <div className="w-full bg-white/60 border border-white/40 rounded-full h-2.5 backdrop-blur-sm">
            <div
              className="bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full h-2.5 transition-all duration-500 shadow-sm"
              style={{ width: `${(achievement as UserAchievement).progress}%` }}
            />
          </div>
          <p className="text-xs text-gray-500 mt-1">进度: {(achievement as UserAchievement).progress}%</p>
        </div>
      )}
    </div>
  </div>
</div>
```

- [ ] **Step 2: Restyle AchievementsPage**

Replace the entire JSX in `AchievementsPage.tsx`:

```tsx
// 1. Background: change min-h-screen bg-gray-50 → min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50

// 2. Layout container: change max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 → w-full px-6 lg:px-12

// 3. Title section:
<div className="mb-10 text-center lg:text-left">
  <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
    成就系统
  </h1>
  <p className="mt-2 text-gray-500">完成各种挑战，解锁成就徽章，展示你的实力！</p>
</div>

// 4. Stats cards - glass style
<div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
  <div className="backdrop-blur-xl bg-white/70 border border-white/40 rounded-2xl shadow-lg shadow-purple-500/5 p-6">
    {/* 已解锁 - blue accent */}
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm text-gray-500">已解锁</p>
        <p className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent">{stats.unlocked}</p>
      </div>
      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-400 to-blue-600 shadow-lg shadow-blue-500/20 flex items-center justify-center">
        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
    </div>
  </div>

  <div className="backdrop-blur-xl bg-white/70 border border-white/40 rounded-2xl shadow-lg shadow-purple-500/5 p-6">
    {/* 总成就数 - purple accent */}
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm text-gray-500">总成就数</p>
        <p className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-500 bg-clip-text text-transparent">{stats.total}</p>
      </div>
      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-400 to-pink-500 shadow-lg shadow-purple-500/20 flex items-center justify-center">
        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
        </svg>
      </div>
    </div>
  </div>

  <div className="backdrop-blur-xl bg-white/70 border border-white/40 rounded-2xl shadow-lg shadow-purple-500/5 p-6">
    {/* 完成度 - emerald accent */}
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm text-gray-500">完成度</p>
        <p className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-teal-400 bg-clip-text text-transparent">{stats.percentage}%</p>
      </div>
      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 shadow-lg shadow-emerald-500/20 flex items-center justify-center">
        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
        </svg>
      </div>
    </div>
    <div className="mt-4">
      <div className="w-full bg-white/60 border border-white/40 rounded-full h-2.5 backdrop-blur-sm">
        <div className="bg-gradient-to-r from-emerald-400 to-teal-500 rounded-full h-2.5 transition-all" style={{ width: `${stats.percentage}%` }} />
      </div>
    </div>
  </div>
</div>

// 5. Filter buttons - glass capsules
<div className="flex flex-wrap gap-3 mb-8">
  {categories.map((category) => (
    <button
      key={category.id}
      onClick={() => setFilter(category.id)}
      className={`px-5 py-2 rounded-full text-sm font-medium transition-all duration-200 backdrop-blur-sm border ${
        filter === category.id
          ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white border-transparent shadow-lg shadow-purple-500/20'
          : 'bg-white/60 text-gray-600 border-white/40 hover:bg-white/80 hover:shadow-md'
      }`}
    >
      {category.label}
    </button>
  ))}
</div>

// 6. Achievement grid - keep grid structure, add full-width columns
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
  // ... AchievementCard items (unchanged props)
</div>

// 7. Loading/Error/Empty states - same patterns, add glass styling
// Loading:
<div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center">
  <div className="backdrop-blur-xl bg-white/70 border border-white/40 rounded-2xl p-8 shadow-lg">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500 mx-auto"></div>
  </div>
</div>

// Error:
<div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center">
  <div className="backdrop-blur-xl bg-white/70 border border-white/40 rounded-2xl p-8 shadow-lg text-center max-w-md">
    <p className="text-red-500 mb-4">{error}</p>
    <button onClick={() => window.location.reload()} className="px-6 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl font-medium hover:shadow-lg transition-all">
      重试
    </button>
  </div>
</div>
```

- [ ] **Step 4: Run tests**

Run: `cd frontend && npm test`
Expected: ALL tests pass (including existing AchievementCard/AchievementsPage tests)

- [ ] **Step 5: Commit**

```bash
git add frontend/src/components/gamification/AchievementCard.tsx frontend/src/pages/Gamification/AchievementsPage.tsx
git commit -m "feat: restyle AchievementsPage + AchievementCard with glassmorphism"
```

---

### Task 2: Track login calendar + DailyChallengePage

**Files:**
- Modify: `frontend/src/components/gamification/LoginStreakCalendar.tsx`
- Modify: `frontend/src/components/gamification/DailyChallengeCard.tsx` (includes DailyTaskList)
- Modify: `frontend/src/pages/Gamification/DailyChallengePage.tsx`

- [ ] **Step 1: Restyle LoginStreakCalendar**

Replace card container with glass, calendar cells with glass/emerald:

```tsx
// Container
<div className="backdrop-blur-xl bg-white/70 border border-white/40 rounded-2xl shadow-lg shadow-purple-500/5 p-5">

// Month navigation buttons - glass
<button className="p-2 rounded-xl bg-white/60 border border-white/40 hover:bg-white/80 transition-all">

// Weekday headers - keep same, just softer text

// Calendar cells - logged in: emerald glass, not logged in: white/40 glass
day === null
  ? ''
  : day.isLoggedIn
  ? 'bg-gradient-to-br from-emerald-400 to-teal-500 text-white font-medium shadow-sm'
  : 'bg-white/40 backdrop-blur-sm text-gray-600 border border-white/30'

// Legend - glass indicators
<div className="flex items-center justify-center gap-4 mt-4 text-xs text-gray-500">
  <div className="flex items-center gap-1.5">
    <div className="w-3 h-3 rounded bg-white/60 border border-white/30"></div>
    <span>未登录</span>
  </div>
  <div className="flex items-center gap-1.5">
    <div className="w-3 h-3 rounded bg-gradient-to-br from-emerald-400 to-teal-500"></div>
    <span>已登录</span>
  </div>
  <div className="flex items-center gap-1.5">
    <span>🔥</span>
    <span>连续天数</span>
  </div>
</div>
```

- [ ] **Step 2: Restyle DailyChallengeCard + DailyTaskList**

DailyChallengeCard:
```tsx
// Main card - keep gradient concept, add glass overlay
<div className="bg-gradient-to-br from-purple-500/90 to-indigo-600/90 backdrop-blur-xl rounded-2xl shadow-lg shadow-purple-500/20 p-6 text-white border border-white/20">

// "No challenge" state - glass
<div className="backdrop-blur-xl bg-white/70 border border-white/40 rounded-2xl p-6 shadow-lg">
  <div className="text-center text-gray-500 py-4">
    <p className="text-lg">今日暂无挑战</p>
  </div>
</div>

// Challenge header - bonus badge glass
<span className="px-3 py-1.5 rounded-full text-sm backdrop-blur-sm bg-white/20 border border-white/20">

// Problem info card - glass overlay
<div className="backdrop-blur-sm bg-white/10 border border-white/10 rounded-xl p-4 mb-4">

// Tags - glass pills
<span className="px-3 py-1 rounded-full text-xs backdrop-blur-sm bg-white/20 border border-white/10">

// Complete button - clean white
<button className="w-full py-3 bg-white text-purple-600 rounded-xl font-semibold hover:bg-white/90 hover:shadow-lg transition-all">

// Completed state - same structure, glass
```

DailyTaskList:
```tsx
// Container
<div className="backdrop-blur-xl bg-white/70 border border-white/40 rounded-2xl shadow-lg shadow-purple-500/5 p-5">

// Task rows
task.completed
  ? 'bg-gradient-to-r from-emerald-50/80 to-teal-50/80 backdrop-blur-sm border border-emerald-200/50'
  : 'bg-white/40 backdrop-blur-sm border border-white/30'

// Check circle
task.completed
  ? 'bg-gradient-to-br from-emerald-400 to-teal-500 shadow-sm'
  : 'bg-white/60 border border-gray-300'

// Reward text - amber
<p className="text-xs font-medium text-amber-600">+{task.reward} 积分</p>
```

- [ ] **Step 3: Restyle DailyChallengePage**

```tsx
// Background: bg-gradient-to-br from-indigo-50 via-white to-purple-50
// Layout: w-full px-6 lg:px-12 py-8 lg:py-12

// Title section (same gradient text pattern as AchievementsPage)
<h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">每日挑战</h1>
<p className="mt-2 text-gray-500">每天完成挑战任务，获取额外积分奖励！</p>

// Streak stats - 4 glass cards
<div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
  {/* current streak - orange accent */}
  <div className="backdrop-blur-xl bg-white/70 border border-white/40 rounded-2xl shadow-lg shadow-purple-500/5 p-5 text-center">
    <div className="text-3xl mb-2">🔥</div>
    <p className="text-2xl font-bold bg-gradient-to-r from-orange-500 to-amber-400 bg-clip-text text-transparent">{streakInfo.currentStreak}</p>
    <p className="text-sm text-gray-500 mt-1">当前连续天数</p>
  </div>
  {/* max streak - amber accent */}
  <div className="backdrop-blur-xl bg-white/70 border border-white/40 rounded-2xl shadow-lg shadow-purple-500/5 p-5 text-center">
    <div className="text-3xl mb-2">🏆</div>
    <p className="text-2xl font-bold bg-gradient-to-r from-amber-500 to-yellow-400 bg-clip-text text-transparent">{streakInfo.maxStreak}</p>
    <p className="text-sm text-gray-500 mt-1">最长连续天数</p>
  </div>
  {/* today login - blue accent */}
  <div className="backdrop-blur-xl bg-white/70 border border-white/40 rounded-2xl shadow-lg shadow-purple-500/5 p-5 text-center">
    <div className="text-3xl mb-2">📅</div>
    <p className="text-2xl font-bold bg-gradient-to-r from-blue-500 to-cyan-400 bg-clip-text text-transparent">{streakInfo.isLoggedInToday ? '✓' : '✗'}</p>
    <p className="text-sm text-gray-500 mt-1">今日登录</p>
  </div>
  {/* tasks - emerald accent */}
  <div className="backdrop-blur-xl bg-white/70 border border-white/40 rounded-2xl shadow-lg shadow-purple-500/5 p-5 text-center">
    <div className="text-3xl mb-2">🎯</div>
    <p className="text-2xl font-bold bg-gradient-to-r from-emerald-500 to-teal-400 bg-clip-text text-transparent">{tasksData?.totalCompleted || 0}/{tasksData?.tasks.length || 0}</p>
    <p className="text-sm text-gray-500 mt-1">今日任务</p>
  </div>
</div>

// Loading states - glass spinner
```

- [ ] **Step 4: Run tests**

Run: `cd frontend && npm test`
Expected: ALL tests pass

- [ ] **Step 5: Commit**

```bash
git add frontend/src/components/gamification/LoginStreakCalendar.tsx frontend/src/components/gamification/DailyChallengeCard.tsx frontend/src/pages/Gamification/DailyChallengePage.tsx
git commit -m "feat: restyle DailyChallengePage with glassmorphism"
```

---

### Task 3: VirtualItemsPage + VirtualItemCard

**Files:**
- Modify: `frontend/src/components/gamification/VirtualItemCard.tsx`
- Modify: `frontend/src/pages/Gamification/VirtualItemsPage.tsx`

- [ ] **Step 1: Restyle VirtualItemCard**

```tsx
// Card wrapper
<div
  className={`backdrop-blur-xl bg-white/70 border rounded-2xl p-5 transition-all duration-300 hover:shadow-xl hover:-translate-y-0.5 ${
    isOwned || isUserItem
      ? rarityBorders[rarity] + ' shadow-lg shadow-purple-500/5'
      : 'border-white/30'
  }`}
>

// Type + rarity tags row
<div className="flex justify-between items-start mb-4">
  <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-white/60 backdrop-blur-sm text-gray-500 border border-white/40">
    {typeLabels[virtualItem.type]}
  </span>
  <span className={`px-2.5 py-1 rounded-full text-xs font-medium backdrop-blur-sm bg-white/80 border border-white/60 shadow-sm ${
    rarity === 'legendary' ? 'text-amber-600' :
    rarity === 'epic' ? 'text-purple-600' :
    rarity === 'rare' ? 'text-blue-600' :
    'text-gray-500'
  }`}>
    {rarityLabels[rarity]}
  </span>
</div>

// Icon - larger, gradient with shine
<div className="flex justify-center mb-4">
  <div className={`w-20 h-20 rounded-xl flex items-center justify-center bg-gradient-to-br shadow-lg ${rarityColors[rarity]}`}>
    {virtualItem.iconUrl ? (
      <img src={virtualItem.iconUrl} alt={virtualItem.name} className="w-14 h-14 drop-shadow" />
    ) : (
      <svg className="w-10 h-10 text-white drop-shadow" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
      </svg>
    )}
  </div>
</div>

// Name + description
<h3 className="font-semibold text-gray-800 text-center">{virtualItem.name}</h3>
<p className="text-xs text-gray-500 text-center mt-1 leading-relaxed">{virtualItem.description}</p>

// Action buttons - glass style
<div className="mt-5">
  {isOwned || isUserItem ? (
    isEquipped ? (
      <button onClick={() => onEquip?.(virtualItem.id, false)}
        className="w-full py-2.5 bg-white/60 backdrop-blur-sm text-gray-600 rounded-xl text-sm font-medium border border-white/40 hover:bg-white/80 transition-all">
        卸下
      </button>
    ) : (
      <button onClick={() => onEquip?.(virtualItem.id, true)}
        className="w-full py-2.5 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl text-sm font-medium shadow-lg shadow-purple-500/20 hover:shadow-xl transition-all">
        装备
      </button>
    )
  ) : virtualItem.price === 0 ? (
    <button onClick={() => onPurchase?.(virtualItem.id)}
      className="w-full py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl text-sm font-medium shadow-lg shadow-emerald-500/20 hover:shadow-xl transition-all">
      免费领取
    </button>
  ) : (
    <button onClick={() => onPurchase?.(virtualItem.id)} disabled={!canAfford}
      className={`w-full py-2.5 rounded-xl text-sm font-medium transition-all ${
        canAfford
          ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg shadow-amber-500/20 hover:shadow-xl'
          : 'bg-white/30 backdrop-blur-sm text-gray-400 border border-white/30 cursor-not-allowed'
      }`}>
      {virtualItem.price} 积分{!canAfford && ' (不足)'}
    </button>
  )}
</div>
```

- [ ] **Step 2: Restyle VirtualItemsPage**

```tsx
// Background: same gradient
// Layout: w-full px-6 lg:px-12 py-8 lg:py-12

// Title: gradient text, same pattern
// Level info area: glass card surrounding LevelProgress component (will be restyled in Task 4)

// Tab bar - glass container
<div className="flex gap-1 backdrop-blur-xl bg-white/60 border border-white/40 rounded-xl p-1.5 mb-8 shadow-lg shadow-purple-500/5">
  {tabs.map((tab) => (
    <button
      key={tab.id}
      onClick={() => setActiveTab(tab.id)}
      className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-sm font-medium transition-all duration-200 ${
        activeTab === tab.id
          ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg shadow-purple-500/20'
          : 'text-gray-500 hover:text-gray-700 hover:bg-white/40'
      }`}
    >
      <span>{tab.icon}</span>
      <span>{tab.label}</span>
    </button>
  ))}
</div>

// Items grid: grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5
// Loading: glass spinner card
// Empty: glass placeholder
```

- [ ] **Step 3: Run tests**

Run: `cd frontend && npm test`
Expected: ALL tests pass

- [ ] **Step 4: Commit**

```bash
git add frontend/src/components/gamification/VirtualItemCard.tsx frontend/src/pages/Gamification/VirtualItemsPage.tsx
git commit -m "feat: restyle VirtualItemsPage + VirtualItemCard with glassmorphism"
```

---

### Task 4: PointsPage + LevelProgress + PointHistoryList

**Files:**
- Modify: `frontend/src/components/gamification/LevelProgress.tsx`
- Modify: `frontend/src/components/gamification/PointHistoryList.tsx`
- Modify: `frontend/src/pages/Gamification/PointsPage.tsx`

- [ ] **Step 1: Restyle LevelProgress**

```tsx
// Container
<div className="backdrop-blur-xl bg-white/70 border border-white/40 rounded-2xl shadow-lg shadow-purple-500/5 p-6">

// Level circle - larger, gradient ring
<div className="w-14 h-14 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg shadow-purple-500/20 flex items-center justify-center">
  <span className="text-white font-bold text-xl">{levelInfo.level}</span>
</div>

// Level text
<p className="font-semibold text-gray-800">等级 {levelInfo.level}</p>
<p className="text-sm text-gray-500">{levelInfo.currentExp} / {levelInfo.nextLevelExp} EXP</p>

// Total EXP label
<span className="text-sm text-gray-400">总经验: {levelInfo.totalExp}</span>

// Progress bar - gradient fill with glass track
<div className="w-full bg-white/60 border border-white/40 rounded-full overflow-hidden backdrop-blur-sm">
  <div className="bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-500 shadow-sm"
    style={{ width: `${levelInfo.progress}%`, height: size === 'lg' ? '16px' : size === 'sm' ? '8px' : '12px' }} />
</div>

// Progress percentage
<p className="text-sm text-gray-400 mt-1.5 text-right">{levelInfo.progress}% 升级进度</p>
```

- [ ] **Step 2: Restyle PointHistoryList**

```tsx
// Container
<div className="backdrop-blur-xl bg-white/70 border border-white/40 rounded-2xl shadow-lg shadow-purple-500/5 overflow-hidden">

// Header
<div className="px-5 py-4 border-b border-white/30">
  <h3 className="font-semibold text-gray-800">积分历史</h3>
</div>

// Divider between rows
<div className="divide-y divide-white/20">

// Row - glass hover
<div className="flex items-center justify-between px-5 py-4 hover:bg-white/40 transition-colors">

// Type icon
<span className="text-xl">{typeInfo.icon}</span>

// Points - gradient text
<span className={`font-semibold bg-clip-text text-transparent ${
  isPositive ? 'bg-gradient-to-r from-emerald-500 to-teal-400' : 'bg-gradient-to-r from-red-500 to-rose-400'
}`}>
  {isPositive ? '+' : ''}{record.points}
</span>

// Empty state
<div className="text-center py-12 text-gray-400 backdrop-blur-sm bg-white/30 rounded-xl">

// Load more button - glass
<button className="w-full py-3 text-sm font-medium text-indigo-600 hover:text-indigo-700 hover:bg-white/40 transition-all rounded-b-2xl">
  加载更多
</button>
```

- [ ] **Step 3: Restyle PointsPage**

```tsx
// Background: same gradient
// Layout: w-full px-6 lg:px-12 py-8 lg:py-12 (note: 原 max-w-4xl → full width)

// Title: gradient text

// Level progress section (uses restyled LevelProgress)

// Stats grid: grid-cols-2 md:grid-cols-4 gap-5
// Each stat card: glass style with gradient numbers
// Example stat card:
<div className="backdrop-blur-xl bg-white/70 border border-white/40 rounded-2xl shadow-lg shadow-purple-500/5 p-5 text-center">
  <p className="text-sm text-gray-500 mb-1">总经验值</p>
  <p className="text-3xl font-bold bg-gradient-to-r from-blue-500 to-cyan-400 bg-clip-text text-transparent">{overview.totalExp.toLocaleString()}</p>
</div>

// History section (uses restyled PointHistoryList)

// Loading/error states: glass style
```

- [ ] **Step 4: Run tests**

Run: `cd frontend && npm test`
Expected: ALL tests pass

- [ ] **Step 5: Commit**

```bash
git add frontend/src/components/gamification/LevelProgress.tsx frontend/src/components/gamification/PointHistoryList.tsx frontend/src/pages/Gamification/PointsPage.tsx
git commit -m "feat: restyle PointsPage + LevelProgress + PointHistoryList with glassmorphism"
```
