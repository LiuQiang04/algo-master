import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Calendar, Clock, X } from 'lucide-react';

// ---- Types ----

type PresetKey = 'today' | 'last7' | 'last30' | 'thisMonth' | 'lastMonth';

export interface DateRange {
  start: Date | null;
  end: Date | null;
}

interface DatePickerProps {
  value?: Date | null;
  onChange?: (date: Date | null) => void;
  placeholder?: string;
  showTimeSelect?: boolean;
  dateFormat?: string;
  minDate?: Date;
  maxDate?: Date;
  disabled?: boolean;
  className?: string;
}

interface DateRangePickerProps {
  value?: DateRange;
  onChange?: (range: DateRange) => void;
  placeholder?: string;
  showTimeSelect?: boolean;
  dateFormat?: string;
  minDate?: Date;
  maxDate?: Date;
  showPresets?: boolean;
  disabled?: boolean;
  className?: string;
}

// ---- Helpers ----

function pad(n: number): string {
  return n.toString().padStart(2, '0');
}

function formatDate(date: Date, format: string, showTime: boolean): string {
  const map: Record<string, string> = {
    YYYY: date.getFullYear().toString(),
    MM: pad(date.getMonth() + 1),
    DD: pad(date.getDate()),
    HH: pad(date.getHours()),
    mm: pad(date.getMinutes()),
    ss: pad(date.getSeconds()),
  };
  let result = format || 'YYYY-MM-DD';
  for (const [key, val] of Object.entries(map)) {
    result = result.replace(key, val);
  }
  if (!showTime) {
    result = result.replace(/\s*HH:mm(:ss)?/, '');
  }
  return result;
}

function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function isToday(date: Date): boolean {
  return isSameDay(date, new Date());
}

function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

function getMonthDays(year: number, month: number): (Date | null)[] {
  const firstDay = new Date(year, month, 1).getDay(); // 0=Sun
  const daysInMonth = getDaysInMonth(year, month);
  const days: (Date | null)[] = [];
  // Padding for first week
  for (let i = 0; i < firstDay; i++) {
    days.push(null);
  }
  for (let d = 1; d <= daysInMonth; d++) {
    days.push(new Date(year, month, d));
  }
  return days;
}

function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function endOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59, 999);
}

const WEEKDAYS = ['日', '一', '二', '三', '四', '五', '六'];

const presets: { key: PresetKey; label: string; getRange: () => DateRange }[] = [
  { key: 'today', label: '今天', getRange: () => ({ start: startOfDay(new Date()), end: endOfDay(new Date()) }) },
  { key: 'last7', label: '最近 7 天', getRange: () => {
    const end = endOfDay(new Date());
    const start = startOfDay(new Date());
    start.setDate(start.getDate() - 6);
    return { start, end };
  }},
  { key: 'last30', label: '最近 30 天', getRange: () => {
    const end = endOfDay(new Date());
    const start = startOfDay(new Date());
    start.setDate(start.getDate() - 29);
    return { start, end };
  }},
  { key: 'thisMonth', label: '本月', getRange: () => {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    const end = endOfDay(new Date());
    return { start, end };
  }},
  { key: 'lastMonth', label: '上月', getRange: () => {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const end = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);
    return { start, end };
  }},
];

// ---- Calendar Grid ----

interface CalendarGridProps {
  year: number;
  month: number;
  selected: Date | null;
  rangeStart?: Date | null;
  rangeEnd?: Date | null;
  minDate?: Date;
  maxDate?: Date;
  onSelect: (date: Date) => void;
  onPrev: () => void;
  onNext: () => void;
}

