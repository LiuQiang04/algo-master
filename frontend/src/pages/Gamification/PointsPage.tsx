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
        <div style={{ marginBottom: 32 }}>
          <h1 style={{ fontSize: 28, fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>积分中心</h1>
          <p style={{ margin: '8px 0 0', fontSize: 14, color: 'var(--text-secondary)' }}>查看你的积分详情、等级进度和积分历史记录</p>
        </div>

        {levelLoading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: 32 }}>
            <div style={{ width: 40, height: 40, borderRadius: '50%', border: '3px solid var(--border-light)', borderTopColor: 'var(--primary-600)', animation: 'spin 0.8s linear infinite' }} />
          </div>
        ) : levelInfo ? (
          <div style={{ marginBottom: 24 }}><LevelProgress levelInfo={levelInfo} size="lg" /></div>
        ) : null}

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
