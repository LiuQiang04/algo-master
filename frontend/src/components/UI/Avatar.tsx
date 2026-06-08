import { useState, type ReactNode } from 'react';

/* ============================================
   Avatar Component
   ============================================ */

export type AvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';
export type AvatarStatus = 'online' | 'offline' | 'busy' | 'away';

interface AvatarProps {
  /** Image source URL */
  src?: string;
  /** Alt text for image */
  alt?: string;
  /** Display name (used for initial letter fallback) */
  name?: string;
  /** Avatar size */
  size?: AvatarSize;
  /** Online status indicator */
  status?: AvatarStatus;
  /** Custom fallback content */
  fallback?: ReactNode;
  /** Additional CSS classes */
  className?: string;
}

const sizeStyles: Record<AvatarSize, { container: string; text: string; status: string; statusDot: string }> = {
  xs: {
    container: 'w-6 h-6',
    text: 'text-[10px]',
    status: 'w-2.5 h-2.5 border',
    statusDot: 'w-1.5 h-1.5',
  },
  sm: {
    container: 'w-8 h-8',
    text: 'text-xs',
    status: 'w-3 h-3 border-2',
    statusDot: 'w-2 h-2',
  },
  md: {
    container: 'w-10 h-10',
    text: 'text-sm',
    status: 'w-3.5 h-3.5 border-2',
    statusDot: 'w-2 h-2',
  },
  lg: {
    container: 'w-14 h-14',
    text: 'text-lg',
    status: 'w-4 h-4 border-2',
    statusDot: 'w-2.5 h-2.5',
  },
  xl: {
    container: 'w-20 h-20',
    text: 'text-2xl',
    status: 'w-5 h-5 border-[3px]',
    statusDot: 'w-3 h-3',
  },
};

const statusColors: Record<AvatarStatus, string> = {
  online: 'bg-green-500',
  offline: 'bg-gray-400',
  busy: 'bg-red-500',
  away: 'bg-amber-500',
};

const statusLabels: Record<AvatarStatus, string> = {
  online: '在线',
  offline: '离线',
  busy: '忙碌',
  away: '离开',
};

/** Generate a deterministic color from a name */
function getColorFromName(name: string): string {
  const colors = [
    'bg-blue-500',
    'bg-green-500',
    'bg-purple-500',
    'bg-pink-500',
    'bg-indigo-500',
    'bg-teal-500',
    'bg-orange-500',
    'bg-cyan-500',
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
}

/** Get the first character of a name (supports CJK) */
function getInitial(name: string): string {
  const trimmed = name.trim();
  if (!trimmed) return '?';
  return trimmed.charAt(0).toUpperCase();
}

export default function Avatar({
  src,
  alt = '',
  name,
  size = 'md',
  status,
  fallback,
  className = '',
}: AvatarProps) {
  const [imgError, setImgError] = useState(false);
  const style = sizeStyles[size];

  const showImage = src && !imgError;
  const initial = name ? getInitial(name) : null;
  const bgColor = name ? getColorFromName(name) : 'bg-gray-400';

  return (
    <div className={`relative inline-flex shrink-0 ${className}`} title={alt || name}>
      <div
        className={`
          ${style.container}
          rounded-full overflow-hidden flex items-center justify-center
          ${showImage ? 'bg-gray-100' : bgColor}
          ring-2 ring-white
        `}
      >
        {showImage ? (
          <img
            src={src}
            alt={alt || name || ''}
            className="w-full h-full object-cover"
            onError={() => setImgError(true)}
          />
        ) : fallback ? (
          fallback
        ) : initial ? (
          <span className={`${style.text} font-semibold text-white select-none`}>
            {initial}
          </span>
        ) : (
          <svg
            className={`${style.text} text-white/70`}
            viewBox="0 0 24 24"
            fill="currentColor"
            width="60%"
            height="60%"
          >
            <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z" />
          </svg>
        )}
      </div>

      {/* Status indicator */}
      {status && (
        <span
          className={`
            absolute bottom-0 right-0 block rounded-full
            ${style.status}
            ${statusColors[status]}
            border-white
          `}
          aria-label={statusLabels[status]}
        />
      )}
    </div>
  );
}

/* ============================================
   AvatarGroup Component
   ============================================ */

interface AvatarGroupProps {
  children: ReactNode;
  /** Maximum number of avatars to show before "+N" */
  max?: number;
  /** Size for all avatars in the group */
  size?: AvatarSize;
  /** Additional CSS classes */
  className?: string;
}

export function AvatarGroup({
  children,
  max = 5,
  size = 'md',
  className = '',
}: AvatarGroupProps) {
  const childArray = Array.isArray(children) ? children : [children];
  const visible = childArray.slice(0, max);
  const remaining = childArray.length - max;

  const overlapMap: Record<AvatarSize, string> = {
    xs: '-ml-1.5',
    sm: '-ml-2',
    md: '-ml-2.5',
    lg: '-ml-3',
    xl: '-ml-4',
  };

  const zIndexBase = 10;

  return (
    <div className={`flex items-center ${className}`}>
      {visible.map((child, i) => (
        <div
          key={i}
          className={`relative ${i > 0 ? overlapMap[size] : ''}`}
          style={{ zIndex: zIndexBase - i }}
        >
          {child}
        </div>
      ))}

      {remaining > 0 && (
        <div
          className={`relative ${overlapMap[size]}`}
          style={{ zIndex: zIndexBase - max }}
        >
          <div
            className={`
              ${sizeStyles[size].container}
              rounded-full flex items-center justify-center
              bg-gray-200 ring-2 ring-white
            `}
          >
            <span className={`${sizeStyles[size].text} font-semibold text-gray-600`}>
              +{remaining}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
