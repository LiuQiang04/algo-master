import type { ReactNode } from 'react';
import { Inbox } from 'lucide-react';
import './Empty.css';

type EmptySize = 'sm' | 'md' | 'lg';

interface EmptyProps {
  /** Custom icon displayed above description */
  icon?: ReactNode;
  /** Description text. Default: '暂无数据' */
  description?: string;
  /** Secondary description text */
  subDescription?: string;
  /** Action element (button, link, etc.) rendered below description */
  action?: ReactNode;
  /** Size variant */
  size?: EmptySize;
  /** Additional class name */
  className?: string;
}

const iconSizeMap: Record<EmptySize, number> = {
  sm: 36,
  md: 48,
  lg: 64,
};

export default function Empty({
  icon,
  description = '暂无数据',
  subDescription,
  action,
  size = 'md',
  className = '',
}: EmptyProps) {
  return (
    <div className={`empty empty--${size} ${className}`}>
      <div className="empty__icon">
        {icon || <Inbox size={iconSizeMap[size]} />}
      </div>
      <div className="empty__content">
        <p className="empty__desc">{description}</p>
        {subDescription && <p className="empty__sub">{subDescription}</p>}
      </div>
      {action && <div className="empty__action">{action}</div>}
    </div>
  );
}
