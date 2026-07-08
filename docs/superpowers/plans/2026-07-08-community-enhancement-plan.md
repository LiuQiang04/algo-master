# 社区功能完善 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 完善社区模块，实现帖子编辑、评论编辑、Markdown 实时预览

**Architecture:**
- 后端：在现有 postService/postController/posts 路由中增加 `PUT /api/comments/:id`
- 前端：复用 CreatePostPage 实现帖子编辑模式；PostDetailPage 的 CommentItem 增加原地编辑模式；两处都增加 Markdown 实时预览

**Tech Stack:** React 19 + TypeScript, Node.js + Express + Prisma, react-markdown + remark-gfm

## Global Constraints

- 前端 API 调用通过 `frontend/src/api/client.ts` 的 axios 实例（自动附加 JWT）
- Markdown 渲染统一使用 `frontend/src/components/common/MarkdownRenderer.tsx`（基于 react-markdown + remark-gfm）
- 后端验证复用 `server/src/middleware/validate.ts` 的 Joi schema
- 后端错误处理复用 `server/src/utils/errors.ts` 的 NotFoundError / ForbiddenError / BadRequestError

---

### Task 1: 后端 — 评论编辑 API

**Files:**
- Modify: `server/src/routes/posts.ts` — 新增路由
- Modify: `server/src/controllers/postController.ts` — 新增 updateComment
- Modify: `server/src/services/postService.ts` — 新增 updateComment

**Interfaces:**
- Produces: `postService.updateComment(commentId: string, userId: string, content: string)` — 返回更新后的评论对象
- Consumes: 现有 Post/Comment Prisma model

- [ ] **Step 1: 在 postService 新增 updateComment**

在 `server/src/services/postService.ts` 末尾（`getComments` 函数之前或之后）添加：

```typescript
// 更新评论
export async function updateComment(commentId: string, userId: string, content: string) {
  const comment = await prisma.comment.findUnique({
    where: { id: commentId },
  });

  if (!comment) {
    throw new NotFoundError('评论不存在');
  }

  if (comment.userId !== userId) {
    throw new ForbiddenError('只能编辑自己的评论');
  }

  if (!content || content.trim().length === 0) {
    throw new BadRequestError('评论内容不能为空');
  }

  if (content.length > 10000) {
    throw new BadRequestError('评论内容不能超过 10000 个字符');
  }

  return prisma.comment.update({
    where: { id: commentId },
    data: { content },
    include: {
      user: {
        select: { id: true, username: true, avatarUrl: true },
      },
    },
  });
}
```

- [ ] **Step 2: 在 postController 新增 updateComment**

在 `server/src/controllers/postController.ts` 末尾添加：

```typescript
// 更新评论
export async function updateComment(req: AuthRequest, res: Response) {
  const userId = req.user!.id;
  const { id } = req.params;
  const { content } = req.body;

  const comment = await postService.updateComment(id, userId, content);
  res.json({
    success: true,
    data: comment,
  });
}
```

- [ ] **Step 3: 在 posts 路由表新增路由**

在 `server/src/routes/posts.ts` 末尾（所有现有路由之后）添加：

```typescript
router.put('/comments/:id', authenticate, postController.updateComment);
```

注意：这条路由将变为 `/api/posts/comments/:id`。如果前端需要 `/api/comments/:id` 格式，则需要调整（见 Task 2 前端实现）。这里采取简单方案——前端调 `/api/posts/comments/:id`。

- [ ] **Step 4: 验证编译**

```bash
cd server && npx tsc --noEmit
```

Expected: 编译通过，无类型错误

- [ ] **Step 5: 提交**

```bash
git add server/src/services/postService.ts server/src/controllers/postController.ts server/src/routes/posts.ts
git commit -m "feat: add comment update API"
```

---

### Task 2: 前端 — 回填加载帖子数据的 API 调用

**Files:**
- Modify: `frontend/src/pages/CreatePostPage.tsx` — 增加编辑模式数据加载

**Interfaces:**
- Consumes: `GET /api/posts/:id` — 获取帖子详情（已有）
- Produces: CreatePostPage 支持编辑模式

- [ ] **Step 1: CreatePostPage 增加编辑模式**

将 `CreatePostPage.tsx` 改为根据 URL 参数判断模式。使用 `useParams` 获取 postId。

添加导入和参数：

```typescript
import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

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
```

替换原有的 `useState` 声明（title, content, postType, tagInput, tagNames, submitting, error 保持原样），新增 `loadingPost` 状态。

- [ ] **Step 2: 添加编辑模式的数据加载 useEffect**

在 `handleSubmit` 之前添加：

```typescript
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
```

- [ ] **Step 3: 修改提交逻辑**

修改 `handleSubmit` 中的 API 调用，根据是否编辑模式选择 POST/PUT：

```typescript
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
```

- [ ] **Step 4: 修改页面标题和提交按钮文案**

编辑模式显示 "Edit Post"，创建模式显示 "Create New Post"；提交按钮编辑模式显示 "Save Changes"：

找到 `<h1>` 标签：

```typescript
<h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 24 }}>
  {isEditMode ? 'Edit Post' : 'Create New Post'}
</h1>
```

找到提交按钮文案：

```typescript
{submitting ? 'Saving...' : (isEditMode ? 'Save Changes' : 'Publish')}
```

- [ ] **Step 5: 编辑模式下禁用 PostType 选择**

编辑模式下，PostType 选择区只显示当前类型（只读展示），不可修改：

