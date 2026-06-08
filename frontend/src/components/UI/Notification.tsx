import { useState, useEffect, useCallback, useRef, createContext, useContext, type ReactNode } from 'react';
import { CheckCircle2, XCircle, AlertTriangle, Info, X } from 'lucide-react';

/* ============================================
   Notification Component
   Rich notification with title, message, type, position, auto-close
   ============================================ */

type NotificationType = 'success' | 'error' | 'warning' | 'info';
type NotificationPosition = 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';

interface NotificationData {
  id: string;
  type: NotificationType;
  title?: string;
  message: string;
  duration?: number;
  onClose?: () => void;
}

interface NotificationProps extends Omit<NotificationData, 'id'> {
  /** Unique id for the notification */
  id?: string;
  /** Whether the notification is visible */
  visible?: boolean;
  /** Additional CSS classes */
  className?: string;
}

// ---- Type configurations ----

const typeConfig: Record<NotificationType, { icon: typeof CheckCircle2; bg: string; border: string; iconColor: string; textColor: string }> = {
  success: {
    icon: CheckCircle2,
    bg: 'bg-[var(--success-50,#f0fdf4)]',
    border: 'border-[var(--success-300,#86efac)]',
    iconColor: 'text-[var(--success-500,#22c55e)]',
    textColor: 'text-[var(--success-700,#15803d)]',
  },
  error: {
    icon: XCircle,
    bg: 'bg-[var(--danger-50,#fef2f2)]',
    border: 'border-[var(--danger-300,#fca5a5)]',
    iconColor: 'text-[var(--danger-500,#ef4444)]',
    textColor: 'text-[var(--danger-600,#dc2626)]',
  },
  warning: {
    icon: AlertTriangle,
    bg: 'bg-[var(--warning-50,#fffbeb)]',
    border: 'border-[var(--warning-300,#fcd34d)]',
    iconColor: 'text-[var(--warning-500,#f59e0b)]',
    textColor: 'text-[var(--warning-600,#d97706)]',
  },
  info: {
    icon: Info,
    bg: 'bg-[var(--primary-50,#eff6ff)]',
    border: 'border-[var(--primary-300,#93c5fd)]',
    iconColor: 'text-[var(--primary-500,#3b82f6)]',
    textColor: 'text-[var(--primary-700,#1d4ed8)]',
  },
};

const positionStyles: Record<NotificationPosition, string> = {
  'top-right': 'top-4 right-4',
  'top-left': 'top-4 left-4',
  'bottom-right': 'bottom-4 right-4',
  'bottom-left': 'bottom-4 left-4',
};

// ---- Single Notification Component ----

export default function Notification({
  id,
  type = 'info',
  title,
  message,
  duration = 4500,
  visible = true,
  onClose,
  className = '',
}: NotificationProps) {
  const [exiting, setExiting] = useState(false);
  const [show, setShow] = useState(visible);
  const config = typeConfig[type];
  const Icon = config.icon;

  const handleClose = useCallback(() => {
    setExiting(true);
    setTimeout(() => {
      setShow(false);
      onClose?.();
    }, 200);
  }, [onClose]);

  // Auto-close
  useEffect(() => {
    if (!visible || duration <= 0) return;
    const timer = setTimeout(() => {
      handleClose();
    }, duration);
    return () => clearTimeout(timer);
  }, [visible, duration, handleClose]);

  // Sync visible prop
  useEffect(() => {
    if (!visible) {
      setExiting(true);
      setTimeout(() => setShow(false), 200);
    } else {
      setShow(true);
      setExiting(false);
    }
  }, [visible]);

  if (!show) return null;

  return (
    <div
      className={`
        flex items-start gap-3 p-4 rounded-xl border shadow-lg
        min-w-[320px] max-w-[420px]
        ${config.bg} ${config.border}
        ${exiting ? 'notification-exit' : 'notification-enter'}
        ${className}
      `}
      role="alert"
      aria-live="assertive"
    >
      {/* Icon */}
      <Icon size={20} className={`mt-0.5 flex-shrink-0 ${config.iconColor}`} />

      {/* Content */}
      <div className="flex-1 min-w-0">
        {title && (
          <h4 className={`text-sm font-semibold mb-0.5 ${config.textColor}`}>
            {title}
          </h4>
        )}
        <p className={`text-sm ${title ? 'opacity-90' : 'font-medium'} ${config.textColor}`}>
          {message}
        </p>
      </div>

      {/* Close button */}
      <button
        onClick={handleClose}
        className={`
          flex-shrink-0 p-1 rounded-lg
          hover:bg-black/5 transition-colors duration-150
          ${config.iconColor}
        `}
        aria-label="关闭通知"
      >
        <X size={16} />
      </button>

      {/* Progress bar for auto-close */}
      {duration > 0 && (
        <div className="absolute bottom-0 left-0 right-0 h-0.5 rounded-b-xl overflow-hidden">
          <div
            className={`h-full ${config.iconColor} opacity-40`}
            style={{
              animation: `notification-progress ${duration}ms linear forwards`,
            }}
          />
        </div>
      )}

      <style>{`
        @keyframes notification-enter {
          from { opacity: 0; transform: translateX(20px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes notification-exit {
          from { opacity: 1; transform: translateX(0); }
          to { opacity: 0; transform: translateX(20px); }
        }
        @keyframes notification-progress {
          from { width: 100%; }
          to { width: 0%; }
        }
        .notification-enter { animation: notification-enter 0.3s ease-out; }
        .notification-exit { animation: notification-exit 0.2s ease-in; }
      `}</style>
    </div>
  );
}

