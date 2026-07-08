# 发帖页 Markdown 编辑器：左右并排实时预览

## 背景

当前 CreatePostPage 的 Markdown 编辑区使用 Write/Preview 标签切换，用户编写内容时需要手动切换到 Preview 标签才能看到渲染效果。页面左右两侧有大量空闲空间，可用来并排展示编辑器与预览。

## 设计

### 响应式行为

| 屏幕宽度 | 布局 |
|----------|------|
| >900px | 左右并排：左 textarea / 右 实时 Markdown 预览 |
| ≤900px | 恢复标签切换（Write / Preview），即当前行为 |

### 宽屏布局（>900px）

- 容器 `maxWidth` 从 800px 扩大到 1200px
- 内容区使用 `display: flex; gap: 16px`，左右各占 `flex: 1`
- 左侧：textarea，无标签栏
- 右侧：`<MarkdownRenderer>` 实时渲染，随输入即时更新
- 移除 Write/Preview 切换按钮
- 预览区无内容时显示 "Nothing to preview" 灰色斜体占位

### 窄屏布局（≤900px）

保持现状不变：tabs 切换 Write / Preview。

### 检测方式

- `useState<boolean>(window.innerWidth > 900)` 初始化
- `useEffect` 绑定 `resize` 事件，cleanup 解绑
- 阈值 900px（与侧边栏断点一致）

### 变更范围

**仅一个文件**：`frontend/src/pages/CreatePostPage.tsx`

- 删除 `showPreview` state
- 新增 `isWide` state + resize 监听
- 原内容区域条件渲染分叉：宽屏并排 / 窄屏标签

## 测试

现有测试（CreatePostPage 14 个用例）不依赖 tab 切换的具体实现，应全部通过。
