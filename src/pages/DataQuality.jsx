import { useEffect, useState } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import KPICard from '../components/KPICard';
import DataTable from '../components/DataTable';
import { EmptyState } from '../components/ErrorMessage';
import { Skeleton } from '../components/Loader';
import Icon from '../components/Icon';
import * as api from '../services/api';

function progressClass(value) {
  if (value >= 97) return 'good';
  if (value >= 93) return 'warn';
  return 'bad';
}

function GaugeCard({ label, value, loading }) {
  return (
    <div className="card gauge-card">
      {loading ? (
        <div className="kpi-skeleton">
          <div className="skeleton" style={{ width: '50%', height: 14 }} />
          <div className="skeleton" style={{ width: '60%', height: 28 }} />
          <div className="skeleton" style={{ width: '100%', height: 8 }} />
        </div>
      ) : (
        <>
          <div className="gauge-header">
            <span className="gauge-label">{label}</span>
            <span className="gauge-value">{value}%</span>
          </div>
          <div className="progress-track">
            <div className={`progress-fill ${progressClass(value)}`} style={{ width: `${value}%` }} />
          </div>
        </>
      )}
    </div>
  );
}

export default function DataQuality() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await api.getDataQuality();
      setData(result);
    } catch (err) {
      setError(err?.response?.data?.detail || err.message || 'Failed to load data quality metrics.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  if (error && !data) {
    return (
      <EmptyState
        title="Unable to load data quality"
        message={error}
        icon="alert"
        action={<button type="button" className="btn btn-primary" onClick={load}>Try again</button>}
      />
    );
  }

  const summary = data?.summary || {};
  const metrics = data?.metrics || {};

  return (
    <div>
      <div className="page-header">
        <div>
          <h2 className="page-title">Data Quality</h2>
          <p className="page-subtitle">
            {loading ? 'Loading quality metrics...' : `Generated: ${data?.generatedAt || '—'}`}
          </p>
        </div>
        <div className="page-actions">
          <button type="button" className="btn btn-secondary" onClick={load} disabled={loading}>
            <Icon name="refresh" size={16} />
            Refresh
          </button>
        </div>
      </div>

      {error && data && (
        <div style={{ marginBottom: 16 }}>
          <div className="error-message" role="alert">
            <Icon name="alert" size={18} />
            <span className="error-text">{error}</span>
            <button type="button" className="btn btn-sm btn-outline" onClick={load}>Retry</button>
          </div>
        </div>
      )}

      <div className="kpi-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => <KPICard key={i} loading />)
        ) : (
          <>
            <KPICard title="Total Records" value={summary.totalRecords?.toLocaleString()} icon="database" subtitle="Across monitored tables" />
            <KPICard title="Valid Records" value={summary.validRecords?.toLocaleString()} icon="checkCircle" subtitle="Passed all quality rules" />
            <KPICard title="Invalid Records" value={summary.invalidRecords?.toLocaleString()} icon="alert" trend="quarantined" trendDirection="down" subtitle="Routed to exceptions" />
            <KPICard title="Duplicate Records" value={summary.duplicateRecords?.toLocaleString()} icon="copy" subtitle="Flagged for deduplication" />
          </>
        )}
      </div>

      <div className="quality-metrics">
        <GaugeCard label="Completeness" value={metrics.completeness} loading={loading} />
        <GaugeCard label="Validity" value={metrics.validity} loading={loading} />
        <GaugeCard label="Uniqueness" value={metrics.uniqueness} loading={loading} />
      </div>

      <div className="chart-grid">
        <div className="card">
          <div className="card-header">
            <div>
              <h3 className="card-title">Quality Trend</h3>
              <p className="card-subtitle">Completeness, validity, and uniqueness over 10 days</p>
            </div>
          </div>
          <div className="card-body">
            {loading ? (
              <Skeleton width="100%" height={260} />
            ) : (
              <ResponsiveContainer width="100%" height={260}>
                <LineChart data={data?.trend || []} margin={{ top: 8, right: 12, left: -14, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                  <XAxis dataKey="date" tick={{ fontSize: 12, fill: '#64748b' }} tickLine={false} axisLine={{ stroke: '#e2e8f0' }} />
                  <YAxis domain={[90, 100]} tick={{ fontSize: 12, fill: '#64748b' }} tickLine={false} axisLine={false} unit="%" />
                  <Tooltip
                    formatter={(value, name) => [`${value}%`, name]}
                    contentStyle={{ borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 13 }}
                  />
                  <Legend wrapperStyle={{ fontSize: 12.5 }} />
                  <Line type="monotone" dataKey="completeness" stroke="#4f46e5" strokeWidth={2.5} dot={false} />
                  <Line type="monotone" dataKey="validity" stroke="#16a34a" strokeWidth={2.5} dot={false} />
                  <Line type="monotone" dataKey="uniqueness" stroke="#d97706" strokeWidth={2.5} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <div>
              <h3 className="card-title">Quality Summary</h3>
              <p className="card-subtitle">Record-level breakdown</p>
            </div>
          </div>
          <div className="card-body">
            {loading ? (
              <Skeleton width="100%" height={200} />
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {[
                  { label: 'Valid', value: summary.validRecords, total: summary.totalRecords, color: 'var(--success)' },
                  { label: 'Invalid', value: summary.invalidRecords, total: summary.totalRecords, color: 'var(--danger)' },
                  { label: 'Duplicates', value: summary.duplicateRecords, total: summary.totalRecords, color: 'var(--warning)' },
                ].map((item) => {
                  const pct = item.total ? +(((item.value || 0) / item.total) * 100).toFixed(2) : 0;
                  return (
                    <div key={item.label}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 5 }}>
                        <span style={{ color: 'var(--text-2)', fontWeight: 600 }}>{item.label}</span>
                        <span style={{ color: 'var(--text-3)' }}>{pct}%</span>
                      </div>
                      <div className="progress-track">
                        <div className="progress-fill" style={{ width: `${pct}%`, background: item.color }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <div>
            <h3 className="card-title">Problematic Columns</h3>
            <p className="card-subtitle">Columns with the highest quality issue counts</p>
          </div>
        </div>
        <DataTable
          columns={[
            { key: 'column', label: 'Column', render: (v) => <span className="cell-mono cell-main">{v}</span> },
            { key: 'table', label: 'Table', render: (v) => <span className="cell-mono">{v}</span> },
            { key: 'issue', label: 'Issue' },
            {
              key: 'count',
              label: 'Issue Count',
              render: (v) => <span className="cell-main">{v.toLocaleString()}</span>,
            },
          ]}
          data={data?.problematicColumns || []}
          loading={loading}
          emptyTitle="No problematic columns"
          emptyMessage="All monitored columns passed their quality rules in the latest scan."
          emptyIcon="quality"
        />
      </div>
    </div>
  );
}
