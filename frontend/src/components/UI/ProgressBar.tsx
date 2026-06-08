import { useMemo } from 'react';

/* ============================================
   Shared types
   ============================================ */

type ProgressSize = 'sm' | 'md' | 'lg';

interface ProgressBaseProps {
  /** Current value (0-100) */
  value: number;
  /** Track color. Default: 'var(--bg-tertiary)' */
  trackColor?: string;
  /** Fill color. Default: 'var(--primary-500)' */
  color?: string;
  /** Show percentage label. Default: false */
  showLabel?: boolean;
  /** Size variant. Default: 'md' */
  size?: ProgressSize;
  /** Extra className */
  className?: string;
}

/* ============================================
   Linear ProgressBar
   ============================================ */

interface ProgressBarProps extends ProgressBaseProps {
  /** Whether to animate the fill. Default: true */
  animated?: boolean;
  /** Display label position: inside the bar or outside. Default: 'outside' */
  labelPosition?: 'inside' | 'outside';
}

const linearHeights: Record<ProgressSize, string> = {
  sm: 'h-1.5',
  md: 'h-2.5',
  lg: 'h-4',
};

const linearTextSizes: Record<ProgressSize, string> = {
  sm: 'text-xs',
  md: 'text-sm',
  lg: 'text-base',
};

export function ProgressBar({
  value,
  color = 'var(--primary-500)',
  trackColor = 'var(--bg-tertiary)',
  showLabel = false,
  size = 'md',
  animated = true,
  labelPosition = 'outside',
  className = '',
}: ProgressBarProps) {
  const clamped = Math.max(0, Math.min(100, value));

  const fillStyle = useMemo(
    () => ({
      width: `${clamped}%`,
      background: color,
      transition: animated ? 'width 500ms ease' : undefined,
    }),
    [clamped, color, animated],
  );

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div
        className={`flex-1 rounded-full overflow-hidden ${linearHeights[size]}`}
        style={{ background: trackColor }}
        role="progressbar"
        aria-valuenow={clamped}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        {labelPosition === 'inside' && showLabel ? (
          <div
            className={`flex items-center justify-end pr-1.5 h-full rounded-full text-white font-medium ${linearTextSizes[size]}`}
            style={fillStyle}
          >
            {Math.round(clamped)}%
          </div>
        ) : (
          <div className="h-full rounded-full" style={fillStyle} />
        )}
      </div>
      {showLabel && labelPosition === 'outside' && (
        <span
          className={`shrink-0 font-medium text-[var(--text-secondary)] ${linearTextSizes[size]}`}
        >
          {Math.round(clamped)}%
        </span>
      )}
    </div>
  );
}

/* ============================================
   CircularProgress
   ============================================ */

interface CircularProgressProps extends ProgressBaseProps {
  /** SVG diameter in px. Default: 80 */
  size?: number;
  /** Stroke width in px. Default: 6 */
  strokeWidth?: number;
  /** Custom label displayed inside the circle */
  children?: React.ReactNode;
}

export function CircularProgress({
  value,
  color = 'var(--primary-500)',
  trackColor = 'var(--bg-tertiary)',
  showLabel = false,
  size: diameter = 80,
  strokeWidth = 6,
  children,
  className = '',
}: CircularProgressProps) {
  const clamped = Math.max(0, Math.min(100, value));
  const radius = (diameter - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - clamped / 100);

  const fontSize = diameter < 48 ? 10 : diameter < 80 ? 14 : 20;

  return (
    <div
      className={`relative inline-flex items-center justify-center ${className}`}
      style={{ width: diameter, height: diameter }}
    >
      <svg
        width={diameter}
        height={diameter}
        className="-rotate-90"
        role="progressbar"
        aria-valuenow={clamped}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        {/* Track */}
        <circle
          cx={diameter / 2}
          cy={diameter / 2}
          r={radius}
          fill="none"
          stroke={trackColor}
          strokeWidth={strokeWidth}
        />
        {/* Fill */}
        <circle
          cx={diameter / 2}
          cy={diameter / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 500ms ease' }}
        />
      </svg>
      {/* Center label */}
      <div className="absolute inset-0 flex items-center justify-center">
        {children ?? (showLabel && (
          <span
            className="font-semibold text-[var(--text-primary)]"
            style={{ fontSize }}
          >
            {Math.round(clamped)}%
          </span>
        ))}
      </div>
    </div>
  );
}
