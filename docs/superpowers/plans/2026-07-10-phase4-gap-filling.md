# Phase 4: Test Coverage Gap Filling — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fill critical test coverage gaps across all three layers (frontend, server, stores) so that all 24 route pages + 15 services + 3 stores have basic test coverage.

**Architecture:** Add new test files where none exist. Priority by risk: Store tests first (authored by data flow), then Service tests (business logic), then Page component tests (UI rendering).

**Tech Stack:** React 19 + TypeScript + Jest (frontend), Node.js + Express + Jest (server), Zustand (stores), React Router v6

## Global Constraints

1. No conditional assertions — every `it()` has guaranteed assertion
2. Complete mock fields — include all real API return fields
3. State coverage: loading → data → empty → error
4. Mock service/store layers but verify `toHaveBeenCalledWith`

---

## Gap Analysis

### Frontend — Pages without tests (12)

| Page | Route | Priority | Risk |
|------|-------|----------|------|
| ProblemDetail | `/problems/:id` | **High** | Core feature, submitted code from here |
| ContestList | `/contests` | **High** | Core feature |
| ContestDetail | `/contests/:id` | **High** | Core feature |
| Profile | `/profile` (protected) | **High** | Auth-dependent |
| LearningPaths | `/paths` | **Medium** |
| LearningPathDetail | `/paths/:id` | **Medium** |
| UserProfilePage | `/users/:id` | **Medium** |
| MessagesPage | `/messages` | **Low** |
| NotificationsPage | `/notifications` | **Low** |
| FeedPage | `/feed` | **Low** |
| GamificationHub | `/gamification` | **Medium** |
| PlaceholderPage | N/A | **Skip** — unused |

### Server — Services without tests (6)

| Service | Priority | Risk |
|---------|----------|------|
| `services/authService.ts` | **High** | Core — covered in P1 Task 7 |
| `services/contestService.ts` | **High** | Core — covered in P1 Task 8 |
| `services/userService.ts` | **High** | Core — covered in P1 Task 9 |
| `services/gamification/loginStreak.ts` | **Medium** | Covered in P1 Task 9 |
| `services/gamification/dailyChallenge.ts` | **Medium** |
| `services/gamification/virtualItems.ts` | **Medium** |
| `services/learningPathService.ts` | **Medium** |

### Stores without tests (2)

| Store | Priority |
|-------|----------|
| `stores/useUIStore.ts` | **High** — toast/theme affect all pages |
| `store/notificationStore.ts` | **Medium** |
| `i18n/index.ts` (useI18nStore) | **Low** |

---

### Task 1: Add ProblemDetail page test

**Files:**
- Create: `frontend/src/__tests__/components/ProblemDetail.test.tsx`
- Source: `frontend/src/pages/Problems/ProblemDetail.tsx`

- [ ] **Step 1: Read ProblemDetail.tsx source to understand data flow**

- [ ] **Step 2: Write ProblemDetail tests**

Cover:
- Loading state: spinner while fetching
- Problem data renders: title, difficulty badge, description, tags
- Code editor and submit button present
- Submissions tab loads and displays history
- Error state: "Problem not found" or API error
- Empty state: no submissions yet (shows empty message)

Mock the problem service with complete problem object (id, title, description, difficulty, timeLimit, memoryLimit, tags, sampleTestCases, etc.)

- [ ] **Step 3: Run tests**

```bash
cd frontend && npx jest src/__tests__/components/ProblemDetail.test.tsx --no-coverage
```

- [ ] **Step 4: Commit**

```bash
git add frontend/src/__tests__/components/ProblemDetail.test.tsx
git commit -m "test: add ProblemDetail page component tests"
```

---

### Task 2: Add ContestList page test

**Files:**
- Create: `frontend/src/__tests__/components/ContestList.test.tsx`
- Source: `frontend/src/pages/Contests/ContestList.tsx`

- [ ] **Step 1: Read ContestList.tsx source**

- [ ] **Step 2: Write ContestList tests**

Cover:
- Loading state
- Contest cards render (upcoming/ongoing/past)
- Filtering by status tabs
- Empty state: "No contests"
- Error state

- [ ] **Step 3: Run tests**

```bash
cd frontend && npx jest src/__tests__/components/ContestList.test.tsx --no-coverage
```

- [ ] **Step 4: Commit**

```bash
git add frontend/src/__tests__/components/ContestList.test.tsx
git commit -m "test: add ContestList page component tests"
```

---

### Task 3: Add ContestDetail page test

**Files:**
- Create: `frontend/src/__tests__/components/ContestDetail.test.tsx`
- Source: `frontend/src/pages/Contests/ContestDetail.tsx`

- [ ] **Step 1: Read ContestDetail.tsx source**

- [ ] **Step 2: Write ContestDetail tests**

Cover:
- Loading state
- Contest info renders: title, description, time, rules
- Problems tab
- Leaderboard tab
- Join button (for upcoming/ongoing contests)
- Error state: contest not found

- [ ] **Step 3: Run tests**

```bash
cd frontend && npx jest src/__tests__/components/ContestDetail.test.tsx --no-coverage
```

- [ ] **Step 4: Commit**

```bash
git add frontend/src/__tests__/components/ContestDetail.test.tsx
git commit -m "test: add ContestDetail page component tests"
```

---

### Task 4: Add Profile page test

**Files:**
- Create: `frontend/src/__tests__/components/Profile.test.tsx`
- Source: `frontend/src/pages/Profile/Profile.tsx`

- [ ] **Step 1: Read Profile.tsx source**

- [ ] **Step 2: Write Profile tests**

