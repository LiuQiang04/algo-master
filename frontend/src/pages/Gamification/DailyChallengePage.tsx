import React from 'react';
import { useDailyChallenge, useDailyTasks, useLoginStreak, useLoginCalendar } from '../../hooks/useGamification';
import DailyChallengeCard, { DailyTaskList } from '../../components/gamification/DailyChallengeCard';
import LoginStreakCalendar from '../../components/gamification/LoginStreakCalendar';

const DailyChallengePage: React.FC = () => {
  const { challenge, isCompleted, loading: challengeLoading } = useDailyChallenge();
  const { tasksData, loading: tasksLoading } = useDailyTasks();
  const { streakInfo, loading: _streakLoading } = useLoginStreak();
  const { calendar, loading: calendarLoading } = useLoginCalendar();

  const handleCompleteChallenge = () => {
    // 跳转到题目页面
    if (challenge) {
      window.location.href = `/problems/${challenge.problemId}`;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 w-full px-8 lg:px-16 py-10 lg:py-16 relative overflow-hidden">
      {/* 装饰光斑 */}
      <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-gradient-to-br from-blue-300/20 to-cyan-300/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -top-32 -right-32 w-96 h-96 bg-gradient-to-br from-purple-300/15 to-pink-300/10 rounded-full blur-3xl pointer-events-none" />

      {/* 页面标题 */}
      <div className="mb-12 lg:mb-16">
        <h1 className="text-5xl font-black bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">每日挑战</h1>
        <p className="mt-2 text-lg text-gray-500">
          每天完成挑战任务，获取额外积分奖励！
        </p>
      </div>

      {/* Hero Banner - 合并统计 */}
      {streakInfo && tasksData && (
        <div className="backdrop-blur-xl bg-white/70 border border-white/40 rounded-2xl shadow-lg shadow-purple-500/5 p-10 mb-12 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/5 via-purple-500/5 to-pink-500/5 rounded-2xl pointer-events-none" />
          <div className="relative grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-4xl mb-2">🔥</div>
              <p className="text-5xl font-black bg-gradient-to-r from-orange-500 to-amber-400 bg-clip-text text-transparent">{streakInfo.currentStreak}</p>
              <p className="text-base font-medium text-gray-500 mt-1">当前连续天数</p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-2">🏆</div>
              <p className="text-5xl font-black bg-gradient-to-r from-amber-500 to-yellow-400 bg-clip-text text-transparent">{streakInfo.maxStreak}</p>
              <p className="text-base font-medium text-gray-500 mt-1">最长连续天数</p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-2">📅</div>
              <p className="text-5xl font-black bg-gradient-to-r from-blue-500 to-cyan-400 bg-clip-text text-transparent">{streakInfo.isLoggedInToday ? '✓' : '✗'}</p>
              <p className="text-base font-medium text-gray-500 mt-1">今日登录</p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-2">🎯</div>
              <p className="text-5xl font-black bg-gradient-to-r from-emerald-500 to-teal-400 bg-clip-text text-transparent">{tasksData.totalCompleted}/{tasksData.tasks.length}</p>
              <p className="text-base font-medium text-gray-500 mt-1">今日任务</p>
            </div>
          </div>
        </div>
      )}

      {/* 只在有 streak 但没 tasks 时报错期兼容 old data */}
      {streakInfo && !tasksData && (
        <div className="backdrop-blur-xl bg-white/70 border border-white/40 rounded-2xl shadow-lg shadow-purple-500/5 p-10 mb-12">
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/5 via-purple-500/5 to-pink-500/5 rounded-2xl pointer-events-none" />
          <div className="relative grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-4xl mb-2">🔥</div>
              <p className="text-5xl font-black bg-gradient-to-r from-orange-500 to-amber-400 bg-clip-text text-transparent">{streakInfo.currentStreak}</p>
              <p className="text-base font-medium text-gray-500 mt-1">当前连续天数</p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-2">🏆</div>
              <p className="text-5xl font-black bg-gradient-to-r from-amber-500 to-yellow-400 bg-clip-text text-transparent">{streakInfo.maxStreak}</p>
              <p className="text-base font-medium text-gray-500 mt-1">最长连续天数</p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-2">📅</div>
              <p className="text-5xl font-black bg-gradient-to-r from-blue-500 to-cyan-400 bg-clip-text text-transparent">{streakInfo.isLoggedInToday ? '✓' : '✗'}</p>
              <p className="text-base font-medium text-gray-500 mt-1">今日登录</p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-2">🎯</div>
              <p className="text-5xl font-black bg-gradient-to-r from-gray-500 to-gray-400 bg-clip-text text-transparent">-</p>
              <p className="text-base font-medium text-gray-500 mt-1">今日任务</p>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* 左侧：每日挑战 */}
        <div className="lg:col-span-2 space-y-6">
          {challengeLoading ? (
            <div className="flex justify-center py-12">
              <div className="backdrop-blur-xl bg-white/70 border border-white/40 rounded-2xl p-8 shadow-lg">
                <div className="animate-spin rounded-full w-16 h-16 border-b-2 border-indigo-500 mx-auto"></div>
              </div>
            </div>
          ) : (
            <DailyChallengeCard
              challenge={challenge}
              onComplete={handleCompleteChallenge}
              isCompleted={isCompleted}
            />
          )}

          {/* 每日任务列表 */}
          {tasksLoading ? (
            <div className="flex justify-center py-8">
              <div className="backdrop-blur-xl bg-white/70 border border-white/40 rounded-2xl p-6 shadow-lg">
                <div className="animate-spin rounded-full w-12 h-12 border-b-2 border-indigo-500 mx-auto"></div>
              </div>
            </div>
          ) : tasksData ? (
            <DailyTaskList tasks={tasksData.tasks} />
          ) : null}
        </div>

        {/* 右侧：登录日历 */}
        <div>
          {calendarLoading ? (
            <div className="flex justify-center py-12">
              <div className="backdrop-blur-xl bg-white/70 border border-white/40 rounded-2xl p-8 shadow-lg">
                <div className="animate-spin rounded-full w-16 h-16 border-b-2 border-indigo-500 mx-auto"></div>
              </div>
            </div>
          ) : (
            <LoginStreakCalendar
              calendar={calendar}
              month={new Date().getMonth() + 1}
              year={new Date().getFullYear()}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default DailyChallengePage;
