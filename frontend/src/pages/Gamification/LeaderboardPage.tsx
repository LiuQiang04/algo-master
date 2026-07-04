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
              entries={entries}
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
