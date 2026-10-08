import { useEffect, useState } from 'react';
import DataTable from '../components/DataTable';
import Modal, { ConfirmModal } from '../components/Modal';
import { EmptyState } from '../components/ErrorMessage';
import Icon from '../components/Icon';
import * as api from '../services/api';

const ROLE_OPTIONS = ['Admin', 'Data Engineer', 'Viewer'];
const STATUS_OPTIONS = ['Active', 'Inactive'];

const EMPTY_FORM = { name: '', email: '', role: '', status: 'Active' };

function validate(form, users, excludeId = null) {
  const errors = {};
  if (!form.name.trim()) errors.name = 'Full name is required.';
  if (!form.email.trim()) errors.email = 'Email is required.';
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) errors.email = 'Enter a valid email address.';
  else if (users.some((u) => u.id !== excludeId && u.email.toLowerCase() === form.email.trim().toLowerCase())) {
    errors.email = 'A user with this email already exists.';
  }
  if (!form.role) errors.role = 'Select a role.';
  return errors;
}

export default function Users() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [modalMode, setModalMode] = useState(null); // 'create' | 'edit' | null
  const [form, setForm] = useState(EMPTY_FORM);
  const [formErrors, setFormErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState(null);

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await api.getUsers();
      setUsers(result);
    } catch (err) {
      setError(err?.response?.data?.detail || err.message || 'Failed to load users.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const openCreate = () => {
    setForm(EMPTY_FORM);
    setFormErrors({});
    setSaveError(null);
    setModalMode('create');
  };

  const openEdit = (user) => {
    setForm({ name: user.name, email: user.email, role: user.role, status: user.status });
    setFormErrors({});
    setSaveError(null);
    setModalMode('edit');
    setEditingId(user.id);
  };

  const [editingId, setEditingId] = useState(null);

  const handleSave = async (e) => {
    e.preventDefault();
    const errors = validate(form, users, editingId);
    setFormErrors(errors);
    if (Object.keys(errors).length > 0) return;

    setSaving(true);
    setSaveError(null);
    try {
      if (modalMode === 'create') {
        const created = await api.createUser(form);
        setUsers((prev) => [...prev, created]);
      } else {
        const updated = await api.updateUser(editingId, form);
        setUsers((prev) => prev.map((u) => (u.id === editingId ? updated : u)));
      }
      setModalMode(null);
    } catch (err) {
      const message = err?.response?.data?.detail || err.message || 'Could not save user.';
      setSaveError(message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    setDeleteError(null);
    try {
      await api.deleteUser(deleteTarget.id);
      setUsers((prev) => prev.filter((u) => u.id !== deleteTarget.id));
      setDeleteTarget(null);
    } catch (err) {
      setDeleteError(err?.response?.data?.detail || err.message || 'Could not delete user.');
    } finally {
      setDeleting(false);
    }
  };

  const columns = [
    {
      key: 'name',
      label: 'Name',
      render: (value, row) => (
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 10 }}>
          <span className="avatar" style={{ width: 30, height: 30, fontSize: 11 }}>
            {value.split(' ').map((n) => n[0]).slice(0, 2).join('')}
          </span>
          <span className="cell-main">{value}</span>
        </span>
      ),
    },
    { key: 'email', label: 'Email' },
    {
      key: 'role',
      label: 'Role',
      render: (value) => <span className={`role-chip role-${value.toLowerCase().replace(' ', '-')}`}>{value}</span>,
    },
    {
      key: 'status',
      label: 'Status',
      render: (value) => (
        <span className={value === 'Active' ? 'status-active' : 'status-inactive'}>{value}</span>
      ),
    },
    { key: 'lastLogin', label: 'Last Login' },
    {
      key: 'actions',
      label: '',
      sortable: false,
      render: (_, row) => (
        <div className="action-btns">
          <button
            type="button"
            className="btn btn-sm btn-outline btn-icon"
            onClick={() => openEdit(row)}
            title={`Edit ${row.name}`}
            aria-label={`Edit ${row.name}`}
          >
            <Icon name="edit" size={15} />
          </button>
          <button
            type="button"
            className="btn btn-sm btn-outline btn-icon"
            style={{ color: 'var(--danger)' }}
            onClick={() => setDeleteTarget(row)}
            title={`Delete ${row.name}`}
            aria-label={`Delete ${row.name}`}
          >
            <Icon name="trash" size={15} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <div className="page-header">
        <div>
          <h2 className="page-title">User Management</h2>
          <p className="page-subtitle">
            {loading ? 'Loading users...' : `${users.length} user account${users.length === 1 ? '' : 's'}`}
          </p>
        </div>
        <div className="page-actions">
          <button type="button" className="btn btn-primary" onClick={openCreate}>
            <Icon name="plus" size={16} />
            Create User
          </button>
        </div>
      </div>

      <div className="card">
        <DataTable
          columns={columns}
          data={users}
          keyField="id"
          loading={loading}
          error={error}
          emptyTitle="No users found"
          emptyMessage="Create a user account to grant access to the platform."
          emptyIcon="users"
        />
      </div>

      <Modal
        open={modalMode !== null}
        onClose={() => !saving && setModalMode(null)}
        title={modalMode === 'create' ? 'Create User' : 'Edit User'}
        footer={
          <>
            <button type="button" className="btn btn-secondary" onClick={() => setModalMode(null)} disabled={saving}>
              Cancel
            </button>
            <button type="button" className="btn btn-primary" onClick={handleSave} disabled={saving}>
              {saving && <span className="spinner spinner-sm spinner-light" />}
              {saving ? 'Saving...' : modalMode === 'create' ? 'Create User' : 'Save Changes'}
            </button>
          </>
        }
      >
        {saveError && (
          <div className="error-message" role="alert" style={{ marginBottom: 14 }}>
            <Icon name="alert" size={18} />
            <span className="error-text">{saveError}</span>
          </div>
        )}
        <form onSubmit={handleSave} noValidate>
          <div className="form-group">
            <label className="form-label" htmlFor="user-name">
              Full name<span className="required">*</span>
            </label>
            <input
              id="user-name"
              className={`form-input ${formErrors.name ? 'input-error' : ''}`}
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              placeholder="e.g. Jordan Blake"
            />
            {formErrors.name && <p className="form-error">{formErrors.name}</p>}
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="user-email">
              Email<span className="required">*</span>
            </label>
            <input
              id="user-email"
              type="email"
              className={`form-input ${formErrors.email ? 'input-error' : ''}`}
              value={form.email}
              onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
              placeholder="name@dataops.com"
            />
            {formErrors.email && <p className="form-error">{formErrors.email}</p>}
            {modalMode === 'create' && !formErrors.email && (
              <p className="form-hint">A temporary password will be issued to this address.</p>
            )}
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label" htmlFor="user-role">
                Role<span className="required">*</span>
              </label>
              <select
                id="user-role"
                className={`form-select ${formErrors.role ? 'input-error' : ''}`}
                value={form.role}
                onChange={(e) => setForm((f) => ({ ...f, role: e.target.value }))}
              >
                <option value="">Select a role</option>
                {ROLE_OPTIONS.map((r) => <option key={r} value={r}>{r}</option>)}
              </select>
              {formErrors.role && <p className="form-error">{formErrors.role}</p>}
              <p className="form-hint">
                {form.role === 'Admin' && 'Full access including user management.'}
                {form.role === 'Data Engineer' && 'Pipeline operations, logs, and AI analysis.'}
                {form.role === 'Viewer' && 'Read-only access to monitoring pages.'}
              </p>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="user-status">Status</label>
              <select
                id="user-status"
                className="form-select"
                value={form.status}
                onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}
              >
                {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>
        </form>
      </Modal>

      <ConfirmModal
        open={!!deleteTarget}
        onClose={() => !deleting && setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete User"
        confirmLabel="Yes, delete user"
        danger
        loading={deleting}
      >
        {!deleting && (
          <p className="modal-message">
            Are you sure you want to delete <strong>{deleteTarget?.name}</strong> ({deleteTarget?.email})?
            This user will immediately lose access to DataOps Insight Hub. This action cannot be undone.
          </p>
        )}
        {deleting && (
          <div className="loader-wrap" style={{ padding: '12px 0' }}>
            <div className="spinner" />
            <p className="loader-label">Deleting user...</p>
          </div>
        )}
        {!deleting && deleteError && (
          <div className="error-message" role="alert" style={{ marginTop: 12 }}>
            <Icon name="alert" size={18} />
            <span className="error-text">{deleteError}</span>
          </div>
        )}
      </ConfirmModal>
    </div>
  );
}
