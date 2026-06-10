import { useState, useEffect, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import api from '../api/client';
import { useAuthStore } from '../store/authStore';
import TimeAgo from '../components/common/TimeAgo';
import Pagination from '../components/common/Pagination';
import { MessageSquare, Eye, Pin, Lock, Plus, Filter, TrendingUp, Clock, Search } from 'lucide-react';

interface Post {
  id: string;
  title: string;
  content: string;
  postType: string;
  upvotes: number;
  downvotes: number;
  viewCount: number;
  isPinned: boolean;
  isLocked: boolean;
  createdAt: string;
  user: { id: string; username: string; avatarUrl?: string };
  tags: { tag: { id: string; name: string } }[];
  _count: { comments: number };
}

interface Tag {
  id: string;
  name: string;
  _count: { posts: number };
}

export default function CommunityPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [posts, setPosts] = useState<Post[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const { user } = useAuthStore();

  const page = parseInt(searchParams.get('page') || '1');
  const postType = searchParams.get('type') || '';
  const tag = searchParams.get('tag') || '';
  const search = searchParams.get('search') || '';
  const sortBy = searchParams.get('sort') || 'createdAt';

  const fetchPosts = useCallback(async () => {
    setLoading(true);
    try {
      const params: any = { page, limit: 20 };
      if (postType) params.postType = postType;
      if (tag) params.tag = tag;
      if (search) params.search = search;
      params.sortBy = sortBy;
      const { data } = await api.get('/posts', { params });
      // 后端返回格式: { success: true, data: { posts: [...], total, page, totalPages } }
      const result = data.data;
      setPosts(result.posts || []);
      setTotal(result.total || 0);
    } catch (err) {
      console.error('Failed to fetch posts', err);
    } finally {
      setLoading(false);
    }
  }, [page, postType, tag, search, sortBy]);

  useEffect(() => { fetchPosts(); }, [fetchPosts]);

  useEffect(() => {
    api.get('/posts/tags').then(({ data }) => setTags(data.data)).catch(() => {});
  }, []);

  const updateParam = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams);
    if (value) params.set(key, value);
    else params.delete(key);
    params.set('page', '1');
    setSearchParams(params);
  };

  const postTypeTabs = [
    { value: '', label: 'All' },
    { value: 'discussion', label: 'Discussions' },
    { value: 'solution', label: 'Solutions' },
    { value: 'question', label: 'Questions' },
  ];

  const sortOptions = [
    { value: 'createdAt', label: 'Latest', icon: <Clock size={14} /> },
    { value: 'upvotes', label: 'Top', icon: <TrendingUp size={14} /> },
  ];

  const totalPages = Math.ceil(total / 20);

  return (
    <div className="container" style={{ padding: '24px 24px', maxWidth: 1100 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 700, color: 'var(--text-primary)' }}>Community</h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: 4 }}>Discuss algorithms, share solutions, and learn together</p>
        </div>
        {user && (
          <Link to="/community/new" style={{
            display: 'flex', alignItems: 'center', gap: 8, padding: '10px 20px',
            borderRadius: 'var(--radius-lg)', background: 'var(--primary-600)',
            color: 'white', fontWeight: 600, fontSize: 14, transition: 'var(--transition-fast)',
          }}>
            <Plus size={18} />
            New Post
          </Link>
        )}
      </div>

      <div style={{ display: 'flex', gap: 24 }}>
        {/* Sidebar */}
        <aside style={{ width: 240, flexShrink: 0 }} className="hidden lg:block">
          {/* Filters */}
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-lg)', padding: 16, marginBottom: 16 }}>
            <h3 style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
              <Filter size={14} />
              Post Type
            </h3>
            {postTypeTabs.map((t) => (
              <button
                key={t.value}
                onClick={() => updateParam('type', t.value)}
                style={{
                  display: 'block', width: '100%', textAlign: 'left', padding: '8px 12px',
                  borderRadius: 'var(--radius-md)', fontSize: 14, marginBottom: 4,
                  color: postType === t.value ? 'var(--primary-700)' : 'var(--text-primary)',
                  background: postType === t.value ? 'var(--primary-50)' : 'transparent',
                  fontWeight: postType === t.value ? 600 : 400,
                  transition: 'var(--transition-fast)',
                }}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Tags */}
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-lg)', padding: 16 }}>
            <h3 style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 12 }}>Popular Tags</h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {tags.slice(0, 20).map((t) => (
                <button
                  key={t.id}
                  onClick={() => updateParam('tag', tag === t.name ? '' : t.name)}
                  style={{
                    padding: '4px 10px', borderRadius: 'var(--radius-full)', fontSize: 12,
                    border: '1px solid var(--border-light)',
                    color: tag === t.name ? 'white' : 'var(--text-secondary)',
                    background: tag === t.name ? 'var(--primary-600)' : 'var(--bg-secondary)',
                    transition: 'var(--transition-fast)',
                  }}
                >
                  {t.name}
                </button>
              ))}
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <div style={{ flex: 1, minWidth: 0 }}>
          {/* Sort & Search */}
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            marginBottom: 16, gap: 12, flexWrap: 'wrap',
          }}>
            <div style={{ display: 'flex', gap: 4 }}>
              {sortOptions.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => updateParam('sort', opt.value)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 4, padding: '6px 14px',
                    borderRadius: 'var(--radius-full)', fontSize: 13, fontWeight: 500,
                    color: sortBy === opt.value ? 'white' : 'var(--text-secondary)',
                    background: sortBy === opt.value ? 'var(--primary-600)' : 'var(--bg-secondary)',
                    border: '1px solid var(--border-light)',
                    transition: 'var(--transition-fast)',
                  }}
                >
                  {opt.icon}
                  {opt.label}
                </button>
              ))}
            </div>
            {search && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                  <Search size={14} style={{ display: 'inline', verticalAlign: -2 }} /> Searching: "{search}"
                </span>
                <button onClick={() => updateParam('search', '')} style={{ fontSize: 13, color: 'var(--primary-600)' }}>Clear</button>
              </div>
            )}
          </div>

          {/* Post List */}
          {loading ? (
            <div style={{ textAlign: 'center', padding: 60, color: 'var(--text-muted)' }}>Loading...</div>
          ) : posts.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 60, color: 'var(--text-muted)' }}>
              <p style={{ fontSize: 18, marginBottom: 8 }}>No posts found</p>
              <p style={{ fontSize: 14 }}>Be the first to start a discussion!</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {posts.map((post) => (
                <PostCard key={post.id} post={post} />
              ))}
            </div>
          )}

          <Pagination page={page} totalPages={totalPages} onPageChange={(p) => updateParam('page', String(p))} />
        </div>
      </div>
    </div>
  );
}

