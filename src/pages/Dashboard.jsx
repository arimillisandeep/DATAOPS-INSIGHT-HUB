import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
} from 'recharts';
import KPICard from '../components/KPICard';
import StatusBadge from '../components/StatusBadge';
import DataTable from '../components/DataTable';
import { EmptyState } from '../components/ErrorMessage';
import { Skeleton } from '../components/Loader';
import Icon from '../components/Icon';
import * as api from '../services/api';

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await api.getDashboard();
      setData(result);
    } catch (err) {
      setError(err?.response?.data?.detail || err.message || 'Failed to load dashboard data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  if (error && !data) {
    return (
      <EmptyState
        title="Unable to load dashboard"
        message={error}
        icon="alert"
        action={<button type="button" className="btn btn-primary" onClick={load}>Try again</button>}
      />
    );
  }

  const kpis = data?.kpis;

  return (
    <div>
      <div className="page-header">
        <div>
          <h2 className="page-title">Pipeline Health Overview</h2>
          <p className="page-subtitle">
            {loading ? 'Loading latest data...' : `Last updated: ${data?.generatedAt || '—'}`}
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

      <div className="kpi-grid">
        {loading ? (
          Array.from({ length: 5 }).map((_, i) => <KPICard key={i} loading />)
        ) : (
          <>
            <KPICard title="Total Pipelines" value={kpis?.totalPipelines ?? 0} icon="pipeline" subtitle="Monitored ETL jobs" />
            <KPICard title="Successful Runs" value={kpis?.successfulRuns ?? 0} icon="checkCircle" trend="stable" trendDirection="up" subtitle="Last 10 days" />
            <KPICard title="Failed Runs" value={kpis?.failedRuns ?? 0} icon="alert" trend="needs attention" trendDirection="down" subtitle="Last 10 days" />
            <KPICard title="Running Pipelines" value={kpis?.runningPipelines ?? 0} icon="refresh" subtitle="In progress now" />
            <KPICard title="Avg. Execution Time" value={`${kpis?.avgDuration ?? 0} min`} icon="clock" subtitle="Per completed run" />
          </>
        )}
      </div>

      <div className="chart-grid">
        <div className="card">
          <div className="card-header">
            <div>
              <h3 className="card-title">Pipeline Success Rate</h3>
              <p className="card-subtitle">Daily success percentage, last 10 days</p>
            </div>
          </div>
          <div className="card-body">
            {loading ? (
              <Skeleton width="100%" height={260} />
            ) : (
              <ResponsiveContainer width="100%" height={260}>
                <AreaChart data={data?.successRateTrend || []} margin={{ top: 8, right: 12, left: -14, bottom: 0 }}>
                  <defs>
                    <linearGradient id="rateFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#4f46e5" stopOpacity={0.28} />
                      <stop offset="100%" stopColor="#4f46e5" stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                  <XAxis dataKey="date" tick={{ fontSize: 12, fill: '#64748b' }} tickLine={false} axisLine={{ stroke: '#e2e8f0' }} />
                  <YAxis domain={[80, 100]} tick={{ fontSize: 12, fill: '#64748b' }} tickLine={false} axisLine={false} unit="%" />
                  <Tooltip
                    formatter={(value) => [`${value}%`, 'Success rate']}
                    contentStyle={{ borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 13 }}
                  />
                  <Area type="monotone" dataKey="rate" stroke="#4f46e5" strokeWidth={2.5} fill="url(#rateFill)" />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <div>
              <h3 className="card-title">Status Distribution</h3>
              <p className="card-subtitle">Current pipeline states</p>
            </div>
          </div>
          <div className="card-body">
            {loading ? (
              <Skeleton width="100%" height={260} />
            ) : (
              <>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={data?.statusDistribution || []}
                      dataKey="value"
                      nameKey="name"
                      innerRadius={58}
                      outerRadius={82}
                      paddingAngle={3}
                      strokeWidth={0}
                    >
                      {(data?.statusDistribution || []).map((entry) => (
                        <Cell key={entry.name} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value, name) => [value, name]}
                      contentStyle={{ borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 13 }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="chart-legend">
                  {(data?.statusDistribution || []).map((entry) => (
                    <div key={entry.name} className="chart-legend-item">
                      <span className="chart-legend-dot" style={{ background: entry.color }} />
                      {entry.name}: <strong>{entry.value}</strong>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="dashboard-grid">
        <div className="card">
          <div className="card-header">
            <div>
              <h3 className="card-title">Recent Pipeline Runs</h3>
              <p className="card-subtitle">Latest executions across all pipelines</p>
            </div>
            <Link to="/pipelines" className="btn btn-sm btn-outline">View all</Link>
          </div>
          {loading ? (
            <div className="card-body"><Skeleton width="100%" height={240} /></div>
          ) : (
            <DataTable
              columns={[
                { key: 'pipelineName', label: 'Pipeline', render: (v) => <span className="cell-main">{v}</span> },
                { key: 'timestamp', label: 'Last Run' },
                { key: 'status', label: 'Status', render: (v) => <StatusBadge status={v} /> },
                { key: 'duration', label: 'Duration', render: (v) => (v ? `${v} min` : '—') },
                { key: 'recordsProcessed', label: 'Records', render: (v) => v.toLocaleString() },
              ]}
              data={data?.recentRuns || []}
              loading={false}
              emptyTitle="No recent runs"
              emptyMessage="Pipeline runs will appear here once executions are recorded."
              emptyIcon="refresh"
            />
          )}
        </div>

        <div className="card">
          <div className="card-header">
            <div>
              <h3 className="card-title">Failed Pipelines</h3>
              <p className="card-subtitle">Require immediate attention</p>
            </div>
          </div>
          {loading ? (
            <div className="card-body"><Skeleton width="100%" height={200} /></div>
          ) : (data?.failedPipelines || []).length === 0 ? (
            <EmptyState
              title="All pipelines healthy"
              message="No pipelines are currently failing."
              icon="checkCircle"
            />
          ) : (
            <div style={{ padding: '8px 20px 16px' }}>
              {(data?.failedPipelines || []).map((p) => (
                <Link
                  to={`/pipelines/${p.id}`}
                  key={p.id}
                  className="failed-pipeline-item"
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    gap: 12, padding: '12px 0', borderBottom: '1px solid var(--border)',
                    textDecoration: 'none',
                  }}
                >
                  <div>
                    <p style={{ fontWeight: 600, color: 'var(--text)' }}>{p.name}</p>
                    <p style={{ fontSize: 12, color: 'var(--text-3)' }}>Last run: {p.lastRun}</p>
                  </div>
                  <StatusBadge status="FAILED" />
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
