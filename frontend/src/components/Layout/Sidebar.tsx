import { Link, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import {
  Home, BookOpen, Trophy, Users, Map, BarChart3, User,
  Gamepad2, Award, CalendarCheck, Coins, Gift, Rss,
  X, ChevronRight,
} from 'lucide-react';

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

interface NavItem {
  to: string;
  label: string;
  icon: React.ReactNode;
}

interface NavGroup {
  title: string;
  items: NavItem[];
}

const navGroups: NavGroup[] = [
  {
    title: '核心功能',
    items: [
      { to: '/', label: '首页', icon: <Home size={20} /> },
      { to: '/problems', label: '题库', icon: <BookOpen size={20} /> },
      { to: '/contests', label: '竞赛', icon: <Trophy size={20} /> },
      { to: '/paths', label: '学习路径', icon: <Map size={20} /> },
    ],
  },
  {
    title: '社区',
    items: [
      { to: '/community', label: '社区', icon: <Users size={20} /> },
      { to: '/feed', label: '动态', icon: <Rss size={20} /> },
    ],
  },
  {
    title: '游戏化',
    items: [
      { to: '/gamification', label: '游戏化中心', icon: <Gamepad2 size={20} /> },
      { to: '/achievements', label: '成就', icon: <Award size={20} /> },
      { to: '/leaderboard', label: '排行榜', icon: <BarChart3 size={20} /> },
      { to: '/daily-challenge', label: '每日挑战', icon: <CalendarCheck size={20} /> },
      { to: '/points', label: '积分', icon: <Coins size={20} /> },
      { to: '/virtual-items', label: '虚拟道具', icon: <Gift size={20} /> },
    ],
  },
];

export default function Sidebar({ open, onClose }: SidebarProps) {
  const location = useLocation();
  const user = useAuthStore((s) => s.user);

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

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
          {navGroups.map((group) => (
            <div key={group.title} className="sidebar-group">
              <div className="sidebar-group-title">{group.title}</div>
              {group.items.map((item) => {
                const active = isActive(item.to);
                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    className={`sidebar-link ${active ? 'sidebar-link--active' : ''}`}
                    onClick={onClose}
                  >
                    <span className="sidebar-link-icon">{item.icon}</span>
                    <span className="sidebar-link-label">{item.label}</span>
                    {active && <ChevronRight size={16} className="sidebar-link-arrow" />}
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>

        {/* 底部个人中心 */}
        <div className="sidebar-footer">
          {user && (
            <Link
              to="/profile"
              className={`sidebar-link ${isActive('/profile') ? 'sidebar-link--active' : ''}`}
              onClick={onClose}
            >
              <span className="sidebar-link-icon"><User size={20} /></span>
              <span className="sidebar-link-label">个人中心</span>
            </Link>
          )}
        </div>
      </aside>
    </>
  );
}