Cover:
- Loading state
- User profile displays: username, email, stats
- Edit profile form
- Achievements/preferences tab
- Error state: profile load fails
- Unauthenticated: redirect to login (if ProtectedRoute)

- [ ] **Step 3: Run tests**

```bash
cd frontend && npx jest src/__tests__/components/Profile.test.tsx --no-coverage
```

- [ ] **Step 4: Commit**

```bash
git add frontend/src/__tests__/components/Profile.test.tsx
git commit -m "test: add Profile page component tests"
```

---

### Task 5: Add LearningPaths + GamificationHub page tests

**Files:**
- Create: `frontend/src/__tests__/components/LearningPaths.test.tsx`
- Create: `frontend/src/__tests__/components/GamificationHub.test.tsx`
- Sources: `frontend/src/pages/LearningPaths/LearningPaths.tsx`, `frontend/src/pages/Gamification/GamificationHubPage.tsx`

- [ ] **Step 1: Read source files**

- [ ] **Step 2: Write LearningPaths tests**

Cover: list rendering, progress, loading, empty ("no paths available"), error.

- [ ] **Step 3: Write GamificationHub tests**

Cover: overview cards (XP, level, achievements), quick links to subpages, loading, error.

- [ ] **Step 4: Run tests**

```bash
cd frontend && npx jest src/__tests__/components/LearningPaths.test.tsx src/__tests__/components/GamificationHub.test.tsx --no-coverage
```

- [ ] **Step 5: Commit**

```bash
git add frontend/src/__tests__/components/LearningPaths.test.tsx frontend/src/__tests__/components/GamificationHub.test.tsx
git commit -m "test: add LearningPaths and GamificationHub page tests"
```

---

### Task 6: Add remaining service tests

**Files:**
- Create: `server/src/__tests__/unit/dailyChallenge.test.ts`
- Create: `server/src/__tests__/unit/virtualItems.test.ts`
- Create: `server/src/__tests__/unit/learningPathService.test.ts`
- Sources: `server/src/services/gamification/dailyChallenge.ts`, `server/src/services/gamification/virtualItems.ts`, `server/src/services/learningPathService.ts`

- [ ] **Step 1: Read source files for each service**

- [ ] **Step 2: Write dailyChallenge tests**

Cover:
- Get today's challenge: found, not found (no challenge configured)
- Submit challenge: success, already completed today, incorrect answer
- Points awarded on completion

- [ ] **Step 3: Write virtualItems tests**

Cover:
- List available items
- Purchase: success, insufficient points, already owned
- Equip/unequip item
- Empty shop: no items available

- [ ] **Step 4: Write learningPathService tests**

Cover:
- List all paths
- Get path detail: found, not found
- Start path for user
- Get user progress: no progress yet, partially complete, fully complete
- Empty paths list

- [ ] **Step 5: Run all new server tests**

```bash
cd server && npx jest src/__tests__/unit/dailyChallenge.test.ts src/__tests__/unit/virtualItems.test.ts src/__tests__/unit/learningPathService.test.ts --no-coverage
```

- [ ] **Step 6: Commit**

```bash
git add server/src/__tests__/unit/
git commit -m "test: add dailyChallenge, virtualItems, learningPathService unit tests"
```

---

### Task 7: Add Store tests

**Files:**
- Create: `frontend/src/__tests__/store/useUIStore.test.ts`
- Create: `frontend/src/__tests__/store/notificationStore.test.ts`
- Sources: `frontend/src/stores/useUIStore.ts`, `frontend/src/store/notificationStore.ts`

- [ ] **Step 1: Read store source files**

- [ ] **Step 2: Write useUIStore tests**

Cover:
- Initial state: sidebar closed, theme default, empty toasts
- `toggleSidebar`: open → closed toggle
- `setTheme`: light/dark/system
- `addToast`: toast appears with correct type (success/error/warning/info)
- `removeToast`: toast removed by ID
- Multiple toasts: can add multiple

Mock nothing — Zustand store is a pure function, test directly.

- [ ] **Step 3: Write notificationStore tests**

Cover:
- Initial state: unreadCount = 0
- `fetchUnreadCount`: success updates count, error leaves count unchanged
- `fetchMessageUnreadCount`: success updates count, error leaves unchanged
- Multiple calls update correctly

- [ ] **Step 4: Run store tests**

```bash
cd frontend && npx jest src/__tests__/store/useUIStore.test.ts src/__tests__/store/notificationStore.test.ts --no-coverage
```

- [ ] **Step 5: Commit**

```bash
git add frontend/src/__tests__/store/
git commit -m "test: add useUIStore and notificationStore tests"
```

---

### Task 8: Final validation

- [ ] **Step 1: Run all frontend tests**

```bash
cd frontend && npm test
```
Expected: All pass.

- [ ] **Step 2: TypeScript check**

```bash
cd frontend && npx tsc --noEmit
```
Expected: No type errors.

- [ ] **Step 3: Run all server tests**

```bash
cd server && npm test
```
Expected: All pass.

- [ ] **Step 4: Run full E2E suite**

```bash
npx playwright test --project=chromium
```
Expected: All pass.

- [ ] **Step 5: Check conditional assertions across entire project**

```bash
grep -rn "if.*toBe\|if.*isVisible" frontend/src/__tests__/ server/src/__tests__/ e2e/ --include="*.{ts,tsx}" || echo "Clean"
```

- [ ] **Step 6: Update PROJECT.md**

Add final test stats: total test files, pass rate, coverage highlights.

- [ ] **Step 7: Final commit**

```bash
git add .
git commit -m "test: Phase 4 gap filling complete — full test coverage achieved"
```
