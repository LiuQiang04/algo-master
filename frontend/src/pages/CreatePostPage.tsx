import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../api/client';
import { useAuthStore } from '../store/authStore';
import { ArrowLeft, Send, Tag as TagIcon, X } from 'lucide-react';
import MarkdownRenderer from '../components/common/MarkdownRenderer';

export default function CreatePostPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditMode = Boolean(id);
  const { user } = useAuthStore();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [postType, setPostType] = useState('discussion');
  const [tagInput, setTagInput] = useState('');
  const [tagNames, setTagNames] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [loadingPost, setLoadingPost] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    if (!isEditMode || !id) return;
    setLoadingPost(true);
    api.get(`/posts/${id}`)
      .then(({ data }) => {
        const post = data.data || data;
        setTitle(post.title || '');
        setContent(post.content || '');
        setPostType(post.postType || 'discussion');
        if (post.tags) {
          setTagNames(post.tags.map((t: any) => t.tag?.name || t.name).filter(Boolean));
        }
      })
      .catch(() => {
        setError('Failed to load post');
        navigate('/community');
      })
      .finally(() => setLoadingPost(false));
  }, [id, isEditMode, navigate]);

  if (!user) {
    navigate('/login');
    return null;
  }

  if (loadingPost) {
    return (
      <div className="container" style={{ padding: '24px 24px', maxWidth: 800 }}>
        <div style={{ textAlign: 'center', padding: 60, color: 'var(--text-muted)' }}>Loading post...</div>
      </div>
    );
  }

  const addTag = () => {
    const tag = tagInput.trim().toLowerCase();
    if (tag && !tagNames.includes(tag) && tagNames.length < 10) {
      setTagNames([...tagNames, tag]);
      setTagInput('');
    }
  };

  const removeTag = (tag: string) => {
    setTagNames(tagNames.filter((t) => t !== tag));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      setError('Title and content are required');
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      if (isEditMode && id) {
        await api.put(`/posts/${id}`, { title, content });
        navigate(`/posts/${id}`);
      } else {
        const { data } = await api.post('/posts', { title, content, postType, tagNames });
        navigate(`/posts/${data.data.id}`);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save post');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container" style={{ padding: '24px 24px', maxWidth: 800 }}>
      <button onClick={() => navigate(-1)} style={{
        display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text-secondary)',
        fontSize: 14, marginBottom: 16,
      }}>
        <ArrowLeft size={16} />
        Back
      </button>

      <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 24 }}>{isEditMode ? 'Edit Post' : 'Create New Post'}</h1>

      {error && (
        <div style={{
          padding: '12px 16px', borderRadius: 'var(--radius-md)',
          background: 'var(--danger-50)', color: 'var(--danger-700)',
          border: '1px solid var(--danger-200)', marginBottom: 16, fontSize: 14,
        }}>{error}</div>
      )}

      <form onSubmit={handleSubmit}>
        {/* Post Type */}
        <div style={{ marginBottom: 20 }}>
          <label style={{ display: 'block', fontSize: 14, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 8 }}>
            Post Type
          </label>
          {isEditMode ? (
            <div style={{
              padding: '12px 16px', borderRadius: 'var(--radius-md)',
              background: 'var(--bg-secondary)', fontSize: 14,
              color: 'var(--text-secondary)',
            }}>
              Post Type: <strong style={{ color: 'var(--text-primary)' }}>{postType}</strong>
              {' '}(cannot be changed after creation)
            </div>
          ) : (
            <div style={{ display: 'flex', gap: 8 }}>
              {[
                { value: 'discussion', label: 'Discussion', desc: 'General topic' },
                { value: 'solution', label: 'Solution', desc: 'Share your solution' },
                { value: 'question', label: 'Question', desc: 'Ask for help' },
              ].map((t) => (
                <button
                  key={t.value}
                  type="button"
                  onClick={() => setPostType(t.value)}
                  style={{
                    flex: 1, padding: '12px 16px', borderRadius: 'var(--radius-md)',
                    border: `2px solid ${postType === t.value ? 'var(--primary-500)' : 'var(--border-light)'}`,
                    background: postType === t.value ? 'var(--primary-50)' : 'var(--bg-card)',
                    textAlign: 'left', transition: 'var(--transition-fast)',
                  }}
                >
                  <div style={{ fontSize: 14, fontWeight: 600, color: postType === t.value ? 'var(--primary-700)' : 'var(--text-primary)' }}>
                    {t.label}
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>{t.desc}</div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Title */}
        <div style={{ marginBottom: 20 }}>
          <label style={{ display: 'block', fontSize: 14, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 8 }}>
            Title
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter a descriptive title..."
            maxLength={200}
            style={{
              width: '100%', padding: '12px 16px', borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-light)', background: 'var(--bg-card)',
              color: 'var(--text-primary)', fontSize: 16, outline: 'none',
            }}
          />
        </div>

        {/* Content (Markdown supported) */}
        <div style={{ marginBottom: 20 }}>
          <label style={{ display: 'block', fontSize: 14, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 8 }}>
            Content (Markdown supported)
          </label>
          <div style={{ display: 'flex', gap: 0, marginBottom: 0, border: '1px solid var(--border-light)', borderRadius: 'var(--radius-md) var(--radius-md) 0 0', overflow: 'hidden' }}>
            <button
              type="button"
              onClick={() => setShowPreview(false)}
              style={{
                flex: 1, padding: '8px 16px', fontSize: 13, fontWeight: 500,
                background: !showPreview ? 'var(--bg-card)' : 'var(--bg-secondary)',
                color: !showPreview ? 'var(--text-primary)' : 'var(--text-muted)',
                borderBottom: !showPreview ? '2px solid var(--primary-500)' : '2px solid transparent',
                transition: 'var(--transition-fast)',
              }}
            >
              Write
            </button>
            <button
              type="button"
              onClick={() => setShowPreview(true)}
              style={{
                flex: 1, padding: '8px 16px', fontSize: 13, fontWeight: 500,
                background: showPreview ? 'var(--bg-card)' : 'var(--bg-secondary)',
                color: showPreview ? 'var(--text-primary)' : 'var(--text-muted)',
                borderBottom: showPreview ? '2px solid var(--primary-500)' : '2px solid transparent',
                transition: 'var(--transition-fast)',
              }}
            >
              Preview
            </button>
          </div>
          {showPreview ? (
            <div style={{
              padding: '16px', minHeight: 320, borderRadius: '0 0 var(--radius-md) var(--radius-md)',
              border: '1px solid var(--border-light)', borderTop: 'none',
              background: 'var(--bg-card)', color: 'var(--text-primary)',
              overflow: 'auto', lineHeight: 1.8, fontSize: 15,
            }}>
              {content.trim() ? (
                <MarkdownRenderer content={content} />
              ) : (
                <p style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>Nothing to preview</p>
              )}
            </div>
          ) : (
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Write your post content here... You can use Markdown syntax."
              rows={16}
              style={{
                width: '100%', padding: '16px', borderRadius: '0 0 var(--radius-md) var(--radius-md)',
                border: '1px solid var(--border-light)', borderTop: 'none',
                background: 'var(--bg-card)', color: 'var(--text-primary)', fontSize: 14,
                outline: 'none', fontFamily: 'var(--font-mono)', lineHeight: 1.6,
                resize: 'vertical',
              }}
            />
          )}
        </div>

        {/* Tags */}
        <div style={{ marginBottom: 24 }}>
          <label style={{ display: 'block', fontSize: 14, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 8 }}>
            <TagIcon size={14} style={{ display: 'inline', verticalAlign: -2 }} /> Tags (up to 10)
          </label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 8 }}>
            {tagNames.map((tag) => (
              <span key={tag} style={{
                display: 'flex', alignItems: 'center', gap: 4, padding: '4px 10px',
                borderRadius: 'var(--radius-full)', fontSize: 13,
                background: 'var(--primary-100)', color: 'var(--primary-700)',
              }}>
                {tag}
                <button type="button" onClick={() => removeTag(tag)} style={{ display: 'flex', color: 'var(--primary-500)' }}>
                  <X size={14} />
                </button>
              </span>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <input
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addTag(); } }}
              placeholder="Add a tag..."
              style={{
                flex: 1, padding: '8px 12px', borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-light)', background: 'var(--bg-card)',
                color: 'var(--text-primary)', fontSize: 14, outline: 'none',
              }}
            />
            <button type="button" onClick={addTag} style={{
              padding: '8px 16px', borderRadius: 'var(--radius-md)',
              background: 'var(--bg-secondary)', border: '1px solid var(--border-light)',
              fontSize: 14, color: 'var(--text-primary)',
            }}>Add</button>
          </div>
        </div>

        {/* Submit */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
          <button type="button" onClick={() => navigate(-1)} style={{
            padding: '10px 24px', borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-light)', fontSize: 14, color: 'var(--text-primary)',
          }}>Cancel</button>
          <button type="submit" disabled={submitting} style={{
            display: 'flex', alignItems: 'center', gap: 8, padding: '10px 24px',
            borderRadius: 'var(--radius-md)', background: 'var(--primary-600)',
            color: 'white', fontSize: 14, fontWeight: 600, opacity: submitting ? 0.7 : 1,
          }}>
            <Send size={16} />
            {submitting ? 'Saving...' : (isEditMode ? 'Save Changes' : 'Publish')}
          </button>
        </div>
      </form>
    </div>
  );
}
