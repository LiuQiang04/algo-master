import { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../api/client';
import { useAuthStore } from '../store/authStore';
import MarkdownRenderer from '../components/common/MarkdownRenderer';
import VoteButton from '../components/common/VoteButton';
import TimeAgo from '../components/common/TimeAgo';
import { MessageSquare, Eye, Pin, Lock, Edit, Trash2, Reply, ChevronDown, Send } from 'lucide-react';

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
  user: { id: string; username: string; avatarUrl?: string; level: number };
  tags: { tag: { id: string; name: string } }[];
  _count: { comments: number };
  userVote: number;
}

interface Comment {
  id: string;
  content: string;
  upvotes: number;
  downvotes: number;
  isDeleted: boolean;
  createdAt: string;
  user: { id: string; username: string; avatarUrl?: string; level: number };
  userVote: number;
  replies: Comment[];
  _count: { replies: number; votes: number };
}

export default function PostDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [post, setPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState('');
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState('');
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchPost = useCallback(async () => {
    try {
      const { data } = await api.get(`/posts/${id}`);
      setPost(data.data || null);
    } catch {
      navigate('/community');
    }
  }, [id]);

  const fetchComments = useCallback(async () => {
    try {
      const { data } = await api.get(`/posts/${id}/comments`);
      setComments(data.data?.comments || []);
    } catch {}
  }, [id]);

  useEffect(() => {
    setLoading(true);
    Promise.all([fetchPost(), fetchComments()]).finally(() => setLoading(false));
  }, [fetchPost, fetchComments]);

  const handleVote = async (value: number) => {
    if (!user) { navigate('/login'); return; }
    const { data } = await api.post(`/posts/${id}/vote`, { value });
    setPost((prev) => prev ? { ...prev, upvotes: data.data.upvotes, downvotes: data.data.downvotes, userVote: value } : prev);
  };

  const handleCommentVote = async (commentId: string, value: number) => {
    if (!user) { navigate('/login'); return; }
    await api.post(`/comments/${commentId}/vote`, { value });
    fetchComments();
  };

  const handleComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !user) return;
    setSubmitting(true);
    try {
      await api.post(`/posts/${id}/comments`, { content: newComment });
      setNewComment('');
      fetchComments();
      fetchPost();
    } finally {
      setSubmitting(false);
    }
  };

  const handleReply = async (e: React.FormEvent, parentId: string) => {
    e.preventDefault();
    if (!replyContent.trim() || !user) return;
    setSubmitting(true);
    try {
      await api.post(`/posts/${id}/comments`, { content: replyContent, parentCommentId: parentId });
      setReplyContent('');
      setReplyTo(null);
      fetchComments();
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeletePost = async () => {
    if (!confirm('Are you sure you want to delete this post?')) return;
    await api.delete(`/posts/${id}`);
    navigate('/community');
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!confirm('Delete this comment?')) return;
    await api.delete(`/comments/${commentId}`);
    fetchComments();
  };

  const handleEditComment = async (commentId: string) => {
    if (!editContent.trim() || !user) return;
    setSubmitting(true);
    try {
      await api.put(`/posts/comments/${commentId}`, { content: editContent });
      setEditingCommentId(null);
      setEditContent('');
      fetchComments();
    } catch (err: any) {
      console.error('Failed to update comment', err);
      alert(err.response?.data?.message || 'Failed to update comment');
    } finally {
      setSubmitting(false);
    }
  };

  const handleStartEdit = (comment: Comment) => {
    setEditingCommentId(comment.id);
    setEditContent(comment.content);
  };

  const handleCancelEdit = () => {
    setEditingCommentId(null);
    setEditContent('');
  };

  if (loading) return <div className="container" style={{ padding: 60, textAlign: 'center', color: 'var(--text-muted)' }}>Loading...</div>;
  if (!post) return null;

  const typeColors: Record<string, string> = {
    discussion: 'var(--primary-50)', solution: 'var(--success-50)', question: 'var(--warning-50)',
  };

  return (
    <div className="container" style={{ padding: '24px 24px', maxWidth: 900 }}>
      {/* Post */}
      <div style={{ display: 'flex', gap: 20 }}>
        {/* Vote sidebar */}
        <div style={{ flexShrink: 0 }} className="hidden md:block">
          <div style={{ position: 'sticky', top: 88 }}>
            <VoteButton
              upvotes={post.upvotes} downvotes={post.downvotes}
              userVote={post.userVote} onVote={handleVote}
            />
          </div>
        </div>

        {/* Post content */}
        <div style={{ flex: 1, minWidth: 0 }}>
          {/* Header */}
          <div style={{ marginBottom: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              {post.isPinned && <Pin size={16} style={{ color: 'var(--warning-500)' }} />}
              {post.isLocked && <Lock size={16} style={{ color: 'var(--text-muted)' }} />}
              <span style={{
                padding: '3px 10px', borderRadius: 'var(--radius-full)', fontSize: 12, fontWeight: 600,
                background: typeColors[post.postType] || typeColors.discussion,
                color: 'var(--text-secondary)',
              }}>{post.postType}</span>
              {(post.tags || []).map(({ tag }) => (
                <span key={tag.id} style={{
                  padding: '2px 10px', borderRadius: 'var(--radius-full)', fontSize: 12,
                  background: 'var(--bg-tertiary)', color: 'var(--text-secondary)',
                }}>{tag.name}</span>
              ))}
            </div>
            <h1 style={{ fontSize: 28, fontWeight: 700, lineHeight: 1.3, color: 'var(--text-primary)' }}>
              {post.title}
            </h1>
          </div>

          {/* Author info */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 12, padding: '12px 0',
            borderTop: '1px solid var(--border-light)', borderBottom: '1px solid var(--border-light)',
            marginBottom: 20,
          }}>
            <Link to={`/users/${post.user.id}`} style={{
              display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none',
            }}>
              <div style={{
                width: 36, height: 36, borderRadius: 'var(--radius-full)',
                background: 'var(--primary-100)', display: 'flex', alignItems: 'center',
                justifyContent: 'center', color: 'var(--primary-600)', fontWeight: 600,
              }}>
                {post.user.avatarUrl ? (
                  <img src={post.user.avatarUrl} alt="" style={{ width: '100%', height: '100%', borderRadius: 'var(--radius-full)' }} />
                ) : post.user.username[0].toUpperCase()}
              </div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>{post.user.username}</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Level {post.user.level}</div>
              </div>
            </Link>
            <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>
              <TimeAgo date={post.createdAt} />
            </span>
            <div style={{ marginLeft: 'auto', display: 'flex', gap: 12, fontSize: 13, color: 'var(--text-muted)' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Eye size={14} /> {post.viewCount}</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><MessageSquare size={14} /> {post._count.comments}</span>
            </div>
            {user && user.id === post.user.id && (
              <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={() => navigate(`/posts/${id}/edit`)} style={{ color: 'var(--text-muted)' }}><Edit size={16} /></button>
                <button onClick={handleDeletePost} style={{ color: 'var(--danger-500)' }}><Trash2 size={16} /></button>
              </div>
            )}
          </div>

          {/* Content */}
          <div style={{ marginBottom: 32, lineHeight: 1.8, fontSize: 15 }}>
            <MarkdownRenderer content={post.content} />
          </div>

          {/* Mobile vote */}
          <div className="md:hidden" style={{ display: 'flex', justifyContent: 'center', marginBottom: 32 }}>
            <VoteButton
              upvotes={post.upvotes} downvotes={post.downvotes}
              userVote={post.userVote} onVote={handleVote} vertical={false}
            />
          </div>

          {/* Comments Section */}
          <div>
            <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
              <MessageSquare size={20} />
              Comments ({post._count.comments})
            </h2>

            {/* New comment form */}
            {user && (
              <form onSubmit={handleComment} style={{ marginBottom: 24 }}>
                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Share your thoughts... (Markdown supported)"
                  rows={4}
                  style={{
                    width: '100%', padding: '12px 16px', borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-light)', background: 'var(--bg-card)',
                    color: 'var(--text-primary)', fontSize: 14, outline: 'none',
                    fontFamily: 'inherit', resize: 'vertical', lineHeight: 1.6,
                  }}
                />
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 8 }}>
                  <button type="submit" disabled={submitting || !newComment.trim()} style={{
                    display: 'flex', alignItems: 'center', gap: 6, padding: '8px 20px',
                    borderRadius: 'var(--radius-md)', background: 'var(--primary-600)',
                    color: 'white', fontSize: 14, fontWeight: 500,
                    opacity: submitting || !newComment.trim() ? 0.6 : 1,
                  }}>
                    <Send size={14} />
                    {submitting ? 'Posting...' : 'Comment'}
                  </button>
                </div>
              </form>
            )}

            {/* Comment list */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
              {comments.map((comment) => (
                <CommentItem
                  key={comment.id}
                  comment={comment}
                  depth={0}
                  user={user}
                  replyTo={replyTo}
                  setReplyTo={setReplyTo}
                  replyContent={replyContent}
                  setReplyContent={setReplyContent}
                  handleReply={handleReply}
                  handleVote={handleCommentVote}
                  handleDelete={handleDeleteComment}
                  handleEdit={handleEditComment}
                  handleStartEdit={handleStartEdit}
                  handleCancelEdit={handleCancelEdit}
                  editingCommentId={editingCommentId}
                  editContent={editContent}
                  setEditContent={setEditContent}
                  submitting={submitting}
                />
              ))}
              {comments.length === 0 && (
                <p style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 32, fontSize: 14 }}>
                  No comments yet. Be the first to comment!
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function CommentItem({
  comment, depth, user, replyTo, setReplyTo, replyContent, setReplyContent,
  handleReply, handleVote, handleDelete, submitting,
  handleEdit, handleStartEdit, handleCancelEdit,
  editingCommentId, editContent, setEditContent,
}: {
  comment: Comment; depth: number; user: any;
  replyTo: string | null; setReplyTo: (id: string | null) => void;
  replyContent: string; setReplyContent: (s: string) => void;
  handleReply: (e: React.FormEvent, parentId: string) => Promise<void>;
  handleVote: (commentId: string, value: number) => Promise<void>;
  handleDelete: (commentId: string) => Promise<void>;
  submitting: boolean;
  handleEdit: (commentId: string) => Promise<void>;
  handleStartEdit: (comment: Comment) => void;
  handleCancelEdit: () => void;
  editingCommentId: string | null;
  editContent: string;
  setEditContent: (s: string) => void;
}) {
  const [showReplies, setShowReplies] = useState(true);
  const maxDepth = 3;

  return (
    <div style={{
      paddingLeft: depth > 0 ? 20 : 0,
      borderLeft: depth > 0 ? '2px solid var(--border-light)' : 'none',
    }}>
      <div style={{
        padding: '12px 0',
        borderBottom: depth === 0 ? '1px solid var(--border-light)' : 'none',
      }}>
        {/* Comment header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
          <Link to={`/users/${comment.user.id}`} style={{
            display: 'flex', alignItems: 'center', gap: 6, textDecoration: 'none',
          }}>
            <div style={{
              width: 24, height: 24, borderRadius: 'var(--radius-full)',
              background: 'var(--accent-100)', display: 'flex', alignItems: 'center',
              justifyContent: 'center', fontSize: 10, color: 'var(--accent-600)', fontWeight: 600,
            }}>
              {comment.user.username[0].toUpperCase()}
            </div>
            <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>
              {comment.user.username}
            </span>
          </Link>
          <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
            <TimeAgo date={comment.createdAt} />
          </span>
        </div>

        {/* Comment body - edit mode */}
        {editingCommentId === comment.id ? (
          <div style={{ marginBottom: 8 }}>
            <textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              autoFocus
              rows={4}
              style={{
                width: '100%', padding: '10px 12px', borderRadius: 'var(--radius-md)',
                border: '1px solid var(--primary-400)', background: 'var(--bg-card)',
                color: 'var(--text-primary)', fontSize: 13, outline: 'none',
                fontFamily: 'inherit', resize: 'vertical', lineHeight: 1.5,
              }}
            />
            {/* 评论编辑的 Markdown 实时预览 */}
            {editContent.trim() && (
              <div style={{
                marginTop: 6, padding: '8px 12px', borderRadius: 'var(--radius-md)',
                background: 'var(--bg-secondary)', border: '1px solid var(--border-light)',
                maxHeight: 200, overflow: 'auto', fontSize: 13, lineHeight: 1.6,
              }}>
                <MarkdownRenderer content={editContent} />
              </div>
            )}
          </div>
        ) : comment.isDeleted ? (
          <p style={{ fontSize: 14, color: 'var(--text-muted)', fontStyle: 'italic', padding: '4px 0' }}>
            [This comment has been deleted]
          </p>
        ) : (
          <div style={{ fontSize: 14, lineHeight: 1.7, marginBottom: 8 }}>
            <MarkdownRenderer content={comment.content} />
          </div>
        )}

        {/* Comment actions */}
        {!comment.isDeleted && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {editingCommentId === comment.id ? (
              <>
                <button onClick={() => handleEdit(comment.id)} disabled={submitting || !editContent.trim()} style={{
                  display: 'flex', alignItems: 'center', gap: 4, padding: '4px 12px',
                  borderRadius: 'var(--radius-sm)', fontSize: 12, fontWeight: 500,
                  background: 'var(--primary-600)', color: 'white',
                  opacity: submitting || !editContent.trim() ? 0.6 : 1,
                }}>
                  {submitting ? 'Saving...' : 'Save'}
                </button>
                <button onClick={handleCancelEdit} style={{
                  padding: '4px 12px', borderRadius: 'var(--radius-sm)', fontSize: 12,
                  color: 'var(--text-secondary)', border: '1px solid var(--border-light)',
                }}>
                  Cancel
                </button>
              </>
            ) : (
              <>
                <VoteButton
                  upvotes={comment.upvotes} downvotes={comment.downvotes}
                  userVote={comment.userVote} onVote={(v) => handleVote(comment.id, v)}
                  vertical={false}
                />
                {user && (
                  <button onClick={() => setReplyTo(replyTo === comment.id ? null : comment.id)} style={{
                    display: 'flex', alignItems: 'center', gap: 4, padding: '4px 8px',
                    borderRadius: 'var(--radius-sm)', fontSize: 12, color: 'var(--text-muted)',
                  }}>
                    <Reply size={12} />
                    Reply
                  </button>
                )}
                {user && user.id === comment.user.id && (
                  <button onClick={() => handleStartEdit(comment)} style={{
                    display: 'flex', alignItems: 'center', gap: 4, padding: '4px 8px',
                    borderRadius: 'var(--radius-sm)', fontSize: 12, color: 'var(--text-muted)',
                  }}>
                    <Edit size={12} />
                    Edit
                  </button>
                )}
                {user && user.id === comment.user.id && (
                  <button onClick={() => handleDelete(comment.id)} style={{
                    display: 'flex', alignItems: 'center', gap: 4, padding: '4px 8px',
                    borderRadius: 'var(--radius-sm)', fontSize: 12, color: 'var(--danger-500)',
                  }}>
                    <Trash2 size={12} />
                    Delete
                  </button>
                )}
              </>
            )}
          </div>
        )}

        {/* Reply form */}
        {replyTo === comment.id && user && (
          <form onSubmit={(e) => handleReply(e, comment.id)} style={{ marginTop: 8, paddingLeft: depth < maxDepth ? 0 : 0 }}>
            <textarea
              value={replyContent}
              onChange={(e) => setReplyContent(e.target.value)}
              placeholder={`Reply to ${comment.user.username}...`}
              rows={3}
              autoFocus
              style={{
                width: '100%', padding: '10px 12px', borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-light)', background: 'var(--bg-card)',
                color: 'var(--text-primary)', fontSize: 13, outline: 'none',
                resize: 'vertical', lineHeight: 1.5,
              }}
            />
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 6 }}>
              <button type="button" onClick={() => { setReplyTo(null); setReplyContent(''); }} style={{
                padding: '6px 14px', borderRadius: 'var(--radius-md)', fontSize: 13,
                color: 'var(--text-secondary)', border: '1px solid var(--border-light)',
              }}>Cancel</button>
              <button type="submit" disabled={submitting || !replyContent.trim()} style={{
                display: 'flex', alignItems: 'center', gap: 4, padding: '6px 14px',
                borderRadius: 'var(--radius-md)', background: 'var(--primary-600)',
                color: 'white', fontSize: 13, fontWeight: 500,
                opacity: submitting || !replyContent.trim() ? 0.6 : 1,
              }}>
                <Send size={12} />
                Reply
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Nested replies */}
      {comment.replies && comment.replies.length > 0 && depth < maxDepth && (
        <>
          {comment.replies.length > 2 && !showReplies && (
            <button onClick={() => setShowReplies(true)} style={{
              display: 'flex', alignItems: 'center', gap: 4, padding: '6px 0',
              fontSize: 12, color: 'var(--primary-600)',
            }}>
              <ChevronDown size={14} />
              Show {comment.replies.length} replies
            </button>
          )}
          {showReplies && (
            <div>
              {comment.replies.map((reply) => (
                <CommentItem
                  key={reply.id} comment={reply} depth={depth + 1} user={user}
                  replyTo={replyTo} setReplyTo={setReplyTo}
                  replyContent={replyContent} setReplyContent={setReplyContent}
                  handleReply={handleReply} handleVote={handleVote}
                  handleDelete={handleDelete} submitting={submitting}
                  handleEdit={handleEdit} handleStartEdit={handleStartEdit}
                  handleCancelEdit={handleCancelEdit}
                  editingCommentId={editingCommentId} editContent={editContent}
                  setEditContent={setEditContent}
                />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
