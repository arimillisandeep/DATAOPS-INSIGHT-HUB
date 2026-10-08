import { NavLink } from 'react-router-dom';
import Icon from './Icon';
import { useAuth } from '../hooks/useAuth';

const NAV_ITEMS = [
  { path: '/dashboard', label: 'Dashboard', icon: 'dashboard', roles: ['Admin', 'Data Engineer', 'Viewer'] },
  { path: '/pipelines', label: 'Pipelines', icon: 'pipeline', roles: ['Admin', 'Data Engineer', 'Viewer'] },
  { path: '/data-quality', label: 'Data Quality', icon: 'quality', roles: ['Admin', 'Data Engineer', 'Viewer'] },
  { path: '/logs', label: 'Error Logs', icon: 'logs', roles: ['Admin', 'Data Engineer', 'Viewer'] },
  { path: '/users', label: 'User Management', icon: 'users', roles: ['Admin'] },
  { path: '/profile', label: 'Profile', icon: 'profile', roles: ['Admin', 'Data Engineer', 'Viewer'] },
];

export default function Sidebar({ mobileOpen = false, onClose = () => {} }) {
  const { user } = useAuth();
  const items = NAV_ITEMS.filter((item) => user && item.roles.includes(user.role));

  return (
    <>
      {mobileOpen && <div className="sidebar-overlay" onClick={onClose} aria-hidden="true" />}
      <aside className={`sidebar ${mobileOpen ? 'sidebar-open' : ''}`} aria-label="Main navigation">
        <div className="sidebar-brand">
          <span className="brand-mark">
            <Icon name="bolt" size={22} />
          </span>
          <div className="brand-text">
            <span className="brand-name">DataOps</span>
            <span className="brand-sub">Insight Hub</span>
          </div>
          <button type="button" className="sidebar-close" onClick={onClose} aria-label="Close menu">
            <Icon name="x" size={20} />
          </button>
        </div>

        <nav className="sidebar-nav">
          <p className="nav-section">Monitoring</p>
          {items.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => `nav-item ${isActive ? 'nav-active' : ''}`}
              onClick={onClose}
            >
              <Icon name={item.icon} size={20} />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="sidebar-user">
            <span className="avatar" aria-hidden="true">
              {user?.name?.split(' ').map((n) => n[0]).slice(0, 2).join('')}
            </span>
            <div className="sidebar-user-info">
              <p className="sidebar-user-name">{user?.name}</p>
              <p className="sidebar-user-role">{user?.role}</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
