import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import AchievementsPage from '../../pages/Gamification/AchievementsPage';
import type { UserAchievement } from '../../types/gamification';

// Mock hooks
const mockUseAchievements = jest.fn();

jest.mock('../../hooks/useGamification', () => ({
  useAchievements: (...args: any[]) => mockUseAchievements(...args),
}));

// Mock AchievementCard
jest.mock('../../components/gamification/AchievementCard', () => ({
  __esModule: true,
  default: ({ achievement, isUnlocked }: any) => (
    <div data-testid="achievement-card" data-unlocked={isUnlocked}>
      <div>{achievement.name}</div>
      <div>{achievement.description}</div>
    </div>
  ),
}));

describe('AchievementsPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const renderPage = () => render(<AchievementsPage />, { wrapper: BrowserRouter });

  const mockAchievements: UserAchievement[] = [
    {
      id: '1', name: 'First Blood', description: 'Solve first problem',
      category: 'problem', rarity: 'common', iconUrl: null, points: 50,
      requirement: {}, isActive: true,
      unlockedAt: '2026-06-01T00:00:00Z', progress: 100,
    },
    {
      id: '2', name: 'Bug Hunter', description: 'Find 10 bugs',
      category: 'special', rarity: 'rare', iconUrl: null, points: 100,
      requirement: {}, isActive: true,
      unlockedAt: '', progress: 60,
    },
  ];

  it('renders page title and description', () => {
    mockUseAchievements.mockReturnValue({
      achievements: [], stats: null, loading: false, error: null,
    });
    renderPage();
    expect(screen.getByText('成就系统')).toBeInTheDocument();
  });

  it('shows loading spinner when loading', () => {
    mockUseAchievements.mockReturnValue({
      achievements: [], stats: null, loading: true, error: null,
    });
    renderPage();
    const spinners = document.querySelectorAll('.animate-spin');
    expect(spinners.length).toBeGreaterThanOrEqual(1);
  });

  it('displays error message and retry button', () => {
    mockUseAchievements.mockReturnValue({
      achievements: [], stats: null, loading: false, error: 'Network Error',
    });
    renderPage();
    expect(screen.getByText('Network Error')).toBeInTheDocument();
    expect(screen.getByText('重试')).toBeInTheDocument();
  });

  it('renders stats cards when stats are available', () => {
    mockUseAchievements.mockReturnValue({
      achievements: mockAchievements,
      stats: { total: 10, unlocked: 5, percentage: 50, byCategory: [] },
      loading: false, error: null,
    });
    renderPage();
    expect(screen.getByText('5')).toBeInTheDocument(); // unlocked count
    expect(screen.getByText('10')).toBeInTheDocument(); // total count
    expect(screen.getByText('50%')).toBeInTheDocument(); // percentage
  });

  it('renders achievement cards', () => {
    mockUseAchievements.mockReturnValue({
      achievements: mockAchievements,
      stats: { total: 10, unlocked: 5, percentage: 50, byCategory: [] },
      loading: false, error: null,
    });
    renderPage();
    expect(screen.getByText('First Blood')).toBeInTheDocument();
    expect(screen.getByText('Bug Hunter')).toBeInTheDocument();
  });

  it('passes isUnlocked correctly based on unlockedAt', () => {
    mockUseAchievements.mockReturnValue({
      achievements: mockAchievements,
      stats: { total: 10, unlocked: 5, percentage: 50, byCategory: [] },
      loading: false, error: null,
    });
    renderPage();
    const cards = screen.getAllByTestId('achievement-card');
    expect(cards[0]).toHaveAttribute('data-unlocked', 'true');  // First Blood has unlockedAt
    expect(cards[1]).toHaveAttribute('data-unlocked', 'false'); // Bug Hunter has no unlockedAt
  });

  it('filters achievements by category', () => {
    mockUseAchievements.mockReturnValue({
      achievements: mockAchievements,
      stats: { total: 10, unlocked: 5, percentage: 50, byCategory: [] },
      loading: false, error: null,
    });
    renderPage();
    // Click '解题' filter
    fireEvent.click(screen.getByText('解题'));
    expect(screen.getByText('First Blood')).toBeInTheDocument();
    // Bug Hunter is 'special' category, should be filtered out
    expect(screen.queryByText('Bug Hunter')).not.toBeInTheDocument();
  });

  it('shows empty state when no achievements match filter', () => {
    mockUseAchievements.mockReturnValue({
      achievements: [],
      stats: { total: 0, unlocked: 0, percentage: 0, byCategory: [] },
      loading: false, error: null,
    });
    renderPage();
    expect(screen.getByText('暂无成就数据')).toBeInTheDocument();
  });
});
