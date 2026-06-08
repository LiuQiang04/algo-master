import api from './client';

// 成就相关
export const achievementApi = {
  // 获取所有成就
  getAll: () => api.get('/achievements'),

  // 获取用户成就
  getMy: () => api.get('/achievements/me'),

  // 获取指定用户成就
  getUser: (userId: string) => api.get(`/achievements/user/${userId}`),

  // 获取成就分类
  getCategories: () => api.get('/achievements/categories'),
};

// 排行榜相关
export const leaderboardApi = {
  // 获取排行榜
  get: (type: 'global' | 'friends' | 'region', page?: number, limit?: number) =>
    api.get(`/leaderboard/${type}`, { params: { page, limit } }),

  // 获取用户排名
  getMyRank: () => api.get('/leaderboard/rank/me'),
};

// 每日挑战相关
export const dailyChallengeApi = {
  // 获取今日挑战
  getToday: () => api.get('/daily-challenge/today'),

  // 完成每日挑战
  complete: (submissionId: string) =>
    api.post('/daily-challenge/complete', { submissionId }),

  // 获取连续天数
  getStreak: () => api.get('/daily-challenge/streak'),

  // 获取历史记录
  getHistory: (page?: number, limit?: number) =>
    api.get('/daily-challenge/history', { params: { page, limit } }),

  // 获取每日任务
  getTasks: () => api.get('/daily-challenge/tasks'),
};

// 虚拟物品相关
export const virtualItemApi = {
  // 获取所有物品
  getAll: (type?: string) => api.get('/virtual-items', { params: { type } }),

  // 获取用户物品
  getMy: (type?: string) => api.get('/virtual-items/my', { params: { type } }),

  // 购买物品
  purchase: (itemId: string) => api.post(`/virtual-items/${itemId}/buy`),

  // 装备物品
  equip: (itemId: string, equip: boolean) =>
    api.post(`/virtual-items/${itemId}/equip`, { equip }),
};

// 游戏化综合接口
export const gamificationApi = {
  // 获取积分历史
  getPointHistory: (page?: number, limit?: number) =>
    api.get('/gamification/points/history', { params: { page, limit } }),

  // 获取等级信息
  getLevel: () => api.get('/gamification/level'),

  // 获取登录连续天数信息
  getLoginStreak: () => api.get('/gamification/login-streak'),

  // 获取登录日历
  getLoginCalendar: (month?: number, year?: number) =>
    api.get('/gamification/login-calendar', { params: { month, year } }),

  // 记录登录
  recordLogin: () => api.post('/gamification/record-login'),

  // 获取游戏化概览
  getOverview: () => api.get('/gamification/overview'),
};