/* ============================================
   Notification Container & Manager
   ============================================ */

interface NotificationItem extends NotificationData {
  position?: NotificationPosition;
}

interface NotificationContainerProps {
  notifications: NotificationItem[];
  onClose: (id: string) => void;
  position?: NotificationPosition;
}

export function NotificationContainer({
  notifications,
  onClose,
  position = 'top-right',
}: NotificationContainerProps) {
  if (notifications.length === 0) return null;

  // Group by position
  const grouped = notifications.reduce<Record<NotificationPosition, NotificationItem[]>>(
    (acc, n) => {
      const pos = n.position || position;
      if (!acc[pos]) acc[pos] = [];
      acc[pos].push(n);
      return acc;
    },
    { 'top-right': [], 'top-left': [], 'bottom-right': [], 'bottom-left': [] }
  );

  return (
    <>
      {(Object.entries(grouped) as [NotificationPosition, NotificationItem[]][]).map(
        ([pos, items]) =>
          items.length > 0 && (
            <div
              key={pos}
              className={`
                fixed z-[9999] flex flex-col gap-3
                ${positionStyles[pos]}
              `}
              style={{ direction: pos.startsWith('bottom') ? 'column-reverse' : 'column' }}
            >
              {items.map((item) => (
                <Notification
                  key={item.id}
                  id={item.id}
                  type={item.type}
                  title={item.title}
                  message={item.message}
                  duration={item.duration}
                  onClose={() => onClose(item.id)}
                />
              ))}
            </div>
          )
      )}
    </>
  );
}

/* ============================================
   useNotification Hook - Imperative API
   ============================================ */

let notificationIdCounter = 0;

interface NotificationMethods {
  success: (message: string, title?: string) => string;
  error: (message: string, title?: string) => string;
  warning: (message: string, title?: string) => string;
  info: (message: string, title?: string) => string;
  close: (id: string) => void;
  closeAll: () => void;
}

export function useNotification(
  position: NotificationPosition = 'top-right',
  defaultDuration = 4500
): [NotificationItem[], NotificationMethods] {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const durationRef = useRef(defaultDuration);

  const add = useCallback(
    (type: NotificationType, message: string, title?: string, duration?: number) => {
      const id = `notification-${++notificationIdCounter}`;
      const item: NotificationItem = {
        id,
        type,
        title,
        message,
        duration: duration ?? durationRef.current,
        position,
      };
      setNotifications((prev) => [...prev, item]);
      return id;
    },
    [position]
  );

  const close = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  const closeAll = useCallback(() => {
    setNotifications([]);
  }, []);

  const methods: NotificationMethods = {
    success: (msg, title) => add('success', msg, title),
    error: (msg, title) => add('error', msg, title),
    warning: (msg, title) => add('warning', msg, title),
    info: (msg, title) => add('info', msg, title),
    close,
    closeAll,
  };

  return [notifications, methods];
}
