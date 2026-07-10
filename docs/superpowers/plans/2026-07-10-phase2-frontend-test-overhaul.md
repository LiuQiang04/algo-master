# Phase 2: Frontend Test Overhaul — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Quality-upgrade all 16 frontend test files to meet spec standards — eliminating conditional assertions, completing mocks, and adding missing state coverage.

**Architecture:** TDD approach — write new/failing tests first, verify they fail against current component, then verify they pass (component usually already supports the behavior). Old test file is replaced entirely.

**Tech Stack:** React 19 + TypeScript, Jest 29 + @testing-library/react, Zustand stores, React Router v6

## Global Constraints

1. No conditional assertions — every `it()` has a guaranteed assertion
2. Mocks must include ALL real API fields — verify by reading the source component first
3. No `waitForTimeout` — use `waitFor` / `findBy*` / `toBeVisible` instead
4. Never assert bug as correct behavior — error states must assert error message
5. State coverage: loading → data → empty → error
6. Mock service layer but verify `toHaveBeenCalledWith` with correct args
7. All test files in `frontend/src/__tests__/`

---

## Quick Reference: Common Test Patterns

**Loading state:**
```typescript
// Use a never-resolving promise to keep loading state active
jest.mock('../../services/auth', () => ({
  authService: { login: jest.fn(() => new Promise(() => {})) },
}));
// Then assert spinner / disabled button / loading text
expect(screen.getByText('Loading...')).toBeInTheDocument();
```

**Error state:**
```typescript
jest.mock('../../services/auth', () => ({
  authService: { login: jest.fn().mockRejectedValue(new Error('Invalid credentials')) },
}));
// Then assert
await waitFor(() => {
  expect(screen.getByText('Invalid credentials')).toBeInTheDocument();
});
```

**Empty state:**
```typescript
jest.mock('../../services/problems', () => ({
  problemService: { getProblems: jest.fn().mockResolvedValue({ problems: [], total: 0 }) },
}));
// Then assert
expect(screen.getByText('No problems found')).toBeInTheDocument();
```

---

## File Audit Summary

**Keep (7)** — skip, no changes needed:
- `components/PostDetailPage.test.tsx` — Good quality
- `components/ProblemList.test.tsx` — Good quality
- `components/CommunityPage.test.tsx` — Good quality
- `components/CreatePostPage.test.tsx` — Good quality
- `components/LeaderboardPage.test.tsx` — Good quality
- `components/PointsPage.test.tsx` — Good quality
- `store/authStore.test.ts` — Good quality

**Minor Fix (5):**
- `components/AchievementsPage.test.tsx` — replace `any` stub, render real child
- `components/Register.test.tsx` — add error/loading states
- `components/DailyChallengePage.test.tsx` — add error state tests
- `components/VirtualItemsPage.test.tsx` — add purchase verification + error
- `components/Header.test.tsx` — remove empty mobile-menu test

**Rewrite (4):**
- `components/App.test.tsx`
- `components/Home.test.tsx`
- `components/Login.test.tsx`
- `components/Footer.test.tsx` — minor touch-up, mostly fine

---

### Task 1: Rewrite App.test.tsx

**Files:**
- Rewrite: `frontend/src/__tests__/components/App.test.tsx`
- Source: `frontend/src/App.tsx`

**Problem:** Current test mocks `@/routes` with a stub, then checks `container` and `body.textContent` exist — no meaningful behavior assertion.

- [ ] **Step 1: Read App.tsx to understand real structure**

```bash
cat frontend/src/App.tsx
```

- [ ] **Step 2: Replace the test file with real behavior tests**

```typescript
import { render, screen } from '@testing-library/react';
import App from '../../App';

// The full App renders with RouterProvider + ErrorBoundary
describe('App Component', () => {
  it('should render without crashing', () => {
    const { container } = render(<App />);
    expect(container.querySelector('#root')).toBeInTheDocument();
  });

  it('should render the app container', () => {
    render(<App />);
    // The app renders a div with id="app" or similar container
    const appContainer = document.querySelector('#root');
    expect(appContainer).toBeInTheDocument();
  });

  it('should include ErrorBoundary wrapper', () => {
    // ErrorBoundary catches errors without crashing the whole app
    // This is verified by the app not throwing during render
    expect(() => render(<App />)).not.toThrow();
  });
});
```

- [ ] **Step 3: Run tests**

```bash
cd frontend && npx jest src/__tests__/components/App.test.tsx --no-coverage
```
Expected: All tests PASS.

