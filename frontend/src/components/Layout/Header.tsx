import { Link, useLocation } from 'react-router-dom';
import { useState } from 'react';
import { Menu } from 'lucide-react';

const navItems = [
  { path: '/', label: '首页' },
  { path: '/problems', label: '题库' },
  { path: '/contests', label: '竞赛' },
  { path: '/paths', label: '学习路径' },
  { path: '/community', label: '社区' },
  { path: '/leaderboard', label: '排行榜' },
];

interface HeaderProps {
  onSidebarToggle?: () => void;
}

const Header = ({ onSidebarToggle }: HeaderProps) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path || location.pathname.startsWith(path + '/');

  return (
    <header className="bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg">
      <div className="container mx-auto px-4 py-3">
        <div className="flex justify-between items-center">
          {/* Sidebar Toggle (mobile) */}
          <button
            className="md:hidden mr-2"
            onClick={onSidebarToggle}
            aria-label="打开侧边栏"
          >
            <Menu size={24} />
          </button>

          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
              <span className="text-2xl font-bold text-blue-600">A</span>
            </div>
            <span className="text-xl font-bold">AlgoMaster</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`transition-colors ${isActive(item.path) ? 'text-white font-semibold border-b-2 border-white pb-1' : 'text-white/80 hover:text-white'}`}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Auth Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            <Link
              to="/login"
              className="px-4 py-2 border border-white rounded-lg hover:bg-white hover:text-blue-600 transition-colors"
            >
              登录
            </Link>
            <Link
              to="/register"
              className="px-4 py-2 bg-white text-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
            >
              注册
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {isMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden mt-4 pb-4">
            <nav className="flex flex-col space-y-3">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`transition-colors ${isActive(item.path) ? 'text-white font-semibold bg-white/10 rounded-lg px-2 py-1' : 'text-white/80 hover:text-white'}`}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
            <div className="flex space-x-4 mt-4">
              <Link
                to="/login"
                className="px-4 py-2 border border-white rounded-lg hover:bg-white hover:text-blue-600 transition-colors"
              >
                登录
              </Link>
              <Link
                to="/register"
                className="px-4 py-2 bg-white text-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
              >
                注册
              </Link>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
