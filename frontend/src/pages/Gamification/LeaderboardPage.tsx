import React, { useState } from 'react';
import { useLeaderboard, useUserRank } from '../../hooks/useGamification';
import LeaderboardTable from '../../components/gamification/LeaderboardTable';

const LeaderboardPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'global' | 'friends' | 'region'>('global');
  const { entries, loading, error, hasMore, loadMore } = useLeaderboard(activeTab);
  const { ranks } = useUserRank();

  const tabs = [
    { id: 'global' as const, label: '全球排行', icon: '🌍' },
    { id: 'friends' as const, label: '好友排行', icon: '👥' },
    { id: 'region' as const, label: '地区排行', icon: '📍' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* 页面标题 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">排行榜</h1>
          <p className="mt-2 text-gray-600">
            查看你在全球用户中的排名，与好友一较高下！
          </p>
        </div>

        {/* 用户排名卡片 */}
        {ranks && (
          <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-md p-6 text-white">
              <p className="text-sm opacity-80">全球排名</p>
              <p className="text-4xl font-bold mt-2">#{ranks.global}</p>
              <p className="text-sm mt-2 opacity-80">全球用户中的位置</p>
            </div>
            <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg shadow-md p-6 text-white">
              <p className="text-sm opacity-80">好友排名</p>
              <p className="text-4xl font-bold mt-2">#{ranks.friends}</p>
              <p className="text-sm mt-2 opacity-80">好友中的位置</p>
            </div>
          </div>
        )}

        {/* 标签页 */}
        <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg mb-6">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* 错误提示 */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-600">{error}</p>
          </div>
        )}

        {/* 排行榜表格 */}
        {loading && entries.length === 0 ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <>
            <LeaderboardTable
              entries={entries}
              showFriendIndicator={activeTab === 'friends'}
            />

            {hasMore && (
              <div className="text-center mt-6">
                <button
                  onClick={loadMore}
                  disabled={loading}
                  className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
                >
                  {loading ? '加载中...' : '加载更多'}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default LeaderboardPage;
