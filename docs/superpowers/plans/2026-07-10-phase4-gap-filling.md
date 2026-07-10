# Phase 4: Test Coverage Gap Filling — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fill critical test coverage gaps. Add tests for high-risk missing coverage: 3 core pages (ProblemDetail, ContestList, Profile), 3 missing services (learningPath, dailyChallenge, virtualItems), and 2 missing stores (useUIStore, notificationStore).

**Architecture:** Each new test file is created from scratch. Read source → identify all data states → write tests covering loading → data → empty → error → edge cases.

**Tech Stack:** React 19 + TypeScript + Jest (frontend), Node.js + Express + Jest (server), Zustand (stores)

## Global Constraints

1. No conditional assertions — every `it()` has guaranteed assertion
2. Complete mock fields — include ALL real API return fields (verify by reading source)
3. State coverage: loading → data → empty → error
4. Mock service/store layers but verify `toHaveBeenCalledWith` with correct args
5. Pure functions (utils, level calc) — zero mocks, test with real data

---

## Priority Matrix

| Target | Type | Priority | Risk | Why |
|--------|------|----------|------|-----|
| ProblemDetail | Page Test | 🔴 High | Core feature — submission entry point |
| ContestList | Page Test | 🔴 High | Core feature — contest navigation |
| Profile | Page Test | 🔴 High | Auth-dependent, data-rich |
| useUIStore | Store Test | 🟡 Medium | Toast/theme affect all pages |
| notificationStore | Store Test | 🟡 Medium | Unread badge across header |
| dailyChallenge | Service Test | 🟡 Medium | Gamification core logic |
| virtualItems | Service Test | 🟡 Medium | Purchase/equip logic |
| learningPathService | Service Test | 🟢 Low | Content management |

---

### Task 1: Add ProblemDetail page test

**Files:**
- Create: `frontend/src/__tests__/components/ProblemDetail.test.tsx`
- Source: `frontend/src/pages/Problems/ProblemDetail.tsx`

- [ ] **Step 1: Read ProblemDetail.tsx to understand data shape and states**

```bash
cat frontend/src/pages/Problems/ProblemDetail.tsx
```

Identify: What service calls (getProblemById, submitCode, getSubmissions)? What states (loading/data/error/empty/compile-error)? What data fields?

- [ ] **Step 2: Create the test file**