```typescript
{isEditMode ? (
  <div style={{
    padding: '12px 16px', borderRadius: 'var(--radius-md)',
    background: 'var(--bg-secondary)', fontSize: 14,
    color: 'var(--text-secondary)',
  }}>
    Post Type: <strong style={{ color: 'var(--text-primary)' }}>{postType}</strong>
    (cannot be changed after creation)
  </div>
) : (
  // 原有的三个按钮选择
  <div style={{ display: 'flex', gap: 8 }}>
    ...
  </div>
)}
```

- [ ] **Step 6: 加载中状态处理**

在 return 开头，loadingPost 时显示加载中：

```typescript
if (loadingPost) {
  return (
    <div className="container" style={{ padding: '24px 24px', maxWidth: 800 }}>
      <div style={{ textAlign: 'center', padding: 60, color: 'var(--text-muted)' }}>Loading post...</div>
    </div>
  );
}
```

- [ ] **Step 7: 提交**

```bash
git add frontend/src/pages/CreatePostPage.tsx
git commit -m "feat: add edit mode to CreatePostPage"
```

---

### Task 3: 前端 — 新增帖子编辑路由

**Files:**
- Modify: `frontend/src/routes/index.tsx` — 新增 `/posts/:id/edit` 路由

- [ ] **Step 1: 路由文件添加新路由**

在 `/posts/:id` 路由下方添加：

```typescript
{ path: 'posts/:id/edit', element: <ProtectedRoute><LazyPage><CreatePostPage /></LazyPage></ProtectedRoute> },
```

注意：需要引入 `CreatePostPage` 的 lazy import（已在顶部），并为编辑路由加上 `ProtectedRoute`（只有作者能编辑）。

- [ ] **Step 2: 验证编译**

```bash
cd frontend && npx tsc --noEmit
```

Expected: 编译通过

- [ ] **Step 3: 提交**

```bash
git add frontend/src/routes/index.tsx
git commit -m "feat: add edit post route /posts/:id/edit"
```

---

### Task 4: 前端 — Markdown 实时预览（发帖页）

**Files:**
- Modify: `frontend/src/pages/CreatePostPage.tsx` — 增加 Write/Preview 切换

- [ ] **Step 1: 添加预览状态和导入**

在 `CreatePostPage.tsx` 的状态声明区域添加：

```typescript
const [showPreview, setShowPreview] = useState(false);
```

在文件顶部已有导入基础上确认 `MarkdownRenderer` 已导入（如未导入则添加）：

```typescript
import MarkdownRenderer from '../components/common/MarkdownRenderer';
```

- [ ] **Step 2: 在 textarea 下方添加 Write/Preview 切换**

将 textarea 及其标签替换为：

```typescript
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
```

- [ ] **Step 3: 提交**

```bash
git add frontend/src/pages/CreatePostPage.tsx
git commit -m "feat: add markdown live preview to CreatePostPage"
```

---

### Task 5: 前端 — 评论编辑模式

**Files:**
- Modify: `frontend/src/pages/PostDetailPage.tsx` — CommentItem 增加编辑模式

**Interfaces:**
- Consumes: `PUT /api/posts/comments/:id`（来自 Task 1）
- Produces: 评论原地编辑功能

- [ ] **Step 1: 在 PostDetailPage 添加编辑状态**

在 PostDetailPage 函数组件的 `const [replyTo, setReplyTo]` 旁边添加：

```typescript
const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
const [editContent, setEditContent] = useState('');
```

- [ ] **Step 2: 添加编辑提交处理函数**

在 `handleDeleteComment` 之后添加：

```typescript
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
```

- [ ] **Step 3: 将新状态和函数传给 CommentItem**

在 CommentItem 渲染处增加 props：

```typescript
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
```

- [ ] **Step 4: 更新 CommentItem 的 Props 类型**

```typescript
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
```

- [ ] **Step 5: 修改 CommentItem 的渲染逻辑**

在 `{!comment.isDeleted && (` 快中的 comment body 区域，根据是否处于编辑模式切换显示：

替换评论 body 部分（当前第 338-342 行）：

```typescript
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
```

- [ ] **Step 6: 修改评论操作栏，增加 Edit 按钮和保存/取消按钮**

替换原有的评论操作栏（当前第 345-371 行）：

```typescript
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
```

注意：需要确认 `Edit` 图标已从 lucide-react 导入。在文件顶部添加：

```typescript
import { ..., Edit, ... } from 'lucide-react';
```

- [ ] **Step 7: 验证编译**

```bash
cd frontend && npx tsc --noEmit
```

Expected: 编译通过

- [ ] **Step 8: 提交**

```bash
git add frontend/src/pages/PostDetailPage.tsx
git commit -m "feat: add comment inline editing with markdown preview"
```

---

### Task 6: 全量测试验证

- [ ] **Step 1: 运行后端测试**

```bash
cd server && npm test
```

Expected: 所有测试通过

- [ ] **Step 2: 运行后端类型检查**

```bash
cd server && npx tsc --noEmit
```

- [ ] **Step 3: 运行前端测试**

```bash
cd frontend && npm test
```

- [ ] **Step 4: 运行前端类型检查**

```bash
cd frontend && npx tsc --noEmit
```

- [ ] **Step 5: 更新 PROJECT.md**

更新 PROJECT.md 中"待完成"部分，去掉"社区功能完善"

- [ ] **Step 6: 最终提交**

```bash
git add . && git commit -m "feat: community enhancement - post editing, comment editing, markdown preview"
```
