import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/client';
import { useAuthStore } from '../store/authStore';
import TimeAgo from '../components/common/TimeAgo';
import Pagination from '../components/common/Pagination';
import { Activity, MessageSquare, UserPlus, ThumbsUp, FileText } from 'lucide-react';

interface ActivityItem {
  id: string;
  type: string;
  targetId?: string;
  targetType?: string;
  metadata?: string;
  createdAt: string;
  user: { id: string; username: string; avatarUrl?: string };
}

const typeInfo: Record<string, { icon: React.ReactNode; text: (meta: any) => string; link: (item: ActivityItem) => string }> = {
  post: {
    icon: <FileText size={14} />,
    text: (meta) => `created a new post "${meta?.title || 'Untitled'}"`,
    link: (item) => `/posts/${item.targetId}`,
  },
  comment: {
    icon: <MessageSquare size={14} />,
    text: () => 'commented on a post',
    link: (item) => `/posts/${item.targetId}`,
  },
  vote: {
    icon: <ThumbsUp size={14} />,
    text: () => 'upvoted a post',
    link: (item) => `/posts/${item.targetId}`,
  },
  follow: {
    icon: <UserPlus size={14} />,
    text: () => 'followed a user',
    link: (item) => `/users/${item.targetId}`,
  },
};

export default function FeedPage() {
  const { user } = useAuthStore();
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  const fetchFeed = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/feed', { params: { page, limit: 20 } });
      setActivities(data.data);
      setTotal(data.pagination.total);
    } catch {} finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => { fetchFeed(); }, [fetchFeed]);

  if (!user) {
    return (
      <div className="container" style={{ padding: 60, textAlign: 'center' }}>
        <Activity size={48} style={{ color: 'var(--text-muted)', margin: '0 auto 16px', opacity: 0.3 }} />
        <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 8 }}>Activity Feed</h2>
        <p style={{ color: 'var(--text-secondary)' }}>
          <Link to="/login" style={{ color: 'var(--primary-600)' }}>Sign in</Link> to see activity from people you follow
        </p>
      </div>
    );
  }

  const totalPages = Math.ceil(total / 20);

  return (
    <div className="container" style={{ padding: '24px 24px', maxWidth: 700 }}>
      <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 24, display: 'flex', alignItems: 'center', gap: 8 }}>
        <Activity size={24} />
        Activity Feed
      </h1>

      {loading ? (
        <div style={{ textAlign: 'center', padding: 60, color: 'var(--text-muted)' }}>Loading...</div>
      ) : activities.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 60, color: 'var(--text-muted)' }}>
          <p style={{ fontSize: 16, marginBottom: 8 }}>No activity yet</p>
          <p style={{ fontSize: 14 }}>Follow some users to see their activity here</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
          {activities.map((item) => {
            const info = typeInfo[item.type];
            const meta = item.metadata ? JSON.parse(item.metadata) : null;
            return (
              <div key={item.id} style={{
                display: 'flex', gap: 12, padding: '14px 0',
                borderBottom: '1px solid var(--border-light)',
              }}>
                <Link to={`/users/${item.user.id}`} style={{
                  width: 36, height: 36, borderRadius: 'var(--radius-full)',
                  background: 'var(--primary-100)', display: 'flex', alignItems: 'center',
                  justifyContent: 'center', color: 'var(--primary-600)', fontWeight: 600,
                  fontSize: 14, flexShrink: 0, textDecoration: 'none',
                }}>
                  {item.user.username[0].toUpperCase()}
                </Link>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14 }}>
                    <Link to={`/users/${item.user.id}`} style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                      {item.user.username}
                    </Link>
                    <span style={{ color: 'var(--text-secondary)' }}> {info?.text(meta) || item.type}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: 'var(--text-muted)' }}>
                      {info?.icon}
                      {item.type}
                    </span>
                    <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                      <TimeAgo date={item.createdAt} />
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
    </div>
  );
}
