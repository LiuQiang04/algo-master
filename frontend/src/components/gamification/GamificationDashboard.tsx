import React from 'react';
import { useGamificationOverview, useDailyTasks, useLoginStreak } from '../../hooks/useGamification';
import LevelProgress from './LevelProgress';
import { calculateLevel } from '../../utils/level';

interface GamificationDashboardProps {
  userId?: string;
}

const GamificationDashboard: React.FC<GamificationDashboardProps> = ({ userId: _userId }) => {
  const { overview, loading: overviewLoading } = useGamificationOverview();
  const { tasksData, loading: tasksLoading } = useDailyTasks();
  const { streakInfo: _streakInfo, loading: streakLoading } = useLoginStreak();

  const isLoading = overviewLoading || tasksLoading || streakLoading;

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-8 bg-gray-200 rounded w-1/2 mb-4"></div>
          <div className="h-2 bg-gray-200 rounded w-full"></div>
        </div>
      </div>
    );
  }

  if (!overview) {
    return null;
  }

  const levelInfo = calculateLevel(overview.totalExp);

  return (
    <div className="space-y-6">
      {/* 等级和经验 */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-800">游戏化概览</h3>
          {overview.title && (
            <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm">
              {overview.title}
            </span>
          )}
        </div>

        <LevelProgress levelInfo={levelInfo} showDetails={false} />
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-gradient-to-br from-orange-400 to-red-500 rounded-lg shadow-md p-4 text-white">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🔥</span>
            <div>
              <p className="text-sm opacity-80">连续登录</p>
              <p className="text-2xl font-bold">{overview.loginStreak}天</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-400 to-indigo-500 rounded-lg shadow-md p-4 text-white">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🏅</span>
            <div>
              <p className="text-sm opacity-80">成就数</p>
              <p className="text-2xl font-bold">{overview.achievementCount}</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-400 to-emerald-500 rounded-lg shadow-md p-4 text-white">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🎯</span>
            <div>
              <p className="text-sm opacity-80">每日挑战</p>
              <p className="text-2xl font-bold">{overview.completedDailyChallenges}</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-yellow-400 to-amber-500 rounded-lg shadow-md p-4 text-white">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🏆</span>
            <div>
              <p className="text-sm opacity-80">全球排名</p>
              <p className="text-2xl font-bold">#{overview.globalRank}</p>
            </div>
          </div>
        </div>
      </div>

      {/* 每日任务进度 */}
      {tasksData && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="font-semibold text-gray-800 mb-4">今日任务</h3>
          <div className="space-y-3">
            {tasksData.tasks.slice(0, 3).map((task) => (
              <div key={task.id} className="flex items-center gap-3">
                <div
                  className={`w-5 h-5 rounded-full flex items-center justify-center ${
                    task.completed ? 'bg-green-500' : 'bg-gray-300'
                  }`}
                >
                  {task.completed && (
                    <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-700">{task.title}</p>
                </div>
                <span className="text-xs text-gray-500">
                  {task.current}/{task.target}
                </span>
              </div>
            ))}
          </div>

          <a
            href="/gamification/daily-challenge"
            className="block mt-4 text-center text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            查看全部任务 →
          </a>
        </div>
      )}

      {/* 快捷链接 */}
      <div className="grid grid-cols-2 gap-4">
        <a
          href="/gamification/achievements"
          className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow text-center"
        >
          <span className="text-2xl">🏅</span>
          <p className="text-sm font-medium text-gray-700 mt-2">成就系统</p>
        </a>
        <a
          href="/gamification/leaderboard"
          className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow text-center"
        >
          <span className="text-2xl">🏆</span>
          <p className="text-sm font-medium text-gray-700 mt-2">排行榜</p>
        </a>
        <a
          href="/gamification/daily-challenge"
          className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow text-center"
        >
          <span className="text-2xl">📅</span>
          <p className="text-sm font-medium text-gray-700 mt-2">每日挑战</p>
        </a>
        <a
          href="/gamification/virtual-items"
          className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow text-center"
        >
          <span className="text-2xl">🛒</span>
          <p className="text-sm font-medium text-gray-700 mt-2">虚拟商店</p>
        </a>
      </div>
    </div>
  );
};

export default GamificationDashboard;
