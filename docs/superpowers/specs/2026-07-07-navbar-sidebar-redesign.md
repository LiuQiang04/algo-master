# 导航栏 & 侧边栏 UI 优化设计

> 日期: 2026-07-07
> 状态: 设计定稿

## 目标

解决当前网站的顶部导航栏和侧边栏的视觉与布局问题：

1. 顶部导航栏颜色、字号和间距问题 - 提升美观度和可读性
2. 侧边栏固定定位覆盖页面内容问题 - 改为正常文档流布局

## 问题分析

### 1. 顶部导航栏 (Header.tsx)

当前实现：
- 蓝紫渐变背景 (`from-blue-600 to-purple-600`)
- 导航文字 `text-white/80`（80% 透明度的白色），在渐变背景上实际呈现为模糊的淡蓝色（约 #6B97EE）
- 导航项间距过小（gap: 4px），视觉上紧凑拥挤
- 字号偏小（约 14px），可读性不足
- 导航项数量多（7 项），紧凑布局更显杂乱

### 2. 侧边栏 (Sidebar.tsx + Sidebar.css)

当前实现：
- `position: fixed; top: 64px; bottom: 0; z-index: 40` 固定定位
- 脱离文档流后尽管有 `md:ml-[240px]` 偏移，但某些页面因容器宽度、padding 等适配问题，左侧内容仍被遮挡
- 侧边栏背景 `var(--bg-card)` = `#ffffff`（不透明），完全遮盖后面的内容

## 改动方案

### 1. 顶部导航栏 — 简约白净风

**配色：**
- 背景：`#ffffff`（纯白），底部 1px `#e5e7eb` 浅灰边框分割
- `position: sticky; top: 0; z-index: 50` 固定在顶部
- 导航文字：`#374151`（gray-700），激活态 `#2563eb`（primary-600，蓝色）
- hover 态：背景 `#f3f4f6`
- 按钮：Ghost 登录按钮（灰底）、蓝色注册按钮

**字号 & 间距：**
- 导航链接：`16px` / `font-weight: 500`
- 导航项间距：`gap: 32px`（远超当前的 4px）
- 导航栏高度：`72px`（当前 64px，更舒展）
- 导航项内 padding 充足

**交互细节：**
- hover 时背景变灰 `#f3f4f6` + 文字加深
- 激活项底部 2px 蓝色指示条（代替当前整块蓝底，更轻盈）
- 页面滚动时加阴影
- 移除去蓝紫渐变及相关 Tailwind 类

**Logo：**
- Code2 图标用 `var(--primary-600)` 纯蓝
- "AlgoMaster" 改为 "AlgoArena" 并与整体设计统一
- 保留 gradient accent 文字效果（不变）

### 2. 侧边栏 — 正常文档流布局

**核心改动：`position: fixed` → 正常 flex 流**

```
改前：position: fixed       → 脱离文档流，靠 margin-left 偏移
改后：flex-shrink: 0         → 与主内容并列排列，无需额外偏移
```

- 侧边栏容器与主内容容器改为 `display: flex` 并排
- 侧边栏 `width: 240px` 不变，`flex-shrink: 0` 防止挤压
- 主内容自动占据剩余空间，无需 `margin-left`
- 移除 `position: fixed`、`top: 64px`、`bottom: 0`、`z-index: 40` 等定位属性
- 侧边栏 `min-height: calc(100vh - 72px)` 填满导航栏以下区域
- 右边缘 1px 分割线，清晰区分侧边栏和内容区
- 内部滚动保留（overflow-y: auto）

**移动端不受影响**：移动端 `max-width: 767px` 保持不变（overlay 弹出式侧边栏）

### 3. MainLayout 联动修改

将 Header、Sidebar、Footer 用 flex 布局组织：

```
┌────────────────────────────────┐
│          Header (sticky)       │
├────────┬───────────────────────┤
│Sidebar │  Main Content (Outlet)│
│240px   │  flex: 1              │
│        │                       │
├────────┴───────────────────────┤
│          Footer                │
└────────────────────────────────┘
```

- Sidebar 和 Main 用 `display: flex; flex: 1` 的容器包裹
- Footer 不受 sidebar 偏移影响，自动对齐

## 不改的

- 侧边栏的导航项、分组结构、图标不变（上次重构已完成）
- 移动端侧边栏 overlay 行为不变
- 不修改任何路由逻辑
- 不修改功能代码
- 不修改页级组件的业务逻辑

## 涉及文件

| 文件 | 改动类型 |
|------|---------|
| `frontend/src/components/Layout/Header.tsx` | 重写（简约白色风格，修改配色/字号/间距） |
| `frontend/src/components/Layout/MainLayout.tsx` | 修改（flex 布局替换 margin-left 偏移） |
| `frontend/src/components/Layout/Sidebar.css` | 修改（移除 fixed 定位，改为 flex 流） |
| `frontend/src/components/Layout/Sidebar.tsx` | 不需改动（仅 CSS 变化） |
| `frontend/src/index.css` | 不需改动（主题变量不变） |

## 实施顺序

```
Sidebar.css (定位修改) → MainLayout.tsx (flex 布局) → Header.tsx (视觉重写)
```

## 测试要点

1. 导航栏在桌面端 7 项链接显示正常、间距均匀、可读性良好
2. 导航栏在移动端 768px 以下正确隐藏 Desktop 链接并显示汉堡菜单
3. 导航栏激活状态指示条正确跟随页面
4. 侧边栏不再遮盖任何页面内容
5. 侧边栏的固定（桌面端显示）行为正常
6. 主内容区域在不同页面宽度下正确填充
7. Footer 位置正确（不再被侧边栏偏移影响）
8. 移动端 overlay 侧边栏行为不变
