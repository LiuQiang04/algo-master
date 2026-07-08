# 社区功能完善 — 设计文档

> 日期: 2026-07-08
> 状态: 已批准
> 涉及: 帖子编辑、评论编辑、Markdown 实时预览

## 1. 概述

完善社区模块的三个功能点：允许用户编辑已发布的帖子、支持评论原地编辑、在发帖和评论时提供 Markdown 实时预览。

---

## 2. 帖子编辑

### 2.1 路由

新增前端路由：`/posts/:id/edit`（`frontend/src/routes/index.tsx`）

### 2.2 前端实现

复用 `CreatePostPage.tsx`，通过 URL params 区分模式：

| 模式 | 判定条件 | 页面标题 | API 方法 | PostType |
|------|----------|----------|----------|----------|
| 创建 | 无 `id` param | "Create New Post" | `POST /api/posts` | 可选 |
| 编辑 | 有 `id` param | "Edit Post" | `PUT /api/posts/:id` | 只读 |

**编辑模式流程**:
1. 进入页面 → `useEffect` 调 `GET /api/posts/:id` 加载帖子数据
2. 填充表单：title, content, postType（禁用）, tags
3. 用户修改内容 → 点击 Publish → `PUT /api/posts/:id`
4. 成功后导航至 `/posts/:id`

### 2.3 后端

`PUT /api/posts/:id` 已存在，无需改动。

---

## 3. 评论编辑

### 3.1 后端新增 API

`server/src/routes/posts.ts` 新增路由：

```
PUT /api/comments/:id → postController.updateComment (authenticate)
```

**Controller** `postController.ts` 新增 `updateComment`:
- 从 `req.params.id` 获取 commentId
- 从 `req.body.content` 获取新内容
- 调用 postService.updateComment()

**Service** `postService.ts` 新增 `updateComment(commentId, userId, content)`:
- 验证评论存在 → 404
- 验证 `comment.userId === userId` → 403
- 验证 content 非空且 ≤ 10000 字 → 400
- 更新评论，返回新评论（含 user 关联）

### 3.2 前端实现

在 `PostDetailPage.tsx` 的 `CommentItem` 组件中增加编辑模式。

**状态**:
- `editingCommentId: string | null` — 当前正在编辑的评论 ID
- `editContent: string` — 编辑框中的内容

**交互**:
1. 评论操作栏增加 "Edit" 按钮（仅评论作者可见）
2. 点击 Edit → `editingCommentId` 设为该评论 ID，`editContent` 预填原内容
3. 评论正文区域切换为 textarea（自动聚焦）
4. 两个按钮：**Save**（调 API 更新） / **Cancel**（还原）
5. 保存成功后更新本地 comments 状态，退出编辑模式

### 3.3 验证规则

- 只能编辑自己的评论
- content 1-10000 字符
- 编辑后更新 `updatedAt` 字段

---

## 4. Markdown 实时预览

### 4.1 发帖页面（CreatePostPage）

在 textarea 下方增加预览区域：

- 添加 `showPreview` 布尔状态
- 增加切换按钮：一行两个 tab — "Write" / "Preview"
- Write 模式：显示 textarea
- Preview 模式：隐藏 textarea，用 `<MarkdownRenderer content={content} />` 渲染
- 高度与 textarea 一致（约 16 行），防止布局跳动
- 预览区样式：白底 + 边框 + 内边距，与 textarea 视觉对齐

### 4.2 评论编辑

在评论编辑的 textarea 下方，加一个小的实时预览：

- 预览区最大高度 200px，超出可滚动
- 用 `<MarkdownRenderer />` 渲染
- 使用浅灰背景区分编辑区
- 编辑时预览自动更新

---

## 5. 涉及文件清单

### 前端
| 文件 | 改动 |
|------|------|
| `frontend/src/routes/index.tsx` | 新增 `/posts/:id/edit` 路由 |
| `frontend/src/pages/CreatePostPage.tsx` | 增加编辑模式、Markdown 预览 |
| `frontend/src/pages/PostDetailPage.tsx` | 评论编辑模式 |

### 后端
| 文件 | 改动 |
|------|------|
| `server/src/routes/posts.ts` | 新增 `PUT /api/comments/:id` 路由 |
| `server/src/controllers/postController.ts` | 新增 `updateComment` controller |
| `server/src/services/postService.ts` | 新增 `updateComment` service |

---

## 6. 不做的事情

- 不涉及帖子删除（已存在）
- 不涉及评论回复功能（已存在）
- 不做评论投票改造（已存在）
- 不改后端帖子编辑 API（已存在）
- 不改 MarkdownRenderer 组件（直接复用）
