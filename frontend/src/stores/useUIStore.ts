import { create } from 'zustand';
import type { Toast, ToastType } from '@/types';

export type Theme = 'light' | 'dark' | 'system';

interface UIState {
  sidebarOpen: boolean;
  toasts: Toast[];
  theme: Theme;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  addToast: (type: ToastType, message: string, duration?: number) => void;
  removeToast: (id: string) => void;
  setTheme: (theme: Theme) => void;
  initTheme: () => void;
}

function getSystemTheme(): 'light' | 'dark' {
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function applyTheme(theme: Theme): void {
  const resolved = theme === 'system' ? getSystemTheme() : theme;
  document.documentElement.setAttribute('data-theme', resolved);
}

let toastId = 0;

export const useUIStore = create<UIState>()((set) => ({
  sidebarOpen: false,
  toasts: [],
  theme: 'system',

  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),

  setSidebarOpen: (open) => set({ sidebarOpen: open }),

  addToast: (type, message, duration = 3000) => {
    const id = `toast-${++toastId}`;
    set((state) => ({
      toasts: [...state.toasts, { id, type, message, duration }],
    }));
    if (duration > 0) {
      setTimeout(() => {
        set((state) => ({
          toasts: state.toasts.filter((t) => t.id !== id),
        }));
      }, duration);
    }
  },

  removeToast: (id) =>
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    })),

  setTheme: (theme) => {
    set({ theme });
    localStorage.setItem('theme', theme);
    applyTheme(theme);
  },

  initTheme: () => {
    const saved = localStorage.getItem('theme') as Theme | null;
    const theme = saved && ['light', 'dark', 'system'].includes(saved) ? saved : 'system';
    set({ theme });
    applyTheme(theme);

    // 监听系统主题变化
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = () => {
      const current = useUIStore.getState().theme;
      if (current === 'system') {
        applyTheme('system');
      }
    };
    mediaQuery.addEventListener('change', handler);
  },
}));
