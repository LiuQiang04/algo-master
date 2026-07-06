import React from 'react';
import type { LevelInfo } from '../../types/gamification';

interface LevelProgressProps {
  levelInfo: LevelInfo;
  showDetails?: boolean;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

const LevelProgress: React.FC<LevelProgressProps> = ({
  levelInfo,
  showDetails = true,
  size = 'md',
}) => {
  const config = {
    sm: { text: 'text-xs', circle: 'w-10 h-10', circleText: 'text-base', bar: 'h-2', pad: 'p-4' },
    md: { text: 'text-sm', circle: 'w-14 h-14', circleText: 'text-xl', bar: 'h-3', pad: 'p-6' },
    lg: { text: 'text-base', circle: 'w-16 h-16', circleText: 'text-xl', bar: 'h-3.5', pad: 'p-8' },
    xl: { text: 'text-base', circle: 'w-20 h-20', circleText: 'text-2xl', bar: 'h-4', pad: 'p-10' },
  };

  const c = config[size];

  return (
    <div className={`backdrop-blur-xl bg-white/70 border border-white/40 rounded-2xl shadow-lg shadow-purple-500/5 ${c.pad}`}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className={`${c.circle} rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg shadow-purple-500/20 flex items-center justify-center`}>
            <span className={`text-white font-bold ${c.circleText}`}>{levelInfo.level}</span>
          </div>
          <div>
            <p className="font-semibold text-gray-800">等级 {levelInfo.level}</p>
            <p className={`${c.text} text-gray-500`}>
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
          className={`bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-500 shadow-sm ${c.bar}`}
          style={{ width: `${levelInfo.progress}%` }}
        />
      </div>

      {showDetails && (
        <p className={`${c.text} text-gray-400 mt-1.5 text-right`}>
          {levelInfo.progress}% 升级进度
        </p>
      )}
    </div>
  );
};

export default LevelProgress;
