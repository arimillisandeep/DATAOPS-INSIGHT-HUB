import Icon from '../components/Icon';
import { useAuth } from '../hooks/useAuth';

const PERMISSIONS = {
  Admin: [
    'View dashboards, pipelines, data quality, and logs',
    'Retry failed pipelines',
    'Run AI error analysis',
    'Create, edit, and delete user accounts',
    'Assign roles',
  ],
  'Data Engineer': [
    'View dashboards, pipelines, data quality, and logs',
    'Retry failed pipelines',
    'Run AI error analysis',
    'Inspect execution history and stack traces',
  ],
  Viewer: [
    'View dashboards, pipelines, data quality, and logs',
    'Read-only access - no operational actions',
  ],
};

export default function Profile() {
  const { user } = useAuth();

  return (
    <div>
      <div className="page-header">
        <div>
          <h2 className="page-title">My Profile</h2>
          <p className="page-subtitle">Your account information and access level</p>
        </div>
      </div>

      <div className="card profile-card">
        <div className="card-body">
          <div className="profile-header">
            <span className="avatar profile-avatar">
              {user?.name?.split(' ').map((n) => n[0]).slice(0, 2).join('')}
            </span>
            <div>
              <p className="profile-name">{user?.name}</p>
              <p className="profile-email">{user?.email}</p>
              <span className={`role-chip role-${(user?.role || '').toLowerCase().replace(' ', '-')}`} style={{ marginTop: 6, display: 'inline-block' }}>
                {user?.role}
              </span>
            </div>
          </div>
        </div>

        <div style={{ borderTop: '1px solid var(--border)' }}>
          <div className="log-detail-row" style={{ padding: '12px 20px' }}>
            <span className="log-detail-key">Account status</span>
            <span className="log-detail-value status-active">{user?.status || 'Active'}</span>
          </div>
          <div className="log-detail-row" style={{ padding: '12px 20px' }}>
            <span className="log-detail-key">Last login</span>
            <span className="log-detail-value">{user?.lastLogin || '—'}</span>
          </div>
          <div className="log-detail-row" style={{ padding: '12px 20px' }}>
            <span className="log-detail-key">Authentication</span>
            <span className="log-detail-value">SSO / credentials</span>
          </div>
        </div>
      </div>

      <div className="card profile-card" style={{ marginTop: 16 }}>
        <div className="card-header">
          <div>
            <h3 className="card-title">Permissions</h3>
            <p className="card-subtitle">What your {user?.role} role can do in DataOps Insight Hub</p>
          </div>
        </div>
        <div className="card-body">
          <ul className="permission-list">
            {(PERMISSIONS[user?.role] || []).map((permission) => (
              <li key={permission}>
                <span className="check"><Icon name="checkCircle" size={17} /></span>
                {permission}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