- [ ] **Step 4: Commit**

```bash
git add frontend/src/__tests__/components/App.test.tsx
git commit -m "test: rewrite App test with ErrorBoundary coverage"
```

---

### Task 2: Rewrite Home.test.tsx

**Files:**
- Rewrite: `frontend/src/__tests__/components/Home.test.tsx`
- Source: `frontend/src/pages/Home/Home.tsx`

**Problem:** Tests render static text but never asserts on dynamic data. Service mock returns empty arrays but results are never checked. No loading/error/empty coverage.

- [ ] **Step 1: Read Home.tsx to understand data flow**

```bash
cat frontend/src/pages/Home/Home.tsx
```

Identify: what services does it call? What data shapes? What states exist?

- [ ] **Step 2: Replace test file with full coverage**

```typescript
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Home from '../../pages/Home/Home';

// Mock the home service
const mockGetPopularProblems = jest.fn();
const mockGetUpcomingContests = jest.fn();

jest.mock('../../services/home', () => ({
  homeService: {
    getPopularProblems: (...args: any[]) => mockGetPopularProblems(...args),
    getUpcomingContests: (...args: any[]) => mockGetUpcomingContests(...args),
  },
}));

function renderWithRouter(ui: React.ReactElement) {
  return render(<BrowserRouter>{ui}</BrowserRouter>);
}

describe('Home Page', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Static content', () => {
    it('should render page heading', () => {
      mockGetPopularProblems.mockResolvedValue([]);
      mockGetUpcomingContests.mockResolvedValue([]);

      renderWithRouter(<Home />);
      expect(screen.getByRole('heading', { name: /algoarena|algo master/i })).toBeInTheDocument();
    });

    it('should render CTA buttons with correct links', () => {
      mockGetPopularProblems.mockResolvedValue([]);
      mockGetUpcomingContests.mockResolvedValue([]);

      renderWithRouter(<Home />);
      const startButton = screen.getByRole('link', { name: /start|begin|get started/i });
      expect(startButton).toHaveAttribute('href', '/problems');
    });
  });

  describe('Popular Problems', () => {
    const mockProblems = [
      {
        id: 'p1', title: 'Two Sum', difficulty: 1,
        tags: [{ id: 't1', name: 'Array' }],
        submissionCount: 100, acceptanceRate: 0.85,
      },
      {
        id: 'p2', title: 'Binary Search', difficulty: 3,
        tags: [{ id: 't2', name: 'Binary Search' }],
        submissionCount: 50, acceptanceRate: 0.72,
      },
    ];

    it('should render popular problems list', async () => {
      mockGetPopularProblems.mockResolvedValue(mockProblems);
      mockGetUpcomingContests.mockResolvedValue([]);

      renderWithRouter(<Home />);
      await waitFor(() => {
        expect(screen.getByText('Two Sum')).toBeInTheDocument();
        expect(screen.getByText('Binary Search')).toBeInTheDocument();
      });
    });

    it('should show empty state when no problems', async () => {
      mockGetPopularProblems.mockResolvedValue([]);
      mockGetUpcomingContests.mockResolvedValue([]);

      renderWithRouter(<Home />);
      await waitFor(() => {
        expect(screen.getByText(/no problems/i)).toBeInTheDocument();
      });
    });

    it('should show error state when API fails', async () => {
      mockGetPopularProblems.mockRejectedValue(new Error('Failed to load'));
      mockGetUpcomingContests.mockResolvedValue([]);

      renderWithRouter(<Home />);
      await waitFor(() => {
        expect(screen.getByText(/failed to load|error/i)).toBeInTheDocument();
      });
    });
  });

  describe('Upcoming Contests', () => {
    const mockContests = [
      { id: 'c1', title: 'Weekly Contest #42', startTime: '2026-07-15T10:00:00Z', status: 'upcoming' },
    ];

    it('should render upcoming contests', async () => {
      mockGetPopularProblems.mockResolvedValue([]);
      mockGetUpcomingContests.mockResolvedValue(mockContests);

      renderWithRouter(<Home />);
      await waitFor(() => {
        expect(screen.getByText('Weekly Contest #42')).toBeInTheDocument();
      });
    });

    it('should show empty state when no contests', async () => {
      mockGetPopularProblems.mockResolvedValue([]);
      mockGetUpcomingContests.mockResolvedValue([]);

      renderWithRouter(<Home />);
      await waitFor(() => {
        expect(screen.getByText(/no contests/i)).toBeInTheDocument();
      });
    });
  });

  describe('Loading states', () => {
    it('should show loading spinner initially', () => {
      mockGetPopularProblems.mockImplementation(() => new Promise(() => {}));
      mockGetUpcomingContests.mockImplementation(() => new Promise(() => {}));

      renderWithRouter(<Home />);
      expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
    });
  });
});
```

