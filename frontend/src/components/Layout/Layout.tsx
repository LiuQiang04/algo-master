import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';

export default function Layout() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar />
      <main style={{ flex: 1 }}>
        <Outlet />
      </main>
      <footer style={{
        borderTop: '1px solid var(--border-light)',
        padding: '24px 0',
        textAlign: 'center',
        color: 'var(--text-muted)',
        fontSize: 13,
      }}>
        <div className="container">
          <p>AlgoArena - Algorithm Competition Learning Platform</p>
        </div>
      </footer>
    </div>
  );
}
