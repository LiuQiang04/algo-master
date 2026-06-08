import { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../api/client';
import { useAuthStore } from '../store/authStore';
import TimeAgo from '../components/common/TimeAgo';
import { UserPlus, UserMinus, MessageCircle, Star, Calendar, MessageSquare } from 'lucide-react';

interface UserProfile {
  id: string;
  username: string;
  avatarUrl?: string;
  bio?: string;
  rating: number;
  level: number;
  createdAt: string;
  isFollowing: boolean;
  _count: { posts: number; comments: number; followers: number; following: number };
}

interface Post {
  id: string;
  title: string;
  postType: string;
  upvotes: number;
  downvotes: number;
  createdAt: string;
  _count: { comments: number };
}

export default function UserProfilePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user: currentUser } = useAuthStore();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [activeTab, setActiveTab] = useState<'posts' | 'followers' | 'following'>('posts');
  const [followers, setFollowers] = useState<any[]>([]);
  const [following, setFollowing] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchProfile = useCallback(async () => {
    try {
      const { data } = await api.get(`/users/${id}`);
      setProfile(data.data);
    } catch {
      navigate('/community');
    }
  }, [id]);

  const fetchPosts = useCallback(async () => {
    try {
      const { data } = await api.get(`/users/${id}/posts`, { params: { limit: 20 } });
      setPosts(data.data);
    } catch {}
  }, [id]);

  useEffect(() => {
    setLoading(true);
    Promise.all([fetchProfile(), fetchPosts()]).finally(() => setLoading(false));
  }, [fetchProfile, fetchPosts]);

  const handleFollow = async () => {
    if (!currentUser) { navigate('/login'); return; }
    try {
      const { data } = await api.post(`/users/${id}/follow`);
      setProfile((prev) => prev ? { ...prev, isFollowing: data.data.isFollowing, _count: { ...prev._count, followers: prev._count.followers + (data.data.isFollowing ? 1 : -1) } } : prev);
    } catch {}
  };

  const fetchFollowers = async () => {
    setActiveTab('followers');
    if (followers.length > 0) return;
    try {
      const { data } = await api.get(`/users/${id}/followers`);
      setFollowers(data.data);
    } catch {}
  };

  const fetchFollowing = async () => {
    setActiveTab('following');
    if (following.length > 0) return;
    try {
      const { data } = await api.get(`/users/${id}/following`);
      setFollowing(data.data);
    } catch {}
  };

  if (loading) return <div className="container" style={{ padding: 60, textAlign: 'center', color: 'var(--text-muted)' }}>Loading...</div>;
  if (!profile) return null;

  const isOwnProfile = currentUser?.id === profile.id;

  return (
    <div className="container" style={{ padding: '24px 24px', maxWidth: 900 }}>
      {/* Profile Header */}
      <div style={{
        background: 'var(--bg-card)', border: '1px solid var(--border-light)',
        borderRadius: 'var(--radius-xl)', padding: 32, marginBottom: 24,
      }}>
        <div style={{ display: 'flex', gap: 24, alignItems: 'flex-start', flexWrap: 'wrap' }}>
          {/* Avatar */}
          <div style={{
            width: 96, height: 96, borderRadius: 'var(--radius-full)',
            background: 'linear-gradient(135deg, var(--primary-400), var(--accent-400))',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'white', fontSize: 36, fontWeight: 700, flexShrink: 0,
          }}>
            {profile.avatarUrl ? (
              <img src={profile.avatarUrl} alt="" style={{ width: '100%', height: '100%', borderRadius: 'var(--radius-full)', objectFit: 'cover' }} />
            ) : profile.username[0].toUpperCase()}
          </div>

          {/* Info */}
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8, flexWrap: 'wrap' }}>
              <h1 style={{ fontSize: 28, fontWeight: 700 }}>{profile.username}</h1>
              <span style={{
                padding: '3px 12px', borderRadius: 'var(--radius-full)', fontSize: 12, fontWeight: 600,
                background: 'var(--primary-50)', color: 'var(--primary-700)',
              }}>Level {profile.level}</span>
              <span style={{
                display: 'flex', alignItems: 'center', gap: 4, padding: '3px 12px',
                borderRadius: 'var(--radius-full)', fontSize: 12, fontWeight: 600,
                background: 'var(--warning-50)', color: 'var(--warning-700)',
              }}>
                <Star size={12} />
                {profile.rating} Rating
              </span>
            </div>
            {profile.bio && <p style={{ color: 'var(--text-secondary)', marginBottom: 12, fontSize: 15 }}>{profile.bio}</p>}
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, fontSize: 13, color: 'var(--text-muted)' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <Calendar size={14} />
                Joined <TimeAgo date={profile.createdAt} />
              </span>
            </div>
          </div>

          {/* Actions */}
          {!isOwnProfile && currentUser && (
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={handleFollow} style={{
                display: 'flex', alignItems: 'center', gap: 6, padding: '8px 20px',
                borderRadius: 'var(--radius-md)', fontSize: 14, fontWeight: 600,
                background: profile.isFollowing ? 'var(--bg-secondary)' : 'var(--primary-600)',
                color: profile.isFollowing ? 'var(--text-primary)' : 'white',
                border: profile.isFollowing ? '1px solid var(--border-default)' : 'none',
              }}>
                {profile.isFollowing ? <UserMinus size={16} /> : <UserPlus size={16} />}
                {profile.isFollowing ? 'Unfollow' : 'Follow'}
              </button>
              <Link to={`/messages?user=${profile.id}`} style={{
                display: 'flex', alignItems: 'center', gap: 6, padding: '8px 20px',
                borderRadius: 'var(--radius-md)', fontSize: 14, fontWeight: 500,
                border: '1px solid var(--border-default)', color: 'var(--text-primary)',
              }}>
                <MessageCircle size={16} />
                Message
              </Link>
            </div>
          )}
        </div>

        {/* Stats */}
        <div style={{ display: 'flex', gap: 32, marginTop: 24, paddingTop: 20, borderTop: '1px solid var(--border-light)' }}>
          <StatItem label="Posts" value={profile._count.posts} />
          <StatItem label="Comments" value={profile._count.comments} />
          <button onClick={fetchFollowers} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
            <StatItem label="Followers" value={profile._count.followers} active={activeTab === 'followers'} />
          </button>
          <button onClick={fetchFollowing} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
            <StatItem label="Following" value={profile._count.following} active={activeTab === 'following'} />
          </button>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'posts' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}>Posts</h2>
          {posts.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', padding: 24, textAlign: 'center' }}>No posts yet</p>
          ) : posts.map((post) => (
            <Link key={post.id} to={`/posts/${post.id}`} style={{
              display: 'flex', alignItems: 'center', gap: 16, padding: '12px 16px',
              background: 'var(--bg-card)', border: '1px solid var(--border-light)',
              borderRadius: 'var(--radius-md)', textDecoration: 'none', color: 'var(--text-primary)',
            }}>
              <span style={{
                fontSize: 14, fontWeight: 600, color: post.upvotes - post.downvotes > 0 ? 'var(--success-600)' : 'var(--text-secondary)',
                minWidth: 40, textAlign: 'center',
              }}>
                {post.upvotes - post.downvotes}
              </span>
              <span style={{ flex: 1, fontSize: 14, fontWeight: 500 }}>{post.title}</span>
              <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                <MessageSquare size={12} style={{ display: 'inline', verticalAlign: -2 }} /> {post._count.comments}
              </span>
              <span style={{ fontSize: 12, color: 'var(--text-muted)' }}><TimeAgo date={post.createdAt} /></span>
            </Link>
          ))}
        </div>
      )}

      {activeTab === 'followers' && (
        <UserList users={followers} title="Followers" />
      )}

      {activeTab === 'following' && (
        <UserList users={following} title="Following" />
      )}
    </div>
  );
}

