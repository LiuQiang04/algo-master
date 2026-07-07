# Gamification Pages Redesign v3 — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将 5 个游戏化子页面从纯 Tailwind 玻璃态改为 CSS 变量外壳 + 玻璃态卡片的混合风格，对标 LeaderboardPage 的简洁度。

**Architecture:** 页面外壳统一使用 CSS 变量内联样式（`var(--bg-secondary)` 背景、`var(--text-primary)` 文字等），内部内容卡片保留玻璃态但降噪（去掉光斑、降低字号、简化渐变）。统计区使用纯色渐变卡片对标 LeaderboardPage 排名卡片风格。

**Tech Stack:** React 19 + TypeScript + Tailwind CSS v4 (保留用于玻璃态卡片) + CSS 变量内联样式 (用于页面外壳)

## Global Constraints

- 不改 API/hooks/types/routes，纯 UI 样式修改
- 去掉所有装饰光斑（绝对定位模糊圆 `blur-3xl`）
- 页面标题统一: `fontSize: 28, fontWeight: 700, color: var(--text-primary)`
- 统计卡片统一: 纯色渐变背景 + 白色文字，对标 LeaderboardPage
- 内容卡片保留玻璃态: `bg-white/70 backdrop-blur-xl border-white/40`
- 字号上限: 统计数字 `fontSize: 36`，正文 `fontSize: 14`
- 状态覆盖: loading spinner / error 红色提示 / empty 灰色文字，统一模式
- 每次改完运行 `cd frontend && npm test` 确保不破坏现有测试

---

### Task 1: LevelProgress.tsx (共享组件)

**Files:**
- Modify: `frontend/src/components/gamification/LevelProgress.tsx`

**Interfaces:**
- Consumes: `LevelInfo` type from `../../types/gamification`
- Produces: `LevelProgress` component (props: `levelInfo`, `showDetails?`, `size?: 'sm' | 'md' | 'lg'`)
- Used by: PointsPage, VirtualItemsPage

- [ ] **Step 1: Rewrite to CSS variables + glassmorphism**

Replace entire file content:

```tsx
import React from 'react';
import type { LevelInfo } from '../../types/gamification';

interface LevelProgressProps {
  levelInfo: LevelInfo;
  showDetails?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const LevelProgress: React.FC<LevelProgressProps> = ({
  levelInfo,
  showDetails = true,
  size = 'md',
}) => {
  const config = {
    sm: { text: 12, circle: '40px', circleText: 16, bar: 'h-2', pad: 16 },
    md: { text: 14, circle: '56px', circleText: 20, bar: 'h-3', pad: 24 },
    lg: { text: 14, circle: '64px', circleText: 20, bar: 'h-3', pad: 24 },
  };

  const c = config[size];

  return (
    <div
      style={{
        background: 'rgba(255,255,255,0.7)',
        backdropFilter: 'blur(12px)',
        border: '1px solid rgba(255,255,255,0.4)',
        borderRadius: 'var(--radius-lg)',
        boxShadow: 'var(--shadow-md)',
        padding: c.pad,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div
            style={{
              width: c.circle,
              height: c.circle,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #4F46E5, #7C3AED)',
              boxShadow: '0 4px 12px rgba(124,58,237,0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <span style={{ color: 'white', fontWeight: 700, fontSize: c.circleText }}>
              {levelInfo.level}
            </span>
          </div>
          <div>
            <p style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: 16, margin: 0 }}>
              等级 {levelInfo.level}
            </p>
            <p style={{ fontSize: c.text, color: 'var(--text-secondary)', margin: '2px 0 0' }}>
              {levelInfo.currentExp} / {levelInfo.nextLevelExp} EXP
            </p>
          </div>
        </div>
        {showDetails && (
          <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>
            总经验: {levelInfo.totalExp}
          </span>
        )}
      </div>

      <div
        style={{
          width: '100%',
          background: 'rgba(255,255,255,0.6)',
          border: '1px solid rgba(255,255,255,0.4)',
          borderRadius: 'var(--radius-full)',
          overflow: 'hidden',
        }}
      >
        <div
          className={c.bar}
          style={{
            background: 'linear-gradient(to right, #4F46E5, #7C3AED)',
            borderRadius: 'var(--radius-full)',
            transition: 'width 0.5s',
            width: `${levelInfo.progress}%`,
          }}
        />
      </div>

      {showDetails && (
        <p style={{ fontSize: c.text, color: 'var(--text-muted)', margin: '6px 0 0', textAlign: 'right' }}>
          {levelInfo.progress}% 升级进度
        </p>
      )}
    </div>
  );
};

export default LevelProgress;
```

- [ ] **Step 2: Run tests**

```bash
cd frontend && npm test -- --testPathPattern="LevelProgress"
```

Expected: PASS

- [ ] **Step 3: Commit**

```bash
git add frontend/src/components/gamification/LevelProgress.tsx
git commit -m "refactor: LevelProgress to CSS variables + glassmorphism, remove xl size"
```

---

### Task 2: GamificationHubPage.tsx

**Files:**
- Modify: `frontend/src/pages/Gamification/GamificationHubPage.tsx`

**Interfaces:**
- Consumes: `useGamificationOverview` hook, `react-router-dom` Link, `lucide-react` icons
- Produces: GamificationHubPage component

- [ ] **Step 1: Rewrite with CSS variables shell, pure gradient stat cards, glassmorphism nav cards**

Replace entire file content:

```tsx
import React from 'react';
import { Link } from 'react-router-dom';
import { useGamificationOverview } from '../../hooks/useGamification';
import {
  Award, BarChart3, CalendarCheck, Coins, Gift,
  ChevronRight, Sparkles, Flame, Trophy, AlertCircle,
} from 'lucide-react';

const hubCards = [
  {
    to: '/achievements',
    icon: Award,
    title: '成就',
    getDesc: (data: any) => `${data.achievementCount ?? '--'} 个已解锁`,
  },
  {
    to: '/leaderboard',
    icon: BarChart3,
    title: '排行榜',
    getDesc: (data: any) => data.globalRank ? `全球排名 #${data.globalRank}` : '暂无排名',
  },
  {
    to: '/daily-challenge',
    icon: CalendarCheck,
    title: '每日挑战',
    getDesc: (data: any) => `已完成 ${data.completedDailyChallenges ?? 0} 次`,
  },
  {
    to: '/points',
    icon: Coins,
    title: '积分',
    getDesc: (data: any) => `${data.totalExp ?? '--'} 总经验`,
  },
  {
    to: '/virtual-items',
    icon: Gift,
    title: '虚拟道具',
    getDesc: () => '徽章 / 称号 / 头像框',
  },
];

