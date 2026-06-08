import { useEffect, useCallback, useRef, type ReactNode } from 'react';
import { X } from 'lucide-react';

type ModalSize = 'small' | 'medium' | 'large' | 'fullscreen';

interface ModalProps {
  /** Whether the modal is visible */
  isOpen: boolean;
  /** Called when the modal requests to close */
  onClose: () => void;
  /** Modal title displayed in the header */
  title?: string;
  /** Modal body content */
  children: ReactNode;
  /** Size variant. Default: 'medium' */
  size?: ModalSize;
  /** Whether clicking the overlay closes the modal. Default: true */
  closeOnOverlayClick?: boolean;
  /** Whether pressing ESC closes the modal. Default: true */
  closeOnEsc?: boolean;
  /** Whether to show the close (X) button. Default: true */
  showCloseButton?: boolean;
  /** Optional footer content (e.g. action buttons) */
  footer?: ReactNode;
  /** Extra className for the modal panel */
  className?: string;
}

const sizeStyles: Record<ModalSize, string> = {
  small: 'max-w-[420px]',
  medium: 'max-w-[640px]',
  large: 'max-w-[960px]',
  fullscreen: 'max-w-[calc(100vw-32px)] max-h-[calc(100vh-32px)]',
};

export default function Modal({
  isOpen,
  onClose,
  title,
  children,
  size = 'medium',
  closeOnOverlayClick = true,
  closeOnEsc = true,
  showCloseButton = true,
  footer,
  className = '',
}: ModalProps) {
  const panelRef = useRef<HTMLDivElement>(null);

  // ESC key handler
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape' && closeOnEsc) {
        onClose();
      }
    },
    [closeOnEsc, onClose],
  );

  useEffect(() => {
    if (!isOpen) return;
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, handleKeyDown]);

  // Lock body scroll when open
  useEffect(() => {
    if (isOpen) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = prev;
      };
    }
  }, [isOpen]);

  // Focus the panel on open for accessibility
  useEffect(() => {
    if (isOpen && panelRef.current) {
      panelRef.current.focus();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleOverlayClick = useCallback(
    (e: React.MouseEvent) => {
      // Only close if clicking the overlay itself, not the panel
      if (closeOnOverlayClick && e.target === e.currentTarget) {
        onClose();
      }
    },
    [closeOnOverlayClick, onClose],
  );

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? 'modal-title' : undefined}
      onClick={handleOverlayClick}
    >
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-[var(--bg-overlay)] transition-opacity duration-200"
        aria-hidden="true"
      />

      {/* Panel */}
      <div
        ref={panelRef}
        tabIndex={-1}
        className={`
          relative w-full ${sizeStyles[size]}
          bg-[var(--bg-card)] rounded-[var(--radius-xl)]
          shadow-[var(--shadow-xl)] border border-[var(--border-light)]
          flex flex-col
          ${size === 'fullscreen' ? 'h-full' : 'max-h-[85vh]'}
          animate-[modalIn_200ms_ease]
          outline-none
          ${className}
        `}
      >
        {/* Header */}
        {(title || showCloseButton) && (
          <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border-light)] shrink-0">
            {title && (
              <h2
                id="modal-title"
                className="text-lg font-semibold text-[var(--text-primary)] leading-snug"
              >
                {title}
              </h2>
            )}
            {!title && <div />}
            {showCloseButton && (
              <button
                onClick={onClose}
                className="p-1.5 rounded-[var(--radius-md)] text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)] transition-colors"
                aria-label="关闭"
              >
                <X size={18} />
              </button>
            )}
          </div>
        )}

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div className="px-6 py-4 border-t border-[var(--border-light)] shrink-0 flex items-center justify-end gap-3">
            {footer}
          </div>
        )}
      </div>

      {/* Inline keyframe animation */}
      <style>{`
        @keyframes modalIn {
          from {
            opacity: 0;
            transform: scale(0.95) translateY(8px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