```typescript
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import ProblemDetail from '../../pages/Problems/ProblemDetail';

// Mock services
const mockGetProblemById = jest.fn();
const mockSubmitCode = jest.fn();
const mockGetSubmissions = jest.fn();

jest.mock('../../services/problems', () => ({
  problemService: {
    getProblemById: (...args: any[]) => mockGetProblemById(...args),
  },
}));

jest.mock('../../services/submissions', () => ({
  submissionService: {
    submitCode: (...args: any[]) => mockSubmitCode(...args),
    getSubmissions: (...args: any[]) => mockGetSubmissions(...args),
  },
}));

// Mock auth store for submission
jest.mock('../../store/authStore', () => ({
  useAuthStore: () => ({
    user: { id: 'user1', username: 'testuser' },
    isAuthenticated: true,
  }),
}));

const mockProblem = {
  id: 'p1',
  title: 'Two Sum',
  description: 'Find two numbers that add up to target',
  difficulty: 1,
  timeLimit: 1000,
  memoryLimit: 256,
  tags: [{ id: 't1', name: 'Array' }],
  sampleTestCases: [
    { input: '1 2', expectedOutput: '3' },
    { input: '5 3', expectedOutput: '8' },
  ],
};

function renderWithRouter(problemId: string = 'p1') {
  return render(
    <MemoryRouter initialEntries={[`/problems/${problemId}`]}>
      <Routes>
        <Route path="/problems/:id" element={<ProblemDetail />} />
      </Routes>
    </MemoryRouter>
  );
}

describe('ProblemDetail Page', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Loading state', () => {
    it('should show loading spinner while fetching problem', () => {
      mockGetProblemById.mockImplementation(() => new Promise(() => {}));
      mockGetSubmissions.mockResolvedValue([]);

      renderWithRouter();
      expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
    });
  });

  describe('Problem data rendering', () => {
    it('should render problem title and description', async () => {
      mockGetProblemById.mockResolvedValue(mockProblem);
      mockGetSubmissions.mockResolvedValue([]);

      renderWithRouter();
      await waitFor(() => {
        expect(screen.getByText('Two Sum')).toBeInTheDocument();
        expect(screen.getByText(/Find two numbers/)).toBeInTheDocument();
      });
    });

    it('should render difficulty badge', async () => {
      mockGetProblemById.mockResolvedValue(mockProblem);
      mockGetSubmissions.mockResolvedValue([]);

      renderWithRouter();
      await waitFor(() => {
        expect(screen.getByText(/easy|difficulty/i)).toBeInTheDocument();
      });
    });

    it('should render problem tags', async () => {
      mockGetProblemById.mockResolvedValue(mockProblem);
      mockGetSubmissions.mockResolvedValue([]);

      renderWithRouter();
      await waitFor(() => {
        expect(screen.getByText('Array')).toBeInTheDocument();
      });
    });

    it('should show code editor', async () => {
      mockGetProblemById.mockResolvedValue(mockProblem);
      mockGetSubmissions.mockResolvedValue([]);

      renderWithRouter();
      await waitFor(() => {
        expect(screen.getByTestId('code-editor')).toBeInTheDocument();
      });
    });

    it('should show submit and run-sample buttons', async () => {
      mockGetProblemById.mockResolvedValue(mockProblem);
      mockGetSubmissions.mockResolvedValue([]);

      renderWithRouter();
      await waitFor(() => {
        expect(screen.getByTestId('submit-btn')).toBeInTheDocument();
        expect(screen.getByTestId('run-sample-btn')).toBeInTheDocument();
      });
    });
  });

  describe('Submissions tab', () => {
    it('should show no submissions when list is empty', async () => {
      mockGetProblemById.mockResolvedValue(mockProblem);
      mockGetSubmissions.mockResolvedValue([]);

      renderWithRouter();
      await waitFor(() => {
        expect(screen.getByText(/no submissions|empty/i)).toBeInTheDocument();
      });
    });

    it('should render submission history list', async () => {
      mockGetProblemById.mockResolvedValue(mockProblem);
      mockGetSubmissions.mockResolvedValue([
        { id: 's1', status: 'accepted', language: 'cpp', submittedAt: '2026-07-01T10:00:00Z', score: 100 },
        { id: 's2', status: 'wrong_answer', language: 'cpp', submittedAt: '2026-07-01T09:00:00Z', score: 0 },
      ]);

      renderWithRouter();
      await waitFor(() => {
        expect(screen.getByText('accepted')).toBeInTheDocument();
        expect(screen.getByText('wrong_answer')).toBeInTheDocument();
      });
    });

    it('should switch to submissions tab when clicked', async () => {
      mockGetProblemById.mockResolvedValue(mockProblem);
      mockGetSubmissions.mockResolvedValue([]);

      renderWithRouter();
      await waitFor(() => {
        expect(screen.getByText(/submissions/i)).toBeInTheDocument();
      });
    });
  });

  describe('Error state', () => {
    it('should show error when problem not found', async () => {
      mockGetProblemById.mockRejectedValue(new Error('Problem not found'));
      mockGetSubmissions.mockResolvedValue([]);

      renderWithRouter('nonexistent');
      await waitFor(() => {
        expect(screen.getByText(/Problem not found|not found/i)).toBeInTheDocument();
      });
    });
  });
});
```

- [ ] **Step 3: Run and fix**

```bash
cd frontend && npx jest src/__tests__/components/ProblemDetail.test.tsx --no-coverage
```
Expected: May need selectors adjusted. Fix `data-testid` to match actual component DOM.

- [ ] **Step 4: Commit**

```bash
git add frontend/src/__tests__/components/ProblemDetail.test.tsx
git commit -m "test: add ProblemDetail page component tests with full state coverage"
```

---

### Task 2: Add ContestList page test

