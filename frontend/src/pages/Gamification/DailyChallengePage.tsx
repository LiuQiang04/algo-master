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
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 w-full px-6 lg:px-12 py-8 lg:py-12">
      {/* 页面标题 */}
      <div className="mb-10">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">每日挑战</h1>
        <p className="mt-2 text-gray-500">
          每天完成挑战任务，获取额外积分奖励！
        </p>
      </div>

      {/* 统计卡片 */}
      {streakInfo && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          <div className="backdrop-blur-xl bg-white/70 border border-white/40 rounded-2xl shadow-lg shadow-purple-500/5 p-5 text-center">
            <div className="text-3xl mb-2">🔥</div>
            <p className="text-2xl font-bold bg-gradient-to-r from-orange-500 to-amber-400 bg-clip-text text-transparent">{streakInfo.currentStreak}</p>
            <p className="text-sm text-gray-500 mt-1">当前连续天数</p>
          </div>
          <div className="backdrop-blur-xl bg-white/70 border border-white/40 rounded-2xl shadow-lg shadow-purple-500/5 p-5 text-center">
            <div className="text-3xl mb-2">🏆</div>
            <p className="text-2xl font-bold bg-gradient-to-r from-amber-500 to-yellow-400 bg-clip-text text-transparent">{streakInfo.maxStreak}</p>
            <p className="text-sm text-gray-500 mt-1">最长连续天数</p>
          </div>
          <div className="backdrop-blur-xl bg-white/70 border border-white/40 rounded-2xl shadow-lg shadow-purple-500/5 p-5 text-center">
            <div className="text-3xl mb-2">📅</div>
            <p className="text-2xl font-bold bg-gradient-to-r from-blue-500 to-cyan-400 bg-clip-text text-transparent">{streakInfo.isLoggedInToday ? '✓' : '✗'}</p>
            <p className="text-sm text-gray-500 mt-1">今日登录</p>
          </div>
          <div className="backdrop-blur-xl bg-white/70 border border-white/40 rounded-2xl shadow-lg shadow-purple-500/5 p-5 text-center">
            <div className="text-3xl mb-2">🎯</div>
            <p className="text-2xl font-bold bg-gradient-to-r from-emerald-500 to-teal-400 bg-clip-text text-transparent">{tasksData?.totalCompleted || 0}/{tasksData?.tasks.length || 0}</p>
            <p className="text-sm text-gray-500 mt-1">今日任务</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* 左侧：每日挑战 */}
        <div className="lg:col-span-2 space-y-6">
          {challengeLoading ? (
            <div className="flex justify-center py-12">
              <div className="backdrop-blur-xl bg-white/70 border border-white/40 rounded-2xl p-8 shadow-lg">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500 mx-auto"></div>
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
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500 mx-auto"></div>
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
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500 mx-auto"></div>
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
