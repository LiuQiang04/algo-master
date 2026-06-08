import { useUIStore } from '@/stores/useUIStore';
import { useCallback } from 'react';

export function useToast() {
  const { addToast, removeToast, toasts } = useUIStore();

  const success = useCallback(
    (message: string) => addToast('success', message),
    [addToast]
  );

  const error = useCallback(
    (message: string) => addToast('error', message),
    [addToast]
  );

  const warning = useCallback(
    (message: string) => addToast('warning', message),
    [addToast]
  );

  const info = useCallback(
    (message: string) => addToast('info', message),
    [addToast]
  );

  return { toasts, success, error, warning, info, removeToast };
}
