import React from 'react';
import type { LeaderboardEntry } from '../../types/gamification';

interface LeaderboardTableProps {
  entries: LeaderboardEntry[];
  currentUserId?: string;
  showFriendIndicator?: boolean;
}

const LeaderboardTable: React.FC<LeaderboardTableProps> = ({
  entries,
  currentUserId,
  showFriendIndicator = false,
}) => {
  const getRankBadge = (rank: number) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return `#${rank}`;
  };

  if (entries.length === 0) {
    return (
      <div
        style={{
          background: 'var(--bg-card)',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border-light)',
          padding: 48,
          textAlign: 'center',
        }}
      >
        <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>暂无数据</p>
      </div>
    );
  }

  return (
    <div
      style={{
        background: 'var(--bg-card)',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--border-light)',
        overflow: 'hidden',
      }}
    >
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr
            style={{
              background: 'var(--bg-secondary)',
              borderBottom: '1px solid var(--border-light)',
            }}
          >
            {['排名', '用户', '等级', '经验值', '评分'].map((h) => (
              <th
                key={h}
                style={{
                  padding: '12px 16px',
                  textAlign: 'left',
                  fontSize: 12,
                  fontWeight: 600,
                  color: 'var(--text-muted)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                }}
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody style={{ fontSize: 14 }}>
          {entries.map((entry, idx) => {
            const isCurrentUser = entry.id === currentUserId;
            return (
              <tr
                key={entry.id}
                style={{
                  borderBottom: idx < entries.length - 1 ? '1px solid var(--border-light)' : 'none',
                  background: isCurrentUser ? 'var(--primary-50, #EFF6FF)' : 'transparent',
                  outline: isCurrentUser ? '2px solid var(--primary-600)' : 'none',
                  outlineOffset: -2,
                  transition: 'background 0.15s',
                }}
                onMouseEnter={(e) => { if (!isCurrentUser) e.currentTarget.style.background = 'var(--hover-bg, #F9FAFB)'; }}
                onMouseLeave={(e) => { if (!isCurrentUser) e.currentTarget.style.background = 'transparent'; }}
              >
                <td style={{ padding: '12px 16px', whiteSpace: 'nowrap' }}>
                  <span style={{ fontSize: 18 }}>{getRankBadge(entry.rank)}</span>
                </td>
                <td style={{ padding: '12px 16px', whiteSpace: 'nowrap' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, var(--primary-500), var(--accent, #7C3AED))',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}
                    >
                      {entry.avatarUrl ? (
                        <img
                          src={entry.avatarUrl}
                          alt={entry.username}
                          style={{ width: 32, height: 32, borderRadius: '50%' }}
                        />
                      ) : (
                        <span style={{ color: 'white', fontSize: 13, fontWeight: 600 }}>
                          {entry.username.charAt(0).toUpperCase()}
                        </span>
                      )}
                    </div>
                    <div>
                      <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>
                        {entry.username}
                        {isCurrentUser && (
                          <span style={{ marginLeft: 6, fontSize: 12, color: 'var(--primary-600)' }}>(你)</span>
                        )}
                        {showFriendIndicator && entry.isFriend && (
                          <span style={{ marginLeft: 6, fontSize: 12, color: 'var(--success, #059669)' }}>好友</span>
                        )}
                      </span>
                      {entry.title && (
                        <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>{entry.title}</div>
                      )}
                    </div>
                  </div>
                </td>
                <td style={{ padding: '12px 16px', whiteSpace: 'nowrap' }}>
                  <span
                    style={{
                      display: 'inline-block',
                      padding: '2px 10px',
                      borderRadius: 'var(--radius-full, 999px)',
                      fontSize: 12,
                      fontWeight: 600,
                      background: 'var(--primary-100)',
                      color: 'var(--primary-700)',
                    }}
                  >
                    Lv.{entry.level}
                  </span>
                </td>
                <td style={{ padding: '12px 16px', whiteSpace: 'nowrap', color: 'var(--text-primary)' }}>
                  {entry.experiencePoints.toLocaleString()}
                </td>
                <td style={{ padding: '12px 16px', whiteSpace: 'nowrap', color: 'var(--text-primary)' }}>
                  {entry.rating}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default LeaderboardTable;
