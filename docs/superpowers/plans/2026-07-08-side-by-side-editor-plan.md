# 发帖页 Markdown 并排编辑器 — 实现计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 发帖页 Markdown 编辑区从 Write/Preview 标签切换改为宽屏并排、窄屏标签回退

**Architecture:** 仅修改 `frontend/src/pages/CreatePostPage.tsx` 一个文件。通过 `useEffect` + `resize` 事件检测屏幕宽度，宽屏（>900px）时左右两列显示 editor + preview，窄屏时恢复标签切换。

**Tech Stack:** React 19 + TypeScript + CSS Variables

## Global Constraints

- 断点阈值 900px（与侧边栏一致）
- 不引入额外 npm 依赖
- 现有 14 个 CreatePostPage 测试全部通过
- 预览区空内容显示 "Nothing to preview" 灰色斜体

---

### Task 1: 实现并排编辑器布局

**Files:**
- Modify: `frontend/src/pages/CreatePostPage.tsx` (全部重写 content 区域)

**Changes:**
- 删除 `showPreview` state
- 新增 `isWide` state + resize 监听
- 新增 `showNarrowPreview` state（仅窄屏用，替代旧的 showPreview）
- 容器 `maxWidth`：宽屏 1200px，窄屏 800px
- 内容区：宽屏 flex row（左 textarea / 右 实时 MarkdownRenderer），窄屏 tabs 切换

- [ ] **Step 1: 确认当前文件状态**

文件当前缺少 `showPreview` state 但 JSX 仍有引用（编译会报错），任务将一次性替换整个 content 区域。

- [ ] **Step 2: 修改 state 声明**

```tsx
// 删除 showPreview state（已删），新增两个 state
const [showNarrowPreview, setShowNarrowPreview] = useState(false);
const [isWide, setIsWide] = useState(window.innerWidth > 900);
```

放在 `loadingPost` state 之后（line 20 后）。

- [ ] **Step 3: 添加 resize 监听**

```tsx
// 放在第一个 useEffect 之前或之后
useEffect(() => {
  const checkWidth = () => setIsWide(window.innerWidth > 900);
  window.addEventListener('resize', checkWidth);
  return () => window.removeEventListener('resize', checkWidth);
}, []);
```

- [ ] **Step 4: 修改容器宽度**

把 loading 容器的 maxWidth 改为 800（不变），主容器 maxWidth 改为条件：

```tsx
// loading 容器（line 49）保持不变
<div className="container" style={{ padding: '24px 24px', maxWidth: 800 }}>

// 主容器（line 91）改为条件宽度
<div className="container" style={{ padding: '24px 24px', maxWidth: isWide ? 1200 : 800 }}>
```

- [ ] **Step 5: 替换 content 区域（lines 172-233）**

全部替换为：

```tsx
        {/* Content (Markdown supported) */}
        <div style={{ marginBottom: 20 }}>
          <label style={{ display: 'block', fontSize: 14, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 8 }}>
            Content (Markdown supported)
          </label>

          {isWide ? (
            /* 宽屏：左右并排 */
            <div style={{ display: 'flex', gap: 16 }}>
              {/* Left: Editor */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Write your post content here... You can use Markdown syntax."
                  rows={16}
                  style={{
                    width: '100%', padding: '16px', borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-light)',
                    background: 'var(--bg-card)', color: 'var(--text-primary)', fontSize: 14,
                    outline: 'none', fontFamily: 'var(--font-mono)', lineHeight: 1.6,
                    resize: 'vertical',
                  }}
                />
              </div>
              {/* Right: Live Preview */}
              <div style={{
                flex: 1, minWidth: 0, padding: '16px', borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-light)',
                background: 'var(--bg-card)', color: 'var(--text-primary)',
                overflow: 'auto', lineHeight: 1.8, fontSize: 15, minHeight: 400,
              }}>
                {content.trim() ? (
                  <MarkdownRenderer content={content} />
                ) : (
                  <p style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>Nothing to preview</p>
                )}
              </div>
            </div>
          ) : (
            /* 窄屏：标签切换 */
            <>
              <div style={{ display: 'flex', gap: 0, marginBottom: 0, border: '1px solid var(--border-light)', borderRadius: 'var(--radius-md) var(--radius-md) 0 0', overflow: 'hidden' }}>
                <button
                  type="button"
                  onClick={() => setShowNarrowPreview(false)}
                  style={{
                    flex: 1, padding: '8px 16px', fontSize: 13, fontWeight: 500,
                    background: !showNarrowPreview ? 'var(--bg-card)' : 'var(--bg-secondary)',
                    color: !showNarrowPreview ? 'var(--text-primary)' : 'var(--text-muted)',
                    borderBottom: !showNarrowPreview ? '2px solid var(--primary-500)' : '2px solid transparent',
                    transition: 'var(--transition-fast)',
                  }}
                >
                  Write
                </button>
                <button
                  type="button"
                  onClick={() => setShowNarrowPreview(true)}
                  style={{
                    flex: 1, padding: '8px 16px', fontSize: 13, fontWeight: 500,
                    background: showNarrowPreview ? 'var(--bg-card)' : 'var(--bg-secondary)',
                    color: showNarrowPreview ? 'var(--text-primary)' : 'var(--text-muted)',
                    borderBottom: showNarrowPreview ? '2px solid var(--primary-500)' : '2px solid transparent',
                    transition: 'var(--transition-fast)',
                  }}
                >
                  Preview
                </button>
              </div>
              {showNarrowPreview ? (
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
            </>
          )}
        </div>
```

- [ ] **Step 6: 运行测试确认通过**

```bash
cd frontend && npm test -- --testPathPattern="CreatePostPage"
```
Expected: 14/14 或全部 pass（原有测试不依赖 tab 切换细节）

- [ ] **Step 7: 启动 dev server 视觉确认**

```bash
pwsh scripts/start-dev.ps1
```
确认：
- 桌面端 → 左右并排显示，textarea 在左，preview 在右
- 缩小到 <900px → 恢复 Write/Preview 标签切换
- Markdown 输入实时渲染到预览区

- [ ] **Step 8: 提交**

```bash
git add frontend/src/pages/CreatePostPage.tsx
git commit -m "feat: 发帖页 Markdown 并排实时预览（宽屏并排/窄屏标签）"
```

---

## Self-Review

| Spec 需求 | 对应步骤 |
|-----------|----------|
| 宽屏并排 | Step 5 — `isWide ?` 两列布局 |
| 窄屏标签回落 | Step 5 — `!isWide ?` 标签切换 |
| 断点 900px | Step 2 — `window.innerWidth > 900` |
| 容器加宽 | Step 4 — `maxWidth: isWide ? 1200 : 800` |
| 实时预览 | Step 5 — 右侧直接渲染 `<MarkdownRenderer>` |
| 空内容占位 | Step 5 — "Nothing to preview" |

无占位符、无歧义、单个文件。计划完成。
