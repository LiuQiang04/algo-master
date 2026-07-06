import { useState, useEffect, useCallback } from 'react';
import {
  gamificationApi,
  achievementApi,
  leaderboardApi,
  dailyChallengeApi,
  virtualItemApi,
} from '../api/gamification';
import type {
  GamificationOverview,
  UserAchievement,
  AchievementStats,
  LeaderboardEntry,
  DailyChallenge,
  DailyTasksResponse,
  VirtualItem,
  UserVirtualItem,
  PointHistory,
  LevelInfo,
  LoginStreakInfo,
  LoginCalendarDay,
} from '../types/gamification';

// 游戏化概览 Hook
export function useGamificationOverview() {
  const [overview, setOverview] = useState<GamificationOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOverview = useCallback(async () => {
    try {
      setLoading(true);
      const response = await gamificationApi.getOverview();
      setOverview(response.data.data);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch overview');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOverview();
  }, [fetchOverview]);

  return { overview, loading, error, refetch: fetchOverview };
}

// 成就 Hook
export function useAchievements() {
  const [achievements, setAchievements] = useState<UserAchievement[]>([]);
  const [stats, setStats] = useState<AchievementStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAchievements = useCallback(async () => {
    try {
      setLoading(true);
      const response = await achievementApi.getMy();
      setAchievements(response.data.achievements);
      setStats(response.data.stats);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch achievements');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAchievements();
  }, [fetchAchievements]);

  return { achievements, stats, loading, error, refetch: fetchAchievements };
}

// 排行榜 Hook
export function useLeaderboard(type: 'global' | 'friends' | 'region' = 'global') {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const fetchLeaderboard = useCallback(async (pageNum: number = 1) => {
    try {
      setLoading(true);
      const response = await leaderboardApi.get(type, pageNum, 50);
      const data = response.data;

      if (pageNum === 1) {
        setEntries(data);
      } else {
        setEntries((prev) => [...prev, ...data]);
      }

      setHasMore(data.length === 50);
      setPage(pageNum);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch leaderboard');
    } finally {
      setLoading(false);
    }
  }, [type]);

  useEffect(() => {
    fetchLeaderboard(1);
  }, [fetchLeaderboard]);

  const loadMore = () => {
    if (!loading && hasMore) {
      fetchLeaderboard(page + 1);
    }
  };

  return { entries, loading, error, hasMore, loadMore, refetch: () => fetchLeaderboard(1) };
}

// 用户排名 Hook
export function useUserRank() {
  const [ranks, setRanks] = useState<{ global: number; friends: number } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRanks = async () => {
      try {
        const response = await leaderboardApi.getMyRank();
        setRanks(response.data);
      } catch (err) {
        console.error('Failed to fetch ranks:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchRanks();
  }, []);

  return { ranks, loading };
}

// 每日挑战 Hook
export function useDailyChallenge() {
  const [challenge, setChallenge] = useState<DailyChallenge | null>(null);
  const [isCompleted, setIsCompleted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchChallenge = useCallback(async () => {
    try {
      setLoading(true);
      const response = await dailyChallengeApi.getToday();
      setChallenge(response.data);

      // 检查是否已完成
      await dailyChallengeApi.getStreak();
      // 这里需要后端返回更详细的信息来判断是否完成
      setIsCompleted(false);

      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch daily challenge');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchChallenge();
  }, [fetchChallenge]);

  const completeChallenge = async (submissionId: string) => {
    try {
      await dailyChallengeApi.complete(submissionId);
      setIsCompleted(true);
      return true;
    } catch (err: any) {
      setError(err.message || 'Failed to complete challenge');
      return false;
    }
  };

  return { challenge, isCompleted, loading, error, completeChallenge, refetch: fetchChallenge };
}

// 每日任务 Hook
export function useDailyTasks() {
  const [tasksData, setTasksData] = useState<DailyTasksResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTasks = useCallback(async () => {
    try {
      setLoading(true);
      const response = await dailyChallengeApi.getTasks();
      setTasksData(response.data);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch daily tasks');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  return { tasksData, loading, error, refetch: fetchTasks };
}

// 虚拟物品 Hook
export function useVirtualItems(type?: string) {
  const [items, setItems] = useState<VirtualItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchItems = useCallback(async () => {
    try {
      setLoading(true);
      const response = await virtualItemApi.getAll(type);
      setItems(response.data.data);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch items');
    } finally {
      setLoading(false);
    }
  }, [type]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  return { items, loading, error, refetch: fetchItems };
}

// 用户虚拟物品 Hook
export function useUserVirtualItems(type?: string) {
  const [userItems, setUserItems] = useState<UserVirtualItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUserItems = useCallback(async () => {
    try {
      setLoading(true);
      const response = await virtualItemApi.getMy(type);
      setUserItems(response.data.data);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch user items');
    } finally {
      setLoading(false);
    }
  }, [type]);

  useEffect(() => {
    fetchUserItems();
  }, [fetchUserItems]);

  const purchaseItem = async (itemId: string) => {
    try {
      await virtualItemApi.purchase(itemId);
      await fetchUserItems();
      return true;
    } catch (err: any) {
      throw new Error(err.response?.data?.error || 'Failed to purchase item');
    }
  };

  const equipItem = async (itemId: string, equip: boolean) => {
    try {
      await virtualItemApi.equip(itemId, equip);
      await fetchUserItems();
      return true;
    } catch (err: any) {
      throw new Error(err.response?.data?.error || 'Failed to equip item');
    }
  };

  return { userItems, loading, error, purchaseItem, equipItem, refetch: fetchUserItems };
}

// 积分历史 Hook
export function usePointHistory() {
  const [history, setHistory] = useState<PointHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchHistory = useCallback(async (pageNum: number = 1) => {
    try {
      setLoading(true);
      const response = await gamificationApi.getPointHistory(pageNum, 20);
      const data = response.data.data;

      if (pageNum === 1) {
        setHistory(data.history);
      } else {
        setHistory((prev) => [...prev, ...data.history]);
      }

      setTotalPages(data.totalPages);
      setPage(pageNum);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch point history');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchHistory(1);
  }, [fetchHistory]);

  const loadMore = () => {
    if (!loading && page < totalPages) {
      fetchHistory(page + 1);
    }
  };

  return { history, loading, error, hasMore: page < totalPages, loadMore, refetch: () => fetchHistory(1) };
}

// 等级信息 Hook
export function useLevelInfo() {
  const [levelInfo, setLevelInfo] = useState<LevelInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLevelInfo = async () => {
      try {
        const response = await gamificationApi.getLevel();
        setLevelInfo(response.data.data);
        setError(null);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch level info');
      } finally {
        setLoading(false);
      }
    };

    fetchLevelInfo();
  }, []);

  return { levelInfo, loading, error };
}

// 登录连续天数 Hook
export function useLoginStreak() {
  const [streakInfo, setStreakInfo] = useState<LoginStreakInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStreakInfo = useCallback(async () => {
    try {
      setLoading(true);
      const response = await gamificationApi.getLoginStreak();
      setStreakInfo(response.data.data);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch login streak');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStreakInfo();
  }, [fetchStreakInfo]);

  return { streakInfo, loading, error, refetch: fetchStreakInfo };
}

// 登录日历 Hook
export function useLoginCalendar(month?: number, year?: number) {
  const [calendar, setCalendar] = useState<LoginCalendarDay[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const currentMonth = month || new Date().getMonth() + 1;
  const currentYear = year || new Date().getFullYear();

  const fetchCalendar = useCallback(async () => {
    try {
      setLoading(true);
      const response = await gamificationApi.getLoginCalendar(currentMonth, currentYear);
      setCalendar(response.data.data);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch calendar');
    } finally {
      setLoading(false);
    }
  }, [currentMonth, currentYear]);

  useEffect(() => {
    fetchCalendar();
  }, [fetchCalendar]);

  return { calendar, loading, error, refetch: fetchCalendar };
}
