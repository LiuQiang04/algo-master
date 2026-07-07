import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { useNotificationStore } from '../../store/notificationStore';
import { useEffect, useState, useRef } from 'react';
import {
  Bell, MessageCircle, User, LogOut, Menu, X,
  ChevronDown, BookOpen, Trophy, Code2, Users, Map,
  Gamepad2, BarChart3,
} from 'lucide-react';

const navLinks = [
  { path: '/', label: '首页', icon: null },
  { path: '/problems', label: '题库', icon: BookOpen },
  { path: '/contests', label: '竞赛', icon: Trophy },
  { path: '/paths', label: '学习路径', icon: Map },
  { path: '/community', label: '社区', icon: Users },
  { path: '/leaderboard', label: '排行榜', icon: BarChart3 },
  { path: '/gamification', label: '游戏化', icon: Gamepad2 },
];

export default function Header({ onSidebarToggle }: { onSidebarToggle?: () => void }) {
  const { user, logout } = useAuthStore();
  const { unreadCount, messageUnreadCount, fetchUnreadCount, fetchMessageUnreadCount } = useNotificationStore();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (user) {
      fetchUnreadCount();
      fetchMessageUnreadCount();
      const interval = setInterval(() => {
        fetchUnreadCount();
        fetchMessageUnreadCount();
      }, 30000);
      return () => clearInterval(interval);
    }
  }, [user]);

  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
    setUserMenuOpen(false);
  };

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <header
      className="navbar-header"
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 50,
        background: '#ffffff',
        borderBottom: scrolled ? '1px solid #e5e7eb' : '1px solid transparent',
        boxShadow: scrolled ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
        transition: 'all 200ms ease',
      }}
    >
      <div
        className="container"
        style={{
          display: 'flex',
          alignItems: 'center',
          height: 72,
          gap: 8,
        }}
      >
        {/* Sidebar Toggle (mobile) */}
        <button
          className="md:hidden"
          onClick={onSidebarToggle}
          aria-label="打开侧边栏"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 40,
            height: 40,
            borderRadius: 8,
            color: '#374151',
            flexShrink: 0,
          }}
        >
          <Menu size={22} />
        </button>

        {/* Logo */}
        <Link
          to="/"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            textDecoration: 'none',
            color: '#111827',
            fontWeight: 700,
            fontSize: 20,
            flexShrink: 0,
            marginRight: 24,
          }}
        >
          <div
            style={{
              width: 36,
              height: 36,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: '#2563eb',
              color: 'white',
              borderRadius: 8,
            }}
          >
            <Code2 size={22} />
          </div>
          <span>AlgoArena</span>
        </Link>

        {/* Desktop Navigation */}
        <nav
          className="hidden md:flex"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 32,
            flex: 1,
          }}
        >
          {navLinks.map((link) => {
            const active = isActive(link.path);
            const Icon = link.icon;
            return (
              <Link
                key={link.path}
                to={link.path}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '8px 0',
                  fontSize: 16,
                  fontWeight: active ? 600 : 500,
                  color: active ? '#2563eb' : '#374151',
                  textDecoration: 'none',
                  borderBottom: active ? '2px solid #2563eb' : '2px solid transparent',
                  marginBottom: -1,
                  transition: 'all 150ms ease',
                  whiteSpace: 'nowrap',
                  position: 'relative',
                  top: 1,
                }}
                onMouseEnter={(e) => {
                  if (!active) {
                    (e.currentTarget as HTMLElement).style.color = '#111827';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!active) {
                    (e.currentTarget as HTMLElement).style.color = '#374151';
                  }
                }}
              >
                {Icon && <Icon size={16} />}
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Right Side */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            flexShrink: 0,
          }}
        >
          {user ? (
            <>
              {/* Notifications */}
              <Link
                to="/notifications"
                style={{
                  position: 'relative',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: 36,
                  height: 36,
                  borderRadius: 8,
                  color: '#6b7280',
                }}
              >
                <Bell size={20} />
                {unreadCount > 0 && (
                  <span
                    style={{
                      position: 'absolute',
                      top: 2,
                      right: 2,
                      minWidth: 16,
                      height: 16,
                      borderRadius: 9999,
                      background: '#ef4444',
                      color: 'white',
                      fontSize: 10,
                      fontWeight: 700,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: '0 4px',
                    }}
                  >
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </span>
                )}
              </Link>

              {/* Messages */}
              <Link
                to="/messages"
                style={{
                  position: 'relative',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: 36,
                  height: 36,
                  borderRadius: 8,
                  color: '#6b7280',
                }}
              >
                <MessageCircle size={20} />
                {messageUnreadCount > 0 && (
                  <span
                    style={{
                      position: 'absolute',
                      top: 2,
                      right: 2,
                      minWidth: 16,
                      height: 16,
                      borderRadius: 9999,
                      background: '#ef4444',
                      color: 'white',
                      fontSize: 10,
                      fontWeight: 700,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: '0 4px',
                    }}
                  >
                    {messageUnreadCount > 99 ? '99+' : messageUnreadCount}
                  </span>
                )}
              </Link>

              {/* User Menu */}
              <div ref={userMenuRef} style={{ position: 'relative' }}>
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    padding: '4px 8px',
                    borderRadius: 8,
                    color: '#111827',
                  }}
                >
                  <div
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: 9999,
                      background: '#dbeafe',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#2563eb',
                      fontWeight: 600,
                      fontSize: 14,
                    }}
                  >
                    {user.avatarUrl ? (
                      <img
                        src={user.avatarUrl}
                        alt=""
                        style={{
                          width: '100%',
                          height: '100%',
                          borderRadius: 9999,
                          objectFit: 'cover',
                        }}
                      />
                    ) : (
                      user.username[0].toUpperCase()
                    )}
                  </div>
                  <span
                    className="hidden md:inline"
                    style={{ fontSize: 14, fontWeight: 500 }}
                  >
                    {user.username}
                  </span>
                  <ChevronDown size={14} className="hidden md:inline" />
                </button>

                {userMenuOpen && (
                  <div
                    style={{
                      position: 'absolute',
                      right: 0,
                      top: '100%',
                      marginTop: 8,
                      width: 200,
                      background: '#ffffff',
                      border: '1px solid #e5e7eb',
                      borderRadius: 12,
                      boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
                      padding: 4,
                      zIndex: 50,
                    }}
                  >
                    <Link
                      to={`/users/${user.id}`}
                      onClick={() => setUserMenuOpen(false)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                        padding: '8px 12px',
                        borderRadius: 8,
                        fontSize: 14,
                        color: '#111827',
                        textDecoration: 'none',
                      }}
                    >
                      <User size={16} />
                      <span>个人中心</span>
                    </Link>
                    <Link
                      to="/notifications"
                      onClick={() => setUserMenuOpen(false)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                        padding: '8px 12px',
                        borderRadius: 8,
                        fontSize: 14,
                        color: '#111827',
                        textDecoration: 'none',
                      }}
                    >
                      <Bell size={16} />
                      <span style={{ flex: 1 }}>通知</span>
                    </Link>
                    <Link
                      to="/messages"
                      onClick={() => setUserMenuOpen(false)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                        padding: '8px 12px',
                        borderRadius: 8,
                        fontSize: 14,
                        color: '#111827',
                        textDecoration: 'none',
                      }}
                    >
                      <MessageCircle size={16} />
                      <span style={{ flex: 1 }}>消息</span>
                    </Link>
                    <div
                      style={{
                        height: 1,
                        background: '#e5e7eb',
                        margin: '4px 0',
                      }}
                    />
                    <button
                      onClick={handleLogout}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                        width: '100%',
                        padding: '8px 12px',
                        borderRadius: 8,
                        color: '#dc2626',
                        fontSize: 14,
                        textAlign: 'left',
                      }}
                    >
                      <LogOut size={16} />
                      <span>退出登录</span>
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div
              style={{
                display: 'flex',
                gap: 8,
              }}
            >
              <Link
                to="/login"
                style={{
                  padding: '8px 20px',
                  borderRadius: 8,
                  fontSize: 14,
                  fontWeight: 500,
                  color: '#374151',
                  background: '#f3f4f6',
                  textDecoration: 'none',
                }}
              >
                登录
              </Link>
              <Link
                to="/register"
                style={{
                  padding: '8px 20px',
                  borderRadius: 8,
                  fontSize: 14,
                  fontWeight: 500,
                  color: 'white',
                  background: '#2563eb',
                  textDecoration: 'none',
                }}
              >
                注册
              </Link>
            </div>
          )}

          {/* Mobile Menu Toggle */}
          <button
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="切换移动端菜单"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 40,
              height: 40,
              borderRadius: 8,
              color: '#374151',
            }}
          >
            {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div
          className="md:hidden"
          style={{
            borderTop: '1px solid #e5e7eb',
            padding: 16,
            background: '#ffffff',
          }}
        >
          <nav
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 2,
            }}
          >
            {navLinks.map((link) => {
              const active = isActive(link.path);
              const Icon = link.icon;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setMobileMenuOpen(false)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    padding: '12px 16px',
                    borderRadius: 8,
                    fontSize: 15,
                    fontWeight: active ? 600 : 500,
                    color: active ? '#2563eb' : '#374151',
                    background: active ? '#eff6ff' : 'transparent',
                    textDecoration: 'none',
                  }}
                >
                  {Icon && <Icon size={18} />}
                  {link.label}
                </Link>
              );
            })}
          </nav>
          {!user && (
            <div
              style={{
                display: 'flex',
                gap: 8,
                marginTop: 16,
                paddingTop: 16,
                borderTop: '1px solid #e5e7eb',
              }}
            >
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                style={{
                  flex: 1,
                  padding: '10px 0',
                  borderRadius: 8,
                  fontSize: 14,
                  fontWeight: 500,
                  color: '#374151',
                  background: '#f3f4f6',
                  textAlign: 'center',
                  textDecoration: 'none',
                }}
              >
                登录
              </Link>
              <Link
                to="/register"
                onClick={() => setMobileMenuOpen(false)}
                style={{
                  flex: 1,
                  padding: '10px 0',
                  borderRadius: 8,
                  fontSize: 14,
                  fontWeight: 500,
                  color: 'white',
                  background: '#2563eb',
                  textAlign: 'center',
                  textDecoration: 'none',
                }}
              >
                注册
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
