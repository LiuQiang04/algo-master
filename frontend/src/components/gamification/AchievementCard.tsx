import React from 'react';
import type { Achievement, UserAchievement } from '../../types/gamification';

interface AchievementCardProps {
  achievement: Achievement | UserAchievement;
  isUnlocked?: boolean;
  showProgress?: boolean;
}

const rarityColors = {
  common: { border: 'var(--border-light)', tag: 'var(--text-muted)' },
  rare: { border: '#60A5FA', tag: '#3B82F6' },
  epic: { border: '#A78BFA', tag: '#7C3AED' },
  legendary: { border: '#FBBF24', tag: '#D97706' },
};

const rarityLabels = {
  common: '普通',
  rare: '稀有',
  epic: '史诗',
  legendary: '传说',
};

const rarityGradients = {
  common: 'linear-gradient(135deg, #9CA3AF, #6B7280)',
  rare: 'linear-gradient(135deg, #60A5FA, #3B82F6)',
  epic: 'linear-gradient(135deg, #A78BFA, #7C3AED)',
  legendary: 'linear-gradient(135deg, #FBBF24, #F59E0B)',
};

const AchievementCard: React.FC<AchievementCardProps> = ({
  achievement,
  isUnlocked = false,
  showProgress = false,
}) => {
  const isUserAchievement = 'unlockedAt' in achievement;
  const rarity = achievement.rarity || 'common';
  const unlocked = isUnlocked || isUserAchievement;

  return (
    <div
      style={{
        position: 'relative',
        background: 'rgba(255,255,255,0.7)',
        backdropFilter: 'blur(12px)',
        border: `1px solid ${unlocked ? rarityColors[rarity].border : 'rgba(255,255,255,0.3)'}`,
        borderRadius: 'var(--radius-lg)',
        padding: 24,
        boxShadow: 'var(--shadow-sm)',
        opacity: unlocked ? 1 : 0.5,
      }}
    >
      <div
        style={{
          position: 'absolute',
          top: 12,
          right: 12,
          padding: '2px 10px',
          borderRadius: 'var(--radius-full)',
          fontSize: 13,
          fontWeight: 500,
          background: 'rgba(255,255,255,0.8)',
          border: '1px solid rgba(255,255,255,0.6)',
          color: rarityColors[rarity].tag,
        }}
      >
        {rarityLabels[rarity]}
      </div>

      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
        <div
          style={{
            width: 56,
            height: 56,
            borderRadius: 'var(--radius-md)',
            background: unlocked ? rarityGradients[rarity] : 'linear-gradient(135deg, #D1D5DB, #9CA3AF)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          {achievement.iconUrl ? (
            <img src={achievement.iconUrl} alt={achievement.name} style={{ width: 36, height: 36 }} />
          ) : (
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
            </svg>
          )}
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <h3 style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>
            {achievement.name}
          </h3>
          <p style={{ fontSize: 14, color: 'var(--text-secondary)', margin: '4px 0 0', lineHeight: 1.4 }}>
            {achievement.description}
          </p>

          <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 8 }}>
            <span style={{ fontSize: 14, color: '#D97706' }}>⭐</span>
            <span style={{ fontSize: 14, fontWeight: 500, color: 'var(--text-secondary)' }}>
              +{achievement.points} 积分
            </span>
          </div>

          {isUserAchievement && 'unlockedAt' in achievement && (
            <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: '4px 0 0' }}>
              解锁于: {new Date((achievement as UserAchievement).unlockedAt).toLocaleDateString()}
            </p>
          )}

          {showProgress && isUserAchievement && 'progress' in achievement && (
            <div style={{ marginTop: 8 }}>
              <div style={{ width: '100%', background: 'rgba(255,255,255,0.6)', borderRadius: 'var(--radius-full)', height: 8, overflow: 'hidden' }}>
                <div
                  style={{
                    height: '100%',
                    background: 'linear-gradient(to right, var(--primary-500), #7C3AED)',
                    borderRadius: 'var(--radius-full)',
                    transition: 'width 0.5s',
                    width: `${(achievement as UserAchievement).progress}%`,
                  }}
                />
              </div>
              <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: '4px 0 0' }}>
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