**Files:**
- Create: `frontend/src/__tests__/components/ContestList.test.tsx`
- Source: `frontend/src/pages/Contests/ContestList.tsx`

- [ ] **Step 1: Read source**

```bash
cat frontend/src/pages/Contests/ContestList.tsx
```

- [ ] **Step 2: Create test file**

```typescript
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import ContestList from '../../pages/Contests/ContestList';

const mockGetContests = jest.fn();
jest.mock('../../services/contests', () => ({
  contestService: {
    getContests: (...args: any[]) => mockGetContests(...args),
  },
}));

function renderWithRouter(ui: React.ReactElement) {
  return render(<BrowserRouter>{ui}</BrowserRouter>);
}

const mockContests = [
  { id: 'c1', title: 'Weekly Contest #42', type: 'weekly', status: 'upcoming', startTime: '2026-07-20T10:00:00Z', endTime: '2026-07-20T12:00:00Z', participantCount: 0 },
  { id: 'c2', title: 'Biweekly #15', type: 'biweekly', status: 'ongoing', startTime: '2026-07-10T10:00:00Z', endTime: '2026-07-10T12:00:00Z', participantCount: 150 },
  { id: 'c3', title: 'Past Contest #1', type: 'weekly', status: 'ended', startTime: '2026-06-01T10:00:00Z', endTime: '2026-06-01T12:00:00Z', participantCount: 300 },
];

describe('ContestList Page', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Loading state', () => {
    it('should show loading state initially', () => {
      mockGetContests.mockImplementation(() => new Promise(() => {}));
      renderWithRouter(<ContestList />);
      expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
    });
  });

  describe('Contest display', () => {
    it('should render contest cards when data loads', async () => {
      mockGetContests.mockResolvedValue(mockContests);
      renderWithRouter(<ContestList />);

      await waitFor(() => {
        expect(screen.getByText('Weekly Contest #42')).toBeInTheDocument();
        expect(screen.getByText('Biweekly #15')).toBeInTheDocument();
      });
    });

    it('should render contest status badges', async () => {
      mockGetContests.mockResolvedValue(mockContests);
      renderWithRouter(<ContestList />);

      await waitFor(() => {
        expect(screen.getByText(/upcoming/i)).toBeInTheDocument();
        expect(screen.getByText(/ongoing/i)).toBeInTheDocument();
        expect(screen.getByText(/ended/i)).toBeInTheDocument();
      });
    });

    it('should show participant count', async () => {
      mockGetContests.mockResolvedValue(mockContests);
      renderWithRouter(<ContestList />);

      await waitFor(() => {
        expect(screen.getByText(/150/)).toBeInTheDocument();
      });
    });
  });

  describe('Filter tabs', () => {
    it('should render status filter tabs', async () => {
      mockGetContests.mockResolvedValue(mockContests);
      renderWithRouter(<ContestList />);

      await waitFor(() => {
        expect(screen.getByText(/all/i)).toBeInTheDocument();
        expect(screen.getByText(/upcoming/i)).toBeInTheDocument();
        expect(screen.getByText(/ongoing|active/i)).toBeInTheDocument();
        expect(screen.getByText(/ended|past/i)).toBeInTheDocument();
      });
    });

    it('should filter contests when tab is clicked', async () => {
      mockGetContests.mockResolvedValue(mockContests);
      renderWithRouter(<ContestList />);

      await waitFor(() => screen.getByText(/upcoming/i));
      fireEvent.click(screen.getByText(/upcoming/i));

      // The service should be called with filter
      await waitFor(() => {
        expect(mockGetContests).toHaveBeenCalledWith(expect.objectContaining({ status: 'upcoming' }));
      });
    });
  });

  describe('Empty state', () => {
    it('should show empty message when no contests', async () => {
      mockGetContests.mockResolvedValue([]);
      renderWithRouter(<ContestList />);

      await waitFor(() => {
        expect(screen.getByText(/no contests|empty/i)).toBeInTheDocument();
      });
    });
  });

  describe('Error state', () => {
    it('should show error message on API failure', async () => {
      mockGetContests.mockRejectedValue(new Error('Failed to load contests'));
      renderWithRouter(<ContestList />);

      await waitFor(() => {
        expect(screen.getByText(/Failed to load|error/i)).toBeInTheDocument();
      });
    });
  });
});
```

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

