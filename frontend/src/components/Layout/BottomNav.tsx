import { Home, BookOpen, Trophy, Users, User, Gamepad2 } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import './BottomNav.css';

const navItems = [
  { path: '/', icon: Home, label: '首页' },
  { path: '/problems', icon: BookOpen, label: '题库' },
  { path: '/contests', icon: Trophy, label: '竞赛' },
  { path: '/community', icon: Users, label: '社区' },
  { path: '/gamification', icon: Gamepad2, label: '游戏化' },
  { path: '/profile', icon: User, label: '我的' },
];

export default function BottomNav() {
  const location = useLocation();

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <nav className="bottom-nav">
      {navItems.map((item) => {
        const Icon = item.icon;
        const active = isActive(item.path);
        return (
          <Link
            key={item.path}
            to={item.path}
            className={`bottom-nav__item ${active ? 'bottom-nav__item--active' : ''}`}
          >
            <Icon size={20} />
            <span className="bottom-nav__label">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
