const STATUS_CONFIG = {
  SUCCESS: { label: 'Success', className: 'badge-success' },
  FAILED: { label: 'Failed', className: 'badge-failed' },
  RUNNING: { label: 'Running', className: 'badge-running' },
};

export default function StatusBadge({ status, pulse = true }) {
  const config = STATUS_CONFIG[status] || { label: status, className: 'badge-neutral' };
  return (
    <span className={`badge ${config.className}`}>
      <span className={`badge-dot ${pulse && status === 'RUNNING' ? 'dot-pulse' : ''}`} />
      {config.label}
    </span>
  );
}
