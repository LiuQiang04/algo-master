import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/client';
import TimeAgo from '../components/common/TimeAgo';
import Pagination from '../components/common/Pagination';
import { Bell, Check, CheckCheck, Settings, UserPlus, MessageSquare, ThumbsUp, AtSign, Info, MessageCircle } from 'lucide-react';

interface Notification {
  id: string;
  type: string;
  title: string;
  content: string;
  link?: string;
  isRead: boolean;
  createdAt: string;
}

const typeIcons: Record<string, React.ReactNode> = {
  follow: <UserPlus size={16} />,
  comment: <MessageSquare size={16} />,
  vote: <ThumbsUp size={16} />,
  mention: <AtSign size={16} />,
  system: <Info size={16} />,
  message: <MessageCircle size={16} />,
};

const typeColors: Record<string, string> = {
  follow: 'var(--primary-100)',
  comment: 'var(--success-100)',
  vote: 'var(--warning-100)',
  mention: 'var(--accent-100)',
  system: 'var(--gray-100)',
  message: 'var(--primary-100)',
};

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [settings, setSettings] = useState<any>(null);

  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/notifications', { params: { page, limit: 20 } });
      setNotifications(data.data);
      setTotal(data.pagination.total);
    } catch {} finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => { fetchNotifications(); }, [fetchNotifications]);

  const markAsRead = async (id: string) => {
    await api.put(`/notifications/${id}/read`);
    setNotifications((prev) => prev.map((n) => n.id === id ? { ...n, isRead: true } : n));
  };

  const markAllAsRead = async () => {
    await api.put('/notifications/read-all');
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  const fetchSettings = async () => {
    try {
      const { data } = await api.get('/notifications/settings');
      setSettings(data.data);
      setShowSettings(true);
    } catch {}
  };

  const updateSetting = async (key: string, value: boolean) => {
    try {
      await api.put('/notifications/settings', { [key]: value });
      setSettings((prev: any) => ({ ...prev, [key]: value }));
    } catch {}
  };

  const totalPages = Math.ceil(total / 20);

  return (
    <div className="container" style={{ padding: '24px 24px', maxWidth: 700 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
          <Bell size={24} />
          Notifications
        </h1>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={markAllAsRead} style={{
            display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px',
            borderRadius: 'var(--radius-md)', fontSize: 13, color: 'var(--primary-600)',
            border: '1px solid var(--primary-200)', background: 'var(--primary-50)',
          }}>
            <CheckCheck size={14} />
            Mark all read
          </button>
          <button onClick={fetchSettings} style={{
            display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px',
            borderRadius: 'var(--radius-md)', fontSize: 13, color: 'var(--text-secondary)',
            border: '1px solid var(--border-light)',
          }}>
            <Settings size={14} />
            Settings
          </button>
        </div>
      </div>

      {/* Settings Modal */}
      {showSettings && settings && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 100,
          background: 'var(--bg-overlay)', display: 'flex', alignItems: 'center', justifyContent: 'center',
        }} onClick={() => setShowSettings(false)}>
          <div onClick={(e) => e.stopPropagation()} style={{
            background: 'var(--bg-card)', borderRadius: 'var(--radius-xl)',
            padding: 24, width: 400, maxWidth: '90vw',
          }}>
            <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16 }}>Notification Settings</h2>
            {[
              { key: 'emailNotification', label: 'Email Notifications' },
              { key: 'followNotification', label: 'New Followers' },
              { key: 'commentNotification', label: 'Comments on Posts' },
              { key: 'voteNotification', label: 'Post Upvotes' },
              { key: 'messageNotification', label: 'Private Messages' },
              { key: 'systemNotification', label: 'System Announcements' },
            ].map((item) => (
              <div key={item.key} style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '10px 0', borderBottom: '1px solid var(--border-light)',
              }}>
                <span style={{ fontSize: 14 }}>{item.label}</span>
                <button
                  onClick={() => updateSetting(item.key, !settings[item.key])}
                  style={{
                    width: 44, height: 24, borderRadius: 12, position: 'relative',
                    background: settings[item.key] ? 'var(--primary-600)' : 'var(--gray-300)',
                    transition: 'var(--transition-base)',
                  }}
                >
                  <span style={{
                    position: 'absolute', top: 2, width: 20, height: 20,
                    borderRadius: 'var(--radius-full)', background: 'white',
                    left: settings[item.key] ? 22 : 2,
                    transition: 'var(--transition-base)',
                  }} />
                </button>
              </div>
            ))}
            <button onClick={() => setShowSettings(false)} style={{
              marginTop: 16, width: '100%', padding: '10px 0', borderRadius: 'var(--radius-md)',
              background: 'var(--primary-600)', color: 'white', fontSize: 14, fontWeight: 600,
            }}>Done</button>
          </div>
        </div>
      )}

      {/* Notification List */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: 60, color: 'var(--text-muted)' }}>Loading...</div>
      ) : notifications.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 60, color: 'var(--text-muted)' }}>
          <Bell size={48} style={{ opacity: 0.3, margin: '0 auto 12px' }} />
          <p style={{ fontSize: 16 }}>No notifications yet</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {notifications.map((notif) => {
            const content = (
              <div
                style={{
                  display: 'flex', gap: 12, padding: '14px 16px',
                  background: notif.isRead ? 'var(--bg-card)' : 'var(--primary-50)',
                  borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)',
                  transition: 'var(--transition-fast)', cursor: notif.link ? 'pointer' : 'default',
                }}
              >
                <div style={{
                  width: 36, height: 36, borderRadius: 'var(--radius-full)',
                  background: typeColors[notif.type] || typeColors.system,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: 'var(--text-secondary)', flexShrink: 0,
                }}>
                  {typeIcons[notif.type] || typeIcons.system}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 2 }}>
                    {notif.title}
                  </div>
                  <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{notif.content}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>
                    <TimeAgo date={notif.createdAt} />
                  </div>
                </div>
                {!notif.isRead && (
                  <button onClick={(e) => { e.preventDefault(); markAsRead(notif.id); }} style={{
                    display: 'flex', alignItems: 'center', gap: 4, padding: '4px 8px',
                    borderRadius: 'var(--radius-sm)', fontSize: 11, color: 'var(--primary-600)',
                  }}>
                    <Check size={12} />
                    Read
                  </button>
                )}
              </div>
            );

            return notif.link ? (
              <Link key={notif.id} to={notif.link} style={{ textDecoration: 'none', color: 'inherit' }}>
                {content}
              </Link>
            ) : (
              <div key={notif.id}>{content}</div>
            );
          })}
        </div>
      )}

      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
    </div>
  );
}