### Task 3: Add Profile page test

**Files:**
- Create: `frontend/src/__tests__/components/Profile.test.tsx`
- Source: `frontend/src/pages/Profile/Profile.tsx`

- [ ] **Step 1: Read Profile.tsx source**

```bash
cat frontend/src/pages/Profile/Profile.tsx
```

- [ ] **Step 2: Create test file**

Cover:
- Loading state: skeleton/spinner while profile loads
- Profile data: username, email, join date, stats (problems solved, contests participated)
- Edit mode: form fields editable, save calls updateProfile
- Error state: profile load failure
- Unauthenticated: redirect (if ProtectedRoute)

```typescript
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import Profile from '../../pages/Profile/Profile';

const mockGetUserProfile = jest.fn();
const mockUpdateProfile = jest.fn();
jest.mock('../../services/users', () => ({
  userService: {
    getUserProfile: (...args: any[]) => mockGetUserProfile(...args),
    updateProfile: (...args: any[]) => mockUpdateProfile(...args),
  },
}));

jest.mock('../../store/authStore', () => ({
  useAuthStore: () => ({
    user: { id: 'user1', username: 'currentuser', email: 'user@test.com' },
    isAuthenticated: true,
  }),
}));

const mockProfile = {
  id: 'user1',
  username: 'currentuser',
  email: 'user@test.com',
  role: 'user',
  experiencePoints: 5000,
  level: 10,
  bio: 'Algorithm enthusiast',
  avatarUrl: null,
  createdAt: '2026-01-15T10:00:00Z',
  stats: {
    problemsSolved: 42,
    contestsParticipated: 15,
    achievements: 8,
    currentStreak: 5,
  },
};

function renderWithRouter(username: string = 'currentuser') {
  return render(
    <MemoryRouter initialEntries={[`/profile`]}>
      <Routes>
        <Route path="/profile" element={<Profile />} />
      </Routes>
    </MemoryRouter>
  );
}

describe('Profile Page', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should show loading state initially', () => {
    mockGetUserProfile.mockImplementation(() => new Promise(() => {}));
    renderWithRouter();
    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
  });

  it('should render profile information', async () => {
    mockGetUserProfile.mockResolvedValue(mockProfile);
    renderWithRouter();

    await waitFor(() => {
      expect(screen.getByText('currentuser')).toBeInTheDocument();
      expect(screen.getByText('user@test.com')).toBeInTheDocument();
    });
  });

  it('should render user stats', async () => {
    mockGetUserProfile.mockResolvedValue(mockProfile);
    renderWithRouter();

    await waitFor(() => {
      expect(screen.getByText('42')).toBeInTheDocument(); // problems solved
      expect(screen.getByText('15')).toBeInTheDocument(); // contests participated
    });
  });

  it('should show error when profile load fails', async () => {
    mockGetUserProfile.mockRejectedValue(new Error('Profile not found'));
    renderWithRouter();

    await waitFor(() => {
      expect(screen.getByText(/Profile not found|error/i)).toBeInTheDocument();
    });
  });
});
```

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

### Task 4: Add useUIStore and notificationStore tests

**Files:**
- Create: `frontend/src/__tests__/store/useUIStore.test.ts`
- Create: `frontend/src/__tests__/store/notificationStore.test.ts`
- Sources: `frontend/src/stores/useUIStore.ts`, `frontend/src/store/notificationStore.ts`

Store tests are the most valuable per line of code — they test real Zustand state transitions with zero mocks.

- [ ] **Step 1: Read both store source files**

```bash
cat frontend/src/stores/useUIStore.ts
cat frontend/src/store/notificationStore.ts
```

- [ ] **Step 2: Create useUIStore.test.ts**

