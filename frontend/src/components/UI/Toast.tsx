import { useEffect, useState } from 'react';
import { CheckCircle2, XCircle, AlertTriangle, Info, X } from 'lucide-react';
import type { Toast as ToastData, ToastType } from '@/types';

type Position =
  | 'top-right'
  | 'top-left'
  | 'bottom-right'
  | 'bottom-left';

interface ToastItemProps {
  toast: ToastData;
  onClose: (id: string) => void;
}

const typeConfig: Record<ToastType, { icon: typeof CheckCircle2; bg: string; border: string; text: string }> = {
  success: {
    icon: CheckCircle2,
    bg: 'bg-[var(--success-50)] dark:bg-green-950',
    border: 'border-[var(--success-300)] dark:border-green-800',
    text: 'text-[var(--success-700)] dark:text-green-300',
  },
  error: {
    icon: XCircle,
    bg: 'bg-[var(--danger-50)] dark:bg-red-950',
    border: 'border-[var(--danger-300)] dark:border-red-800',
    text: 'text-[var(--danger-700)] dark:text-red-300',
  },
  warning: {
    icon: AlertTriangle,
    bg: 'bg-[var(--warning-50)] dark:bg-amber-950',
    border: 'border-[var(--warning-300)] dark:border-amber-800',
    text: 'text-[var(--warning-600)] dark:text-amber-300',
  },
  info: {
    icon: Info,
    bg: 'bg-[var(--primary-50)] dark:bg-blue-950',
    border: 'border-[var(--primary-300)] dark:border-blue-800',
    text: 'text-[var(--primary-700)] dark:text-blue-300',
  },
};

function ToastItem({ toast, onClose }: ToastItemProps) {
  const [exiting, setExiting] = useState(false);
  const config = typeConfig[toast.type];
  const Icon = config.icon;

  const handleClose = () => {
    setExiting(true);
    setTimeout(() => onClose(toast.id), 200);
  };

  useEffect(() => {
    if (toast.duration && toast.duration > 0) {
      const timer = setTimeout(() => {
        handleClose();
      }, toast.duration - 200); // Start exit animation before removal
      return () => clearTimeout(timer);
    }
  }, [toast.duration, toast.id]);

  return (
    <div
      className={`
        flex items-start gap-3 p-4 rounded-lg border shadow-lg
        min-w-[320px] max-w-[420px] pointer-events-auto
        ${config.bg} ${config.border}
        ${exiting ? 'animate-toast-exit' : 'animate-toast-enter'}
      `}
      role="alert"
    >
      <Icon size={18} className={`mt-0.5 flex-shrink-0 ${config.text}`} />
      <p className={`flex-1 text-sm font-medium ${config.text}`}>
        {toast.message}
      </p>
      <button
        onClick={handleClose}
        className={`flex-shrink-0 p-0.5 rounded hover:bg-black/5 dark:hover:bg-white/10 ${config.text}`}
        aria-label="关闭"
      >
        <X size={14} />
      </button>
    </div>
  );
}

interface ToastContainerProps {
  toasts: ToastData[];
  onClose: (id: string) => void;
  position?: Position;
}

const positionStyles: Record<Position, string> = {
  'top-right': 'top-4 right-4',
  'top-left': 'top-4 left-4',
  'bottom-right': 'bottom-4 right-4',
  'bottom-left': 'bottom-4 left-4',
};

export function ToastContainer({ toasts, onClose, position = 'top-right' }: ToastContainerProps) {
  if (toasts.length === 0) return null;

  const isBottom = position.startsWith('bottom');

  return (
    <div
      className={`
        fixed z-[9999] flex flex-col gap-2 pointer-events-none
        ${positionStyles[position]}
      `}
      style={{ direction: isBottom ? 'column-reverse' : 'column' }}
    >
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onClose={onClose} />
      ))}
    </div>
  );
}

export default ToastItem;
