import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { useNotificationStore } from '../../store/notificationStore';
import { useEffect, useState, useRef } from 'react';
import {
  Bell, MessageCircle, User, LogOut, Search, Menu, X,
  ChevronDown, BookOpen, Trophy, Code2, Users
} from 'lucide-react';

export default function Navbar() {
  const { user, logout } = useAuthStore();
  const { unreadCount, messageUnreadCount, fetchUnreadCount, fetchMessageUnreadCount } = useNotificationStore();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
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

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/community?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
    setUserMenuOpen(false);
  };

  return (
    <nav style={{
      position: 'sticky', top: 0, zIndex: 50,
      background: 'var(--bg-primary)',
      borderBottom: '1px solid var(--border-light)',
      backdropFilter: 'blur(12px)',
    }}>
      <div className="container" style={{ display: 'flex', alignItems: 'center', height: 64, gap: 24 }}>
        {/* Logo */}
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none', color: 'var(--text-primary)', fontWeight: 700, fontSize: 20 }}>
          <Code2 size={28} style={{ color: 'var(--primary-600)' }} />
          <span>AlgoArena</span>
        </Link>

        {/* Desktop Nav Links */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }} className="hidden md:flex">
          <NavLink to="/problems" icon={<BookOpen size={16} />} label="Problems" />
          <NavLink to="/contests" icon={<Trophy size={16} />} label="Contests" />
          <NavLink to="/community" icon={<Users size={16} />} label="Community" />
        </div>

        {/* Search */}
        <form onSubmit={handleSearch} style={{ flex: 1, maxWidth: 400, marginLeft: 'auto' }} className="hidden md:block">
          <div style={{
            display: 'flex', alignItems: 'center', background: 'var(--bg-secondary)',
            border: '1px solid var(--border-light)', borderRadius: 'var(--radius-lg)', padding: '0 12px',
          }}>
            <Search size={16} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
            <input
              type="text"
              placeholder="Search community..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                flex: 1, border: 'none', background: 'transparent', padding: '8px 8px',
                color: 'var(--text-primary)', outline: 'none', fontSize: 14,
              }}
            />
          </div>
        </form>

        {/* Right Side */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {user ? (
            <>
              {/* Notifications */}
              <Link to="/notifications" style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', width: 36, height: 36, borderRadius: 'var(--radius-md)', color: 'var(--text-secondary)', transition: 'var(--transition-fast)' }}>
                <Bell size={20} />
                {unreadCount > 0 && <Badge count={unreadCount} />}
              </Link>

              {/* Messages */}
              <Link to="/messages" style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', width: 36, height: 36, borderRadius: 'var(--radius-md)', color: 'var(--text-secondary)', transition: 'var(--transition-fast)' }}>
                <MessageCircle size={20} />
                {messageUnreadCount > 0 && <Badge count={messageUnreadCount} />}
              </Link>

              {/* User Menu */}
              <div ref={userMenuRef} style={{ position: 'relative' }}>
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 8, padding: '4px 8px',
                    borderRadius: 'var(--radius-md)', transition: 'var(--transition-fast)',
                    color: 'var(--text-primary)',
                  }}
                >
                  <div style={{
                    width: 32, height: 32, borderRadius: 'var(--radius-full)',
                    background: 'var(--primary-100)', display: 'flex', alignItems: 'center',
                    justifyContent: 'center', color: 'var(--primary-600)', fontWeight: 600, fontSize: 14,
                  }}>
                    {user.avatarUrl ? (
                      <img src={user.avatarUrl} alt="" style={{ width: '100%', height: '100%', borderRadius: 'var(--radius-full)', objectFit: 'cover' }} />
                    ) : (
                      user.username[0].toUpperCase()
                    )}
                  </div>
                  <span className="hidden md:inline" style={{ fontSize: 14, fontWeight: 500 }}>{user.username}</span>
                  <ChevronDown size={14} className="hidden md:inline" />
                </button>

                {userMenuOpen && (
                  <div style={{
                    position: 'absolute', right: 0, top: '100%', marginTop: 8, width: 200,
                    background: 'var(--bg-card)', border: '1px solid var(--border-light)',
                    borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-lg)', padding: 4, zIndex: 50,
                    animation: 'fadeIn 0.15s ease',
                  }}>
                    <MenuLink to={`/users/${user.id}`} icon={<User size={16} />} label="My Profile" onClick={() => setUserMenuOpen(false)} />
                    <MenuLink to="/notifications" icon={<Bell size={16} />} label="Notifications" badge={unreadCount} onClick={() => setUserMenuOpen(false)} />
                    <MenuLink to="/messages" icon={<MessageCircle size={16} />} label="Messages" badge={messageUnreadCount} onClick={() => setUserMenuOpen(false)} />
                    <div style={{ height: 1, background: 'var(--border-light)', margin: '4px 0' }} />
                    <button onClick={handleLogout} style={{
                      display: 'flex', alignItems: 'center', gap: 8, width: '100%', padding: '8px 12px',
                      borderRadius: 'var(--radius-md)', color: 'var(--danger-600)', fontSize: 14,
                      transition: 'var(--transition-fast)', textAlign: 'left',
                    }}>
                      <LogOut size={16} />
                      <span>Logout</span>
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div style={{ display: 'flex', gap: 8 }}>
              <Link to="/login" style={{
                padding: '8px 16px', borderRadius: 'var(--radius-md)', fontSize: 14, fontWeight: 500,
                color: 'var(--text-primary)', border: '1px solid var(--border-default)',
                transition: 'var(--transition-fast)',
              }}>Login</Link>
              <Link to="/register" style={{
                padding: '8px 16px', borderRadius: 'var(--radius-md)', fontSize: 14, fontWeight: 500,
                color: 'white', background: 'var(--primary-600)',
                transition: 'var(--transition-fast)',
              }}>Register</Link>
            </div>
          )}

          {/* Mobile Menu Toggle */}
          <button className="md:hidden" onClick={() => setMobileOpen(!mobileOpen)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 36, height: 36, color: 'var(--text-secondary)' }}>
            {mobileOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="md:hidden" style={{ borderTop: '1px solid var(--border-light)', padding: 16, background: 'var(--bg-primary)' }}>
          <form onSubmit={handleSearch} style={{ marginBottom: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', background: 'var(--bg-secondary)', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-lg)', padding: '0 12px' }}>
              <Search size={16} style={{ color: 'var(--text-muted)' }} />
              <input type="text" placeholder="Search..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} style={{ flex: 1, border: 'none', background: 'transparent', padding: '10px 8px', color: 'var(--text-primary)', outline: 'none', fontSize: 14 }} />
            </div>
          </form>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <MobileNavLink to="/problems" label="Problems" onClick={() => setMobileOpen(false)} />
            <MobileNavLink to="/contests" label="Contests" onClick={() => setMobileOpen(false)} />
            <MobileNavLink to="/community" label="Community" onClick={() => setMobileOpen(false)} />
          </div>
        </div>
      )}
    </nav>
  );
}

