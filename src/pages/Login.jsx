import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../components/Icon';
import { useAuth } from '../hooks/useAuth';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function Login() {
  const { login, loading, error, clearError } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({ email: '', password: '' });
  const [fieldErrors, setFieldErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (error) {
      const t = setTimeout(clearError, 6000);
      return () => clearTimeout(t);
    }
  }, [error, clearError]);

  const validate = () => {
    const errors = {};
    if (!form.email.trim()) errors.email = 'Email is required.';
    else if (!EMAIL_RE.test(form.email.trim())) errors.email = 'Enter a valid email address.';
    if (!form.password) errors.password = 'Password is required.';
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setFieldErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    const result = await login(form.email, form.password);
    if (result.ok) navigate('/dashboard', { replace: true });
  };

  const fillCredentials = (email, password) => {
    setForm({ email, password });
    setFieldErrors({});
    clearError();
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-brand">
          <span className="brand-mark">
            <Icon name="bolt" size={24} />
          </span>
          <div>
            <div className="login-title">DataOps Insight Hub</div>
          </div>
        </div>
        <p className="login-subtitle">
          Sign in to monitor pipelines, investigate failures, and analyze data quality.
        </p>

        {error && (
          <div className="error-message" role="alert" style={{ marginBottom: 16 }}>
            <Icon name="alert" size={18} />
            <span className="error-text">{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label className="form-label" htmlFor="email">
              Email<span className="required">*</span>
            </label>
            <input
              id="email"
              name="email"
              type="email"
              className={`form-input ${fieldErrors.email ? 'input-error' : ''}`}
              placeholder="you@dataops.com"
              autoComplete="email"
              value={form.email}
              onChange={handleChange}
            />
            {fieldErrors.email && <p className="form-error">{fieldErrors.email}</p>}
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="password">
              Password<span className="required">*</span>
            </label>
            <input
              id="password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              className={`form-input ${fieldErrors.password ? 'input-error' : ''}`}
              placeholder="Enter your password"
              autoComplete="current-password"
              value={form.password}
              onChange={handleChange}
            />
            {fieldErrors.password && <p className="form-error">{fieldErrors.password}</p>}
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
            {loading && <span className="spinner spinner-sm spinner-light" />}
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>

        <div className="login-demo">
          <p className="login-demo-title">Demo credentials (mock auth)</p>
          <div className="login-demo-row">
            <span>Admin</span>
            <button type="button" className="btn btn-sm btn-ghost" onClick={() => fillCredentials('admin@dataops.com', 'Admin@123')}>
              <code>admin@dataops.com</code>&nbsp;/&nbsp;<code>Admin@123</code>
            </button>
          </div>
          <div className="login-demo-row">
            <span>Data Engineer</span>
            <button type="button" className="btn btn-sm btn-ghost" onClick={() => fillCredentials('engineer@dataops.com', 'Engineer@123')}>
              <code>engineer@dataops.com</code>&nbsp;/&nbsp;<code>Engineer@123</code>
            </button>
          </div>
          <div className="login-demo-row">
            <span>Viewer</span>
            <button type="button" className="btn btn-sm btn-ghost" onClick={() => fillCredentials('viewer@dataops.com', 'Viewer@123')}>
              <code>viewer@dataops.com</code>&nbsp;/&nbsp;<code>Viewer@123</code>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
