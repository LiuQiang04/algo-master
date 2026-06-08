// 成就相关类型
export interface Achievement {
  id: string;
  name: string;
  description: string;
  category: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  iconUrl: string | null;
  points: number;
  requirement: Record<string, any>;
  isActive: boolean;
}

export interface UserAchievement extends Achievement {
  unlockedAt: string;
  progress: number;
}

export interface AchievementStats {
  total: number;
  unlocked: number;
  percentage: number;
  byCategory: Array<{
    category: string;
    _count: number;
  }>;
}

// 排行榜相关类型
export interface LeaderboardEntry {
  rank: number;
  id: string;
  username: string;
  avatarUrl: string | null;
  level: number;
  experiencePoints: number;
  rating: number;
  title: string | null;
  isFriend?: boolean;
}

export interface RegionLeaderboardEntry {
  rank: number;
  region: string;
  userCount: number;
  avgExperience: number;
  avgLevel: number;
}

// 每日挑战相关类型
export interface DailyChallenge {
  id: string;
  problemId: string;
  challengeDate: string;
  bonusPoints: number;
  problem: {
    id: string;
    title: string;
    description: string;
    difficulty: number;
    tags: Array<{
      tag: {
        id: string;
        name: string;
      };
    }>;
  };
}

export interface DailyChallengeCompletion {
  id: string;
  userId: string;
  challengeId: string;
  completedAt: string;
  timeTaken: number | null;
  challenge: DailyChallenge;
}

export interface DailyTask {
  id: string;
  title: string;
  description: string;
  current: number;
  target: number;
  reward: number;
  completed: boolean;
}

export interface DailyTasksResponse {
  tasks: DailyTask[];
  totalCompleted: number;
  totalRewards: number;
}

// 虚拟物品相关类型
export interface VirtualItem {
  id: string;
  name: string;
  description: string;
  type: 'badge' | 'title' | 'frame' | 'decoration';
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  iconUrl: string | null;
  price: number;
  isActive: boolean;
}

export interface UserVirtualItem {
  id: string;
  userId: string;
  itemId: string;
  isEquipped: boolean;
  acquiredAt: string;
  item: VirtualItem;
}

// 积分相关类型
export interface PointHistory {
  id: string;
  userId: string;
  points: number;
  type: string;
  description: string | null;
  relatedId: string | null;
  createdAt: string;
}

export interface PointHistoryResponse {
  history: PointHistory[];
  total: number;
  page: number;
  totalPages: number;
}

// 等级相关类型
export interface LevelInfo {
  level: number;
  currentExp: number;
  nextLevelExp: number;
  progress: number;
  totalExp: number;
}

// 登录连续天数相关类型
export interface LoginStreakInfo {
  currentStreak: number;
  maxStreak: number;
  isLoggedInToday: boolean;
  recentLogins: Array<{
    date: string;
    streakDays: number;
  }>;
}

export interface LoginCalendarDay {
  date: string;
  isLoggedIn: boolean;
  streakDays: number;
}

// 游戏化概览
export interface GamificationOverview {
  level: number;
  currentExp: number;
  nextLevelExp: number;
  progress: number;
  totalExp: number;
  title: string | null;
  achievementCount: number;
  completedDailyChallenges: number;
  loginStreak: number;
  maxLoginStreak: number;
  globalRank: number;
}
