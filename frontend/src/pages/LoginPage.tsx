import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { Code2, Eye, EyeOff } from 'lucide-react';

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuthStore();
  const [loginField, setLoginField] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginField.trim() || !password) {
      setError('Please fill in all fields');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await login(loginField, password);
      navigate('/community');
    } catch (err: any) {
      setError(err.response?.data?.error?.message || err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'var(--bg-secondary)', padding: 24,
    }}>
      <div style={{
        width: 400, maxWidth: '100%', background: 'var(--bg-card)',
        borderRadius: 'var(--radius-xl)', padding: 40,
        boxShadow: 'var(--shadow-lg)', border: '1px solid var(--border-light)',
      }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 8 }}>
            <Code2 size={28} style={{ color: 'var(--primary-600)' }} />
            <span style={{ fontSize: 24, fontWeight: 700 }}>AlgoArena</span>
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>Sign in to your account</p>
        </div>

        {error && (
          <div style={{
            padding: '10px 14px', borderRadius: 'var(--radius-md)',
            background: 'var(--danger-50)', color: 'var(--danger-700)',
            border: '1px solid var(--danger-200)', marginBottom: 16, fontSize: 13,
          }}>{error}</div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>
              Username or Email
            </label>
            <input
              type="text"
              value={loginField}
              onChange={(e) => setLoginField(e.target.value)}
              placeholder="Enter your username or email"
              style={{
                width: '100%', padding: '10px 14px', borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-light)', background: 'var(--bg-secondary)',
                color: 'var(--text-primary)', fontSize: 14, outline: 'none',
              }}
            />
          </div>

          <div style={{ marginBottom: 24 }}>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>
              Password
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                style={{
                  width: '100%', padding: '10px 14px', paddingRight: 44,
                  borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)',
                  background: 'var(--bg-secondary)', color: 'var(--text-primary)',
                  fontSize: 14, outline: 'none',
                }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                  color: 'var(--text-muted)',
                }}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button type="submit" disabled={loading} style={{
            width: '100%', padding: '12px 0', borderRadius: 'var(--radius-md)',
            background: 'var(--primary-600)', color: 'white', fontSize: 15, fontWeight: 600,
            opacity: loading ? 0.7 : 1, transition: 'var(--transition-fast)',
          }}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: 20, fontSize: 14, color: 'var(--text-secondary)' }}>
          Don't have an account?{' '}
          <Link to="/register" style={{ color: 'var(--primary-600)', fontWeight: 600 }}>Sign up</Link>
        </p>
      </div>
    </div>
  );
}