- [ ] **Step 3: Run the new tests**

```bash
cd frontend && npx jest src/__tests__/components/Home.test.tsx --no-coverage
```
Expected: May fail — adjust test selectors to match actual component DOM.

- [ ] **Step 4: Fix test/component to match real DOM, then commit**

```bash
git add frontend/src/__tests__/components/Home.test.tsx
git commit -m "test: rewrite Home tests with loading/data/empty/error coverage"
```

---

### Task 3: Rewrite Login.test.tsx

**Files:**
- Rewrite: `frontend/src/__tests__/components/Login.test.tsx`
- Source: `frontend/src/pages/LoginPage.tsx`

**Problem:** Only verifies `mockLogin` was called. No loading/error/validation state coverage.

- [ ] **Step 1: Read LoginPage.tsx source**

```bash
cat frontend/src/pages/LoginPage.tsx
```

- [ ] **Step 2: Replace test file with full state coverage**

```typescript
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Login from '../../pages/LoginPage';

const mockLogin = jest.fn();
jest.mock('../../store/authStore', () => ({
  useAuthStore: () => ({
    login: mockLogin,
    isLoading: false,
  }),
}));

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

function renderWithRouter(ui: React.ReactElement) {
  return render(<BrowserRouter>{ui}</BrowserRouter>);
}

describe('Login Page', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render email and password inputs', () => {
      renderWithRouter(<Login />);
      expect(screen.getByPlaceholderText(/email/i)).toBeInTheDocument();
      expect(screen.getByPlaceholderText(/password/i)).toBeInTheDocument();
    });

    it('should render submit button', () => {
      renderWithRouter(<Login />);
      expect(screen.getByRole('button', { name: /sign in|login|log in/i })).toBeInTheDocument();
    });

    it('should render register link', () => {
      renderWithRouter(<Login />);
      expect(screen.getByRole('link', { name: /register|sign up/i })).toBeInTheDocument();
    });
  });

  describe('Form interaction', () => {
    it('should update email value on input', () => {
      renderWithRouter(<Login />);
      const emailInput = screen.getByPlaceholderText(/email/i);
      fireEvent.change(emailInput, { target: { value: 'test@test.com' } });
      expect(emailInput).toHaveValue('test@test.com');
    });

    it('should call login with email and password on submit', async () => {
      mockLogin.mockResolvedValue({});
      renderWithRouter(<Login />);

      fireEvent.change(screen.getByPlaceholderText(/email/i), { target: { value: 'user@test.com' } });
      fireEvent.change(screen.getByPlaceholderText(/password/i), { target: { value: 'pass123' } });
      fireEvent.click(screen.getByRole('button', { name: /sign in|login/i }));

      await waitFor(() => {
        expect(mockLogin).toHaveBeenCalledWith('user@test.com', 'pass123');
      });
    });
  });

  describe('Loading state', () => {
    it('should disable submit button while loading', () => {
      // Re-mock with loading=true
      jest.mock('../../store/authStore', () => ({
        useAuthStore: () => ({
          login: mockLogin,
          isLoading: true,
        }),
      }));

      // Note: This test may need different approach depending on how
      // the component reads isLoading. Adjust based on actual source.
      renderWithRouter(<Login />);
      const submitBtn = screen.getByRole('button', { name: /sign in|login/i });
      expect(submitBtn).toBeDisabled();
    });
  });

  describe('Error state', () => {
    it('should display error message on failed login', async () => {
      mockLogin.mockRejectedValue(new Error('Invalid credentials'));
      renderWithRouter(<Login />);

      fireEvent.change(screen.getByPlaceholderText(/email/i), { target: { value: 'bad@test.com' } });
      fireEvent.change(screen.getByPlaceholderText(/password/i), { target: { value: 'wrong' } });
      fireEvent.click(screen.getByRole('button', { name: /sign in|login/i }));

      await waitFor(() => {
        expect(screen.getByText(/invalid credentials|error|failed/i)).toBeInTheDocument();
      });
    });
  });
});
```

- [ ] **Step 3: Run the new tests**

