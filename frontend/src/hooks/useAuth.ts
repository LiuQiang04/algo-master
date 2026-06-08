import { useAuthStore } from '@/stores/useAuthStore';
import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

export function useAuth() {
  const { user, isAuthenticated, setAuth, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = useCallback(() => {
    logout();
    navigate('/login');
  }, [logout, navigate]);

  return {
    user,
    isAuthenticated,
    setAuth,
    logout: handleLogout,
  };
}
