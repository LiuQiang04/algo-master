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