function PostCard({ post }: { post: Post }) {
  const typeColors: Record<string, string> = {
    discussion: 'var(--primary-100)',
    solution: 'var(--success-100)',
    question: 'var(--warning-100)',
  };
  const typeTextColors: Record<string, string> = {
    discussion: 'var(--primary-700)',
    solution: 'var(--success-700)',
    question: 'var(--warning-700)',
  };

  return (
    <Link to={`/posts/${post.id}`} style={{
      display: 'flex', gap: 16, padding: 16,
      background: 'var(--bg-card)', border: '1px solid var(--border-light)',
      borderRadius: 'var(--radius-lg)', textDecoration: 'none',
      color: 'var(--text-primary)', transition: 'var(--transition-fast)',
    }}>
      {/* Vote Score */}
      <div style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        minWidth: 48, padding: '8px 0',
      }}>
        <span style={{
          fontSize: 18, fontWeight: 700,
          color: post.upvotes - post.downvotes > 0 ? 'var(--success-600)' : 'var(--text-secondary)',
        }}>
          {post.upvotes - post.downvotes}
        </span>
        <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>votes</span>
      </div>

      {/* Content */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
          {post.isPinned && <Pin size={14} style={{ color: 'var(--warning-500)' }} />}
          {post.isLocked && <Lock size={14} style={{ color: 'var(--text-muted)' }} />}
          <span style={{
            padding: '2px 8px', borderRadius: 'var(--radius-full)', fontSize: 11, fontWeight: 600,
            background: typeColors[post.postType] || typeColors.discussion,
            color: typeTextColors[post.postType] || typeTextColors.discussion,
          }}>
            {post.postType}
          </span>
          <h3 style={{
            fontSize: 16, fontWeight: 600, overflow: 'hidden',
            textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          }}>
            {post.title}
          </h3>
        </div>

        <p style={{
          fontSize: 13, color: 'var(--text-secondary)', marginBottom: 8,
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        }}>
          {post.content.slice(0, 150)}
        </p>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: 'var(--text-muted)' }}>
            <div style={{
              width: 20, height: 20, borderRadius: 'var(--radius-full)',
              background: 'var(--primary-100)', display: 'flex', alignItems: 'center',
              justifyContent: 'center', fontSize: 10, color: 'var(--primary-600)', fontWeight: 600,
            }}>
              {post.user.username[0].toUpperCase()}
            </div>
            <span>{post.user.username}</span>
          </div>
          <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
            <TimeAgo date={post.createdAt} />
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: 'var(--text-muted)' }}>
            <MessageSquare size={12} />
            {post._count.comments}
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: 'var(--text-muted)' }}>
            <Eye size={12} />
            {post.viewCount}
          </span>
          {post.tags && post.tags.length > 0 && (
            <div style={{ display: 'flex', gap: 4 }}>
              {post.tags.slice(0, 3).map(({ tag }) => (
                <span key={tag.id} style={{
                  padding: '1px 8px', borderRadius: 'var(--radius-full)', fontSize: 11,
                  background: 'var(--bg-tertiary)', color: 'var(--text-secondary)',
                }}>
                  {tag.name}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