function CalendarGrid({
  year, month, selected, rangeStart, rangeEnd,
  minDate, maxDate, onSelect, onPrev, onNext,
}: CalendarGridProps) {
  const days = getMonthDays(year, month);

  const isInRange = (date: Date): boolean => {
    if (!rangeStart || !rangeEnd) return false;
    const time = date.getTime();
    return time >= startOfDay(rangeStart).getTime() && time <= endOfDay(rangeEnd).getTime();
  };

  const isRangeEdge = (date: Date, side: 'start' | 'end'): boolean => {
    if (side === 'start' && rangeStart) return isSameDay(date, rangeStart);
    if (side === 'end' && rangeEnd) return isSameDay(date, rangeEnd);
    return false;
  };

  const isDisabled = (date: Date): boolean => {
    if (minDate && date < startOfDay(minDate)) return true;
    if (maxDate && date > endOfDay(maxDate)) return true;
    return false;
  };

  return (
    <div className="dp-calendar">
      <div className="dp-calendar-header">
        <button onClick={onPrev} className="dp-nav-btn" aria-label="上个月">
          <ChevronLeft size={16} />
        </button>
        <span className="dp-calendar-title">{year}年 {month + 1}月</span>
        <button onClick={onNext} className="dp-nav-btn" aria-label="下个月">
          <ChevronRight size={16} />
        </button>
      </div>
      <div className="dp-weekdays">
        {WEEKDAYS.map((d) => (
          <span key={d} className="dp-weekday">{d}</span>
        ))}
      </div>
      <div className="dp-days">
        {days.map((date, i) => {
          if (!date) return <span key={`pad-${i}`} className="dp-day dp-day--empty" />;
          const disabled = isDisabled(date);
          const selected_ = selected && isSameDay(date, selected);
          const today = isToday(date);
          const inRange = isInRange(date);
          const isStart = isRangeEdge(date, 'start');
          const isEnd = isRangeEdge(date, 'end');

          let cls = 'dp-day';
          if (disabled) cls += ' dp-day--disabled';
          if (selected_ && !rangeStart) cls += ' dp-day--selected';
          if (today) cls += ' dp-day--today';
          if (inRange) cls += ' dp-day--in-range';
          if (isStart) cls += ' dp-day--range-start';
          if (isEnd) cls += ' dp-day--range-end';

          return (
            <button
              key={date.toISOString()}
              className={cls}
              disabled={disabled}
              onClick={() => onSelect(date)}
            >
              {date.getDate()}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ---- Time Picker ----

interface TimePickerProps {
  value: Date | null;
  onChange: (date: Date) => void;
}

function TimePicker({ value, onChange }: TimePickerProps) {
  const hours = value ? value.getHours() : 0;
  const minutes = value ? value.getMinutes() : 0;

  const setHours = (h: number) => {
    const d = value ? new Date(value) : new Date();
    d.setHours(h);
    onChange(d);
  };

  const setMinutes = (m: number) => {
    const d = value ? new Date(value) : new Date();
    d.setMinutes(m);
    onChange(d);
  };

  return (
    <div className="dp-time">
      <Clock size={14} className="text-[var(--text-muted)]" />
      <select
        value={pad(hours)}
        onChange={(e) => setHours(parseInt(e.target.value))}
        className="dp-time-select"
      >
        {Array.from({ length: 24 }, (_, i) => (
          <option key={i} value={pad(i)}>{pad(i)}</option>
        ))}
      </select>
      <span className="text-[var(--text-muted)]">:</span>
      <select
        value={pad(minutes)}
        onChange={(e) => setMinutes(parseInt(e.target.value))}
        className="dp-time-select"
      >
        {Array.from({ length: 60 }, (_, i) => (
          <option key={i} value={pad(i)}>{pad(i)}</option>
        ))}
      </select>
    </div>
  );
}

// ---- DatePicker (single date) ----

export default function DatePicker({
  value,
  onChange,
  placeholder = '选择日期',
  showTimeSelect = false,
  dateFormat = 'YYYY-MM-DD',
  minDate,
  maxDate,
  disabled = false,
  className = '',
}: DatePickerProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const now = new Date();
  const [viewYear, setViewYear] = useState(value?.getFullYear() ?? now.getFullYear());
  const [viewMonth, setViewMonth] = useState(value?.getMonth() ?? now.getMonth());

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const handleSelect = (date: Date) => {
    if (value && showTimeSelect) {
      date.setHours(value.getHours(), value.getMinutes());
    }
    onChange?.(date);
    if (!showTimeSelect) setOpen(false);
  };

  const handleTimeChange = (date: Date) => {
    onChange?.(date);
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange?.(null);
  };

  return (
    <div ref={ref} className={`dp-root ${className}`}>
      <div
        className={`dp-input ${disabled ? 'dp-input--disabled' : ''}`}
        onClick={() => !disabled && setOpen(!open)}
      >
        <Calendar size={16} className="text-[var(--text-muted)] flex-shrink-0" />
        <span className={value ? 'dp-input-text' : 'dp-input-placeholder'}>
          {value ? formatDate(value, dateFormat, showTimeSelect) : placeholder}
        </span>
        {value && !disabled && (
          <button onClick={handleClear} className="dp-clear" aria-label="清除">
            <X size={14} />
          </button>
        )}
      </div>
      {open && (
        <div className="dp-dropdown">
          <CalendarGrid
            year={viewYear}
            month={viewMonth}
            selected={value ?? null}
            minDate={minDate}
            maxDate={maxDate}
            onSelect={handleSelect}
            onPrev={() => {
              if (viewMonth === 0) { setViewYear(viewYear - 1); setViewMonth(11); }
              else setViewMonth(viewMonth - 1);
            }}
            onNext={() => {
              if (viewMonth === 11) { setViewYear(viewYear + 1); setViewMonth(0); }
              else setViewMonth(viewMonth + 1);
            }}
          />
          {showTimeSelect && (
            <TimePicker value={value ?? null} onChange={handleTimeChange} />
          )}
          {showTimeSelect && (
            <div className="dp-actions">
              <button className="dp-action-btn dp-action-btn--confirm" onClick={() => setOpen(false)}>
                确定
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ---- DateRangePicker ----

export function DateRangePicker({
  value,
  onChange,
  placeholder = '选择日期范围',
  showTimeSelect = false,
  dateFormat = 'YYYY-MM-DD',
  minDate,
  maxDate,
  showPresets = true,
  disabled = false,
  className = '',
}: DateRangePickerProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const now = new Date();
  const [viewYear, setViewYear] = useState(now.getFullYear());
  const [viewMonth, setViewMonth] = useState(now.getMonth());
  const [hoverDate, setHoverDate] = useState<Date | null>(null);
  const [selecting, setSelecting] = useState(false);

  const start = value?.start ?? null;
  const end = value?.end ?? null;

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
        setSelecting(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const handleSelect = useCallback((date: Date) => {
    if (!selecting) {
      // First click
      onChange?.({ start: date, end: null });
      setSelecting(true);
    } else {
      // Second click
      const s = value?.start;
      if (s && date < s) {
        onChange?.({ start: date, end: s });
      } else {
        onChange?.({ start: s ?? date, end: date });
      }
      setSelecting(false);
    }
  }, [selecting, value?.start, onChange]);

  const effectiveEnd = selecting ? (hoverDate ?? end) : end;

  const formatRange = (): string => {
    if (!start) return placeholder;
    const s = formatDate(start, dateFormat, showTimeSelect);
    if (!effectiveEnd) return `${s} - ...`;
    return `${s} - ${formatDate(effectiveEnd, dateFormat, showTimeSelect)}`;
  };

  const handlePreset = (preset: typeof presets[0]) => {
    const range = preset.getRange();
    onChange?.(range);
    setOpen(false);
    setSelecting(false);
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange?.({ start: null, end: null });
    setSelecting(false);
  };

  return (
    <div ref={ref} className={`dp-root ${className}`}>
      <div
        className={`dp-input ${disabled ? 'dp-input--disabled' : ''}`}
        onClick={() => !disabled && setOpen(!open)}
      >
        <Calendar size={16} className="text-[var(--text-muted)] flex-shrink-0" />
        <span className={start ? 'dp-input-text' : 'dp-input-placeholder'}>
          {formatRange()}
        </span>
        {start && !disabled && (
          <button onClick={handleClear} className="dp-clear" aria-label="清除">
            <X size={14} />
          </button>
        )}
      </div>
      {open && (
        <div className="dp-dropdown dp-dropdown--range">
          {showPresets && (
            <div className="dp-presets">
              {presets.map((p) => (
                <button
                  key={p.key}
                  className="dp-preset-btn"
                  onClick={() => handlePreset(p)}
                >
                  {p.label}
                </button>
              ))}
            </div>
          )}
          <div
            onMouseLeave={() => setHoverDate(null)}
          >
            <CalendarGrid
              year={viewYear}
              month={viewMonth}
              selected={null}
              rangeStart={start}
              rangeEnd={effectiveEnd}
              minDate={minDate}
              maxDate={maxDate}
              onSelect={handleSelect}
              onPrev={() => {
                if (viewMonth === 0) { setViewYear(viewYear - 1); setViewMonth(11); }
                else setViewMonth(viewMonth - 1);
              }}
              onNext={() => {
                if (viewMonth === 11) { setViewYear(viewYear + 1); setViewMonth(0); }
                else setViewMonth(viewMonth + 1);
              }}
            />
          </div>
          {showTimeSelect && (
            <div className="dp-actions">
              <button className="dp-action-btn dp-action-btn--confirm" onClick={() => setOpen(false)}>
                确定
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
