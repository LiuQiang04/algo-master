import React from 'react';
import type { LoginCalendarDay } from '../../types/gamification';

interface LoginStreakCalendarProps {
  calendar: LoginCalendarDay[];
  month: number;
  year: number;
  onMonthChange?: (month: number, year: number) => void;
}

const LoginStreakCalendar: React.FC<LoginStreakCalendarProps> = ({ calendar, month, year, onMonthChange }) => {
  const firstDayOfWeek = new Date(year, month - 1, 1).getDay();
  const weekDays = ['日', '一', '二', '三', '四', '五', '六'];
  const handlePrevMonth = () => { if (month === 1) onMonthChange?.(12, year - 1); else onMonthChange?.(month - 1, year); };
  const handleNextMonth = () => { if (month === 12) onMonthChange?.(1, year + 1); else onMonthChange?.(month + 1, year); };
  const calendarDays: (LoginCalendarDay | null)[] = [];
  for (let i = 0; i < firstDayOfWeek; i++) calendarDays.push(null);
  calendar.forEach((day) => calendarDays.push(day));

  return (
    <div style={{ background: 'rgba(255,255,255,0.7)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.4)', borderRadius: 'var(--radius-lg)', padding: 20, boxShadow: 'var(--shadow-sm)' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <button onClick={handlePrevMonth} style={{ padding: 8, borderRadius: 'var(--radius-md)', background: 'rgba(255,255,255,0.6)', border: '1px solid rgba(255,255,255,0.4)', cursor: 'pointer', display: 'flex' }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
        </button>
        <h3 style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>{year}年{month}月</h3>
        <button onClick={handleNextMonth} style={{ padding: 8, borderRadius: 'var(--radius-md)', background: 'rgba(255,255,255,0.6)', border: '1px solid rgba(255,255,255,0.4)', cursor: 'pointer', display: 'flex' }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
        </button>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 2, marginBottom: 4 }}>
        {weekDays.map((day) => (
          <div key={day} style={{ textAlign: 'center', fontSize: 13, fontWeight: 600, color: 'var(--text-muted)', padding: '4px 0' }}>{day}</div>
        ))}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 2 }}>
        {calendarDays.map((day, index) => (
          <div key={index} style={{ aspectRatio: '1', minHeight: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 'var(--radius-sm)', fontSize: 13, ...(day === null ? {} : day.isLoggedIn ? { background: 'linear-gradient(135deg, #34D399, #10B981)', color: 'white', fontWeight: 500 } : { background: 'rgba(255,255,255,0.4)', color: 'var(--text-secondary)', border: '1px solid rgba(255,255,255,0.3)' }) }}>
            {day && (
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 13, fontWeight: 500 }}>{new Date(day.date).getDate()}</div>
                {day.isLoggedIn && day.streakDays > 1 && <div style={{ fontSize: 10 }}>🔥{day.streakDays}</div>}
              </div>
            )}
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, marginTop: 12, fontSize: 13, color: 'var(--text-muted)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <div style={{ width: 10, height: 10, borderRadius: 2, background: 'rgba(255,255,255,0.4)', border: '1px solid rgba(255,255,255,0.3)' }} />
          <span>未登录</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <div style={{ width: 10, height: 10, borderRadius: 2, background: 'linear-gradient(135deg, #34D399, #10B981)' }} />
          <span>已登录</span>
        </div>
      </div>
    </div>
  );
};

export default LoginStreakCalendar;
