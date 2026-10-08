import { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';

const TITLES = {
  '/dashboard': 'Dashboard',
  '/pipelines': 'Pipeline Management',
  '/data-quality': 'Data Quality',
  '/logs': 'Error Logs',
  '/users': 'User Management',
  '/profile': 'My Profile',
};

export default function AppLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  const segments = location.pathname.split('/').filter(Boolean);
  let title = 'Dashboard';
  if (segments[0] === 'pipelines' && segments[1]) title = 'Pipeline Details';
  else if (TITLES[location.pathname]) title = TITLES[location.pathname];

  return (
    <div className="app-shell">
      <Sidebar mobileOpen={mobileOpen} onClose={() => setMobileOpen(false)} />
      <div className="app-main">
        <Navbar title={title} onMenuClick={() => setMobileOpen(true)} />
        <main className="app-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
