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
  const textSizes = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
  };

  return (
    <div className="backdrop-blur-xl bg-white/70 border border-white/40 rounded-2xl shadow-lg shadow-purple-500/5 p-6">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className="w-14 h-14 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg shadow-purple-500/20 flex items-center justify-center">
            <span className="text-white font-bold text-xl">{levelInfo.level}</span>
          </div>
          <div>
            <p className="font-semibold text-gray-800">等级 {levelInfo.level}</p>
            <p className={`${textSizes[size]} text-gray-500`}>
              {levelInfo.currentExp} / {levelInfo.nextLevelExp} EXP
            </p>
          </div>
        </div>
        {showDetails && (
          <span className="text-sm text-gray-400">总经验: {levelInfo.totalExp}</span>
        )}
      </div>

      <div className="w-full bg-white/60 border border-white/40 rounded-full overflow-hidden backdrop-blur-sm">
        <div
          className="bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-500 shadow-sm"
          style={{ width: `${levelInfo.progress}%`, height: size === 'lg' ? '16px' : size === 'sm' ? '8px' : '12px' }}
        />
      </div>

      {showDetails && (
        <p className={`${textSizes[size]} text-gray-400 mt-1.5 text-right`}>
          {levelInfo.progress}% 升级进度
        </p>
      )}
    </div>
  );
};

export default LevelProgress;