function NavLink({ to, icon, label }: { to: string; icon: React.ReactNode; label: string }) {
  return (
    <Link to={to} style={{
      display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px',
      borderRadius: 'var(--radius-md)', fontSize: 14, fontWeight: 500,
      color: 'var(--text-secondary)', transition: 'var(--transition-fast)',
    }}>
      {icon}
      <span>{label}</span>
    </Link>
  );
}

function MobileNavLink({ to, label, onClick }: { to: string; label: string; onClick: () => void }) {
  return (
    <Link to={to} onClick={onClick} style={{
      display: 'block', padding: '10px 12px', borderRadius: 'var(--radius-md)',
      fontSize: 15, fontWeight: 500, color: 'var(--text-primary)',
    }}>{label}</Link>
  );
}

function MenuLink({ to, icon, label, badge, onClick }: { to: string; icon: React.ReactNode; label: string; badge?: number; onClick: () => void }) {
  return (
    <Link to={to} onClick={onClick} style={{
      display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px',
      borderRadius: 'var(--radius-md)', fontSize: 14, color: 'var(--text-primary)',
      transition: 'var(--transition-fast)',
    }}>
      {icon}
      <span style={{ flex: 1 }}>{label}</span>
      {badge && badge > 0 && <Badge count={badge} />}
    </Link>
  );
}

function Badge({ count }: { count: number }) {
  return (
    <span style={{
      position: 'absolute', top: 2, right: 2, minWidth: 16, height: 16,
      borderRadius: 'var(--radius-full)', background: 'var(--danger-500)',
      color: 'white', fontSize: 10, fontWeight: 700, display: 'flex',
      alignItems: 'center', justifyContent: 'center', padding: '0 4px',
    }}>
      {count > 99 ? '99+' : count}
    </span>
  );
}
