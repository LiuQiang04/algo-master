import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import PointsPage from '../../pages/Gamification/PointsPage';

const mockUsePointHistory = jest.fn();
const mockUseLevelInfo = jest.fn();
const mockUseGamificationOverview = jest.fn();

jest.mock('../../hooks/useGamification', () => ({
  usePointHistory: (...args: any[]) => mockUsePointHistory(...args),
  useLevelInfo: (...args: any[]) => mockUseLevelInfo(...args),
  useGamificationOverview: (...args: any[]) => mockUseGamificationOverview(...args),
}));

jest.mock('../../components/gamification/LevelProgress', () => ({
  __esModule: true,
  default: ({ levelInfo }: any) => <div data-testid="level-progress">Level {levelInfo.level}</div>,
}));

jest.mock('../../components/gamification/PointHistoryList', () => ({
  __esModule: true,
  default: ({ history, showLoadMore, onLoadMore }: any) => (
    <div data-testid="point-history-list">
      {history.length > 0 ? (
        history.map((h: any) => <div key={h.id}>{h.description}</div>)
      ) : (
        <div>暂无积分记录</div>
      )}
      {showLoadMore && <button onClick={onLoadMore} data-testid="load-more">加载更多</button>}
    </div>
  ),
}));

const mockHistory = [
  { id: 'h1', points: 50, type: 'solve', description: 'Solved Two Sum', relatedId: null, createdAt: '2026-07-06T10:00:00Z' },
  { id: 'h2', points: 100, type: 'achievement', description: 'Unlocked First Blood', relatedId: null, createdAt: '2026-07-05T10:00:00Z' },
];

describe('PointsPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const renderPage = () => render(<PointsPage />, { wrapper: BrowserRouter });

  it('renders page title', () => {
    mockUsePointHistory.mockReturnValue({ history: [], loading: false, error: null, hasMore: false, loadMore: jest.fn() });
    mockUseLevelInfo.mockReturnValue({ levelInfo: null, loading: false });
    mockUseGamificationOverview.mockReturnValue({ overview: null });

    renderPage();
    expect(screen.getByText('积分中心')).toBeInTheDocument();
  });

  it('shows loading spinner when loading history', () => {
    mockUsePointHistory.mockReturnValue({ history: [], loading: true, error: null, hasMore: false, loadMore: jest.fn() });
    mockUseLevelInfo.mockReturnValue({ levelInfo: null, loading: false });
    mockUseGamificationOverview.mockReturnValue({ overview: null });

    renderPage();
    const spinner = document.querySelector('[style*="animation: spin"]');
    expect(spinner).not.toBeNull();
  });

  it('renders level progress', () => {
    mockUsePointHistory.mockReturnValue({ history: [], loading: false, error: null, hasMore: false, loadMore: jest.fn() });
    mockUseLevelInfo.mockReturnValue({ levelInfo: { level: 15, currentExp: 800, nextLevelExp: 1000, progress: 80, totalExp: 5000 }, loading: false });
    mockUseGamificationOverview.mockReturnValue({ overview: null });

    renderPage();
    expect(screen.getByTestId('level-progress')).toBeInTheDocument();
  });

  it('renders overview stats cards', () => {
    mockUsePointHistory.mockReturnValue({ history: [], loading: false, error: null, hasMore: false, loadMore: jest.fn() });
    mockUseLevelInfo.mockReturnValue({ levelInfo: null, loading: false });
    mockUseGamificationOverview.mockReturnValue({
      overview: { level: 10, currentExp: 500, nextLevelExp: 1000, progress: 50, totalExp: 5000, title: null, achievementCount: 12, completedDailyChallenges: 8, loginStreak: 3, maxLoginStreak: 7, globalRank: 42 },
    });

    renderPage();
    expect(screen.getByText('5,000')).toBeInTheDocument();  // totalExp formatted
    expect(screen.getByText('12')).toBeInTheDocument();      // achievementCount
    expect(screen.getByText('8')).toBeInTheDocument();       // completedDailyChallenges
    expect(screen.getByText('#42')).toBeInTheDocument();     // globalRank
  });

  it('renders point history list', () => {
    mockUsePointHistory.mockReturnValue({ history: mockHistory, loading: false, error: null, hasMore: false, loadMore: jest.fn() });
    mockUseLevelInfo.mockReturnValue({ levelInfo: null, loading: false });
    mockUseGamificationOverview.mockReturnValue({ overview: null });

    renderPage();
    expect(screen.getByText('Solved Two Sum')).toBeInTheDocument();
    expect(screen.getByText('Unlocked First Blood')).toBeInTheDocument();
  });

  it('displays load more button when hasMore is true', () => {
    const mockLoadMore = jest.fn();
    mockUsePointHistory.mockReturnValue({ history: mockHistory, loading: false, error: null, hasMore: true, loadMore: mockLoadMore });
    mockUseLevelInfo.mockReturnValue({ levelInfo: null, loading: false });
    mockUseGamificationOverview.mockReturnValue({ overview: null });

    renderPage();
    const loadMoreBtn = screen.getByTestId('load-more');
    expect(loadMoreBtn).toBeInTheDocument();
    fireEvent.click(loadMoreBtn);
    expect(mockLoadMore).toHaveBeenCalled();
  });

  it('shows error state', () => {
    mockUsePointHistory.mockReturnValue({ history: [], loading: false, error: 'Failed to load', hasMore: false, loadMore: jest.fn() });
    mockUseLevelInfo.mockReturnValue({ levelInfo: null, loading: false });
    mockUseGamificationOverview.mockReturnValue({ overview: null });

    renderPage();
    expect(screen.getByText('Failed to load')).toBeInTheDocument();
  });
});
