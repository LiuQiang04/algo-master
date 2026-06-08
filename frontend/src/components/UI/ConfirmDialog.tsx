import { useState, useEffect, useCallback, type ReactNode } from 'react';
import { AlertTriangle, Info, AlertOctagon, X } from 'lucide-react';

type Severity = 'info' | 'warning' | 'danger';

interface ConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  title: string;
  message?: ReactNode;
  severity?: Severity;
  confirmText?: string;
  cancelText?: string;
  /** 自定义图标，不传则根据 severity 自动选择 */
  icon?: ReactNode;
}

const severityConfig: Record<Severity, { icon: ReactNode; iconBg: string; iconColor: string; confirmVariant: string }> = {
  info: {
    icon: <Info size={22} />,
    iconBg: 'bg-[var(--primary-50)] dark:bg-[rgba(59,130,246,0.15)]',
    iconColor: 'text-[var(--primary-600)] dark:text-[var(--primary-400)]',
    confirmVariant: 'bg-[var(--primary-600)] hover:bg-[var(--primary-700)] text-white',
  },
  warning: {
    icon: <AlertTriangle size={22} />,
    iconBg: 'bg-[var(--warning-50)] dark:bg-[rgba(245,158,11,0.15)]',
    iconColor: 'text-[var(--warning-600)] dark:text-[var(--warning-400)]',
    confirmVariant: 'bg-[var(--warning-500)] hover:bg-[var(--warning-600)] text-white',
  },
  danger: {
    icon: <AlertOctagon size={22} />,
    iconBg: 'bg-[var(--danger-50)] dark:bg-[rgba(239,68,68,0.15)]',
    iconColor: 'text-[var(--danger-600)] dark:text-[var(--danger-400)]',
    confirmVariant: 'bg-[var(--danger-500)] hover:bg-[var(--danger-600)] text-white',
  },
};

export default function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  message,
  severity = 'info',
  confirmText = '确认',
  cancelText = '取消',
  icon,
}: ConfirmDialogProps) {
  const [loading, setLoading] = useState(false);
  const config = severityConfig[severity];

  const handleConfirm = useCallback(async () => {
    try {
      setLoading(true);
      await onConfirm();
      onClose();
    } catch {
      // 出错时保持对话框打开，由调用方处理错误
    } finally {
      setLoading(false);
    }
  }, [onConfirm, onClose]);

  // ESC 键关闭
  useEffect(() => {
    if (!open) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !loading) onClose();
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [open, loading, onClose]);

  // 打开时锁定背景滚动
  useEffect(() => {
    if (open) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => { document.body.style.overflow = prev; };
    }
  }, [open]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-dialog-title"
    >
      {/* 遮罩层 */}
      <div
        className="absolute inset-0 bg-[var(--bg-overlay)] transition-opacity"
        onClick={loading ? undefined : onClose}
        aria-hidden="true"
      />

      {/* 对话框 */}
      <div className="relative w-full max-w-[420px] bg-[var(--bg-card)] rounded-[var(--radius-xl)] shadow-[var(--shadow-xl)] border border-[var(--border-light)] animate-[scaleIn_200ms_ease]">
        {/* 关闭按钮 */}
        <button
          onClick={onClose}
          disabled={loading}
          className="absolute top-3 right-3 p-1.5 rounded-[var(--radius-md)] text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)] transition-colors disabled:opacity-50"
          aria-label="关闭"
        >
          <X size={18} />
        </button>

        <div className="p-6">
          {/* 图标 + 标题 */}
          <div className="flex items-start gap-4 mb-4">
            <div
              className={`flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-[var(--radius-lg)] ${config.iconBg} ${config.iconColor}`}
            >
              {icon ?? config.icon}
            </div>
            <div className="min-w-0 flex-1">
              <h2
                id="confirm-dialog-title"
                className="text-base font-semibold text-[var(--text-primary)] leading-snug"
              >
                {title}
              </h2>
              {message && (
                <p className="mt-1.5 text-sm text-[var(--text-secondary)] leading-relaxed">
                  {message}
                </p>
              )}
            </div>
          </div>

          {/* 按钮 */}
          <div className="flex items-center justify-end gap-3 mt-6">
            <button
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 text-sm font-medium rounded-[var(--radius-lg)] text-[var(--text-secondary)] bg-[var(--bg-tertiary)] hover:bg-[var(--border-light)] transition-colors disabled:opacity-50"
            >
              {cancelText}
            </button>
            <button
              onClick={handleConfirm}
              disabled={loading}
              className={`
                inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium rounded-[var(--radius-lg)]
                transition-colors disabled:opacity-70
                ${config.confirmVariant}
              `}
            >
              {loading && (
                <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              )}
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
