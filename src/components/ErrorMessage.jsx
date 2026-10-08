import Icon from './Icon';

export default function ErrorMessage({ message, onRetry, compact = false }) {
  if (!message) return null;
  return (
    <div className={`error-message ${compact ? 'error-compact' : ''}`} role="alert">
      <Icon name="alert" size={20} />
      <span className="error-text">{message}</span>
      {onRetry && (
        <button type="button" className="btn btn-sm btn-outline" onClick={onRetry}>
          <Icon name="refresh" size={16} />
          Retry
        </button>
      )}
    </div>
  );
}

export function EmptyState({ title = 'No data found', message, icon = 'database', action }) {
  return (
    <div className="empty-state">
      <div className="empty-icon">
        <Icon name={icon} size={28} />
      </div>
      <p className="empty-title">{title}</p>
      {message && <p className="empty-message">{message}</p>}
      {action}
    </div>
  );
}
