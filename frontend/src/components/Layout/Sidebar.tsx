import { Link, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import {
  Home,
  BookOpen,
  Trophy,
  Users,
  Map,
  BarChart3,
  User,
  X,
  ChevronRight,
} from 'lucide-react';

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

interface NavItem {
  to: string;
  label: string;
  icon: React.ReactNode;
  requireAuth?: boolean;
}

const navItems: NavItem[] = [
  { to: '/', label: '首页', icon: <Home size={20} /> },
  { to: '/problems', label: '题库', icon: <BookOpen size={20} /> },
  { to: '/contests', label: '竞赛', icon: <Trophy size={20} /> },
  { to: '/community', label: '社区', icon: <Users size={20} /> },
  { to: '/paths', label: '学习路径', icon: <Map size={20} /> },
  { to: '/leaderboard', label: '排行榜', icon: <BarChart3 size={20} /> },
  { to: '/profile', label: '个人中心', icon: <User size={20} />, requireAuth: true },
];

export default function Sidebar({ open, onClose }: SidebarProps) {
  const location = useLocation();
  const user = useAuthStore((s) => s.user);

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  const visibleItems = navItems.filter((item) => !item.requireAuth || user);

  return (
    <>
      {/* Overlay for mobile */}
      {open && (
        <div
          className="sidebar-overlay"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Sidebar panel */}
      <aside className={`sidebar ${open ? 'sidebar--open' : ''}`}>
        {/* Mobile close button */}
        <div className="sidebar-close">
          <button onClick={onClose} aria-label="关闭侧边栏">
            <X size={20} />
          </button>
        </div>

        {/* User info */}
        {user && (
          <div className="sidebar-user">
            <div className="sidebar-avatar">
              {user.avatarUrl ? (
                <img src={user.avatarUrl} alt={user.username} />
              ) : (
                <span>{user.username[0].toUpperCase()}</span>
              )}
            </div>
            <div className="sidebar-user-info">
              <span className="sidebar-username">{user.username}</span>
              <span className="sidebar-level">Lv.{user.level}</span>
            </div>
          </div>
        )}

        {/* Navigation */}
        <nav className="sidebar-nav">
          {visibleItems.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className={`sidebar-link ${isActive(item.to) ? 'sidebar-link--active' : ''}`}
              onClick={onClose}
            >
              <span className="sidebar-link-icon">{item.icon}</span>
              <span className="sidebar-link-label">{item.label}</span>
              {isActive(item.to) && (
                <ChevronRight size={16} className="sidebar-link-arrow" />
              )}
            </Link>
          ))}
        </nav>
      </aside>
    </>
  );
}
