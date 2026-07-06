# Findings & Decisions

## Requirements

1. 重新设计4个 gamification 页面前端 UI（成就系统、每日挑战、虚拟商店、积分中心）
2. 解决页面空旷、字体小、样式丑三个核心问题
3. 只改前端 UI，不改后端接口
4. 参考 frontend-design 和 ui-ux-pro-max 两个 skill 的设计理念
5. 保留现有玻璃态基础，大幅增强视觉冲击力

## Research Findings

### 当前代码状态

- 4个页面位于 `frontend/src/pages/Gamification/`
- 6个相关组件位于 `frontend/src/components/gamification/`
- 所有数据通过 `useGamification.ts` hooks 获取
- 已有玻璃态基础设计（`backdrop-blur-xl bg-white/70 border-white/40`）
- Tailwind CSS v4，无 tailwind.config.js

### 设计参考

- frontend-design skill：强调视觉层次、间距系统、色彩运用
- ui-ux-pro-max skill：强调用户体验、信息架构、交互细节
- 方案 A+C：Hero 驱动 + 沉浸式游戏化

### 关键发现

| 发现 | 影响 |
|------|------|
| 当前字号以 text-sm/text-xs 为主 | 需要全面升级到 text-base/text-lg 体系 |
| 统计卡片和内容网格同级 | 需要 Hero Banner 打破扁平层次 |
| 4个页面共享 LevelProgress 组件 | 升级该组件影响多个页面 |
| 所有业务逻辑在 hooks 中 | 纯 UI 改造不影响功能 |

## Technical Decisions

| Decision | Rationale |
|----------|-----------|
| 三/四统计合并为 Hero Banner | 创建视觉锚点，打破卡片同级 |
| 字号体系 text-sm → text-base | 解决字体小问题 |
| LevelProgress 新增 xl 尺寸档 | 复用组件，支持不同页面需求 |
| 背景加装饰光斑 | 增强视觉丰富度 |
| 不改类型/hook/API | 纯前端改造，风险最低 |

## Issues Encountered

| Issue | Resolution |
|-------|------------|
|       |            |

## Resources

- 设计规范: `docs/superpowers/specs/2026-07-06-gamification-redesign-v2.md`
- 现有玻璃态设计: `docs/superpowers/specs/2026-07-06-gamification-glassmorphism-design.md`
- 页面代码: `frontend/src/pages/Gamification/`
- 组件代码: `frontend/src/components/gamification/`
- 类型定义: `frontend/src/types/gamification.ts`
- Hooks: `frontend/src/hooks/useGamification.ts`
