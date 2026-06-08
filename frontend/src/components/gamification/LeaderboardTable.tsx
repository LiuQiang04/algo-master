import React from 'react';
import type { LeaderboardEntry } from '../../types/gamification';

interface LeaderboardTableProps {
  entries: LeaderboardEntry[];
  currentUserId?: string;
  showFriendIndicator?: boolean;
}

const LeaderboardTable: React.FC<LeaderboardTableProps> = ({
  entries,
  currentUserId,
  showFriendIndicator = false,
}) => {
  const getRankBadge = (rank: number) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return `#${rank}`;
  };

  const getRankColor = (rank: number) => {
    if (rank === 1) return 'bg-yellow-100 text-yellow-800';
    if (rank === 2) return 'bg-gray-100 text-gray-800';
    if (rank === 3) return 'bg-orange-100 text-orange-800';
    return 'bg-white';
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <table className="w-full">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              排名
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              用户
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              等级
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              经验值
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              评分
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {entries.map((entry) => (
            <tr
              key={entry.id}
              className={`${getRankColor(entry.rank)} ${
                entry.id === currentUserId ? 'ring-2 ring-blue-500' : ''
              } hover:bg-gray-50 transition-colors`}
            >
              <td className="px-4 py-3 whitespace-nowrap">
                <span className="text-lg">{getRankBadge(entry.rank)}</span>
              </td>
              <td className="px-4 py-3 whitespace-nowrap">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center mr-3">
                    {entry.avatarUrl ? (
                      <img
                        src={entry.avatarUrl}
                        alt={entry.username}
                        className="w-8 h-8 rounded-full"
                      />
                    ) : (
                      <span className="text-white text-sm font-medium">
                        {entry.username.charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {entry.username}
                      {entry.id === currentUserId && (
                        <span className="ml-2 text-xs text-blue-600">(你)</span>
                      )}
                      {showFriendIndicator && entry.isFriend && (
                        <span className="ml-2 text-xs text-green-600">好友</span>
                      )}
                    </p>
                    {entry.title && (
                      <p className="text-xs text-gray-500">{entry.title}</p>
                    )}
                  </div>
                </div>
              </td>
              <td className="px-4 py-3 whitespace-nowrap">
                <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                  Lv.{entry.level}
                </span>
              </td>
              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                {entry.experiencePoints.toLocaleString()}
              </td>
              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                {entry.rating}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {entries.length === 0 && (
        <div className="text-center py-8 text-gray-500">暂无数据</div>
      )}
    </div>
  );
};

export default LeaderboardTable;
