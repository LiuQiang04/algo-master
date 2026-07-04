/**
 * Unit tests for the LeaderboardPage component.
 * Tests rendering, loading, error, and data display.
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import LeaderboardPage from '../../pages/Gamification/LeaderboardPage';

// Mock the hooks
const mockUseLeaderboard = jest.fn();
const mockUseUserRank = jest.fn();

jest.mock('../../hooks/useGamification', () => ({
  useLeaderboard: (...args: any[]) => mockUseLeaderboard(...args),
  useUserRank: (...args: any[]) => mockUseUserRank(...args),
}));

// Mock LeaderboardTable as simple render
jest.mock('../../components/gamification/LeaderboardTable', () => ({
  __esModule: true,
  default: ({ entries }: any) => (
    <div data-testid="leaderboard-table">
      {entries.length > 0 ? (
        entries.map((e: any) => (
          <div key={e.id} data-testid="entry-row">
            {e.username}
          </div>
        ))
      ) : (
        <div data-testid="empty-table">暂无数据</div>
      )}
    </div>
  ),
}));

describe('LeaderboardPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const renderPage = () => render(<LeaderboardPage />, { wrapper: BrowserRouter });

  it('renders page title', () => {
    mockUseLeaderboard.mockReturnValue({
      entries: [],
      loading: false,
      error: null,
      hasMore: false,
      loadMore: jest.fn(),
    });
    mockUseUserRank.mockReturnValue({ ranks: null, loading: false });

    renderPage();
    expect(screen.getByText('排行榜')).toBeInTheDocument();
  });

  it('shows loading spinner when loading', () => {
    mockUseLeaderboard.mockReturnValue({
      entries: [],
      loading: true,
      error: null,
      hasMore: false,
      loadMore: jest.fn(),
    });
    mockUseUserRank.mockReturnValue({ ranks: null, loading: false });

    renderPage();
    // Should show spinner (the animated div)
    const container = document.querySelector('div[style*="animation"]');
    expect(container).toBeInTheDocument();
  });

  it('displays error message when error occurs', () => {
    mockUseLeaderboard.mockReturnValue({
      entries: [],
      loading: false,
      error: 'Failed to load leaderboard',
      hasMore: false,
      loadMore: jest.fn(),
    });
    mockUseUserRank.mockReturnValue({ ranks: null, loading: false });

    renderPage();
    expect(screen.getByText('Failed to load leaderboard')).toBeInTheDocument();
  });

  it('renders user rank cards when ranks are available', () => {
    mockUseLeaderboard.mockReturnValue({
      entries: [],
      loading: false,
      error: null,
      hasMore: false,
      loadMore: jest.fn(),
    });
    mockUseUserRank.mockReturnValue({
      ranks: { global: 1, friends: 3 },
      loading: false,
    });

    renderPage();
    expect(screen.getByText('#1')).toBeInTheDocument();
    expect(screen.getByText('#3')).toBeInTheDocument();
  });

  it('renders leaderboard entries', () => {
    mockUseLeaderboard.mockReturnValue({
      entries: [
        { id: '1', username: 'alice', rank: 1, level: 20, experiencePoints: 15000, rating: 2100, avatarUrl: null, title: null },
        { id: '2', username: 'bob', rank: 2, level: 10, experiencePoints: 8000, rating: 1800, avatarUrl: null, title: null },
      ],
      loading: false,
      error: null,
      hasMore: false,
      loadMore: jest.fn(),
    });
    mockUseUserRank.mockReturnValue({ ranks: null, loading: false });

    renderPage();
    expect(screen.getByText('alice')).toBeInTheDocument();
    expect(screen.getByText('bob')).toBeInTheDocument();
  });

  it('switches tabs and calls useLeaderboard with different type', async () => {
    mockUseLeaderboard.mockReturnValue({
      entries: [],
      loading: false,
      error: null,
      hasMore: false,
      loadMore: jest.fn(),
    });
    mockUseUserRank.mockReturnValue({ ranks: null, loading: false });

    renderPage();

    // Click "好友排行" tab
    fireEvent.click(screen.getByText('好友排行'));

    // The hook should have been called with 'friends'
    await waitFor(() => {
      expect(mockUseLeaderboard).toHaveBeenCalledWith('friends');
    });
  });

  it('shows load more button when hasMore is true', () => {
    mockUseLeaderboard.mockReturnValue({
      entries: [
        { id: '1', username: 'alice', rank: 1, level: 20, experiencePoints: 15000, rating: 2100, avatarUrl: null, title: null },
      ],
      loading: false,
      error: null,
      hasMore: true,
      loadMore: jest.fn(),
    });
    mockUseUserRank.mockReturnValue({ ranks: null, loading: false });

    renderPage();
    expect(screen.getByText('加载更多')).toBeInTheDocument();
  });

  it('calls loadMore when load more button is clicked', () => {
    const mockLoadMore = jest.fn();
    mockUseLeaderboard.mockReturnValue({
      entries: [
        { id: '1', username: 'alice', rank: 1, level: 20, experiencePoints: 15000, rating: 2100, avatarUrl: null, title: null },
      ],
      loading: false,
      error: null,
      hasMore: true,
      loadMore: mockLoadMore,
    });
    mockUseUserRank.mockReturnValue({ ranks: null, loading: false });

    renderPage();
    fireEvent.click(screen.getByText('加载更多'));
    expect(mockLoadMore).toHaveBeenCalled();
  });
});
