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
      className={`relative backdrop-blur-xl bg-white/70 border rounded-2xl p-7 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 ${
        isUnlocked || isUserAchievement
          ? rarityBorders[rarity] + ' shadow-lg shadow-purple-500/5'
          : 'border-white/30 opacity-50'
      }`}
    >
      {/* Rarity tag - glass badge instead of solid gradient */}
      <div
        className={`absolute top-3 right-3 px-3 py-1 rounded-full text-sm font-medium backdrop-blur-sm bg-white/80 text-gray-700 border border-white/60 shadow-sm ${
          rarity === 'legendary' ? 'text-amber-600' :
          rarity === 'epic' ? 'text-purple-600' :
          rarity === 'rare' ? 'text-blue-600' :
          'text-gray-500'
        }`}
      >
        {rarityLabels[rarity]}
      </div>

      <div className="flex items-start gap-4">
        {/* Icon - larger, gradient, with glass overlay effect */}
        <div
          className={`w-16 h-16 rounded-xl flex items-center justify-center bg-gradient-to-br shadow-inner shrink-0 ${
            isUnlocked || isUserAchievement
              ? rarityColors[rarity]
              : 'from-gray-300 to-gray-400'
          }`}
        >
          {achievement.iconUrl ? (
            <img src={achievement.iconUrl} alt={achievement.name} className="w-10 h-10 drop-shadow" />
          ) : (
            <svg className="w-8 h-8 text-white drop-shadow" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
            </svg>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-bold text-gray-800 truncate">{achievement.name}</h3>
          <p className="text-base text-gray-500 mt-1 line-clamp-2">{achievement.description}</p>

          {/* Points reward */}
          <div className="flex items-center gap-1.5 mt-2">
            <svg className="w-4 h-4 text-amber-500 shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            <span className="text-base font-medium text-gray-600">+{achievement.points} 积分</span>
          </div>

          {/* Unlock time */}
          {isUserAchievement && 'unlockedAt' in achievement && (
            <p className="text-sm text-gray-400 mt-1.5">
              解锁于: {new Date((achievement as UserAchievement).unlockedAt).toLocaleDateString()}
            </p>
          )}

          {/* Progress */}
          {showProgress && isUserAchievement && 'progress' in achievement && (
            <div className="mt-3">
              <div className="w-full bg-white/60 border border-white/40 rounded-full h-3 backdrop-blur-sm overflow-hidden">
                <div
                  className="bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full h-3 transition-all duration-500 shadow-sm"
                  style={{ width: `${(achievement as UserAchievement).progress}%` }}
                />
              </div>
              <p className="text-sm text-gray-500 mt-1">进度: {(achievement as UserAchievement).progress}%</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AchievementCard;
