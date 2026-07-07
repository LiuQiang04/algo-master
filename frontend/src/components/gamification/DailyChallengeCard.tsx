import React from 'react';
import type { DailyChallenge, DailyTask } from '../../types/gamification';

interface DailyChallengeCardProps {
  challenge: DailyChallenge | null;
  onComplete?: () => void;
  isCompleted?: boolean;
}

export const DailyChallengeCard: React.FC<DailyChallengeCardProps> = ({
  challenge,
  onComplete,
  isCompleted = false,
}) => {
  if (!challenge) {
    return (
      <div style={{ background: 'rgba(255,255,255,0.7)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.4)', borderRadius: 'var(--radius-lg)', padding: 24, boxShadow: 'var(--shadow-sm)', textAlign: 'center' }}>
        <p style={{ fontSize: 14, color: 'var(--text-muted)' }}>今日暂无挑战</p>
      </div>
    );
  }

  const difficultyStars = Array(5).fill(0).map((_, i) => (
    <svg key={i} width="16" height="16" viewBox="0 0 20 20" fill={i < challenge.problem.difficulty ? '#FBBF24' : '#D1D5DB'}>
      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
    </svg>
  ));

  return (
    <div style={{ background: 'linear-gradient(135deg, rgba(124,58,237,0.9), rgba(79,70,229,0.9))', backdropFilter: 'blur(12px)', borderRadius: 'var(--radius-lg)', padding: 24, boxShadow: 'var(--shadow-md)', color: 'white', border: '1px solid rgba(255,255,255,0.2)' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <h3 style={{ fontSize: 18, fontWeight: 700, margin: 0 }}>每日挑战</h3>
        <span style={{ padding: '4px 12px', borderRadius: 'var(--radius-full)', fontSize: 14, background: 'rgba(255,255,255,0.2)', border: '1px solid rgba(255,255,255,0.2)' }}>
          +{challenge.bonusPoints} 积分
        </span>
      </div>
      <div style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 'var(--radius-md)', padding: 16, marginBottom: 16 }}>
        <h4 style={{ fontSize: 16, fontWeight: 600, margin: '0 0 8px' }}>{challenge.problem.title}</h4>
        <div style={{ display: 'flex', gap: 2, marginBottom: 8 }}>{difficultyStars}</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
          {challenge.problem.tags.map(({ tag }) => (
            <span key={tag.id} style={{ padding: '2px 10px', borderRadius: 'var(--radius-full)', fontSize: 13, background: 'rgba(255,255,255,0.2)', border: '1px solid rgba(255,255,255,0.1)' }}>
              {tag.name}
            </span>
          ))}
        </div>
      </div>
      {isCompleted ? (
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'linear-gradient(135deg, #34D399, #10B981)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 8px' }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <p style={{ fontSize: 16, fontWeight: 500, margin: 0 }}>今日挑战已完成!</p>
        </div>
      ) : (
        <button onClick={onComplete} style={{ width: '100%', padding: '12px 0', fontSize: 16, fontWeight: 600, background: 'white', color: '#7C3AED', border: 'none', borderRadius: 'var(--radius-md)', cursor: 'pointer' }}>
          开始挑战
        </button>
      )}
    </div>
  );
};

interface DailyTaskListProps {
  tasks: DailyTask[];
}

export const DailyTaskList: React.FC<DailyTaskListProps> = ({ tasks }) => {
  return (
    <div style={{ background: 'rgba(255,255,255,0.7)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.4)', borderRadius: 'var(--radius-lg)', padding: 20, boxShadow: 'var(--shadow-sm)' }}>
      <h3 style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-primary)', margin: '0 0 16px' }}>每日任务</h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {tasks.map((task) => (
          <div key={task.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', minHeight: 52, borderRadius: 'var(--radius-md)', background: task.completed ? 'linear-gradient(to right, rgba(16,185,129,0.1), rgba(20,184,166,0.1))' : 'rgba(255,255,255,0.4)', border: task.completed ? '1px solid rgba(16,185,129,0.2)' : '1px solid rgba(255,255,255,0.3)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 24, height: 24, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, background: task.completed ? 'linear-gradient(135deg, #34D399, #10B981)' : 'rgba(255,255,255,0.6)', border: task.completed ? 'none' : '1px solid var(--border-light)' }}>
                {task.completed && (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </div>
              <div>
                <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>{task.title}</p>
                <p style={{ fontSize: 13, color: 'var(--text-secondary)', margin: '2px 0 0' }}>{task.description}</p>
              </div>
            </div>
            <div style={{ textAlign: 'right', flexShrink: 0 }}>
              <p style={{ fontSize: 14, color: 'var(--text-secondary)', margin: 0 }}>{task.current}/{task.target}</p>
              {task.reward > 0 && <p style={{ fontSize: 13, fontWeight: 500, color: '#D97706', margin: '2px 0 0' }}>+{task.reward} 积分</p>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DailyChallengeCard;
