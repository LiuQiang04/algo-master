type SkeletonVariant = 'text' | 'circular' | 'rectangular' | 'rounded';
type SkeletonSize = 'sm' | 'md' | 'lg';

interface SkeletonProps {
  variant?: SkeletonVariant;
  width?: string | number;
  height?: string | number;
  className?: string;
  count?: number;
}

const variantStyles: Record<SkeletonVariant, string> = {
  text: 'rounded-[var(--radius-sm)]',
  circular: 'rounded-full',
  rectangular: '',
  rounded: 'rounded-[var(--radius-lg)]',
};

function Skeleton({
  variant = 'text',
  width,
  height,
  className = '',
  count = 1,
}: SkeletonProps) {
  const style: React.CSSProperties = {};
  if (width !== undefined) style.width = typeof width === 'number' ? `${width}px` : width;
  if (height !== undefined) style.height = typeof height === 'number' ? `${height}px` : height;

  // Default heights for text variant
  if (variant === 'text' && height === undefined) {
    style.height = '1em';
  }

  const baseClass = `
    bg-[var(--bg-tertiary)]
    dark:bg-[var(--bg-tertiary)]
    animate-pulse
    ${variantStyles[variant]}
    ${className}
  `;

  if (count > 1) {
    return (
      <div className="flex flex-col gap-2">
        {Array.from({ length: count }).map((_, i) => (
          <div
            key={i}
            className={baseClass}
            style={{
              ...style,
              // Last item is usually shorter for text
              ...(variant === 'text' && i === count - 1 ? { width: '60%' } : {}),
            }}
          />
        ))}
      </div>
    );
  }

  return <div className={baseClass} style={style} />;
}

// Predefined skeleton layouts
interface SkeletonLineProps {
  lines?: number;
  className?: string;
}

export function SkeletonText({ lines = 3, className = '' }: SkeletonLineProps) {
  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className="h-4 rounded-[var(--radius-sm)] bg-[var(--bg-tertiary)] animate-pulse"
          style={{
            width: i === lines - 1 ? '60%' : '100%',
          }}
        />
      ))}
    </div>
  );
}

interface SkeletonCardProps {
  className?: string;
}

export function SkeletonCard({ className = '' }: SkeletonCardProps) {
  return (
    <div
      className={`
        p-6 rounded-xl border border-[var(--border-light)]
        bg-[var(--bg-card)] ${className}
      `}
    >
      <div className="flex items-center gap-3 mb-4">
        <Skeleton variant="circular" width={40} height={40} />
        <div className="flex-1">
          <Skeleton width="40%" height={16} className="mb-2" />
          <Skeleton width="25%" height={12} />
        </div>
      </div>
      <SkeletonText lines={3} />
    </div>
  );
}

interface SkeletonTableProps {
  rows?: number;
  cols?: number;
  className?: string;
}

export function SkeletonTable({ rows = 5, cols = 4, className = '' }: SkeletonTableProps) {
  return (
    <div className={`w-full ${className}`}>
      {/* Header */}
      <div className="flex gap-4 pb-3 border-b border-[var(--border-light)]">
        {Array.from({ length: cols }).map((_, i) => (
          <Skeleton
            key={i}
            height={16}
            className="flex-1"
          />
        ))}
      </div>
      {/* Rows */}
      {Array.from({ length: rows }).map((_, rowIdx) => (
        <div
          key={rowIdx}
          className="flex gap-4 py-3 border-b border-[var(--border-light)]"
        >
          {Array.from({ length: cols }).map((_, colIdx) => (
            <Skeleton
              key={colIdx}
              height={14}
              className="flex-1"
            />
          ))}
        </div>
      ))}
    </div>
  );
}

export default Skeleton;
