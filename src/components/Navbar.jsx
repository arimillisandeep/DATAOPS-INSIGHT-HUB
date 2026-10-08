import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from './Icon';
import { useAuth } from '../hooks/useAuth';

export default function Navbar({ onMenuClick, title }) {
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    setMenuOpen(false);
    logout();
    navigate('/login');
  };

  return (
    <header className="navbar">
      <button type="button" className="navbar-burger" onClick={onMenuClick} aria-label="Open menu">
        <Icon name="menu" size={22} />
      </button>
      <h1 className="navbar-title">{title}</h1>

      <div className="navbar-actions">
        <span className={`role-chip role-${(user?.role || '').toLowerCase().replace(' ', '-')}`}>
          {user?.role}
        </span>
        <div className="navbar-user">
          <span className="avatar" aria-hidden="true">
            {user?.name?.split(' ').map((n) => n[0]).slice(0, 2).join('')}
          </span>
          <span className="navbar-user-name">{user?.name}</span>
        </div>
        <button type="button" className="btn btn-ghost" onClick={handleLogout} title="Log out">
          <Icon name="logout" size={18} />
          <span className="btn-label-desktop">Log out</span>
        </button>
      </div>
    </header>
  );
}
