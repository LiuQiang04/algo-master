import { useState, useCallback, type ReactNode } from 'react';

/* ============================================
   Rate Component - Star/Half-star Rating
   ============================================ */

type RateSize = 'sm' | 'md' | 'lg';

interface RateProps {
  /** Current rating value */
  value?: number;
  /** Callback when rating changes */
  onChange?: (value: number) => void;
  /** Total number of stars */
  count?: number;
  /** Allow half-star selection */
  allowHalf?: boolean;
  /** Read-only mode */
  readonly?: boolean;
  /** Custom color (CSS value) */
  color?: string;
  /** Inactive color (CSS value) */
  inactiveColor?: string;
  /** Show numeric score alongside stars */
  showScore?: boolean;
  /** Custom score formatter */
  formatScore?: (value: number, count: number) => string;
  /** Tooltip texts for each star */
  tooltips?: string[];
  /** Custom icon character (default: star) */
  character?: ReactNode;
  /** Size preset */
  size?: RateSize;
  /** Additional CSS classes */
  className?: string;
}

const sizeStyles: Record<RateSize, { icon: string; gap: string; score: string }> = {
  sm: { icon: 'text-lg', gap: 'gap-0.5', score: 'text-sm' },
  md: { icon: 'text-2xl', gap: 'gap-1', score: 'text-base' },
  lg: { icon: 'text-3xl', gap: 'gap-1.5', score: 'text-lg' },
};

function StarIcon({ fill, size }: { fill: 'full' | 'half' | 'empty'; size: string }) {
  const colorFull = 'currentColor';
  const colorEmpty = 'currentColor';

  if (fill === 'half') {
    return (
      <span className={`inline-block ${size} leading-none`}>
        <svg viewBox="0 0 24 24" width="1em" height="1em" fill="none" stroke="currentColor" strokeWidth="1">
          <defs>
            <linearGradient id="half-grad">
              <stop offset="50%" stopColor={colorFull} />
              <stop offset="50%" stopColor="transparent" />
            </linearGradient>
          </defs>
          <path
            d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
            fill="url(#half-grad)"
            strokeLinejoin="round"
            strokeLinecap="round"
          />
        </svg>
      </span>
    );
  }

  return (
    <span className={`inline-block ${size} leading-none`}>
      <svg viewBox="0 0 24 24" width="1em" height="1em" fill={fill === 'full' ? colorFull : 'none'} stroke={fill === 'full' ? colorFull : colorEmpty} strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round">
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
      </svg>
    </span>
  );
}

export default function Rate({
  value = 0,
  onChange,
  count = 5,
  allowHalf = false,
  readonly = false,
  color = 'var(--warning-500, #f59e0b)',
  inactiveColor = 'var(--text-muted, #d1d5db)',
  showScore = false,
  formatScore,
  tooltips,
  character,
  size = 'md',
  className = '',
}: RateProps) {
  const [hoverValue, setHoverValue] = useState<number | null>(null);
  const style = sizeStyles[size];

  const displayValue = hoverValue ?? value;

  const handleClick = useCallback(
    (starIndex: number, isHalf: boolean) => {
      if (readonly) return;
      const newValue = isHalf ? starIndex + 0.5 : starIndex + 1;
      onChange?.(newValue);
    },
    [readonly, onChange]
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>, starIndex: number) => {
      if (readonly) return;
      if (allowHalf) {
        const rect = e.currentTarget.getBoundingClientRect();
        const isLeftHalf = e.clientX - rect.left < rect.width / 2;
        setHoverValue(isLeftHalf ? starIndex + 0.5 : starIndex + 1);
      } else {
        setHoverValue(starIndex + 1);
      }
    },
    [readonly, allowHalf]
  );

  const handleMouseLeave = useCallback(() => {
    if (!readonly) setHoverValue(null);
  }, [readonly]);

  const getFill = (starIndex: number): 'full' | 'half' | 'empty' => {
    const diff = displayValue - starIndex;
    if (diff >= 1) return 'full';
    if (diff >= 0.5) return 'half';
    return 'empty';
  };

  const activeColor = hoverValue !== null && hoverValue > value ? color : color;

  return (
    <div
      className={`inline-flex items-center ${style.gap} ${className}`}
      onMouseLeave={handleMouseLeave}
      role="radiogroup"
      aria-label="评分"
    >
      {Array.from({ length: count }, (_, i) => {
        const fill = getFill(i);
        const isActive = displayValue > i;
        const tooltipText = tooltips?.[i];

        return (
          <div
            key={i}
            className={`
              relative inline-flex items-center justify-center
              ${readonly ? 'cursor-default' : 'cursor-pointer'}
              transition-transform duration-150
              ${!readonly ? 'hover:scale-110' : ''}
            `}
            style={{
              color: isActive ? activeColor : inactiveColor,
            }}
            onClick={() => handleClick(i, allowHalf && hoverValue === i + 0.5)}
            onMouseMove={(e) => handleMouseMove(e, i)}
            role="radio"
            aria-checked={value >= i + 1}
            aria-label={tooltipText || `${i + 1} 星`}
            tabIndex={readonly ? -1 : 0}
            onKeyDown={(e) => {
              if (readonly) return;
              if (e.key === 'ArrowRight' || e.key === 'ArrowUp') {
                e.preventDefault();
                onChange?.(Math.min(count, (value === Math.floor(value) ? value : Math.ceil(value)) + (allowHalf ? 0.5 : 1)));
              }
              if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') {
                e.preventDefault();
                onChange?.(Math.max(0, (value === Math.ceil(value) ? value : Math.floor(value)) - (allowHalf ? 0.5 : 1)));
              }
            }}
          >
            {character ? (
              <span
                className={`inline-block ${style.icon} leading-none transition-opacity duration-150`}
                style={{ opacity: isActive ? 1 : 0.3 }}
              >
                {character}
              </span>
            ) : (
              <StarIcon fill={fill} size={style.icon} />
            )}

            {/* Tooltip */}
            {tooltipText && hoverValue === i + 1 && (
              <span className="absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-1 text-xs font-medium text-white bg-gray-800 rounded whitespace-nowrap pointer-events-none z-10">
                {tooltipText}
              </span>
            )}
          </div>
        );
      })}

      {/* Score display */}
      {showScore && (
        <span
          className={`${style.score} font-medium ml-2`}
          style={{ color }}
        >
          {formatScore ? formatScore(value, count) : value.toFixed(allowHalf ? 1 : 0)}
        </span>
      )}
    </div>
  );
}
