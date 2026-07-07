import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import DailyChallengePage from '../../pages/Gamification/DailyChallengePage';

// Mock hooks
const mockUseDailyChallenge = jest.fn();
const mockUseDailyTasks = jest.fn();
const mockUseLoginStreak = jest.fn();
const mockUseLoginCalendar = jest.fn();

jest.mock('../../hooks/useGamification', () => ({
  useDailyChallenge: (...args: any[]) => mockUseDailyChallenge(...args),
  useDailyTasks: (...args: any[]) => mockUseDailyTasks(...args),
  useLoginStreak: (...args: any[]) => mockUseLoginStreak(...args),
  useLoginCalendar: (...args: any[]) => mockUseLoginCalendar(...args),
}));

// Mock child components
jest.mock('../../components/gamification/DailyChallengeCard', () => ({
  __esModule: true,
  default: ({ challenge, isCompleted }: any) => (
    <div data-testid="daily-challenge-card">
      {challenge ? challenge.problem.title : '今日暂无挑战'}
      {isCompleted && <span data-testid="completed-badge">已完成</span>}
    </div>
  ),
  DailyTaskList: ({ tasks }: any) => (
    <div data-testid="daily-task-list">
      {tasks.length > 0 ? `${tasks.length} tasks` : '暂无任务'}
    </div>
  ),
}));

jest.mock('../../components/gamification/LoginStreakCalendar', () => ({
  __esModule: true,
  default: () => <div data-testid="login-calendar">Calendar</div>,
}));

const mockChallenge = {
  id: 'c1', problemId: 'p1', challengeDate: '2026-07-06',
  bonusPoints: 50,
  problem: { id: 'p1', title: 'Two Sum', description: '...', difficulty: 3, tags: [] },
};

const mockTasks = [
  { id: 't1', title: 'Solve 3 problems', description: 'Solve any 3 problems', current: 1, target: 3, reward: 20, completed: false },
  { id: 't2', title: 'Daily Login', description: 'Login today', current: 1, target: 1, reward: 5, completed: true },
];

describe('DailyChallengePage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const renderPage = () => render(<DailyChallengePage />, { wrapper: BrowserRouter });

  it('renders page title', () => {
    mockUseDailyChallenge.mockReturnValue({ challenge: null, isCompleted: false, loading: false, error: null });
    mockUseDailyTasks.mockReturnValue({ tasksData: null, loading: false });
    mockUseLoginStreak.mockReturnValue({ streakInfo: null, loading: false });
    mockUseLoginCalendar.mockReturnValue({ calendar: [], loading: false });

    renderPage();
    expect(screen.getByText('每日挑战')).toBeInTheDocument();
  });

  it('shows loading spinner for challenge', () => {
    mockUseDailyChallenge.mockReturnValue({ challenge: null, isCompleted: false, loading: true, error: null });
    mockUseDailyTasks.mockReturnValue({ tasksData: null, loading: false });
    mockUseLoginStreak.mockReturnValue({ streakInfo: null, loading: false });
    mockUseLoginCalendar.mockReturnValue({ calendar: [], loading: false });

    renderPage();
    const spinners = document.querySelectorAll('[style*="animation"]');
    expect(spinners.length).toBeGreaterThanOrEqual(1);
  });

  it('renders streak info cards', () => {
    mockUseDailyChallenge.mockReturnValue({ challenge: mockChallenge, isCompleted: false, loading: false, error: null });
    mockUseDailyTasks.mockReturnValue({ tasksData: { tasks: mockTasks, totalCompleted: 1, totalRewards: 25 }, loading: false });
    mockUseLoginStreak.mockReturnValue({ streakInfo: { currentStreak: 5, maxStreak: 10, isLoggedInToday: true, recentLogins: [] }, loading: false });
    mockUseLoginCalendar.mockReturnValue({ calendar: [], loading: false });

    renderPage();
    expect(screen.getByText('5')).toBeInTheDocument();  // current streak
    expect(screen.getByText('10')).toBeInTheDocument(); // max streak
    expect(screen.getByText('1/2')).toBeInTheDocument();  // completed/total tasks count
  });

  it('renders challenge card when challenge exists', () => {
    mockUseDailyChallenge.mockReturnValue({ challenge: mockChallenge, isCompleted: false, loading: false, error: null });
    mockUseDailyTasks.mockReturnValue({ tasksData: { tasks: [], totalCompleted: 0, totalRewards: 0 }, loading: false });
    mockUseLoginStreak.mockReturnValue({ streakInfo: null, loading: false });
    mockUseLoginCalendar.mockReturnValue({ calendar: [], loading: false });

    renderPage();
    expect(screen.getByTestId('daily-challenge-card')).toBeInTheDocument();
  });

  it('shows login calendar when calendar loads', () => {
    mockUseDailyChallenge.mockReturnValue({ challenge: null, isCompleted: false, loading: false, error: null });
    mockUseDailyTasks.mockReturnValue({ tasksData: null, loading: false });
    mockUseLoginStreak.mockReturnValue({ streakInfo: null, loading: false });
    mockUseLoginCalendar.mockReturnValue({ calendar: [], loading: false });

    renderPage();
    expect(screen.getByTestId('login-calendar')).toBeInTheDocument();
  });

  it('renders daily task list when tasks are available', () => {
    mockUseDailyChallenge.mockReturnValue({ challenge: mockChallenge, isCompleted: false, loading: false, error: null });
    mockUseDailyTasks.mockReturnValue({ tasksData: { tasks: mockTasks, totalCompleted: 1, totalRewards: 25 }, loading: false });
    mockUseLoginStreak.mockReturnValue({ streakInfo: { currentStreak: 3, maxStreak: 7, isLoggedInToday: false, recentLogins: [] }, loading: false });
    mockUseLoginCalendar.mockReturnValue({ calendar: [], loading: false });

    renderPage();
    expect(screen.getByTestId('daily-task-list')).toBeInTheDocument();
  });
});
