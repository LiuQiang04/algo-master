import React from 'react';
import { usePointHistory, useLevelInfo, useGamificationOverview } from '../../hooks/useGamification';
import LevelProgress from '../../components/gamification/LevelProgress';
import PointHistoryList from '../../components/gamification/PointHistoryList';

const PointsPage: React.FC = () => {
  const { history, loading, error, hasMore, loadMore } = usePointHistory();
  const { levelInfo, loading: levelLoading } = useLevelInfo();
  const { overview } = useGamificationOverview();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/30 to-purple-50/30 w-full px-8 lg:px-16 py-10 lg:py-16 relative overflow-hidden">
      {/* 装饰光斑 */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-gradient-to-br from-emerald-300/20 to-teal-300/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-gradient-to-br from-indigo-300/15 to-purple-300/10 rounded-full blur-3xl pointer-events-none" />

      {/* 页面标题 */}
      <div className="mb-12 lg:mb-16">
        <h1 className="text-5xl font-black bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">积分中心</h1>
        <p className="mt-2 text-lg text-gray-600">
          查看你的积分详情、等级进度和积分历史记录
        </p>
      </div>

      {/* 等级进度 */}
      {levelLoading ? (
        <div className="flex justify-center py-8">
          <div className="backdrop-blur-xl bg-white/70 border border-white/40 rounded-2xl p-8 shadow-lg">
            <div className="animate-spin rounded-full w-16 h-16 border-b-2 border-indigo-500 mx-auto"></div>
          </div>
        </div>
      ) : levelInfo ? (
        <div className="mb-8">
          <LevelProgress levelInfo={levelInfo} size="lg" />
        </div>
      ) : null}

      {/* 统计卡片 */}
      {overview && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
          <div className="backdrop-blur-xl bg-white/70 border border-white/40 rounded-2xl shadow-lg shadow-purple-500/5 p-7 text-center">
            <p className="text-base font-medium text-gray-500 mb-1">总经验值</p>
            <p className="text-5xl font-black bg-gradient-to-r from-blue-500 to-cyan-400 bg-clip-text text-transparent">{overview.totalExp.toLocaleString()}</p>
          </div>
          <div className="backdrop-blur-xl bg-white/70 border border-white/40 rounded-2xl shadow-lg shadow-purple-500/5 p-7 text-center">
            <p className="text-base font-medium text-gray-500 mb-1">成就数</p>
            <p className="text-5xl font-black bg-gradient-to-r from-purple-500 to-pink-400 bg-clip-text text-transparent">{overview.achievementCount}</p>
          </div>
          <div className="backdrop-blur-xl bg-white/70 border border-white/40 rounded-2xl shadow-lg shadow-purple-500/5 p-7 text-center">
            <p className="text-base font-medium text-gray-500 mb-1">每日挑战</p>
            <p className="text-5xl font-black bg-gradient-to-r from-emerald-500 to-teal-400 bg-clip-text text-transparent">{overview.completedDailyChallenges}</p>
          </div>
          <div className="backdrop-blur-xl bg-white/70 border border-white/40 rounded-2xl shadow-lg shadow-purple-500/5 p-7 text-center">
            <p className="text-base font-medium text-gray-500 mb-1">全球排名</p>
            <p className="text-5xl font-black bg-gradient-to-r from-amber-500 to-orange-400 bg-clip-text text-transparent">#{overview.globalRank}</p>
          </div>
        </div>
      )}

      {/* 积分历史 */}
      {loading && history.length === 0 ? (
        <div className="flex justify-center py-12">
          <div className="backdrop-blur-xl bg-white/70 border border-white/40 rounded-2xl p-8 shadow-lg">
            <div className="animate-spin rounded-full w-16 h-16 border-b-2 border-indigo-500 mx-auto"></div>
          </div>
        </div>
      ) : error ? (
        <div className="backdrop-blur-xl bg-red-50/70 border border-red-200/40 rounded-2xl shadow-lg p-4">
          <p className="text-red-600">{error}</p>
        </div>
      ) : (
        <PointHistoryList
          history={history}
          showLoadMore={hasMore}
          onLoadMore={loadMore}
        />
      )}
    </div>
  );
};

export default PointsPage;
