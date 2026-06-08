type SpinnerSize = 'sm' | 'md' | 'lg';

interface SpinnerProps {
  size?: SpinnerSize;
  color?: string;
  className?: string;
  label?: string;
}

const sizeMap: Record<SpinnerSize, string> = {
  sm: 'w-4 h-4 border-2',
  md: 'w-8 h-8 border-[3px]',
  lg: 'w-12 h-12 border-4',
};

export default function Spinner({
  size = 'md',
  color,
  className = '',
  label,
}: SpinnerProps) {
  const borderColor = color
    ? `border-[${color}]/20 border-t-[${color}]`
    : 'border-[var(--border-light)] border-t-[var(--primary-500)]';

  return (
    <div
      className={`inline-flex flex-col items-center justify-center gap-2 ${className}`}
      role="status"
      aria-label={label || '加载中'}
    >
      <div
        className={`
          ${sizeMap[size]}
          ${borderColor}
          rounded-full animate-spin
          dark:border-[var(--border-dark)] dark:border-t-[var(--primary-400)]
        `}
        style={
          color
            ? { borderColor: `color-mix(in srgb, ${color} 20%, transparent)`, borderTopColor: color }
            : undefined
        }
      />
      {label && (
        <span className="text-sm text-[var(--text-secondary)]">{label}</span>
      )}
    </div>
  );
}

export function SpinnerPage({ label = '加载中...' }: { label?: string }) {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <Spinner size="lg" label={label} />
    </div>
  );
}