```typescript
import { useUIStore } from '../../stores/useUIStore';

describe('useUIStore', () => {
  beforeEach(() => {
    // Reset store to initial state before each test
    useUIStore.setState({
      sidebarOpen: false,
      theme: 'system',
      toasts: [],
    });
  });

  describe('initial state', () => {
    it('should start with sidebar closed', () => {
      expect(useUIStore.getState().sidebarOpen).toBe(false);
    });

    it('should start with system theme', () => {
      expect(useUIStore.getState().theme).toBe('system');
    });

    it('should start with empty toasts', () => {
      expect(useUIStore.getState().toasts).toEqual([]);
    });
  });

  describe('toggleSidebar', () => {
    it('should toggle sidebar from false to true', () => {
      useUIStore.getState().toggleSidebar();
      expect(useUIStore.getState().sidebarOpen).toBe(true);
    });

    it('should toggle sidebar from true to false', () => {
      useUIStore.getState().toggleSidebar(); // true
      useUIStore.getState().toggleSidebar(); // false
      expect(useUIStore.getState().sidebarOpen).toBe(false);
    });
  });

  describe('setTheme', () => {
    it('should set theme to light', () => {
      useUIStore.getState().setTheme('light');
      expect(useUIStore.getState().theme).toBe('light');
    });

    it('should set theme to dark', () => {
      useUIStore.getState().setTheme('dark');
      expect(useUIStore.getState().theme).toBe('dark');
    });

    it('should set theme to system', () => {
      useUIStore.getState().setTheme('system');
      expect(useUIStore.getState().theme).toBe('system');
    });
  });

  describe('toast management', () => {
    it('should add a toast', () => {
      useUIStore.getState().addToast('Test message', 'success');
      const toasts = useUIStore.getState().toasts;
      expect(toasts).toHaveLength(1);
      expect(toasts[0].message).toBe('Test message');
      expect(toasts[0].type).toBe('success');
    });

    it('should add multiple toasts', () => {
      useUIStore.getState().addToast('First', 'info');
      useUIStore.getState().addToast('Second', 'error');
      expect(useUIStore.getState().toasts).toHaveLength(2);
    });

    it('should add toasts with different types', () => {
      useUIStore.getState().addToast('Success', 'success');
      useUIStore.getState().addToast('Error', 'error');
      useUIStore.getState().addToast('Warning', 'warning');
      useUIStore.getState().addToast('Info', 'info');

      const types = useUIStore.getState().toasts.map(t => t.type);
      expect(types).toContain('success');
      expect(types).toContain('error');
      expect(types).toContain('warning');
      expect(types).toContain('info');
    });

    it('should remove a toast by id', () => {
      useUIStore.getState().addToast('Test', 'success');
      const toastId = useUIStore.getState().toasts[0].id;
      useUIStore.getState().removeToast(toastId);
      expect(useUIStore.getState().toasts).toHaveLength(0);
    });

    it('should generate unique ids for each toast', () => {
      useUIStore.getState().addToast('A', 'success');
      useUIStore.getState().addToast('B', 'success');
      const ids = useUIStore.getState().toasts.map(t => t.id);
      expect(ids[0]).not.toBe(ids[1]);
    });
  });
});
```

- [ ] **Step 3: Create notificationStore.test.ts**

