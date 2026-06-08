import React from 'react';
import type { LevelInfo } from '../../types/gamification';

interface LevelProgressProps {
  levelInfo: LevelInfo;
  showDetails?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const LevelProgress: React.FC<LevelProgressProps> = ({
  levelInfo,
  showDetails = true,
  size = 'md',
}) => {
  const sizeClasses = {
    sm: 'h-2',
    md: 'h-3',
    lg: 'h-4',
  };

  const textSizes = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-4">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
            <span className="text-white font-bold text-lg">{levelInfo.level}</span>
          </div>
          <div>
            <p className="font-semibold text-gray-800">等级 {levelInfo.level}</p>
            <p className={`${textSizes[size]} text-gray-500`}>
              {levelInfo.currentExp} / {levelInfo.nextLevelExp} EXP
            </p>
          </div>
        </div>
        {showDetails && (
          <span className="text-sm text-gray-500">
            总经验: {levelInfo.totalExp}
          </span>
        )}
      </div>

      <div className={`w-full bg-gray-200 rounded-full ${sizeClasses[size]}`}>
        <div
          className="bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all duration-500"
          style={{ width: `${levelInfo.progress}%` }}
        />
      </div>

      {showDetails && (
        <p className={`${textSizes[size]} text-gray-500 mt-1 text-right`}>
          {levelInfo.progress}% 升级进度
        </p>
      )}
    </div>
  );
};

export default LevelProgress;