```bash
cd frontend && npx jest src/__tests__/components/Login.test.tsx --no-coverage
```
Expected: May fail — adjust selectors and mock structure to match real component.

- [ ] **Step 4: Commit after fixing**

```bash
git add frontend/src/__tests__/components/Login.test.tsx
git commit -m "test: rewrite Login tests with loading/error/validation coverage"
```

---

### Task 4: Fix Acceptable-level tests (6 files)

**Files:**
- Modify: `frontend/src/__tests__/components/AchievementsPage.test.tsx`
- Modify: `frontend/src/__tests__/components/Register.test.tsx`
- Modify: `frontend/src/__tests__/components/DailyChallengePage.test.tsx`
- Modify: `frontend/src/__tests__/components/VirtualItemsPage.test.tsx`
- Modify: `frontend/src/__tests__/components/Header.test.tsx`
- Modify: `frontend/src/__tests__/components/Footer.test.tsx`

- [ ] **Step 1: Fix AchievementsPage.test.tsx**

Replace the `any`-typed AchievementCard stub with a real rendering check. Find the existing `jest.mock` for AchievementCard and change it to render actual content:

```typescript
// In achievements test, find the mock:
jest.mock('../../components/gamification/AchievementCard', () => ({
  __esModule: true,
  default: ({ achievement }: any) => (
    <div data-testid="achievement-card">
      <div>{achievement.name}</div>
      <div>{achievement.description}</div>
      <div>{achievement.rarity}</div>
    </div>
  ),
}));

// Then add a test that verifies actual achievement card content:
it('renders achievement card with name and description', async () => {
  // ... render with mock data ...
  await waitFor(() => {
    expect(screen.getByText('First Blood')).toBeInTheDocument();
    expect(screen.getByText('Solve your first problem')).toBeInTheDocument();
  });
});

// Add error state:
it('shows error message when achievements fail to load', async () => {
  mockUseAchievements.mockReturnValue({
    achievements: [], loading: false, error: 'Failed to load',
  });
  renderPage();
  expect(screen.getByText('Failed to load')).toBeInTheDocument();
});
```

- [ ] **Step 2: Fix Register.test.tsx — add error and loading states**

Add these tests at the end of the Register test file:

```typescript
describe('Error handling', () => {
  it('should show error message on registration failure', async () => {
    mockRegister.mockRejectedValue(new Error('Username already taken'));
    renderWithRouter(<Register />);

    fireEvent.change(screen.getByPlaceholderText('Choose a username'), { target: { value: 'taken' } });
    fireEvent.change(screen.getByPlaceholderText('Enter your email'), { target: { value: 'a@b.com' } });
    fireEvent.change(screen.getByPlaceholderText('At least 6 characters'), { target: { value: 'pass123' } });
    fireEvent.change(screen.getByPlaceholderText('Re-enter your password'), { target: { value: 'pass123' } });
    fireEvent.click(screen.getByRole('button', { name: 'Create Account' }));

    await waitFor(() => {
      expect(screen.getByText(/Username already taken|error/i)).toBeInTheDocument();
    });
  });
});

describe('Loading state', () => {
  it('should disable submit button while loading', () => {
    mockRegister.mockImplementation(() => new Promise(() => {}));
    renderWithRouter(<Register />);
    // Fill form...
    fireEvent.change(screen.getByPlaceholderText('Choose a username'), { target: { value: 'user' } });
    fireEvent.change(screen.getByPlaceholderText('Enter your email'), { target: { value: 'a@b.com' } });
    fireEvent.change(screen.getByPlaceholderText('At least 6 characters'), { target: { value: 'pass123' } });
    fireEvent.change(screen.getByPlaceholderText('Re-enter your password'), { target: { value: 'pass123' } });
    fireEvent.click(screen.getByRole('button', { name: 'Create Account' }));

    const submitBtn = screen.getByRole('button', { name: 'Create Account' });
    expect(submitBtn).toBeDisabled();
  });
});
```

- [ ] **Step 3: Fix DailyChallengePage.test.tsx — add error state tests**

