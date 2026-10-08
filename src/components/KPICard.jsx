import Icon from './Icon';

export default function KPICard({ title, value, subtitle, icon, trend, trendDirection = 'up', loading = false }) {
  if (loading) {
    return (
      <div className="card kpi-card">
        <div className="kpi-skeleton">
          <div className="skeleton" style={{ width: '55%', height: 14 }} />
          <div className="skeleton" style={{ width: '70%', height: 30 }} />
          <div className="skeleton" style={{ width: '40%', height: 12 }} />
        </div>
      </div>
    );
  }

  return (
    <div className="card kpi-card">
      <div className="kpi-header">
        <p className="kpi-title">{title}</p>
        {icon && (
          <span className="kpi-icon" aria-hidden="true">
            <Icon name={icon} size={20} />
          </span>
        )}
      </div>
      <p className="kpi-value">{value}</p>
      <div className="kpi-footer">
        {trend && (
          <span className={`kpi-trend trend-${trendDirection}`}>
            <Icon name={trendDirection === 'up' ? 'chevronRight' : 'chevronDown'} size={14} />
            {trend}
          </span>
        )}
        {subtitle && <span className="kpi-subtitle">{subtitle}</span>}
      </div>
    </div>
  );
}
