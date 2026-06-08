import { create } from 'zustand';
import api from '../api/client';

interface NotificationState {
  unreadCount: number;
  messageUnreadCount: number;
  fetchUnreadCount: () => Promise<void>;
  fetchMessageUnreadCount: () => Promise<void>;
}

export const useNotificationStore = create<NotificationState>((set) => ({
  unreadCount: 0,
  messageUnreadCount: 0,

  fetchUnreadCount: async () => {
    try {
      const { data } = await api.get('/notifications/unread');
      set({ unreadCount: data.data.count });
    } catch {
      // ignore
    }
  },

  fetchMessageUnreadCount: async () => {
    try {
      const { data } = await api.get('/messages/unread');
      set({ messageUnreadCount: data.data.count });
    } catch {
      // ignore
    }
  },
}));
