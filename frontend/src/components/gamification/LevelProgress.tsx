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
  const config = {
    sm: { text: 12, circle: '40px', circleText: 16, bar: 'h-2', pad: 16 },
    md: { text: 14, circle: '56px', circleText: 20, bar: 'h-3', pad: 24 },
    lg: { text: 14, circle: '64px', circleText: 20, bar: 'h-3', pad: 24 },
  };

  const c = config[size];

  return (
    <div
      style={{
        background: 'rgba(255,255,255,0.7)',
        backdropFilter: 'blur(12px)',
        border: '1px solid rgba(255,255,255,0.4)',
        borderRadius: 'var(--radius-lg)',
        boxShadow: 'var(--shadow-md)',
        padding: c.pad,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div
            style={{
              width: c.circle,
              height: c.circle,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #4F46E5, #7C3AED)',
              boxShadow: '0 4px 12px rgba(124,58,237,0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <span style={{ color: 'white', fontWeight: 700, fontSize: c.circleText }}>
              {levelInfo.level}
            </span>
          </div>
          <div>
            <p style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: 16, margin: 0 }}>
              等级 {levelInfo.level}
            </p>
            <p style={{ fontSize: c.text, color: 'var(--text-secondary)', margin: '2px 0 0' }}>
              {levelInfo.currentExp} / {levelInfo.nextLevelExp} EXP
            </p>
          </div>
        </div>
        {showDetails && (
          <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>
            总经验: {levelInfo.totalExp}
          </span>
        )}
      </div>

      <div
        style={{
          width: '100%',
          background: 'rgba(255,255,255,0.6)',
          border: '1px solid rgba(255,255,255,0.4)',
          borderRadius: 'var(--radius-full)',
          overflow: 'hidden',
        }}
      >
        <div
          className={c.bar}
          style={{
            background: 'linear-gradient(to right, #4F46E5, #7C3AED)',
            borderRadius: 'var(--radius-full)',
            transition: 'width 0.5s',
            width: `${levelInfo.progress}%`,
          }}
        />
      </div>

      {showDetails && (
        <p style={{ fontSize: c.text, color: 'var(--text-muted)', margin: '6px 0 0', textAlign: 'right' }}>
          {levelInfo.progress}% 升级进度
        </p>
      )}
    </div>
  );
};

export default LevelProgress;
