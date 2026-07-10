import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Home from '../../pages/Home/Home';

const mockGetPopularProblems = jest.fn();
const mockGetUpcomingContests = jest.fn();

jest.mock('@/services/home', () => ({
  getPopularProblems: (...args: any[]) => mockGetPopularProblems(...args),
  getUpcomingContests: (...args: any[]) => mockGetUpcomingContests(...args),
}));

function renderPage() {
  return render(<BrowserRouter><Home /></BrowserRouter>);
}

const mockProblem = {
  id: 1,
  title: 'Two Sum',
  slug: 'two-sum',
  difficulty: 'easy' as const,
  tags: ['Array', 'Hash Table'],
  solvedCount: 15000,
  submissionCount: 30000,
  acceptanceRate: 0.5,
};

const mockContest = {
  id: 1,
  title: 'Weekly Contest #42',
  description: 'Test',
  startTime: new Date(Date.now() + 86400000).toISOString(),
  endTime: new Date(Date.now() + 86400000 + 7200000).toISOString(),
  status: 'upcoming' as const,
  type: 'weekly' as const,
  problemCount: 5,
  participantCount: 1200,
};

describe('Home Page', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Static content', () => {
    it('should render hero heading', () => {
      mockGetPopularProblems.mockResolvedValue([]);
      mockGetUpcomingContests.mockResolvedValue([]);
      renderPage();

      expect(screen.getByText('掌握算法')).toBeInTheDocument();
      expect(screen.getByText('成就竞赛梦想')).toBeInTheDocument();
    });

    it('should render CTA buttons with correct links', () => {
      mockGetPopularProblems.mockResolvedValue([]);
      mockGetUpcomingContests.mockResolvedValue([]);
      renderPage();

      const startBtn = screen.getByText('开始练习').closest('a');
      expect(startBtn).toHaveAttribute('href', '/problems');

      const pathBtn = screen.getByRole('link', { name: /学习路径/ });
      expect(pathBtn).toHaveAttribute('href', '/paths');
    });

    it('should render stats', () => {
      mockGetPopularProblems.mockResolvedValue([]);
      mockGetUpcomingContests.mockResolvedValue([]);
      renderPage();

      expect(screen.getByText('1,200+')).toBeInTheDocument();
      expect(screen.getByText('50,000+')).toBeInTheDocument();
    });

    it('should render features section heading', () => {
      mockGetPopularProblems.mockResolvedValue([]);
      mockGetUpcomingContests.mockResolvedValue([]);
      renderPage();

      expect(screen.getByText('为什么选择 Algorithm Arena')).toBeInTheDocument();
    });

    it('should render feature cards', () => {
      mockGetPopularProblems.mockResolvedValue([]);
      mockGetUpcomingContests.mockResolvedValue([]);
      renderPage();

      expect(screen.getByText('丰富的题库')).toBeInTheDocument();
      expect(screen.getByText('即时评测')).toBeInTheDocument();
      expect(screen.getByText('竞赛系统')).toBeInTheDocument();
    });

    it('should render CTA section', () => {
      mockGetPopularProblems.mockResolvedValue([]);
      mockGetUpcomingContests.mockResolvedValue([]);
      renderPage();

      expect(screen.getByText('准备好开始了吗？')).toBeInTheDocument();
      const regLink = screen.getByText('免费注册').closest('a');
      expect(regLink).toHaveAttribute('href', '/register');
    });
  });

  describe('Popular Problems', () => {
    it('should render problem list when data loads', async () => {
      mockGetPopularProblems.mockResolvedValue([mockProblem]);
      mockGetUpcomingContests.mockResolvedValue([]);
      renderPage();

      await waitFor(() => {
        expect(screen.getByText('Two Sum')).toBeInTheDocument();
      });
      expect(screen.getByText('简单')).toBeInTheDocument();
    });

    it('should show loading state initially', () => {
      mockGetPopularProblems.mockImplementation(() => new Promise(() => {}));
      mockGetUpcomingContests.mockImplementation(() => new Promise(() => {}));
      renderPage();

      expect(screen.getAllByText('加载中...').length).toBeGreaterThanOrEqual(1);
    });

    it('should show error when problem API fails', async () => {
      mockGetPopularProblems.mockRejectedValue(new Error('Network error'));
      mockGetUpcomingContests.mockResolvedValue([]);
      renderPage();

      await waitFor(() => {
        expect(screen.getByText('加载题目失败')).toBeInTheDocument();
      });
    });
  });

  describe('Upcoming Contests', () => {
    it('should render contest cards when data loads', async () => {
      mockGetPopularProblems.mockResolvedValue([]);
      mockGetUpcomingContests.mockResolvedValue([mockContest]);
      renderPage();

      await waitFor(() => {
        expect(screen.getByText('Weekly Contest #42')).toBeInTheDocument();
      });
    });

    it('should show loading state for contests', () => {
      mockGetPopularProblems.mockResolvedValue([]);
      mockGetUpcomingContests.mockImplementation(() => new Promise(() => {}));
      renderPage();

      const loadingEls = screen.getAllByText('加载中...');
      expect(loadingEls.length).toBeGreaterThanOrEqual(1);
    });

    it('should show error when contest API fails', async () => {
      mockGetPopularProblems.mockResolvedValue([]);
      mockGetUpcomingContests.mockRejectedValue(new Error('Server error'));
      renderPage();

      await waitFor(() => {
        expect(screen.getByText('加载竞赛失败')).toBeInTheDocument();
      });
    });
  });

  describe('API call arguments', () => {
    it('should call getPopularProblems with limit 4', () => {
      mockGetPopularProblems.mockResolvedValue([]);
      mockGetUpcomingContests.mockResolvedValue([]);
      renderPage();

      expect(mockGetPopularProblems).toHaveBeenCalledWith(4);
    });

    it('should call getUpcomingContests with limit 2', () => {
      mockGetPopularProblems.mockResolvedValue([]);
      mockGetUpcomingContests.mockResolvedValue([]);
      renderPage();

      expect(mockGetUpcomingContests).toHaveBeenCalledWith(2);
    });
  });
});
