import React from 'react';
import { useDailyChallenge, useDailyTasks, useLoginStreak, useLoginCalendar } from '../../hooks/useGamification';
import DailyChallengeCard, { DailyTaskList } from '../../components/gamification/DailyChallengeCard';
import LoginStreakCalendar from '../../components/gamification/LoginStreakCalendar';

const DailyChallengePage: React.FC = () => {
  const { challenge, isCompleted, loading: challengeLoading } = useDailyChallenge();
  const { tasksData, loading: tasksLoading } = useDailyTasks();
  const { streakInfo, loading: _streakLoading } = useLoginStreak();
  const { calendar, loading: calendarLoading } = useLoginCalendar();

  const handleCompleteChallenge = () => { if (challenge) window.location.href = `/problems/${challenge.problemId}`; };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-secondary)', padding: '32px 0' }}>
      <div style={{ maxWidth: 1000, margin: '0 auto', padding: '0 24px' }}>
        <div style={{ marginBottom: 32 }}>
          <h1 style={{ fontSize: 28, fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>每日挑战</h1>
          <p style={{ margin: '8px 0 0', fontSize: 14, color: 'var(--text-secondary)' }}>每天完成挑战任务，获取额外积分奖励！</p>
        </div>

        {streakInfo && tasksData && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 32 }}>
            <div style={{ background: 'linear-gradient(135deg, #EA580C, #C2410C)', borderRadius: 'var(--radius-lg)', padding: 24, boxShadow: 'var(--shadow-md)', color: 'white' }}>
              <p style={{ fontSize: 13, opacity: 0.8, margin: 0 }}>🔥 连续登录</p>
              <p style={{ fontSize: 36, fontWeight: 700, margin: '8px 0 0' }}>{streakInfo.currentStreak}<span style={{ fontSize: 14, fontWeight: 400 }}> 天</span></p>
            </div>
            <div style={{ background: 'linear-gradient(135deg, #D97706, #B45309)', borderRadius: 'var(--radius-lg)', padding: 24, boxShadow: 'var(--shadow-md)', color: 'white' }}>
              <p style={{ fontSize: 13, opacity: 0.8, margin: 0 }}>🏆 最长连续</p>
              <p style={{ fontSize: 36, fontWeight: 700, margin: '8px 0 0' }}>{streakInfo.maxStreak}<span style={{ fontSize: 14, fontWeight: 400 }}> 天</span></p>
            </div>
            <div style={{ background: 'linear-gradient(135deg, #2563EB, #1D4ED8)', borderRadius: 'var(--radius-lg)', padding: 24, boxShadow: 'var(--shadow-md)', color: 'white' }}>
              <p style={{ fontSize: 13, opacity: 0.8, margin: 0 }}>📅 今日登录</p>
              <p style={{ fontSize: 36, fontWeight: 700, margin: '8px 0 0' }}>{streakInfo.isLoggedInToday ? '✓' : '✗'}</p>
            </div>
            <div style={{ background: 'linear-gradient(135deg, #059669, #047857)', borderRadius: 'var(--radius-lg)', padding: 24, boxShadow: 'var(--shadow-md)', color: 'white' }}>
              <p style={{ fontSize: 13, opacity: 0.8, margin: 0 }}>🎯 今日任务</p>
              <p style={{ fontSize: 36, fontWeight: 700, margin: '8px 0 0' }}>{tasksData.totalCompleted}/{tasksData.tasks.length}</p>
            </div>
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 24 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            {challengeLoading ? (
              <div style={{ display: 'flex', justifyContent: 'center', padding: 48 }}>
                <div style={{ width: 40, height: 40, borderRadius: '50%', border: '3px solid var(--border-light)', borderTopColor: 'var(--primary-600)', animation: 'spin 0.8s linear infinite' }} />
              </div>
            ) : (
              <DailyChallengeCard challenge={challenge} onComplete={handleCompleteChallenge} isCompleted={isCompleted} />
            )}
            {tasksLoading ? (
              <div style={{ display: 'flex', justifyContent: 'center', padding: 32 }}>
                <div style={{ width: 32, height: 32, borderRadius: '50%', border: '3px solid var(--border-light)', borderTopColor: 'var(--primary-600)', animation: 'spin 0.8s linear infinite' }} />
              </div>
            ) : tasksData ? (
              <DailyTaskList tasks={tasksData.tasks} />
            ) : null}
          </div>
          <div>
            {calendarLoading ? (
              <div style={{ display: 'flex', justifyContent: 'center', padding: 48 }}>
                <div style={{ width: 40, height: 40, borderRadius: '50%', border: '3px solid var(--border-light)', borderTopColor: 'var(--primary-600)', animation: 'spin 0.8s linear infinite' }} />
              </div>
            ) : (
              <LoginStreakCalendar calendar={calendar} month={new Date().getMonth() + 1} year={new Date().getFullYear()} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DailyChallengePage;
