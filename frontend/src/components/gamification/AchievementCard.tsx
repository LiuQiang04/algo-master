import React from 'react';
import type { Achievement, UserAchievement } from '../../types/gamification';

interface AchievementCardProps {
  achievement: Achievement | UserAchievement;
  isUnlocked?: boolean;
  showProgress?: boolean;
}

const rarityColors = {
  common: 'from-gray-400 to-gray-500',
  rare: 'from-blue-400 to-blue-600',
  epic: 'from-purple-400 to-purple-600',
  legendary: 'from-yellow-400 to-orange-500',
};

const rarityBorders = {
  common: 'border-gray-300',
  rare: 'border-blue-400',
  epic: 'border-purple-400',
  legendary: 'border-yellow-400',
};

const rarityLabels = {
  common: '普通',
  rare: '稀有',
  epic: '史诗',
  legendary: '传说',
};

const AchievementCard: React.FC<AchievementCardProps> = ({
  achievement,
  isUnlocked = false,
  showProgress = false,
}) => {
  const isUserAchievement = 'unlockedAt' in achievement;
  const rarity = achievement.rarity || 'common';

  return (
    <div
      className={`relative bg-white rounded-lg shadow-md p-4 border-2 transition-all hover:shadow-lg ${
        isUnlocked || isUserAchievement
          ? rarityBorders[rarity]
          : 'border-gray-200 opacity-60'
      }`}
    >
      {/* 稀有度标签 */}
      <div
        className={`absolute top-2 right-2 px-2 py-1 rounded text-xs text-white bg-gradient-to-r ${
          rarityColors[rarity]
        }`}
      >
        {rarityLabels[rarity]}
      </div>

      <div className="flex items-start gap-3">
        {/* 图标 */}
        <div
          className={`w-12 h-12 rounded-lg flex items-center justify-center bg-gradient-to-br ${
            isUnlocked || isUserAchievement
              ? rarityColors[rarity]
              : 'from-gray-300 to-gray-400'
          }`}
        >
          {achievement.iconUrl ? (
            <img
              src={achievement.iconUrl}
              alt={achievement.name}
              className="w-8 h-8"
            />
          ) : (
            <svg
              className="w-6 h-6 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
              />
            </svg>
          )}
        </div>

        {/* 内容 */}
        <div className="flex-1">
          <h3 className="font-semibold text-gray-800">{achievement.name}</h3>
          <p className="text-sm text-gray-500 mt-1">{achievement.description}</p>

          {/* 积分奖励 */}
          <div className="flex items-center gap-1 mt-2">
            <svg
              className="w-4 h-4 text-yellow-500"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            <span className="text-sm text-gray-600">+{achievement.points} 积分</span>
          </div>

          {/* 解锁时间 */}
          {isUserAchievement && (
            <p className="text-xs text-gray-400 mt-1">
              解锁于: {new Date((achievement as UserAchievement).unlockedAt).toLocaleDateString()}
            </p>
          )}

          {/* 进度条 */}
          {showProgress && isUserAchievement && (
            <div className="mt-2">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-500 rounded-full h-2"
                  style={{ width: `${(achievement as UserAchievement).progress}%` }}
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                进度: {(achievement as UserAchievement).progress}%
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AchievementCard;