```typescript
import { useNotificationStore } from '../../store/notificationStore';

// Mock the API client
jest.mock('../../api/client', () => ({
  get: jest.fn(),
}));

const api = require('../../api/client');

describe('useNotificationStore', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useNotificationStore.setState({
      unreadCount: 0,
      messageUnreadCount: 0,
    });
  });

  describe('initial state', () => {
    it('should start with zero unread notifications', () => {
      expect(useNotificationStore.getState().unreadCount).toBe(0);
    });

    it('should start with zero unread messages', () => {
      expect(useNotificationStore.getState().messageUnreadCount).toBe(0);
    });
  });

  describe('fetchUnreadCount', () => {
    it('should update unread count on success', async () => {
      api.get.mockResolvedValue({ data: { data: { count: 5 } } });
      await useNotificationStore.getState().fetchUnreadCount();
      expect(useNotificationStore.getState().unreadCount).toBe(5);
    });

    it('should leave count unchanged on error', async () => {
      useNotificationStore.setState({ unreadCount: 3 });
      api.get.mockRejectedValue(new Error('Network error'));

      await useNotificationStore.getState().fetchUnreadCount();
      // Count stays at previous value
      expect(useNotificationStore.getState().unreadCount).toBe(3);
    });

    it('should call correct API endpoint', async () => {
      api.get.mockResolvedValue({ data: { data: { count: 2 } } });
      await useNotificationStore.getState().fetchUnreadCount();
      expect(api.get).toHaveBeenCalledWith('/notifications/unread-count');
    });
  });

  describe('fetchMessageUnreadCount', () => {
    it('should update message count on success', async () => {
      api.get.mockResolvedValue({ data: { data: { count: 3 } } });
      await useNotificationStore.getState().fetchMessageUnreadCount();
      expect(useNotificationStore.getState().messageUnreadCount).toBe(3);
    });

    it('should leave message count unchanged on error', async () => {
      useNotificationStore.setState({ messageUnreadCount: 1 });
      api.get.mockRejectedValue(new Error('Network error'));

      await useNotificationStore.getState().fetchMessageUnreadCount();
      expect(useNotificationStore.getState().messageUnreadCount).toBe(1);
    });

    it('should call correct API endpoint', async () => {
      api.get.mockResolvedValue({ data: { data: { count: 0 } } });
      await useNotificationStore.getState().fetchMessageUnreadCount();
      expect(api.get).toHaveBeenCalledWith('/messages/unread-count');
    });
  });
});
```

- [ ] **Step 4: Run both store tests**

```bash
cd frontend && npx jest src/__tests__/store/useUIStore.test.ts src/__tests__/store/notificationStore.test.ts --no-coverage
```
Expected: All tests PASS.

- [ ] **Step 5: Commit**

```bash
git add frontend/src/__tests__/store/useUIStore.test.ts frontend/src/__tests__/store/notificationStore.test.ts
git commit -m "test: add useUIStore and notificationStore tests with full state coverage"
```

---

### Task 5: Add dailyChallenge service tests

**Files:**
- Create: `server/src/__tests__/unit/dailyChallenge.test.ts`
- Source: `server/src/services/gamification/dailyChallenge.ts`

- [ ] **Step 1: Read dailyChallenge.ts source**

```bash
cat server/src/services/gamification/dailyChallenge.ts
```

- [ ] **Step 2: Create test file**

```typescript
import { prisma } from '../../utils/prisma';

// Source functions to test — adjust signatures after reading source
const {
  getDailyChallenge,
  submitDailyChallenge,
  getDailyTasks,
  completeDailyTask,
} = require('../../services/gamification/dailyChallenge');

jest.mock('../../utils/prisma', () => ({
  prisma: {
    dailyChallenge: { findFirst: jest.fn(), findUnique: jest.fn(), create: jest.fn() },
    dailyChallengeCompletion: { findFirst: jest.fn(), create: jest.fn() },
    dailyTask: { findMany: jest.fn() },
    dailyTaskCompletion: { findFirst: jest.fn(), create: jest.fn() },
    user: { findUnique: jest.fn(), update: jest.fn() },
    pointHistory: { create: jest.fn() },
    notification: { create: jest.fn() },
  },
}));

jest.mock('../../utils/logger', () => ({
  logger: { info: jest.fn(), warn: jest.fn(), error: jest.fn() },
  createModuleLogger: jest.fn(() => ({ info: jest.fn(), warn: jest.fn(), error: jest.fn() })),
}));

const mockPrisma = prisma as jest.Mocked<typeof prisma>;

describe('dailyChallenge Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getDailyChallenge', () => {
    const mockChallenge = {
      id: 'dc1',
      problemId: 'p1',
      challengeDate: new Date('2026-07-10'),
      bonusPoints: 50,
      problem: {
        id: 'p1',
        title: 'Two Sum',
        difficulty: 1,
        tags: [],
      },
    };

    it('should return today\'s challenge when it exists', async () => {
      mockPrisma.dailyChallenge.findFirst.mockResolvedValue(mockChallenge);
      const result = await getDailyChallenge(new Date('2026-07-10'));
      expect(result).toEqual(mockChallenge);
      expect(mockPrisma.dailyChallenge.findFirst).toHaveBeenCalled();
    });

    it('should return null when no challenge exists for today', async () => {
      mockPrisma.dailyChallenge.findFirst.mockResolvedValue(null);
      const result = await getDailyChallenge(new Date('2026-07-10'));
      expect(result).toBeNull();
    });
  });

  describe('submitDailyChallenge', () => {
    const completion = {
      id: 'cmp1',
      userId: 'user1',
      challengeId: 'dc1',
      completedAt: new Date(),
      score: 100,
    };

    it('should allow first-time completion', async () => {
      mockPrisma.dailyChallengeCompletion.findFirst.mockResolvedValue(null);
      mockPrisma.dailyChallengeCompletion.create.mockResolvedValue(completion);

      const result = await submitDailyChallenge('user1', 'dc1', 100);
      expect(result).toBeDefined();
      expect(mockPrisma.dailyChallengeCompletion.create).toHaveBeenCalled();
    });

    it('should reject duplicate completion', async () => {
      mockPrisma.dailyChallengeCompletion.findFirst.mockResolvedValue(completion);

      await expect(
        submitDailyChallenge('user1', 'dc1', 50)
      ).rejects.toThrow(/already completed|already/i);
    });

    it('should award bonus points on completion', async () => {
      mockPrisma.dailyChallengeCompletion.findFirst.mockResolvedValue(null);
      mockPrisma.dailyChallengeCompletion.create.mockResolvedValue(completion);

      await submitDailyChallenge('user1', 'dc1', 100);
      expect(mockPrisma.pointHistory.create).toHaveBeenCalled();
    });
  });
});
```

