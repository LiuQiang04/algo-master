import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Menu,
  X,
  Code2,
  Trophy,
  BookOpen,
  User,
  LogIn,
  ChevronDown,
} from 'lucide-react';
import './Navbar.css';

const navLinks = [
  { path: '/', label: '首页', icon: null },
  { path: '/problems', label: '题库', icon: Code2 },
  { path: '/contests', label: '竞赛', icon: Trophy },
  { path: '/learn', label: '学习路径', icon: BookOpen },
];

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const location = useLocation();

  // Mock login state
  const isLoggedIn = false;

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
    setUserMenuOpen(false);
  }, [location.pathname]);

  return (
    <nav className={`navbar ${scrolled ? 'navbar--scrolled' : ''}`}>
      <div className="navbar__inner container">
        {/* Logo */}
        <Link to="/" className="navbar__logo">
          <div className="navbar__logo-icon">
            <Code2 size={24} />
          </div>
          <span className="navbar__logo-text">
            Algorithm<span className="navbar__logo-accent">Arena</span>
          </span>
        </Link>

        {/* Desktop Nav Links */}
        <div className="navbar__links">
          {navLinks.map((link) => {
            const isActive =
              link.path === '/'
                ? location.pathname === '/'
                : location.pathname.startsWith(link.path);
            return (
              <Link
                key={link.path}
                to={link.path}
                className={`navbar__link ${isActive ? 'navbar__link--active' : ''}`}
              >
                {link.icon && <link.icon size={16} />}
                {link.label}
              </Link>
            );
          })}
        </div>

        {/* Right Actions */}
        <div className="navbar__actions">
          {isLoggedIn ? (
            <div className="navbar__user-menu">
              <button
                className="navbar__user-btn"
                onClick={() => setUserMenuOpen(!userMenuOpen)}
              >
                <div className="navbar__avatar">
                  <User size={18} />
                </div>
                <ChevronDown size={14} />
              </button>
              {userMenuOpen && (
                <div className="navbar__dropdown">
                  <Link to="/profile" className="navbar__dropdown-item">
                    <User size={16} /> 个人中心
                  </Link>
                  <div className="navbar__dropdown-divider" />
                  <button className="navbar__dropdown-item navbar__dropdown-item--danger">
                    退出登录
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="navbar__auth">
              <Link to="/login" className="navbar__btn navbar__btn--ghost">
                <LogIn size={16} />
                登录
              </Link>
              <Link to="/register" className="navbar__btn navbar__btn--primary">
                注册
              </Link>
            </div>
          )}

          {/* Mobile Toggle */}
          <button
            className="navbar__mobile-toggle"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <div className={`navbar__mobile ${mobileOpen ? 'navbar__mobile--open' : ''}`}>
        <div className="navbar__mobile-inner">
          {navLinks.map((link) => {
            const isActive =
              link.path === '/'
                ? location.pathname === '/'
                : location.pathname.startsWith(link.path);
            return (
              <Link
                key={link.path}
                to={link.path}
                className={`navbar__mobile-link ${isActive ? 'navbar__mobile-link--active' : ''}`}
              >
                {link.icon && <link.icon size={20} />}
                {link.label}
              </Link>
            );
          })}
          <div className="navbar__mobile-divider" />
          {!isLoggedIn && (
            <div className="navbar__mobile-auth">
              <Link to="/login" className="navbar__btn navbar__btn--ghost navbar__btn--full">
                登录
              </Link>
              <Link to="/register" className="navbar__btn navbar__btn--primary navbar__btn--full">
                注册
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
