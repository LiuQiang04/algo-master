import React from 'react';
import type { PointHistory } from '../../types/gamification';

interface PointHistoryListProps {
  history: PointHistory[];
  showLoadMore?: boolean;
  onLoadMore?: () => void;
}

const typeIcons: Record<string, string> = {
  solve: '✅', contest: '🏆', daily: '📅', achievement: '🏅',
  bonus: '🎁', login: '🔑', login_streak: '🔥', purchase: '🛒',
};

const PointHistoryList: React.FC<PointHistoryListProps> = ({ history, showLoadMore = false, onLoadMore }) => {
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div style={{ background: 'rgba(255,255,255,0.7)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.4)', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-sm)', overflow: 'hidden' }}>
      <div style={{ padding: '14px 20px', borderBottom: '1px solid rgba(255,255,255,0.3)' }}>
        <h3 style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>积分历史</h3>
      </div>
      <div>
        {history.map((record) => {
          const icon = typeIcons[record.type] || '📌';
          const isPositive = record.points > 0;
          return (
            <div key={record.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 20px', minHeight: 56, borderBottom: '1px solid rgba(255,255,255,0.15)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{ fontSize: 20 }}>{icon}</span>
                <div>
                  <p style={{ fontSize: 14, fontWeight: 500, color: 'var(--text-primary)', margin: 0 }}>{record.description || '积分变动'}</p>
                  <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: '2px 0 0' }}>{formatDate(record.createdAt)}</p>
                </div>
              </div>
              <span style={{ fontSize: 16, fontWeight: 600, color: isPositive ? '#059669' : '#DC2626' }}>
                {isPositive ? '+' : ''}{record.points}
              </span>
            </div>
          );
        })}
      </div>
      {history.length === 0 && (
        <div style={{ textAlign: 'center', padding: 48, fontSize: 14, color: 'var(--text-muted)' }}>暂无积分记录</div>
      )}
      {showLoadMore && (
        <button onClick={onLoadMore} style={{ width: '100%', padding: '12px 0', fontSize: 14, fontWeight: 500, color: 'var(--primary-600)', background: 'transparent', border: 'none', cursor: 'pointer', borderTop: '1px solid rgba(255,255,255,0.15)' }}>
          加载更多
        </button>
      )}
    </div>
  );
};

export default PointHistoryList;