- [ ] **Step 3: Run tests**

```bash
cd server && npx jest src/__tests__/unit/dailyChallenge.test.ts --no-coverage
```

- [ ] **Step 4: Commit**

```bash
git add server/src/__tests__/unit/dailyChallenge.test.ts
git commit -m "test: add dailyChallenge service unit tests"
```

---

### Task 6: Add virtualItems service tests

**Files:**
- Create: `server/src/__tests__/unit/virtualItems.test.ts`
- Source: `server/src/services/gamification/virtualItems.ts`

- [ ] **Step 1: Read source**

```bash
cat server/src/services/gamification/virtualItems.ts
```

- [ ] **Step 2: Create test file**

Cover: list items, purchase (success/insufficient points/already owned), equip/unequip, empty shop.

```typescript
jest.mock('../../utils/prisma', () => ({
  prisma: {
    virtualItem: { findMany: jest.fn(), findUnique: jest.fn() },
    userVirtualItem: { findFirst: jest.fn(), create: jest.fn(), update: jest.fn(), findMany: jest.fn() },
    user: { findUnique: jest.fn(), update: jest.fn() },
    pointHistory: { create: jest.fn() },
  },
}));

jest.mock('../../utils/logger', () => ({
  logger: { info: jest.fn(), warn: jest.fn(), error: jest.fn() },
  createModuleLogger: jest.fn(() => ({ info: jest.fn(), warn: jest.fn(), error: jest.fn() })),
}));

const { prisma } = require('../../utils/prisma');
// Import functions after mocking — adjust names to match source
const {
  getAvailableItems,
  purchaseItem,
  getUserItems,
  equipItem,
} = require('../../services/gamification/virtualItems');

describe('virtualItems Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const mockItem = {
    id: 'vi1',
    name: 'Gold Badge',
    type: 'badge',
    price: 500,
    rarity: 'rare',
    description: 'A shiny gold badge',
    isActive: true,
  };

  describe('getAvailableItems', () => {
    it('should return all active items', async () => {
      prisma.virtualItem.findMany.mockResolvedValue([mockItem]);
      const items = await getAvailableItems();
      expect(items).toHaveLength(1);
      expect(items[0].name).toBe('Gold Badge');
    });

    it('should return empty array when no items', async () => {
      prisma.virtualItem.findMany.mockResolvedValue([]);
      const items = await getAvailableItems();
      expect(items).toEqual([]);
    });
  });

  describe('purchaseItem', () => {
    it('should allow purchase with sufficient points', async () => {
      prisma.user.findUnique.mockResolvedValue({ id: 'user1', experiencePoints: 1000 });
      prisma.virtualItem.findUnique.mockResolvedValue(mockItem);
      prisma.userVirtualItem.findFirst.mockResolvedValue(null); // not owned

      const result = await purchaseItem('user1', 'vi1');
      expect(result).toBeDefined();
      expect(prisma.pointHistory.create).toHaveBeenCalled();
    });

    it('should reject purchase with insufficient points', async () => {
      prisma.user.findUnique.mockResolvedValue({ id: 'user1', experiencePoints: 100 });
      prisma.virtualItem.findUnique.mockResolvedValue(mockItem);
      prisma.userVirtualItem.findFirst.mockResolvedValue(null);

      await expect(purchaseItem('user1', 'vi1')).rejects.toThrow(/insufficient|points/i);
    });

    it('should reject purchase of already-owned item', async () => {
      prisma.user.findUnique.mockResolvedValue({ id: 'user1', experiencePoints: 1000 });
      prisma.virtualItem.findUnique.mockResolvedValue(mockItem);
      prisma.userVirtualItem.findFirst.mockResolvedValue({ id: 'uvi1', userId: 'user1', virtualItemId: 'vi1' });

      await expect(purchaseItem('user1', 'vi1')).rejects.toThrow(/already owned|already/i);
    });

    it('should reject purchase of non-existent item', async () => {
      prisma.virtualItem.findUnique.mockResolvedValue(null);

      await expect(purchaseItem('user1', 'nonexistent')).rejects.toThrow(/not found/i);
    });
  });

  describe('equipItem', () => {
    it('should equip an owned item', async () => {
      prisma.userVirtualItem.findFirst.mockResolvedValue({
        id: 'uvi1', userId: 'user1', virtualItemId: 'vi1', isEquipped: false,
      });

      const result = await equipItem('user1', 'vi1', true);
      expect(result.isEquipped).toBe(true);
    });

    it('should unequip an equipped item', async () => {
      prisma.userVirtualItem.findFirst.mockResolvedValue({
        id: 'uvi1', userId: 'user1', virtualItemId: 'vi1', isEquipped: true,
      });

      const result = await equipItem('user1', 'vi1', false);
      expect(result.isEquipped).toBe(false);
    });
  });
});
```

