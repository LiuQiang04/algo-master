import { useUIStore } from '@/stores/useUIStore';
import { useCallback, useState } from 'react';

type Position = 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';

export function useToast() {
  const { addToast, removeToast, toasts } = useUIStore();
  const [position, setPosition] = useState<Position>('top-right');

  const success = useCallback(
    (message: string, duration?: number) => addToast('success', message, duration),
    [addToast]
  );

  const error = useCallback(
    (message: string, duration?: number) => addToast('error', message, duration),
    [addToast]
  );

  const warning = useCallback(
    (message: string, duration?: number) => addToast('warning', message, duration),
    [addToast]
  );

  const info = useCallback(
    (message: string, duration?: number) => addToast('info', message, duration),
    [addToast]
  );

  return {
    toasts,
    position,
    setPosition,
    success,
    error,
    warning,
    info,
    removeToast,
  };
}