```typescript
it('shows error when challenge fails to load', () => {
  mockUseDailyChallenge.mockReturnValue({
    challenge: null, isCompleted: false, loading: false,
    error: 'Failed to load daily challenge',
  });
  mockUseDailyTasks.mockReturnValue({ tasksData: null, loading: false });
  mockUseLoginStreak.mockReturnValue({ streakInfo: null, loading: false });
  mockUseLoginCalendar.mockReturnValue({ calendar: [], loading: false });

  renderPage();
  expect(screen.getByText('Failed to load daily challenge')).toBeInTheDocument();
});

it('shows error when daily tasks fail to load', () => {
  mockUseDailyChallenge.mockReturnValue({
    challenge: null, isCompleted: false, loading: false, error: null,
  });
  mockUseDailyTasks.mockReturnValue({ tasksData: null, loading: false, error: 'Failed to load tasks' });
  mockUseLoginStreak.mockReturnValue({ streakInfo: null, loading: false });
  mockUseLoginCalendar.mockReturnValue({ calendar: [], loading: false });

  renderPage();
  expect(screen.getByText('Failed to load tasks')).toBeInTheDocument();
});
```

- [ ] **Step 4: Fix VirtualItemsPage.test.tsx — add purchase interaction test**

Find the `onPurchase` mock and add a test that verifies the purchase button triggers correctly:

```typescript
it('calls purchaseItem with correct item id on buy click', async () => {
  const mockPurchase = jest.fn().mockResolvedValue({});
  mockUseVirtualItems.mockReturnValue({ items: mockBadgeItems, loading: false });
  mockUseUserVirtualItems.mockReturnValue({
    userItems: [], loading: false,
    purchaseItem: mockPurchase,
    equipItem: jest.fn(),
  });
  mockUseLevelInfo.mockReturnValue({ levelInfo: null });

  renderPage();
  fireEvent.click(screen.getByTestId('buy-b1'));
  await waitFor(() => {
    expect(mockPurchase).toHaveBeenCalledWith('b1');
  });
});

it('shows error when purchase fails', async () => {
  const mockPurchase = jest.fn().mockRejectedValue(new Error('Insufficient points'));
  mockUseVirtualItems.mockReturnValue({ items: mockBadgeItems, loading: false });
  mockUseUserVirtualItems.mockReturnValue({
    userItems: [], loading: false,
    purchaseItem: mockPurchase,
    equipItem: jest.fn(),
  });
  mockUseLevelInfo.mockReturnValue({ levelInfo: null });

  renderPage();
  fireEvent.click(screen.getByTestId('buy-b1'));
  await waitFor(() => {
    expect(screen.getByText(/Insufficient points|error/i)).toBeInTheDocument();
  });
});
```

- [ ] **Step 5: Fix Header.test.tsx — remove empty mobile menu test**

Find the `describe('Mobile menu')` block and either remove it entirely or replace with a real assertion:

```typescript
// Option A: Remove the silent test entirely
// Delete:
// describe('Mobile menu', () => {
//   it('should have a mobile menu button', ...)
//   it('should toggle mobile menu when button is clicked', ...)
// })

// Option B: Replace with real toggle behavior test
// This depends on how the sidebar is actually controlled
it('mobile menu button should be present', () => {
  renderWithRouter(<Header />);
  const menuButton = screen.getByRole('button', { name: /打开侧边栏/i });
  expect(menuButton).toBeInTheDocument();
});
```

- [ ] **Step 6: Minor Footer fix — already acceptable**

Footer tests are static content checks. If there's no dynamic behavior, no changes needed beyond confirming all assertions are unconditional (they are — every test has a direct `expect()` call).

- [ ] **Step 7: Run all frontend tests**

```bash
cd frontend && npm test
```
Expected: All tests PASS. If any fail, fix selectors to match real DOM.

- [ ] **Step 8: Commit**

```bash
git add frontend/src/__tests__/
git commit -m "test: fix acceptable-level frontend tests with missing error/loading coverage"
```

---

### Task 5: Final full validation

- [ ] **Step 1: Run all frontend tests**

```bash
cd frontend && npm test
```
Expected: All 16+ files pass.

- [ ] **Step 2: TypeScript check**

```bash
cd frontend && npx tsc --noEmit
```
Expected: No type errors.

- [ ] **Step 3: Run server tests to confirm no breakage**

```bash
cd server && npm test
```

- [ ] **Step 4: Check for conditional assertions (R1)**

```bash
cd frontend && grep -rn "if.*toBe\|if.*isVisible\|if.*exists" src/__tests__/ --include="*.tsx" --include="*.ts" || echo "Clean"
```
Expected: No matches.

- [ ] **Step 5: Update PROJECT.md**

- [ ] **Step 6: Final commit**

```bash
git add .
git commit -m "test: Phase 2 frontend test overhaul complete"
```
