import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import Sidebar from './Sidebar';
import BottomNav from './BottomNav';
import './Sidebar.css';

export default function MainLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header onSidebarToggle={() => setSidebarOpen(true)} />
      <div className="flex flex-1">
        <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <main className="flex-grow md:ml-[240px]" style={{ paddingBottom: 'var(--bottom-nav-height, 0px)' }}>
          <Outlet />
        </main>
      </div>
      <div className="md:ml-[240px]">
        <Footer />
      </div>
      <BottomNav />
    </div>
  );
}
