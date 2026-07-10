# Task Plan: Test Overhaul — 全量测试整改

## Goal

按 CLAUDE.md 质量标准整改所有 45 个现有测试文件，填补核心覆盖缺口，产出一套"真正的测试"。

## Current Phase

准备完成 — 1 份 Spec + 4 份 Plan 已写完，待开始执行 Phase 1

## 交付物索引

| 文档 | 路径 |
|------|------|
| Spec | `docs/superpowers/specs/2026-07-10-test-overhaul-design.md` |
| Phase 1 Plan | `docs/superpowers/plans/2026-07-10-phase1-server-test-overhaul.md` |
| Phase 2 Plan | `docs/superpowers/plans/2026-07-10-phase2-frontend-test-overhaul.md` |
| Phase 3 Plan | `docs/superpowers/plans/2026-07-10-phase3-e2e-test-overhaul.md` |
| Phase 4 Plan | `docs/superpowers/plans/2026-07-10-phase4-gap-filling.md` |

## Phases

### Phase 1: Server 整改

**范围**: server 17 个测试文件 + 新增 4 个服务测试
- 重写: judgeQueue, apiContract
- 修补: rateLimiter, gamification, auth integration, health, runSample
- 新增: authService, contestService, userService, loginStreak
- 保留: auth(unit), leaderboard, points, submissionService, achievements, validate, errorHandler, languageConfig, postService, dockerJudge

**Status:** ✅ completed (2026-07-10)

**结果:**
- 重写: judgeQueue (5 tests) + apiContract (5 tests)
- 修补: rateLimiter (+3 edge case), gamification (去重), auth integration (HTTP 格式)
- 新增: authService (18), contestService (24), userService (9), loginStreak (9)
- Server 测试数: 143 → 209 (+66)
- 全量验证: Server 209/209 ✅ | Frontend 165/165 ✅ | TypeScript ✅

### Phase 2: Frontend 整改

**范围**: frontend 16 个测试文件
- 重写: App, Home, Login
- 修补: AchievementsPage, Register, DailyChallengePage, VirtualItemsPage, Header, Footer
- 保留: authStore, PostDetailPage, ProblemList, CommunityPage, CreatePostPage, LeaderboardPage, PointsPage

**Status:** ✅ completed (2026-07-10)

**结果:**
- 重写: App (3 tests) + Home (14 tests) + Login (18 tests)
- 修补: Register (+4), DailyChallengePage (+3), VirtualItemsPage (+2), Header (mobile menu 真实断言), AchievementsPage/Footer 维持
- 前端测试数: 165 → 187 (+22)
- 全量验证: Frontend 187/187 ✅ | Server 209/209 ✅ | TypeScript ✅ | 条件断言 无违规 ✅

### Phase 3: E2E 整改

**范围**: e2e 12 个测试文件
- 重写 gamificationFlow, contestDetail, postDetail
- 审计+修补剩余 8 个文件（消除全部 R1/R3 违规）

**Status:** pending

### Phase 4: 缺口补漏

**范围**: 新增 ~10 个测试文件
- 页面: ProblemDetail, ContestList, Profile
- 服务: dailyChallenge, virtualItems, learningPathService
- Store: useUIStore, notificationStore

**Status:** pending

## Errors

| Error | Attempt | Resolution |
|-------|---------|------------|
| None yet | | |
