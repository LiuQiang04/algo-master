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
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* 页面标题 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">每日挑战</h1>
          <p className="mt-2 text-gray-600">
            每天完成挑战任务，获取额外积分奖励！
          </p>
        </div>

        {/* 统计卡片 */}
        {streakInfo && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-white rounded-lg shadow-md p-4 text-center">
              <div className="text-3xl mb-2">🔥</div>
              <p className="text-2xl font-bold text-orange-600">{streakInfo.currentStreak}</p>
              <p className="text-sm text-gray-500">当前连续天数</p>
            </div>
            <div className="bg-white rounded-lg shadow-md p-4 text-center">
              <div className="text-3xl mb-2">🏆</div>
              <p className="text-2xl font-bold text-yellow-600">{streakInfo.maxStreak}</p>
              <p className="text-sm text-gray-500">最长连续天数</p>
            </div>
            <div className="bg-white rounded-lg shadow-md p-4 text-center">
              <div className="text-3xl mb-2">📅</div>
              <p className="text-2xl font-bold text-blue-600">
                {streakInfo.isLoggedInToday ? '✓' : '✗'}
              </p>
              <p className="text-sm text-gray-500">今日登录</p>
            </div>
            <div className="bg-white rounded-lg shadow-md p-4 text-center">
              <div className="text-3xl mb-2">🎯</div>
              <p className="text-2xl font-bold text-green-600">
                {tasksData?.totalCompleted || 0}/{tasksData?.tasks.length || 0}
              </p>
              <p className="text-sm text-gray-500">今日任务</p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 左侧：每日挑战 */}
          <div className="lg:col-span-2 space-y-6">
            {challengeLoading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
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
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              </div>
            ) : tasksData ? (
              <DailyTaskList tasks={tasksData.tasks} />
            ) : null}
          </div>

          {/* 右侧：登录日历 */}
          <div>
            {calendarLoading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
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
    </div>
  );
};

export default DailyChallengePage;
