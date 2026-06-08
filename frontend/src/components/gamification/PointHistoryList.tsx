import React from 'react';
import type { PointHistory } from '../../types/gamification';

interface PointHistoryListProps {
  history: PointHistory[];
  showLoadMore?: boolean;
  onLoadMore?: () => void;
}

const typeIcons: Record<string, { icon: string; color: string }> = {
  solve: { icon: '✅', color: 'text-green-500' },
  contest: { icon: '🏆', color: 'text-yellow-500' },
  daily: { icon: '📅', color: 'text-blue-500' },
  achievement: { icon: '🏅', color: 'text-purple-500' },
  bonus: { icon: '🎁', color: 'text-pink-500' },
  login: { icon: '🔑', color: 'text-gray-500' },
  login_streak: { icon: '🔥', color: 'text-orange-500' },
  purchase: { icon: '🛒', color: 'text-red-500' },
};

const PointHistoryList: React.FC<PointHistoryListProps> = ({
  history,
  showLoadMore = false,
  onLoadMore,
}) => {
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('zh-CN', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-md">
      <div className="p-4 border-b">
        <h3 className="font-semibold text-gray-800">积分历史</h3>
      </div>

      <div className="divide-y divide-gray-100">
        {history.map((record) => {
          const typeInfo = typeIcons[record.type] || { icon: '📌', color: 'text-gray-500' };
          const isPositive = record.points > 0;

          return (
            <div key={record.id} className="flex items-center justify-between p-4 hover:bg-gray-50">
              <div className="flex items-center gap-3">
                <span className="text-xl">{typeInfo.icon}</span>
                <div>
                  <p className="text-sm font-medium text-gray-800">
                    {record.description || '积分变动'}
                  </p>
                  <p className="text-xs text-gray-500">{formatDate(record.createdAt)}</p>
                </div>
              </div>
              <span
                className={`font-semibold ${
                  isPositive ? 'text-green-600' : 'text-red-600'
                }`}
              >
                {isPositive ? '+' : ''}
                {record.points}
              </span>
            </div>
          );
        })}
      </div>

      {history.length === 0 && (
        <div className="text-center py-8 text-gray-500">暂无积分记录</div>
      )}

      {showLoadMore && (
        <div className="p-4 border-t">
          <button
            onClick={onLoadMore}
            className="w-full py-2 text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            加载更多
          </button>
        </div>
      )}
    </div>
  );
};

export default PointHistoryList;
