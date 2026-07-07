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
        <div style={{ marginBottom: 32 }}>
          <h1 style={{ fontSize: 28, fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
            成就系统
          </h1>
          <p style={{ margin: '8px 0 0', fontSize: 14, color: 'var(--text-secondary)' }}>
            完成各种挑战，解锁成就徽章，展示你的实力！
          </p>
        </div>

        {stats && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 32 }}>
            <div style={{ background: 'linear-gradient(135deg, #2563EB, #1D4ED8)', borderRadius: 'var(--radius-lg)', padding: 24, boxShadow: 'var(--shadow-md)', color: 'white' }}>
              <p style={{ fontSize: 13, opacity: 0.8, margin: 0 }}>已解锁</p>
              <p style={{ fontSize: 36, fontWeight: 700, margin: '8px 0 0' }}>{stats.unlocked}</p>
            </div>
            <div style={{ background: 'linear-gradient(135deg, #7C3AED, #6D28D9)', borderRadius: 'var(--radius-lg)', padding: 24, boxShadow: 'var(--shadow-md)', color: 'white' }}>
              <p style={{ fontSize: 13, opacity: 0.8, margin: 0 }}>总成就数</p>
              <p style={{ fontSize: 36, fontWeight: 700, margin: '8px 0 0' }}>{stats.total}</p>
            </div>
            <div style={{ background: 'linear-gradient(135deg, #059669, #047857)', borderRadius: 'var(--radius-lg)', padding: 24, boxShadow: 'var(--shadow-md)', color: 'white' }}>
              <p style={{ fontSize: 13, opacity: 0.8, margin: 0 }}>完成度</p>
              <p style={{ fontSize: 36, fontWeight: 700, margin: '8px 0' }}>{stats.percentage}%</p>
              <div style={{ width: '100%', background: 'rgba(255,255,255,0.3)', borderRadius: 'var(--radius-full)', height: 8, overflow: 'hidden' }}>
                <div style={{ height: '100%', background: 'white', borderRadius: 'var(--radius-full)', transition: 'width 0.5s', width: `${stats.percentage}%` }} />
              </div>
            </div>
          </div>
        )}

        {loading && (
          <div style={{ display: 'flex', justifyContent: 'center', padding: 48 }}>
            <div style={{ width: 40, height: 40, borderRadius: '50%', border: '3px solid var(--border-light)', borderTopColor: 'var(--primary-600)', animation: 'spin 0.8s linear infinite' }} />
          </div>
        )}

        {error && !loading && (
          <div style={{ padding: '12px 16px', borderRadius: 'var(--radius-md)', background: 'var(--danger-50)', color: 'var(--danger-700)', border: '1px solid var(--danger-200)', marginBottom: 24, fontSize: 14 }}>
            {error}
          </div>
        )}

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
                    background: filter === category.id ? 'linear-gradient(135deg, var(--primary-500), var(--primary-700))' : 'rgba(255,255,255,0.6)',
                    color: filter === category.id ? 'white' : 'var(--text-secondary)',
                    cursor: 'pointer',
                    transition: 'all 0.15s',
                  }}
                >
                  {category.label}
                </button>
              ))}
            </div>

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