const GamificationHubPage: React.FC = () => {
  const { overview, loading, error } = useGamificationOverview();

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-secondary)', padding: '32px 0' }}>
      <div style={{ maxWidth: 800, margin: '0 auto', padding: '0 24px' }}>
        {/* 页面标题 */}
        <div style={{ marginBottom: 32 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <Sparkles size={24} color="var(--primary-600)" />
            <h1 style={{ fontSize: 28, fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
              游戏化中心
            </h1>
          </div>
          <p style={{ margin: 0, fontSize: 14, color: 'var(--text-secondary)' }}>
            追踪你的学习成就，与全球用户一较高下
          </p>
        </div>

        {/* 统计卡片 — 纯色渐变 */}
        {overview && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
            <div
              style={{
                background: 'linear-gradient(135deg, var(--primary-600), #1D4ED8)',
                borderRadius: 'var(--radius-lg)',
                padding: 24,
                boxShadow: 'var(--shadow-md)',
                color: 'white',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <Flame size={18} />
                <span style={{ fontSize: 13, opacity: 0.8 }}>连续登录</span>
              </div>
              <p style={{ fontSize: 36, fontWeight: 700, margin: 0 }}>{overview.loginStreak} <span style={{ fontSize: 14, fontWeight: 400 }}>天</span></p>
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
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <Trophy size={18} />
                <span style={{ fontSize: 13, opacity: 0.8 }}>等级</span>
              </div>
              <p style={{ fontSize: 36, fontWeight: 700, margin: 0 }}>Lv.{overview.level}</p>
            </div>
          </div>
        )}

        {/* 经验进度条 — 玻璃态卡片 */}
        {overview && (
          <div
            style={{
              background: 'rgba(255,255,255,0.7)',
              backdropFilter: 'blur(12px)',
              border: '1px solid rgba(255,255,255,0.4)',
              borderRadius: 'var(--radius-lg)',
              boxShadow: 'var(--shadow-sm)',
              padding: '16px 24px',
              marginBottom: 32,
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>经验值</span>
              <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{overview.currentExp} / {overview.nextLevelExp}</span>
            </div>
            <div style={{ width: '100%', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-full)', height: 10, overflow: 'hidden' }}>
              <div
                style={{
                  height: '100%',
                  background: 'linear-gradient(to right, var(--primary-500), #7C3AED)',
                  borderRadius: 'var(--radius-full)',
                  transition: 'width 0.5s',
                  width: `${overview.progress}%`,
                }}
              />
            </div>
          </div>
        )}

        {/* 加载状态 */}
        {loading && (
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
        )}

        {/* 错误状态 */}
        {error && !loading && (
          <div
            style={{
              padding: '12px 16px',
              borderRadius: 'var(--radius-md)',
              background: 'var(--danger-50)',
              color: 'var(--danger-700)',
              border: '1px solid var(--danger-200)',
              marginBottom: 24,
              fontSize: 14,
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}
          >
            <AlertCircle size={18} />
            {error}
          </div>
        )}

        {/* 导航卡片 — 玻璃态 */}
        {!loading && overview && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 16 }}>
            {hubCards.map((card) => (
              <Link
                key={card.to}
                to={card.to}
                style={{
                  background: 'rgba(255,255,255,0.7)',
                  backdropFilter: 'blur(12px)',
                  border: '1px solid rgba(255,255,255,0.4)',
                  borderRadius: 'var(--radius-lg)',
                  padding: 24,
                  boxShadow: 'var(--shadow-sm)',
                  textDecoration: 'none',
                  transition: 'box-shadow 0.2s',
                  display: 'block',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.boxShadow = 'var(--shadow-md)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.boxShadow = 'var(--shadow-sm)'; }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                  <div
                    style={{
                      width: 48,
                      height: 48,
                      borderRadius: 'var(--radius-md)',
                      background: 'linear-gradient(135deg, var(--primary-500), var(--primary-700))',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <card.icon size={22} color="white" />
                  </div>
                  <h3 style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>
                    {card.title}
                  </h3>
                </div>
                <p style={{ fontSize: 14, color: 'var(--text-secondary)', margin: '0 0 8px' }}>
                  {card.getDesc(overview ?? {})}
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 14, color: 'var(--primary-600)', fontWeight: 500 }}>
                  查看详情 <ChevronRight size={14} />
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default GamificationHubPage;
```

- [ ] **Step 2: Run tests**

```bash
cd frontend && npm test -- --testPathPattern="GamificationHub"
```

Expected: PASS

- [ ] **Step 3: Commit**

```bash
git add frontend/src/pages/Gamification/GamificationHubPage.tsx
git commit -m "refactor: GamificationHubPage to CSS variables shell with hybrid glassmorphism cards"
```

---

### Task 3: AchievementCard.tsx + AchievementsPage.tsx

**Files:**
- Modify: `frontend/src/components/gamification/AchievementCard.tsx`
- Modify: `frontend/src/pages/Gamification/AchievementsPage.tsx`

**Interfaces:**
- AchievementCard consumes: `Achievement | UserAchievement` types, props `achievement`, `isUnlocked?`, `showProgress?`
- AchievementsPage consumes: `useAchievements` hook, `AchievementCard` component

- [ ] **Step 1: Rewrite AchievementCard.tsx — shrink, remove hover animation, simplify**

Replace `frontend/src/components/gamification/AchievementCard.tsx`:

```tsx
import React from 'react';
import type { Achievement, UserAchievement } from '../../types/gamification';

interface AchievementCardProps {
  achievement: Achievement | UserAchievement;
  isUnlocked?: boolean;
  showProgress?: boolean;
}

const rarityColors = {
  common: { border: 'var(--border-light)', tag: 'var(--text-muted)' },
  rare: { border: '#60A5FA', tag: '#3B82F6' },
  epic: { border: '#A78BFA', tag: '#7C3AED' },
  legendary: { border: '#FBBF24', tag: '#D97706' },
};

const rarityLabels = {
  common: '普通',
  rare: '稀有',
  epic: '史诗',
  legendary: '传说',
};

const rarityGradients = {
  common: 'linear-gradient(135deg, #9CA3AF, #6B7280)',
  rare: 'linear-gradient(135deg, #60A5FA, #3B82F6)',
  epic: 'linear-gradient(135deg, #A78BFA, #7C3AED)',
  legendary: 'linear-gradient(135deg, #FBBF24, #F59E0B)',
};

const AchievementCard: React.FC<AchievementCardProps> = ({
  achievement,
  isUnlocked = false,
  showProgress = false,
}) => {
  const isUserAchievement = 'unlockedAt' in achievement;
  const rarity = achievement.rarity || 'common';
  const unlocked = isUnlocked || isUserAchievement;

  return (
    <div
      style={{
        position: 'relative',
        background: 'rgba(255,255,255,0.7)',
        backdropFilter: 'blur(12px)',
        border: `1px solid ${unlocked ? rarityColors[rarity].border : 'rgba(255,255,255,0.3)'}`,
        borderRadius: 'var(--radius-lg)',
        padding: 24,
        boxShadow: 'var(--shadow-sm)',
        opacity: unlocked ? 1 : 0.5,
      }}
    >
      {/* 稀有度标签 */}
      <div
        style={{
          position: 'absolute',
          top: 12,
          right: 12,
          padding: '2px 10px',
          borderRadius: 'var(--radius-full)',
          fontSize: 13,
          fontWeight: 500,
          background: 'rgba(255,255,255,0.8)',
          border: '1px solid rgba(255,255,255,0.6)',
          color: rarityColors[rarity].tag,
        }}
      >
        {rarityLabels[rarity]}
      </div>

      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
        {/* 图标 */}
        <div
          style={{
            width: 56,
            height: 56,
            borderRadius: 'var(--radius-md)',
            background: unlocked ? rarityGradients[rarity] : 'linear-gradient(135deg, #D1D5DB, #9CA3AF)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          {achievement.iconUrl ? (
            <img src={achievement.iconUrl} alt={achievement.name} style={{ width: 36, height: 36 }} />
          ) : (
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
            </svg>
          )}
        </div>

        {/* 内容 */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <h3 style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>
            {achievement.name}
          </h3>
          <p style={{ fontSize: 14, color: 'var(--text-secondary)', margin: '4px 0 0', lineHeight: 1.4 }}>
            {achievement.description}
          </p>

          {/* 积分 */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 8 }}>
            <span style={{ fontSize: 14, color: '#D97706' }}>⭐</span>
            <span style={{ fontSize: 14, fontWeight: 500, color: 'var(--text-secondary)' }}>
              +{achievement.points} 积分
            </span>
          </div>

          {/* 解锁时间 */}
          {isUserAchievement && 'unlockedAt' in achievement && (
            <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: '4px 0 0' }}>
              解锁于: {new Date((achievement as UserAchievement).unlockedAt).toLocaleDateString()}
            </p>
          )}

          {/* 进度条 */}
          {showProgress && isUserAchievement && 'progress' in achievement && (
            <div style={{ marginTop: 8 }}>
              <div
                style={{
                  width: '100%',
                  background: 'rgba(255,255,255,0.6)',
                  borderRadius: 'var(--radius-full)',
                  height: 8,
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    height: '100%',
                    background: 'linear-gradient(to right, var(--primary-500), #7C3AED)',
                    borderRadius: 'var(--radius-full)',
                    transition: 'width 0.5s',
                    width: `${(achievement as UserAchievement).progress}%`,
                  }}
                />
              </div>
              <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: '4px 0 0' }}>
                进度: {(achievement as UserAchievement).progress}%
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AchievementCard;
```

- [ ] **Step 2: Rewrite AchievementsPage.tsx — CSS variables shell, gradient stat cards**

Replace `frontend/src/pages/Gamification/AchievementsPage.tsx`:

```tsx
import React, { useState } from 'react';
import { useAchievements } from '../../hooks/useGamification';
import AchievementCard from '../../components/gamification/AchievementCard';
import type { UserAchievement } from '../../types/gamification';

const AchievementsPage: React.FC = () => {
  const { achievements, stats, loading, error } = useAchievements();
  const [filter, setFilter] = useState<string>('all');

  const categories = [
    { id: 'all', label: '全部' },
    { id: 'problem', label: '解题' },
    { id: 'contest', label: '竞赛' },
    { id: 'learning', label: '学习' },
    { id: 'level', label: '等级' },
    { id: 'social', label: '社交' },
    { id: 'special', label: '特殊' },
  ];

  const filteredAchievements = filter === 'all'
    ? achievements
    : achievements.filter((a) => a.category === filter);

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-secondary)', padding: '32px 0' }}>
      <div style={{ maxWidth: 1000, margin: '0 auto', padding: '0 24px' }}>
        {/* 页面标题 */}
        <div style={{ marginBottom: 32 }}>
          <h1 style={{ fontSize: 28, fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
            成就系统
          </h1>
          <p style={{ margin: '8px 0 0', fontSize: 14, color: 'var(--text-secondary)' }}>
            完成各种挑战，解锁成就徽章，展示你的实力！
          </p>
        </div>

        {/* 统计卡片 — 纯色渐变 */}
        {stats && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 32 }}>
            <div
              style={{
                background: 'linear-gradient(135deg, #2563EB, #1D4ED8)',
                borderRadius: 'var(--radius-lg)',
                padding: 24,
                boxShadow: 'var(--shadow-md)',
                color: 'white',
              }}
            >
              <p style={{ fontSize: 13, opacity: 0.8, margin: 0 }}>已解锁</p>
              <p style={{ fontSize: 36, fontWeight: 700, margin: '8px 0 0' }}>{stats.unlocked}</p>
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
              <p style={{ fontSize: 13, opacity: 0.8, margin: 0 }}>总成就数</p>
              <p style={{ fontSize: 36, fontWeight: 700, margin: '8px 0 0' }}>{stats.total}</p>
            </div>
            <div
              style={{
                background: 'linear-gradient(135deg, #059669, #047857)',
                borderRadius: 'var(--radius-lg)',
                padding: 24,
                boxShadow: 'var(--shadow-md)',
                color: 'white',
              }}
            >
              <p style={{ fontSize: 13, opacity: 0.8, margin: 0 }}>完成度</p>
              <p style={{ fontSize: 36, fontWeight: 700, margin: '8px 0' }}>{stats.percentage}%</p>
              <div style={{ width: '100%', background: 'rgba(255,255,255,0.3)', borderRadius: 'var(--radius-full)', height: 8, overflow: 'hidden' }}>
                <div
                  style={{
                    height: '100%',
                    background: 'white',
                    borderRadius: 'var(--radius-full)',
                    transition: 'width 0.5s',
                    width: `${stats.percentage}%`,
                  }}
                />
              </div>
            </div>
          </div>
        )}

        {/* 加载状态 */}
        {loading && (
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
        )}

        {/* 错误状态 */}
        {error && !loading && (
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

        {/* 分类筛选 */}
        {!loading && !error && (
          <>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 24 }}>
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setFilter(category.id)}
                  style={{
                    padding: '8px 20px',
                    borderRadius: 'var(--radius-full)',
                    fontSize: 14,
                    fontWeight: 500,
                    border: filter === category.id ? 'none' : '1px solid var(--border-light)',
                    background: filter === category.id
                      ? 'linear-gradient(135deg, var(--primary-500), var(--primary-700))'
                      : 'rgba(255,255,255,0.6)',
                    color: filter === category.id ? 'white' : 'var(--text-secondary)',
                    cursor: 'pointer',
                    transition: 'all 0.15s',
                  }}
                >
                  {category.label}
                </button>
              ))}
            </div>

            {/* 成就网格 */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
              {filteredAchievements.map((achievement) => (
                <AchievementCard
                  key={achievement.id}
                  achievement={achievement}
                  isUnlocked={!!(achievement as UserAchievement).unlockedAt}
                  showProgress={true}
                />
              ))}
            </div>

            {filteredAchievements.length === 0 && (
              <div style={{ textAlign: 'center', padding: 48 }}>
                <p style={{ fontSize: 14, color: 'var(--text-muted)' }}>暂无成就数据</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default AchievementsPage;
```

- [ ] **Step 3: Run tests**

```bash
cd frontend && npm test -- --testPathPattern="Achievement"
```

Expected: PASS

- [ ] **Step 4: Commit**

```bash
git add frontend/src/components/gamification/AchievementCard.tsx frontend/src/pages/Gamification/AchievementsPage.tsx
git commit -m "refactor: Achievements page & card to CSS variables hybrid style"
```

---

### Task 4: DailyChallengeCard.tsx + LoginStreakCalendar.tsx + DailyChallengePage.tsx

**Files:**
- Modify: `frontend/src/components/gamification/DailyChallengeCard.tsx`
- Modify: `frontend/src/components/gamification/LoginStreakCalendar.tsx`
- Modify: `frontend/src/pages/Gamification/DailyChallengePage.tsx`

- [ ] **Step 1: Rewrite DailyChallengeCard.tsx — shrink, keep purple gradient identity**

Replace `frontend/src/components/gamification/DailyChallengeCard.tsx`:

```tsx
import React from 'react';
import type { DailyChallenge, DailyTask } from '../../types/gamification';

interface DailyChallengeCardProps {
  challenge: DailyChallenge | null;
  onComplete?: () => void;
  isCompleted?: boolean;
}

export const DailyChallengeCard: React.FC<DailyChallengeCardProps> = ({
  challenge,
  onComplete,
  isCompleted = false,
}) => {
  if (!challenge) {
    return (
      <div
        style={{
          background: 'rgba(255,255,255,0.7)',
          backdropFilter: 'blur(12px)',
          border: '1px solid rgba(255,255,255,0.4)',
          borderRadius: 'var(--radius-lg)',
          padding: 24,
          boxShadow: 'var(--shadow-sm)',
          textAlign: 'center',
        }}
      >
        <p style={{ fontSize: 14, color: 'var(--text-muted)' }}>今日暂无挑战</p>
      </div>
    );
  }

  const difficultyStars = Array(5)
    .fill(0)
    .map((_, i) => (
      <svg
        key={i}
        width="16"
        height="16"
        viewBox="0 0 20 20"
        fill={i < challenge.problem.difficulty ? '#FBBF24' : '#D1D5DB'}
      >
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
    ));

  return (
    <div
      style={{
        background: 'linear-gradient(135deg, rgba(124,58,237,0.9), rgba(79,70,229,0.9))',
        backdropFilter: 'blur(12px)',
        borderRadius: 'var(--radius-lg)',
        padding: 24,
        boxShadow: 'var(--shadow-md)',
        color: 'white',
        border: '1px solid rgba(255,255,255,0.2)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <h3 style={{ fontSize: 18, fontWeight: 700, margin: 0 }}>每日挑战</h3>
        <span
          style={{
            padding: '4px 12px',
            borderRadius: 'var(--radius-full)',
            fontSize: 14,
            background: 'rgba(255,255,255,0.2)',
            border: '1px solid rgba(255,255,255,0.2)',
          }}
        >
          +{challenge.bonusPoints} 积分
        </span>
      </div>

      <div
        style={{
          background: 'rgba(255,255,255,0.1)',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: 'var(--radius-md)',
          padding: 16,
          marginBottom: 16,
        }}
      >
        <h4 style={{ fontSize: 16, fontWeight: 600, margin: '0 0 8px' }}>{challenge.problem.title}</h4>
        <div style={{ display: 'flex', gap: 2, marginBottom: 8 }}>{difficultyStars}</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
          {challenge.problem.tags.map(({ tag }) => (
            <span
              key={tag.id}
              style={{
                padding: '2px 10px',
                borderRadius: 'var(--radius-full)',
                fontSize: 13,
                background: 'rgba(255,255,255,0.2)',
                border: '1px solid rgba(255,255,255,0.1)',
              }}
            >
              {tag.name}
            </span>
          ))}
        </div>
      </div>

      {isCompleted ? (
        <div style={{ textAlign: 'center' }}>
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #34D399, #10B981)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 8px',
            }}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <p style={{ fontSize: 16, fontWeight: 500, margin: 0 }}>今日挑战已完成!</p>
        </div>
      ) : (
        <button
          onClick={onComplete}
          style={{
            width: '100%',
            padding: '12px 0',
            fontSize: 16,
            fontWeight: 600,
            background: 'white',
            color: '#7C3AED',
            border: 'none',
            borderRadius: 'var(--radius-md)',
            cursor: 'pointer',
            transition: 'opacity 0.15s',
          }}
        >
          开始挑战
        </button>
      )}
    </div>
  );
};

interface DailyTaskListProps {
  tasks: DailyTask[];
}

export const DailyTaskList: React.FC<DailyTaskListProps> = ({ tasks }) => {
  return (
    <div
      style={{
        background: 'rgba(255,255,255,0.7)',
        backdropFilter: 'blur(12px)',
        border: '1px solid rgba(255,255,255,0.4)',
        borderRadius: 'var(--radius-lg)',
        padding: 20,
        boxShadow: 'var(--shadow-sm)',
      }}
    >
      <h3 style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-primary)', margin: '0 0 16px' }}>每日任务</h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {tasks.map((task) => (
          <div
            key={task.id}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '12px 16px',
              minHeight: 52,
              borderRadius: 'var(--radius-md)',
              background: task.completed
                ? 'linear-gradient(to right, rgba(16,185,129,0.1), rgba(20,184,166,0.1))'
                : 'rgba(255,255,255,0.4)',
              border: task.completed ? '1px solid rgba(16,185,129,0.2)' : '1px solid rgba(255,255,255,0.3)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div
                style={{
                  width: 24,
                  height: 24,
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  background: task.completed
                    ? 'linear-gradient(135deg, #34D399, #10B981)'
                    : 'rgba(255,255,255,0.6)',
                  border: task.completed ? 'none' : '1px solid var(--border-light)',
                }}
              >
                {task.completed && (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </div>
              <div>
                <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>
                  {task.title}
                </p>
                <p style={{ fontSize: 13, color: 'var(--text-secondary)', margin: '2px 0 0' }}>
                  {task.description}
                </p>
              </div>
            </div>
            <div style={{ textAlign: 'right', flexShrink: 0 }}>
              <p style={{ fontSize: 14, color: 'var(--text-secondary)', margin: 0 }}>
                {task.current}/{task.target}
              </p>
              {task.reward > 0 && (
                <p style={{ fontSize: 13, fontWeight: 500, color: '#D97706', margin: '2px 0 0' }}>
                  +{task.reward} 积分
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DailyChallengeCard;
```

- [ ] **Step 2: Rewrite LoginStreakCalendar.tsx — shrink grid, simplify**

Replace `frontend/src/components/gamification/LoginStreakCalendar.tsx`:

```tsx
import React from 'react';
import type { LoginCalendarDay } from '../../types/gamification';

interface LoginStreakCalendarProps {
  calendar: LoginCalendarDay[];
  month: number;
  year: number;
  onMonthChange?: (month: number, year: number) => void;
}

const LoginStreakCalendar: React.FC<LoginStreakCalendarProps> = ({
  calendar,
  month,
  year,
  onMonthChange,
}) => {
  const firstDayOfWeek = new Date(year, month - 1, 1).getDay();
  const weekDays = ['日', '一', '二', '三', '四', '五', '六'];

  const handlePrevMonth = () => {
    if (month === 1) onMonthChange?.(12, year - 1);
    else onMonthChange?.(month - 1, year);
  };

  const handleNextMonth = () => {
    if (month === 12) onMonthChange?.(1, year + 1);
    else onMonthChange?.(month + 1, year);
  };

  const calendarDays: (LoginCalendarDay | null)[] = [];
  for (let i = 0; i < firstDayOfWeek; i++) calendarDays.push(null);
  calendar.forEach((day) => calendarDays.push(day));

  return (
    <div
      style={{
        background: 'rgba(255,255,255,0.7)',
        backdropFilter: 'blur(12px)',
        border: '1px solid rgba(255,255,255,0.4)',
        borderRadius: 'var(--radius-lg)',
        padding: 20,
        boxShadow: 'var(--shadow-sm)',
      }}
    >
      {/* 月份导航 */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <button
          onClick={handlePrevMonth}
          style={{
            padding: 8,
            borderRadius: 'var(--radius-md)',
            background: 'rgba(255,255,255,0.6)',
            border: '1px solid rgba(255,255,255,0.4)',
            cursor: 'pointer',
            display: 'flex',
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h3 style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>
          {year}年{month}月
        </h3>
        <button
          onClick={handleNextMonth}
          style={{
            padding: 8,
            borderRadius: 'var(--radius-md)',
            background: 'rgba(255,255,255,0.6)',
            border: '1px solid rgba(255,255,255,0.4)',
            cursor: 'pointer',
            display: 'flex',
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* 星期头 */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 2, marginBottom: 4 }}>
        {weekDays.map((day) => (
          <div key={day} style={{ textAlign: 'center', fontSize: 13, fontWeight: 600, color: 'var(--text-muted)', padding: '4px 0' }}>
            {day}
          </div>
        ))}
      </div>

      {/* 日历网格 */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 2 }}>
        {calendarDays.map((day, index) => (
          <div
            key={index}
            style={{
              aspectRatio: '1',
              minHeight: 36,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: 'var(--radius-sm)',
              fontSize: 13,
              ...(day === null
                ? {}
                : day.isLoggedIn
                ? { background: 'linear-gradient(135deg, #34D399, #10B981)', color: 'white', fontWeight: 500 }
                : { background: 'rgba(255,255,255,0.4)', color: 'var(--text-secondary)', border: '1px solid rgba(255,255,255,0.3)' }),
            }}
          >
            {day && (
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 13, fontWeight: 500 }}>{new Date(day.date).getDate()}</div>
                {day.isLoggedIn && day.streakDays > 1 && (
                  <div style={{ fontSize: 10 }}>🔥{day.streakDays}</div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* 图例 */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, marginTop: 12, fontSize: 13, color: 'var(--text-muted)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <div style={{ width: 10, height: 10, borderRadius: 2, background: 'rgba(255,255,255,0.4)', border: '1px solid rgba(255,255,255,0.3)' }} />
          <span>未登录</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <div style={{ width: 10, height: 10, borderRadius: 2, background: 'linear-gradient(135deg, #34D399, #10B981)' }} />
          <span>已登录</span>
        </div>
      </div>
    </div>
  );
};

export default LoginStreakCalendar;
```

- [ ] **Step 3: Rewrite DailyChallengePage.tsx — CSS variables shell**

Replace `frontend/src/pages/Gamification/DailyChallengePage.tsx`:

```tsx
import React from 'react';
import { useDailyChallenge, useDailyTasks, useLoginStreak, useLoginCalendar } from '../../hooks/useGamification';
import DailyChallengeCard, { DailyTaskList } from '../../components/gamification/DailyChallengeCard';
import LoginStreakCalendar from '../../components/gamification/LoginStreakCalendar';

const DailyChallengePage: React.FC = () => {
  const { challenge, isCompleted, loading: challengeLoading } = useDailyChallenge();
  const { tasksData, loading: tasksLoading } = useDailyTasks();
  const { streakInfo, loading: _streakLoading } = useLoginStreak();
  const { calendar, loading: calendarLoading } = useLoginCalendar();

  const handleCompleteChallenge = () => {
    if (challenge) {
      window.location.href = `/problems/${challenge.problemId}`;
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-secondary)', padding: '32px 0' }}>
      <div style={{ maxWidth: 1000, margin: '0 auto', padding: '0 24px' }}>
        {/* 页面标题 */}
        <div style={{ marginBottom: 32 }}>
          <h1 style={{ fontSize: 28, fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
            每日挑战
          </h1>
          <p style={{ margin: '8px 0 0', fontSize: 14, color: 'var(--text-secondary)' }}>
            每天完成挑战任务，获取额外积分奖励！
          </p>
        </div>

        {/* 统计卡片 — 纯色渐变 */}
        {streakInfo && tasksData && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 32 }}>
            <div style={{ background: 'linear-gradient(135deg, #EA580C, #C2410C)', borderRadius: 'var(--radius-lg)', padding: 24, boxShadow: 'var(--shadow-md)', color: 'white' }}>
              <p style={{ fontSize: 13, opacity: 0.8, margin: 0 }}>🔥 连续登录</p>
              <p style={{ fontSize: 36, fontWeight: 700, margin: '8px 0 0' }}>{streakInfo.currentStreak}<span style={{ fontSize: 14, fontWeight: 400 }}> 天</span></p>
            </div>
            <div style={{ background: 'linear-gradient(135deg, #D97706, #B45309)', borderRadius: 'var(--radius-lg)', padding: 24, boxShadow: 'var(--shadow-md)', color: 'white' }}>
              <p style={{ fontSize: 13, opacity: 0.8, margin: 0 }}>🏆 最长连续</p>
              <p style={{ fontSize: 36, fontWeight: 700, margin: '8px 0 0' }}>{streakInfo.maxStreak}<span style={{ fontSize: 14, fontWeight: 400 }}> 天</span></p>
            </div>
            <div style={{ background: 'linear-gradient(135deg, #2563EB, #1D4ED8)', borderRadius: 'var(--radius-lg)', padding: 24, boxShadow: 'var(--shadow-md)', color: 'white' }}>
              <p style={{ fontSize: 13, opacity: 0.8, margin: 0 }}>📅 今日登录</p>
              <p style={{ fontSize: 36, fontWeight: 700, margin: '8px 0 0' }}>{streakInfo.isLoggedInToday ? '✓' : '✗'}</p>
            </div>
            <div style={{ background: 'linear-gradient(135deg, #059669, #047857)', borderRadius: 'var(--radius-lg)', padding: 24, boxShadow: 'var(--shadow-md)', color: 'white' }}>
              <p style={{ fontSize: 13, opacity: 0.8, margin: 0 }}>🎯 今日任务</p>
              <p style={{ fontSize: 36, fontWeight: 700, margin: '8px 0 0' }}>{tasksData.totalCompleted}/{tasksData.tasks.length}</p>
            </div>
          </div>
        )}

        {/* 主内容 — 双栏 */}
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 24 }}>
          {/* 左侧 */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            {challengeLoading ? (
              <div style={{ display: 'flex', justifyContent: 'center', padding: 48 }}>
                <div style={{ width: 40, height: 40, borderRadius: '50%', border: '3px solid var(--border-light)', borderTopColor: 'var(--primary-600)', animation: 'spin 0.8s linear infinite' }} />
              </div>
            ) : (
              <DailyChallengeCard challenge={challenge} onComplete={handleCompleteChallenge} isCompleted={isCompleted} />
            )}

            {tasksLoading ? (
              <div style={{ display: 'flex', justifyContent: 'center', padding: 32 }}>
                <div style={{ width: 32, height: 32, borderRadius: '50%', border: '3px solid var(--border-light)', borderTopColor: 'var(--primary-600)', animation: 'spin 0.8s linear infinite' }} />
              </div>
            ) : tasksData ? (
              <DailyTaskList tasks={tasksData.tasks} />
            ) : null}
          </div>

          {/* 右侧 */}
          <div>
            {calendarLoading ? (
              <div style={{ display: 'flex', justifyContent: 'center', padding: 48 }}>
                <div style={{ width: 40, height: 40, borderRadius: '50%', border: '3px solid var(--border-light)', borderTopColor: 'var(--primary-600)', animation: 'spin 0.8s linear infinite' }} />
              </div>
            ) : (
              <LoginStreakCalendar calendar={calendar} month={new Date().getMonth() + 1} year={new Date().getFullYear()} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DailyChallengePage;
```

- [ ] **Step 4: Run tests**

```bash
cd frontend && npm test -- --testPathPattern="DailyChallenge|LoginStreak"
```

Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add frontend/src/components/gamification/DailyChallengeCard.tsx frontend/src/components/gamification/LoginStreakCalendar.tsx frontend/src/pages/Gamification/DailyChallengePage.tsx
git commit -m "refactor: DailyChallenge page & components to CSS variables hybrid style"
```

---

### Task 5: PointHistoryList.tsx + PointsPage.tsx

**Files:**
- Modify: `frontend/src/components/gamification/PointHistoryList.tsx`
- Modify: `frontend/src/pages/Gamification/PointsPage.tsx`

- [ ] **Step 1: Rewrite PointHistoryList.tsx — shrink rows, simplify**

Replace `frontend/src/components/gamification/PointHistoryList.tsx`:

```tsx
import React from 'react';
import type { PointHistory } from '../../types/gamification';

interface PointHistoryListProps {
  history: PointHistory[];
  showLoadMore?: boolean;
  onLoadMore?: () => void;
}

const typeIcons: Record<string, string> = {
  solve: '✅',
  contest: '🏆',
  daily: '📅',
  achievement: '🏅',
  bonus: '🎁',
  login: '🔑',
  login_streak: '🔥',
  purchase: '🛒',
};

const PointHistoryList: React.FC<PointHistoryListProps> = ({
  history,
  showLoadMore = false,
  onLoadMore,
}) => {
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div
      style={{
        background: 'rgba(255,255,255,0.7)',
        backdropFilter: 'blur(12px)',
        border: '1px solid rgba(255,255,255,0.4)',
        borderRadius: 'var(--radius-lg)',
        boxShadow: 'var(--shadow-sm)',
        overflow: 'hidden',
      }}
    >
      <div style={{ padding: '14px 20px', borderBottom: '1px solid rgba(255,255,255,0.3)' }}>
        <h3 style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>积分历史</h3>
      </div>

      <div>
        {history.map((record) => {
          const icon = typeIcons[record.type] || '📌';
          const isPositive = record.points > 0;

          return (
            <div
              key={record.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '12px 20px',
                minHeight: 56,
                borderBottom: '1px solid rgba(255,255,255,0.15)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{ fontSize: 20 }}>{icon}</span>
                <div>
                  <p style={{ fontSize: 14, fontWeight: 500, color: 'var(--text-primary)', margin: 0 }}>
                    {record.description || '积分变动'}
                  </p>
                  <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: '2px 0 0' }}>
                    {formatDate(record.createdAt)}
                  </p>
                </div>
              </div>
              <span
                style={{
                  fontSize: 16,
                  fontWeight: 600,
                  color: isPositive ? '#059669' : '#DC2626',
                }}
              >
                {isPositive ? '+' : ''}{record.points}
              </span>
            </div>
          );
        })}
      </div>

      {history.length === 0 && (
        <div style={{ textAlign: 'center', padding: 48, fontSize: 14, color: 'var(--text-muted)' }}>
          暂无积分记录
        </div>
      )}

      {showLoadMore && (
        <button
          onClick={onLoadMore}
          style={{
            width: '100%',
            padding: '12px 0',
            fontSize: 14,
            fontWeight: 500,
            color: 'var(--primary-600)',
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            borderTop: '1px solid rgba(255,255,255,0.15)',
          }}
        >
          加载更多
        </button>
      )}
    </div>
  );
};

export default PointHistoryList;
```

- [ ] **Step 2: Rewrite PointsPage.tsx — CSS variables shell**

Replace `frontend/src/pages/Gamification/PointsPage.tsx`:

```tsx
import React from 'react';
import { usePointHistory, useLevelInfo, useGamificationOverview } from '../../hooks/useGamification';
import LevelProgress from '../../components/gamification/LevelProgress';
import PointHistoryList from '../../components/gamification/PointHistoryList';

const PointsPage: React.FC = () => {
  const { history, loading, error, hasMore, loadMore } = usePointHistory();
  const { levelInfo, loading: levelLoading } = useLevelInfo();
  const { overview } = useGamificationOverview();

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-secondary)', padding: '32px 0' }}>
      <div style={{ maxWidth: 800, margin: '0 auto', padding: '0 24px' }}>
        {/* 页面标题 */}
        <div style={{ marginBottom: 32 }}>
          <h1 style={{ fontSize: 28, fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
            积分中心
          </h1>
          <p style={{ margin: '8px 0 0', fontSize: 14, color: 'var(--text-secondary)' }}>
            查看你的积分详情、等级进度和积分历史记录
          </p>
        </div>

        {/* 等级进度 */}
        {levelLoading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: 32 }}>
            <div style={{ width: 40, height: 40, borderRadius: '50%', border: '3px solid var(--border-light)', borderTopColor: 'var(--primary-600)', animation: 'spin 0.8s linear infinite' }} />
          </div>
        ) : levelInfo ? (
          <div style={{ marginBottom: 24 }}>
            <LevelProgress levelInfo={levelInfo} size="lg" />
          </div>
        ) : null}

        {/* 统计卡片 — 纯色渐变 */}
        {overview && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 32 }}>
            <div style={{ background: 'linear-gradient(135deg, #2563EB, #1D4ED8)', borderRadius: 'var(--radius-lg)', padding: 24, boxShadow: 'var(--shadow-md)', color: 'white' }}>
              <p style={{ fontSize: 13, opacity: 0.8, margin: 0 }}>总经验值</p>
              <p style={{ fontSize: 36, fontWeight: 700, margin: '8px 0 0' }}>{overview.totalExp.toLocaleString()}</p>
            </div>
            <div style={{ background: 'linear-gradient(135deg, #7C3AED, #6D28D9)', borderRadius: 'var(--radius-lg)', padding: 24, boxShadow: 'var(--shadow-md)', color: 'white' }}>
              <p style={{ fontSize: 13, opacity: 0.8, margin: 0 }}>成就数</p>
              <p style={{ fontSize: 36, fontWeight: 700, margin: '8px 0 0' }}>{overview.achievementCount}</p>
            </div>
            <div style={{ background: 'linear-gradient(135deg, #059669, #047857)', borderRadius: 'var(--radius-lg)', padding: 24, boxShadow: 'var(--shadow-md)', color: 'white' }}>
              <p style={{ fontSize: 13, opacity: 0.8, margin: 0 }}>每日挑战</p>
              <p style={{ fontSize: 36, fontWeight: 700, margin: '8px 0 0' }}>{overview.completedDailyChallenges}</p>
            </div>
            <div style={{ background: 'linear-gradient(135deg, #D97706, #B45309)', borderRadius: 'var(--radius-lg)', padding: 24, boxShadow: 'var(--shadow-md)', color: 'white' }}>
              <p style={{ fontSize: 13, opacity: 0.8, margin: 0 }}>全球排名</p>
              <p style={{ fontSize: 36, fontWeight: 700, margin: '8px 0 0' }}>#{overview.globalRank}</p>
            </div>
          </div>
        )}

        {/* 积分历史 */}
        {loading && history.length === 0 ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: 48 }}>
            <div style={{ width: 40, height: 40, borderRadius: '50%', border: '3px solid var(--border-light)', borderTopColor: 'var(--primary-600)', animation: 'spin 0.8s linear infinite' }} />
          </div>
        ) : error ? (
          <div style={{ padding: '12px 16px', borderRadius: 'var(--radius-md)', background: 'var(--danger-50)', color: 'var(--danger-700)', border: '1px solid var(--danger-200)', fontSize: 14 }}>
            {error}
          </div>
        ) : (
          <PointHistoryList history={history} showLoadMore={hasMore} onLoadMore={loadMore} />
        )}
      </div>
    </div>
  );
};

export default PointsPage;
```

- [ ] **Step 3: Run tests**

```bash
cd frontend && npm test -- --testPathPattern="Points|PointHistory"
```

Expected: PASS

- [ ] **Step 4: Commit**

```bash
git add frontend/src/components/gamification/PointHistoryList.tsx frontend/src/pages/Gamification/PointsPage.tsx
git commit -m "refactor: Points page & PointHistoryList to CSS variables hybrid style"
```

---

### Task 6: VirtualItemCard.tsx + VirtualItemsPage.tsx

**Files:**
- Modify: `frontend/src/components/gamification/VirtualItemCard.tsx`
- Modify: `frontend/src/pages/Gamification/VirtualItemsPage.tsx`

- [ ] **Step 1: Rewrite VirtualItemCard.tsx — shrink, simplify**

Replace `frontend/src/components/gamification/VirtualItemCard.tsx`:

```tsx
import React from 'react';
import type { VirtualItem, UserVirtualItem } from '../../types/gamification';

interface VirtualItemCardProps {
  item: VirtualItem | UserVirtualItem;
  isOwned?: boolean;
  isEquipped?: boolean;
  onPurchase?: (itemId: string) => void;
  onEquip?: (itemId: string, equip: boolean) => void;
  userPoints?: number;
}

const rarityGradients: Record<string, string> = {
  common: 'linear-gradient(135deg, #9CA3AF, #6B7280)',
  rare: 'linear-gradient(135deg, #60A5FA, #3B82F6)',
  epic: 'linear-gradient(135deg, #A78BFA, #7C3AED)',
  legendary: 'linear-gradient(135deg, #FBBF24, #F59E0B)',
};

const rarityBorders: Record<string, string> = {
  common: 'var(--border-light)',
  rare: '#60A5FA',
  epic: '#A78BFA',
  legendary: '#FBBF24',
};

const rarityLabels: Record<string, string> = {
  common: '普通',
  rare: '稀有',
  epic: '史诗',
  legendary: '传说',
};

const typeLabels: Record<string, string> = {
  badge: '徽章',
  title: '称号',
  frame: '头像框',
  decoration: '装饰',
};

const VirtualItemCard: React.FC<VirtualItemCardProps> = ({
  item,
  isOwned = false,
  isEquipped = false,
  onPurchase,
  onEquip,
  userPoints = 0,
}) => {
  const isUserItem = 'acquiredAt' in item;
  const virtualItem = isUserItem ? (item as UserVirtualItem).item : item;
  const rarity = virtualItem.rarity || 'common';
  const canAfford = userPoints >= virtualItem.price;

  return (
    <div
      style={{
        background: 'rgba(255,255,255,0.7)',
        backdropFilter: 'blur(12px)',
        border: `1px solid ${isOwned || isUserItem ? rarityBorders[rarity] : 'rgba(255,255,255,0.3)'}`,
        borderRadius: 'var(--radius-lg)',
        padding: 24,
        boxShadow: 'var(--shadow-sm)',
      }}
    >
      {/* 类型 + 稀有度标签 */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
        <span style={{ padding: '2px 10px', borderRadius: 'var(--radius-full)', fontSize: 13, fontWeight: 500, background: 'rgba(255,255,255,0.6)', color: 'var(--text-muted)', border: '1px solid rgba(255,255,255,0.4)' }}>
          {typeLabels[virtualItem.type]}
        </span>
        <span style={{ padding: '2px 10px', borderRadius: 'var(--radius-full)', fontSize: 13, fontWeight: 500, background: 'rgba(255,255,255,0.8)', border: '1px solid rgba(255,255,255,0.6)', color: rarity === 'legendary' ? '#D97706' : rarity === 'epic' ? '#7C3AED' : rarity === 'rare' ? '#3B82F6' : 'var(--text-muted)' }}>
          {rarityLabels[rarity]}
        </span>
      </div>

      {/* 图标 */}
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
        <div
          style={{
            width: 80,
            height: 80,
            borderRadius: 'var(--radius-md)',
            background: rarityGradients[rarity],
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {virtualItem.iconUrl ? (
            <img src={virtualItem.iconUrl} alt={virtualItem.name} style={{ width: 56, height: 56 }} />
          ) : (
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
            </svg>
          )}
        </div>
      </div>

      {/* 名称 + 描述 */}
      <h3 style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-primary)', textAlign: 'center', margin: 0 }}>
        {virtualItem.name}
      </h3>
      <p style={{ fontSize: 14, color: 'var(--text-secondary)', textAlign: 'center', margin: '4px 0 0', lineHeight: 1.4 }}>
        {virtualItem.description}
      </p>

      {/* 操作按钮 */}
      <div style={{ marginTop: 20 }}>
        {isOwned || isUserItem ? (
          isEquipped ? (
            <button
              onClick={() => onEquip?.(virtualItem.id, false)}
              style={{
                width: '100%',
                padding: '10px 0',
                fontSize: 14,
                fontWeight: 500,
                background: 'rgba(255,255,255,0.6)',
                color: 'var(--text-secondary)',
                border: '1px solid rgba(255,255,255,0.4)',
                borderRadius: 'var(--radius-md)',
                cursor: 'pointer',
              }}
            >
              卸下
            </button>
          ) : (
            <button
              onClick={() => onEquip?.(virtualItem.id, true)}
              style={{
                width: '100%',
                padding: '10px 0',
                fontSize: 14,
                fontWeight: 500,
                background: 'linear-gradient(135deg, #4F46E5, #7C3AED)',
                color: 'white',
                border: 'none',
                borderRadius: 'var(--radius-md)',
                cursor: 'pointer',
              }}
            >
              装备
            </button>
          )
        ) : virtualItem.price === 0 ? (
          <button
            onClick={() => onPurchase?.(virtualItem.id)}
            style={{
              width: '100%',
              padding: '10px 0',
              fontSize: 14,
              fontWeight: 500,
              background: 'linear-gradient(135deg, #059669, #10B981)',
              color: 'white',
              border: 'none',
              borderRadius: 'var(--radius-md)',
              cursor: 'pointer',
            }}
          >
            免费领取
          </button>
        ) : (
          <button
            onClick={() => onPurchase?.(virtualItem.id)}
            disabled={!canAfford}
            style={{
              width: '100%',
              padding: '10px 0',
              fontSize: 14,
              fontWeight: 500,
              borderRadius: 'var(--radius-md)',
              border: 'none',
              cursor: canAfford ? 'pointer' : 'not-allowed',
              background: canAfford ? 'linear-gradient(135deg, #D97706, #EA580C)' : 'rgba(255,255,255,0.3)',
              color: canAfford ? 'white' : 'var(--text-muted)',
            }}
          >
            {virtualItem.price} 积分{!canAfford && ' (不足)'}
          </button>
        )}
      </div>
    </div>
  );
};

export default VirtualItemCard;
```

- [ ] **Step 2: Rewrite VirtualItemsPage.tsx — CSS variables shell**

Replace `frontend/src/pages/Gamification/VirtualItemsPage.tsx`:

```tsx
import React, { useState } from 'react';
import { useVirtualItems, useUserVirtualItems, useLevelInfo } from '../../hooks/useGamification';
import VirtualItemCard from '../../components/gamification/VirtualItemCard';
import LevelProgress from '../../components/gamification/LevelProgress';

const VirtualItemsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'badge' | 'title' | 'frame' | 'decoration'>('badge');
  const { items, loading: itemsLoading } = useVirtualItems(activeTab);
  const { userItems, purchaseItem, equipItem, loading: userItemsLoading } = useUserVirtualItems();
  const { levelInfo } = useLevelInfo();

  const tabs = [
    { id: 'badge' as const, label: '徽章', icon: '🏅' },
    { id: 'title' as const, label: '称号', icon: '👑' },
    { id: 'frame' as const, label: '头像框', icon: '🖼️' },
    { id: 'decoration' as const, label: '装饰', icon: '✨' },
  ];

  const ownedItemIds = new Set(userItems.map((ui) => ui.itemId));
  const equippedItemIds = new Set(userItems.filter((ui) => ui.isEquipped).map((ui) => ui.itemId));

  const handlePurchase = async (itemId: string) => {
    try {
      await purchaseItem(itemId);
      alert('购买成功！');
    } catch (err: any) {
      alert(err.message || '购买失败');
    }
  };

  const handleEquip = async (itemId: string, equip: boolean) => {
    try {
      await equipItem(itemId, equip);
    } catch (err: any) {
      alert(err.message || '操作失败');
    }
  };

  const isLoading = itemsLoading || userItemsLoading;

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-secondary)', padding: '32px 0' }}>
      <div style={{ maxWidth: 1000, margin: '0 auto', padding: '0 24px' }}>
        {/* 页面标题 */}
        <div style={{ marginBottom: 32 }}>
          <h1 style={{ fontSize: 28, fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
            虚拟商店
          </h1>
          <p style={{ margin: '8px 0 0', fontSize: 14, color: 'var(--text-secondary)' }}>
            使用积分兑换徽章、称号、头像框等虚拟物品，个性化你的主页！
          </p>
        </div>

        {/* 等级信息 */}
        {levelInfo && (
          <div style={{ marginBottom: 24 }}>
            <LevelProgress levelInfo={levelInfo} size="lg" />
          </div>
        )}

        {/* Tab 切换 */}
        <div style={{ display: 'flex', gap: 4, marginBottom: 24 }}>
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6,
                padding: '12px 16px',
                border: 'none',
                borderRadius: 'var(--radius-md)',
                fontSize: 14,
                fontWeight: 500,
                cursor: 'pointer',
                background: activeTab === tab.id
                  ? 'linear-gradient(135deg, #4F46E5, #7C3AED)'
                  : 'rgba(255,255,255,0.6)',
                color: activeTab === tab.id ? 'white' : 'var(--text-secondary)',
                boxShadow: activeTab === tab.id ? '0 4px 12px rgba(124,58,237,0.2)' : 'none',
                transition: 'all 0.15s',
              }}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* 加载状态 */}
        {isLoading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: 48 }}>
            <div style={{ width: 40, height: 40, borderRadius: '50%', border: '3px solid var(--border-light)', borderTopColor: 'var(--primary-600)', animation: 'spin 0.8s linear infinite' }} />
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 16 }}>
            {items.map((item) => (
              <VirtualItemCard
                key={item.id}
                item={item}
                isOwned={ownedItemIds.has(item.id)}
                isEquipped={equippedItemIds.has(item.id)}
                onPurchase={handlePurchase}
                onEquip={handleEquip}
                userPoints={levelInfo?.totalExp || 0}
              />
            ))}
          </div>
        )}

        {items.length === 0 && !isLoading && (
          <div style={{ textAlign: 'center', padding: 48 }}>
            <p style={{ fontSize: 14, color: 'var(--text-muted)' }}>暂无可兑换的物品</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default VirtualItemsPage;
```

- [ ] **Step 3: Run tests**

```bash
cd frontend && npm test -- --testPathPattern="VirtualItem"
```

Expected: PASS

- [ ] **Step 4: Commit**

```bash
git add frontend/src/components/gamification/VirtualItemCard.tsx frontend/src/pages/Gamification/VirtualItemsPage.tsx
git commit -m "refactor: VirtualItems page & card to CSS variables hybrid style"
```

---

## Completion Checklist

After all 6 tasks complete, run full verification:

- [ ] **Frontend unit tests**
```bash
cd frontend && npm test
```
Expected: 142/142 PASS (or better)

- [ ] **TypeScript check**
```bash
cd frontend && npx tsc --noEmit
```
Expected: no errors

- [ ] **E2E tests**
```bash
npx playwright test --project=chromium
```
Expected: 74/74 PASS

- [ ] **Update PROJECT.md** — update date, test stats, add changelog entry
- [ ] **Final commit**
```bash
git add PROJECT.md
git commit -m "docs: update PROJECT.md for gamification v3 redesign completion"
```
