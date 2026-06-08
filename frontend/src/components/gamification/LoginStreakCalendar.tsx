import React from 'react';
import type { LoginCalendarDay } from '../../types/gamification';

interface LoginStreakCalendarProps {
  calendar: LoginCalendarDay[];
  month: number;
  year: number;
  onMonthChange?: (month: number, year: number) => void;
}

const LoginStreakCalendar: React.FC<LoginStreakCalendarProps> = ({
  calendar,
  month,
  year,
  onMonthChange,
}) => {
  const firstDayOfWeek = new Date(year, month - 1, 1).getDay();

  const weekDays = ['日', '一', '二', '三', '四', '五', '六'];

  const handlePrevMonth = () => {
    if (month === 1) {
      onMonthChange?.(12, year - 1);
    } else {
      onMonthChange?.(month - 1, year);
    }
  };

  const handleNextMonth = () => {
    if (month === 12) {
      onMonthChange?.(1, year + 1);
    } else {
      onMonthChange?.(month + 1, year);
    }
  };

  const getCalendarDays = () => {
    const days: (LoginCalendarDay | null)[] = [];

    // 添加空白天数
    for (let i = 0; i < firstDayOfWeek; i++) {
      days.push(null);
    }

    // 添加日历天数
    calendar.forEach((day) => {
      days.push(day);
    });

    return days;
  };

  const calendarDays = getCalendarDays();

  return (
    <div className="bg-white rounded-lg shadow-md p-4">
      {/* 月份导航 */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={handlePrevMonth}
          className="p-2 hover:bg-gray-100 rounded-lg"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h3 className="font-semibold text-gray-800">
          {year}年{month}月
        </h3>
        <button
          onClick={handleNextMonth}
          className="p-2 hover:bg-gray-100 rounded-lg"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* 星期头部 */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {weekDays.map((day) => (
          <div
            key={day}
            className="text-center text-xs font-medium text-gray-500 py-2"
          >
            {day}
          </div>
        ))}
      </div>

      {/* 日历网格 */}
      <div className="grid grid-cols-7 gap-1">
        {calendarDays.map((day, index) => (
          <div
            key={index}
            className={`aspect-square flex items-center justify-center rounded-lg text-sm ${
              day === null
                ? ''
                : day.isLoggedIn
                ? 'bg-green-500 text-white font-medium'
                : 'bg-gray-100 text-gray-600'
            }`}
          >
            {day && (
              <div className="text-center">
                <div>{new Date(day.date).getDate()}</div>
                {day.isLoggedIn && day.streakDays > 1 && (
                  <div className="text-xs">🔥{day.streakDays}</div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* 图例 */}
      <div className="flex items-center justify-center gap-4 mt-4 text-xs text-gray-500">
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-gray-100 rounded"></div>
          <span>未登录</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-green-500 rounded"></div>
          <span>已登录</span>
        </div>
        <div className="flex items-center gap-1">
          <span>🔥</span>
          <span>连续天数</span>
        </div>
      </div>
    </div>
  );
};

export default LoginStreakCalendar;
