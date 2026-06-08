import { type ReactNode } from 'react';
import { X } from 'lucide-react';
import './Badge.css';

export type BadgeVariant = 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'info';
export type BadgeSize = 'sm' | 'md' | 'lg';

interface BadgeProps {
  children: ReactNode;
  variant?: BadgeVariant;
  size?: BadgeSize;
  icon?: ReactNode;
  closable?: boolean;
  onClose?: () => void;
  color?: string;
  className?: string;
}

const variantStyles: Record<BadgeVariant, string> = {
  default: 'badge--default',
  primary: 'badge--primary',
  success: 'badge--success',
  warning: 'badge--warning',
  danger: 'badge--danger',
  info: 'badge--info',
};

const sizeStyles: Record<BadgeSize, string> = {
  sm: 'badge--sm',
  md: 'badge--md',
  lg: 'badge--lg',
};

const closeSizeMap: Record<BadgeSize, number> = {
  sm: 10,
  md: 12,
  lg: 14,
};

export default function Badge({
  children,
  variant = 'default',
  size = 'sm',
  icon,
  closable = false,
  onClose,
  color,
  className = '',
}: BadgeProps) {
  const style: React.CSSProperties = color
    ? { backgroundColor: `${color}18`, color, borderColor: `${color}30` }
    : {};

  return (
    <span
      className={`badge ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
      style={style}
    >
      {icon && <span className="badge__icon">{icon}</span>}
      <span className="badge__text">{children}</span>
      {closable && (
        <button
          className="badge__close"
          onClick={(e) => {
            e.stopPropagation();
            onClose?.();
          }}
          aria-label="移除"
        >
          <X size={closeSizeMap[size]} />
        </button>
      )}
    </span>
  );
}
