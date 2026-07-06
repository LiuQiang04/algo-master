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
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500 mx-auto"></div>
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
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 py-8 lg:py-12">
      <div className="w-full px-6 lg:px-12">
        {/* 页面标题 */}
        <div className="mb-10 text-center lg:text-left">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            成就系统
          </h1>
          <p className="mt-2 text-gray-500">完成各种挑战，解锁成就徽章，展示你的实力！</p>
        </div>

        {/* 统计卡片 */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
            <div className="backdrop-blur-xl bg-white/70 border border-white/40 rounded-2xl shadow-lg shadow-purple-500/5 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">已解锁</p>
                  <p className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent">{stats.unlocked}</p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-400 to-blue-600 shadow-lg shadow-blue-500/20 flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="backdrop-blur-xl bg-white/70 border border-white/40 rounded-2xl shadow-lg shadow-purple-500/5 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">总成就数</p>
                  <p className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-500 bg-clip-text text-transparent">{stats.total}</p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-400 to-pink-500 shadow-lg shadow-purple-500/20 flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="backdrop-blur-xl bg-white/70 border border-white/40 rounded-2xl shadow-lg shadow-purple-500/5 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">完成度</p>
                  <p className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-teal-400 bg-clip-text text-transparent">{stats.percentage}%</p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 shadow-lg shadow-emerald-500/20 flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                </div>
              </div>
              <div className="mt-4">
                <div className="w-full bg-white/60 border border-white/40 rounded-full h-2.5 backdrop-blur-sm">
                  <div
                    className="bg-gradient-to-r from-emerald-400 to-teal-500 rounded-full h-2.5 transition-all"
                    style={{ width: `${stats.percentage}%` }}
                  />
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
              className={`px-5 py-2 rounded-full text-sm font-medium transition-all duration-200 backdrop-blur-sm border ${
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
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
              <p className="text-gray-400">暂无成就数据</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AchievementsPage;
