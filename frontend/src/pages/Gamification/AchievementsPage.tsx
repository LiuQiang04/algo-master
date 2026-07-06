import React, { useState } from 'react';
import { useAchievements } from '../../hooks/useGamification';
import AchievementCard from '../../components/gamification/AchievementCard';
import type { UserAchievement } from '../../types/gamification';

const AchievementsPage: React.FC = () => {
  const { achievements, stats, loading, error } = useAchievements();
  const [filter, setFilter] = useState<string>('all');

  const categories = [
    { id: 'all', label: '全部' },
    { id: 'problem', label: '解题' },
    { id: 'contest', label: '竞赛' },
    { id: 'learning', label: '学习' },
    { id: 'level', label: '等级' },
    { id: 'social', label: '社交' },
    { id: 'special', label: '特殊' },
  ];

  const filteredAchievements = filter === 'all'
    ? achievements
    : achievements.filter((a) => a.category === filter);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center">
        <div className="backdrop-blur-xl bg-white/70 border border-white/40 rounded-2xl p-8 shadow-lg">
          <div className="animate-spin rounded-full w-16 h-16 border-b-2 border-indigo-500 mx-auto"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center">
        <div className="backdrop-blur-xl bg-white/70 border border-white/40 rounded-2xl p-8 shadow-lg text-center max-w-md">
          <p className="text-red-500 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl font-medium hover:shadow-lg transition-all"
          >
            重试
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 w-full px-8 lg:px-16 py-10 lg:py-16 relative overflow-hidden">
      {/* 装饰光斑 */}
      <div className="absolute -top-32 -right-32 w-96 h-96 bg-gradient-to-br from-purple-300/20 to-pink-300/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-gradient-to-br from-indigo-300/15 to-blue-300/10 rounded-full blur-3xl pointer-events-none" />

      {/* 页面标题 */}
      <div className="mb-12 lg:mb-16 text-center lg:text-left">
        <h1 className="text-5xl font-black bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
          成就系统
        </h1>
        <p className="mt-2 text-lg text-gray-500">完成各种挑战，解锁成就徽章，展示你的实力！</p>
      </div>

      {/* Hero Banner - 合并统计卡片 */}
      {stats && (
        <div className="backdrop-blur-xl bg-white/70 border border-white/40 rounded-2xl shadow-lg shadow-purple-500/5 p-10 mb-12 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/5 via-purple-500/5 to-pink-500/5 rounded-2xl pointer-events-none" />
          <div className="relative flex flex-col md:flex-row items-center gap-8">
            <div className="flex-1 text-center md:text-left">
              <p className="text-base font-medium text-gray-500 mb-1">已解锁</p>
              <p className="text-5xl font-black bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent">{stats.unlocked}</p>
            </div>
            <div className="flex-1 text-center md:text-left">
              <p className="text-base font-medium text-gray-500 mb-1">总成就数</p>
              <p className="text-5xl font-black bg-gradient-to-r from-purple-600 to-pink-500 bg-clip-text text-transparent">{stats.total}</p>
            </div>
            <div className="flex-1 text-center md:text-left">
              <p className="text-base font-medium text-gray-500 mb-1">完成度</p>
              <p className="text-5xl font-black bg-gradient-to-r from-emerald-600 to-teal-400 bg-clip-text text-transparent">{stats.percentage}%</p>
              <div className="mt-4">
                <div className="w-full bg-white/60 border border-white/40 rounded-full h-4 backdrop-blur-sm">
                  <div
                    className="bg-gradient-to-r from-emerald-400 to-teal-500 rounded-full h-4 transition-all"
                    style={{ width: `${stats.percentage}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 分类筛选 */}
      <div className="flex flex-wrap gap-3 mb-8">
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => setFilter(category.id)}
            className={`px-6 py-3 rounded-full text-base font-medium transition-all duration-200 backdrop-blur-sm border ${
              filter === category.id
                ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white border-transparent shadow-lg shadow-purple-500/20'
                : 'bg-white/60 text-gray-600 border-white/40 hover:bg-white/80 hover:shadow-md'
            }`}
          >
            {category.label}
          </button>
        ))}
      </div>

      {/* 成就列表 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredAchievements.map((achievement) => (
          <AchievementCard
            key={achievement.id}
            achievement={achievement}
            isUnlocked={!!(achievement as UserAchievement).unlockedAt}
            showProgress={true}
          />
        ))}
      </div>

      {filteredAchievements.length === 0 && (
        <div className="text-center py-12">
          <div className="backdrop-blur-xl bg-white/70 border border-white/40 rounded-2xl p-10 shadow-lg inline-block">
            <p className="text-lg text-gray-400">暂无成就数据</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default AchievementsPage;
