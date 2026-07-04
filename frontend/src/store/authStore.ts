import { create } from 'zustand';
import api from '../api/client';
import { useAuthStore as usePersistentAuthStore } from '../stores/useAuthStore';

interface User {
  id: string;
  username: string;
  email: string;
  avatarUrl?: string;
  bio?: string;
  rating: number;
  level: number;
  role: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (login: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  fetchMe: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: JSON.parse(localStorage.getItem('user') || 'null'),
  token: localStorage.getItem('token'),
  isLoading: false,

  login: async (login, password) => {
    const { data } = await api.post('/auth/login', { login, password });
    const { user, accessToken } = data.data;
    localStorage.setItem('token', accessToken);
    localStorage.setItem('user', JSON.stringify(user));
    usePersistentAuthStore.getState().setAuth(accessToken, user);
    set({ user, token: accessToken });
  },

  register: async (username, email, password) => {
    const { data } = await api.post('/auth/register', { username, email, password });
    const { user, accessToken } = data.data;
    localStorage.setItem('token', accessToken);
    localStorage.setItem('user', JSON.stringify(user));
    usePersistentAuthStore.getState().setAuth(accessToken, user);
    set({ user, token: accessToken });
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    usePersistentAuthStore.getState().logout();
    set({ user: null, token: null });
  },

  fetchMe: async () => {
    try {
      set({ isLoading: true });
      const { data } = await api.get('/auth/me');
      localStorage.setItem('user', JSON.stringify(data.data));
      set({ user: data.data, isLoading: false });
    } catch {
      set({ isLoading: false });
    }
  },
}));