function StatItem({ label, value, active }: { label: string; value: number; active?: boolean }) {
  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{ fontSize: 22, fontWeight: 700, color: active ? 'var(--primary-600)' : 'var(--text-primary)' }}>{value}</div>
      <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>{label}</div>
    </div>
  );
}

function UserList({ users, title }: { users: any[]; title: string }) {
  return (
    <div>
      <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}>{title}</h2>
      {users.length === 0 ? (
        <p style={{ color: 'var(--text-muted)', padding: 24, textAlign: 'center' }}>No {title.toLowerCase()} yet</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {users.map((u: any) => (
            <Link key={u.id} to={`/users/${u.id}`} style={{
              display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px',
              background: 'var(--bg-card)', border: '1px solid var(--border-light)',
              borderRadius: 'var(--radius-md)', textDecoration: 'none', color: 'var(--text-primary)',
            }}>
              <div style={{
                width: 36, height: 36, borderRadius: 'var(--radius-full)',
                background: 'var(--primary-100)', display: 'flex', alignItems: 'center',
                justifyContent: 'center', color: 'var(--primary-600)', fontWeight: 600, fontSize: 14,
              }}>
                {u.username[0].toUpperCase()}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 600 }}>{u.username}</div>
                {u.bio && <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{u.bio.slice(0, 80)}</div>}
              </div>
              <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Level {u.level}</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
