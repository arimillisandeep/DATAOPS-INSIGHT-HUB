import { useEffect, useState } from 'react';
import SearchBar from '../components/SearchBar';
import Filter from '../components/Filter';
import DataTable from '../components/DataTable';
import Pagination from '../components/Pagination';
import Modal from '../components/Modal';
import Icon from '../components/Icon';
import * as api from '../services/api';

const SEVERITY_OPTIONS = [
  { value: 'ALL', label: 'All severities' },
  { value: 'Critical', label: 'Critical' },
  { value: 'High', label: 'High' },
  { value: 'Medium', label: 'Medium' },
  { value: 'Low', label: 'Low' },
];

export default function Logs() {
  const [rows, setRows] = useState([]);
  const [total, setTotal] = useState(0);
  const [params, setParams] = useState({ search: '', severity: 'ALL', page: 1, pageSize: 10 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Selected log entry + AI analysis state
  const [selected, setSelected] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisError, setAnalysisError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    api
      .getLogs(params)
      .then((res) => {
        if (!cancelled) {
          setRows(res.data);
          setTotal(res.total);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err?.response?.data?.detail || err.message || 'Failed to load error logs.');
          setLoading(false);
        }
      });
    return () => { cancelled = true; };
  }, [params.search, params.severity, params.page, params.pageSize]);

  const openDetails = (row) => {
    setSelected(row);
    setAnalysis(null);
    setAnalysisError(null);
  };

  const closeDetails = () => {
    if (analyzing) return;
    setSelected(null);
    setAnalysis(null);
    setAnalysisError(null);
  };

  const runAnalysis = async () => {
    setAnalyzing(true);
    setAnalysisError(null);
    setAnalysis(null);
    try {
      const result = await api.analyzeError({
        errorId: selected.id,
        pipelineId: selected.pipelineId,
        component: selected.component,
        message: selected.message,
      });
      setAnalysis(result);
    } catch (err) {
      setAnalysisError(err?.response?.data?.detail || err.message || 'Analysis failed.');
    } finally {
      setAnalyzing(false);
    }
  };

  const columns = [
    { key: 'timestamp', label: 'Timestamp', sortable: false },
    {
      key: 'pipelineName',
      label: 'Pipeline',
      sortable: false,
      render: (v) => <span className="cell-main">{v}</span>,
    },
    { key: 'component', label: 'Component', sortable: false, render: (v) => <span className="cell-mono">{v}</span> },
    {
      key: 'severity',
      label: 'Severity',
      sortable: false,
      render: (v) => <span className={`badge badge-${v.toLowerCase()}`}>{v}</span>,
    },
    { key: 'message', label: 'Error Message', sortable: false, render: (v) => <span className="cell-truncate">{v}</span> },
  ];

  return (
    <div>
      <div className="page-header">
        <div>
          <h2 className="page-title">Error Logs</h2>
          <p className="page-subtitle">
            {loading ? 'Loading error logs...' : `${total} error${total === 1 ? '' : 's'} recorded`}
          </p>
        </div>
      </div>

      <div className="toolbar">
        <SearchBar
          value={params.search}
          onChange={(search) => setParams((p) => ({ ...p, search, page: 1 }))}
          placeholder="Search by pipeline, component, or message..."
          loading={loading}
        />
        <Filter
          label="Severity"
          value={params.severity}
          options={SEVERITY_OPTIONS}
          onChange={(severity) => setParams((p) => ({ ...p, severity, page: 1 }))}
        />
      </div>

      <div className="card">
        <DataTable
          columns={columns}
          data={rows}
          keyField="id"
          loading={loading}
          error={error}
          onRowClick={openDetails}
          emptyTitle="No error logs found"
          emptyMessage="No errors match your search, or no errors have been recorded recently."
          emptyIcon="checkCircle"
        />
        {!loading && !error && total > 0 && (
          <Pagination
            page={params.page}
            pageSize={params.pageSize}
            total={total}
            onChange={(page) => setParams((p) => ({ ...p, page }))}
          />
        )}
      </div>

      <Modal
        open={!!selected}
        onClose={closeDetails}
        title="Error Details"
        width="640px"
        footer={
          !analyzing ? (
            <button type="button" className="btn btn-primary" onClick={runAnalysis}>
              <Icon name="sparkles" size={16} />
              {analysis ? 'Re-analyze Error' : 'Analyze with AI'}
            </button>
          ) : undefined
        }
      >
        {selected && (
          <>
            <div className="log-detail-row">
              <span className="log-detail-key">Pipeline</span>
              <span className="log-detail-value">{selected.pipelineName}</span>
            </div>
            <div className="log-detail-row">
              <span className="log-detail-key">Component</span>
              <span className="log-detail-value cell-mono">{selected.component}</span>
            </div>
            <div className="log-detail-row">
              <span className="log-detail-key">Severity</span>
              <span className="log-detail-value">
                <span className={`badge badge-${selected.severity.toLowerCase()}`}>{selected.severity}</span>
              </span>
            </div>
            <div className="log-detail-row">
              <span className="log-detail-key">Timestamp</span>
              <span className="log-detail-value">{selected.timestamp}</span>
            </div>
            <div className="log-detail-row" style={{ alignItems: 'flex-start' }}>
              <span className="log-detail-key">Message</span>
              <span className="log-detail-value" style={{ maxWidth: 420 }}>{selected.message}</span>
            </div>

            <p className="meta-label" style={{ marginTop: 16, marginBottom: 4 }}>Stack trace</p>
            <pre className="stack-trace">{selected.stackTrace}</pre>

            <div style={{ marginTop: 18 }}>
              {analyzing && (
                <div className="ai-card">
                  <div className="loader-wrap" style={{ padding: '18px 0' }}>
                    <div className="spinner" />
                    <p className="loader-label">AI is analyzing this error...</p>
                  </div>
                </div>
              )}

              {analysisError && (
                <div className="error-message" role="alert">
                  <Icon name="alert" size={18} />
                  <span className="error-text">{analysisError}</span>
                  <button type="button" className="btn btn-sm btn-outline" onClick={runAnalysis}>
                    Retry analysis
                  </button>
                </div>
              )}

              {analysis && !analyzing && (
                <div className="ai-card">
                  <div className="ai-header">
                    <p className="ai-title">
                      <Icon name="sparkles" size={17} />
                      AI Error Analysis
                    </p>
                    <span className="card-subtitle">· {analysis.analyzedAt}</span>
                  </div>

                  <div className="ai-section">
                    <p className="ai-label">Possible Cause</p>
                    <p className="ai-text">{analysis.possibleCause}</p>
                  </div>

                  <div className="ai-section">
                    <p className="ai-label">Recommended Solution</p>
                    <ol className="ai-list">
                      {analysis.recommendedSolution.map((step, i) => (
                        <li key={i}>{step}</li>
                      ))}
                    </ol>
                  </div>

                  <div className="ai-section">
                    <p className="ai-label">Confidence: {analysis.confidence}%</p>
                    <div className="confidence-meter">
                      <div className="confidence-fill" style={{ width: `${analysis.confidence}%` }} />
                    </div>
                  </div>

                  {analysis.notes && (
                    <div className="ai-section">
                      <p className="ai-label">Notes</p>
                      <p className="ai-text">{analysis.notes}</p>
                    </div>
                  )}

                  <p className="form-hint">
                    AI analysis is advisory only. It does not apply database changes or execute operations.
                  </p>
                </div>
              )}

              {!analysis && !analyzing && !analysisError && (
                <div className="ai-card" style={{ textAlign: 'center', color: 'var(--text-3)' }}>
                  <Icon name="sparkles" size={26} style={{ marginBottom: 8 }} />
                  <p style={{ fontSize: 13.5 }}>
                    Click <strong>Analyze with AI</strong> to get a likely cause and recommended remediation for this error.
                  </p>
                </div>
              )}
            </div>
          </>
        )}
      </Modal>
    </div>
  );
}