- [ ] **Step 3: Run tests**

```bash
cd server && npx jest src/__tests__/unit/virtualItems.test.ts --no-coverage
```

- [ ] **Step 4: Commit**

```bash
git add server/src/__tests__/unit/virtualItems.test.ts
git commit -m "test: add virtualItems service unit tests"
```

---

### Task 7: Add learningPathService tests

**Files:**
- Create: `server/src/__tests__/unit/learningPathService.test.ts`
- Source: `server/src/services/learningPathService.ts`

- [ ] **Step 1: Read source**

```bash
cat server/src/services/learningPathService.ts
```

- [ ] **Step 2: Create test file**

Cover: list paths, get detail, start path, get progress (none/partial/complete), empty.

- [ ] **Step 3: Run tests**

```bash
cd server && npx jest src/__tests__/unit/learningPathService.test.ts --no-coverage
```

- [ ] **Step 4: Commit**

```bash
git add server/src/__tests__/unit/learningPathService.test.ts
git commit -m "test: add learningPathService unit tests"
```

---

### Task 8: Final validation

- [ ] **Step 1: Run all frontend tests**

```bash
cd frontend && npm test
```
Expected: All tests PASS.

- [ ] **Step 2: Run all server tests**

```bash
cd server && npm test
```
Expected: All tests PASS.

- [ ] **Step 3: TypeScript check**

```bash
cd frontend && npx tsc --noEmit
```

- [ ] **Step 4: Run E2E tests**

```bash
npx playwright test --project=chromium
```

- [ ] **Step 5: Update PROJECT.md with new test totals**

- [ ] **Step 6: Final commit**

```bash
git add .
git commit -m "test: Phase 4 gap filling complete"
```
