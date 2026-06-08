import React from 'react';
import { usePointHistory, useLevelInfo, useGamificationOverview } from '../../hooks/useGamification';
import LevelProgress from '../../components/gamification/LevelProgress';
import PointHistoryList from '../../components/gamification/PointHistoryList';

const PointsPage: React.FC = () => {
  const { history, loading, error, hasMore, loadMore } = usePointHistory();
  const { levelInfo, loading: levelLoading } = useLevelInfo();
  const { overview } = useGamificationOverview();

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* 页面标题 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">积分中心</h1>
          <p className="mt-2 text-gray-600">
            查看你的积分详情、等级进度和积分历史记录
          </p>
        </div>

        {/* 等级进度 */}
        {levelLoading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
        ) : levelInfo ? (
          <div className="mb-8">
            <LevelProgress levelInfo={levelInfo} size="lg" />
          </div>
        ) : null}

        {/* 统计卡片 */}
        {overview && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-white rounded-lg shadow-md p-4 text-center">
              <p className="text-sm text-gray-500">总经验值</p>
              <p className="text-2xl font-bold text-blue-600">{overview.totalExp.toLocaleString()}</p>
            </div>
            <div className="bg-white rounded-lg shadow-md p-4 text-center">
              <p className="text-sm text-gray-500">成就数</p>
              <p className="text-2xl font-bold text-purple-600">{overview.achievementCount}</p>
            </div>
            <div className="bg-white rounded-lg shadow-md p-4 text-center">
              <p className="text-sm text-gray-500">每日挑战</p>
              <p className="text-2xl font-bold text-green-600">{overview.completedDailyChallenges}</p>
            </div>
            <div className="bg-white rounded-lg shadow-md p-4 text-center">
              <p className="text-sm text-gray-500">全球排名</p>
              <p className="text-2xl font-bold text-yellow-600">#{overview.globalRank}</p>
            </div>
          </div>
        )}

        {/* 积分历史 */}
        {loading && history.length === 0 ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
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
    </div>
  );
};

export default PointsPage;
