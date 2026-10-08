import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import StatusBadge from '../components/StatusBadge';
import DataTable from '../components/DataTable';
import { ConfirmModal } from '../components/Modal';
import { EmptyState } from '../components/ErrorMessage';
import { Skeleton } from '../components/Loader';
import Icon from '../components/Icon';
import { useAuth } from '../hooks/useAuth';
import * as api from '../services/api';

export default function PipelineDetails() {
  const { id } = useParams();
  const { user, canRetryPipelines } = useAuth();

  const [pipeline, setPipeline] = useState(null);
  const [runs, setRuns] = useState([]);
  const [errors, setErrors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Retry workflow state: confirm -> processing -> success / failure
  const [retryState, setRetryState] = useState({ modalOpen: false, processing: false, failed: false, message: '' });
  const [retryNotice, setRetryNotice] = useState(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const [pipelineRes, runsRes, errorsRes] = await Promise.all([
        api.getPipeline(id),
        api.getPipelineRuns(id),
        api.getPipelineErrors(id),
      ]);
      setPipeline(pipelineRes);
      setRuns(runsRes);
      setErrors(errorsRes);
    } catch (err) {
      setError(err?.response?.data?.detail || err.message || 'Failed to load pipeline details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [id]);

  const latestRun = runs[runs.length - 1];
  const failed = pipeline?.status === 'FAILED';
  const showRetry = canRetryPipelines && failed && !retryState.processing;

  const successRate = (() => {
    const completed = runs.filter((r) => r.status === 'SUCCESS' || r.status === 'FAILED');
    if (!completed.length) return null;
    return Math.round((completed.filter((r) => r.status === 'SUCCESS').length / completed.length) * 100);
  })();

  const openRetry = () => {
    setRetryState({ modalOpen: true, processing: false, failed: false, message: '' });
    setRetryNotice(null);
  };

  const confirmRetry = async () => {
    setRetryState((s) => ({ ...s, processing: true, failed: false, message: '' }));
    try {
      const result = await api.retryPipeline(id);
      setPipeline(result.pipeline);
      const refreshedRuns = await api.getPipelineRuns(id);
      setRuns(refreshedRuns);
      setRetryState({ modalOpen: false, processing: false, failed: false, message: '' });
      setRetryNotice({
        type: 'success',
        text: `Pipeline "${result.pipeline.name}" re-ran successfully in ${result.run.duration} min and processed ${result.run.recordsProcessed.toLocaleString()} records.`,
      });
    } catch (err) {
      const message = err?.response?.data?.detail || err.message || 'Retry failed. Please try again.';
      setRetryState((s) => ({ ...s, processing: false, failed: true, message }));
    }
  };

  if (error && !pipeline) {
    return (
      <EmptyState
        title="Unable to load pipeline"
        message={error}
        icon="alert"
        action={
          <>
            <button type="button" className="btn btn-primary" onClick={load}>Try again</button>
            <Link to="/pipelines" className="btn btn-secondary">Back to pipelines</Link>
          </>
        }
      />
    );
  }

  return (
    <div>
      <Link to="/pipelines" className="back-link">
        <Icon name="arrowLeft" size={16} /> Back to pipelines
      </Link>

      {loading ? (
        <div className="card card-padded">
          <Skeleton width="40%" height={26} style={{ marginBottom: 14 }} />
          <Skeleton width="70%" height={16} style={{ marginBottom: 22 }} />
          <div className="meta-grid">
            {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} height={62} />)}
          </div>
        </div>
      ) : (
        <>
          <div className="card card-padded">
            <div className="detail-header">
              <div>
                <div className="detail-title-row">
                  <h2 className="page-title">{pipeline.name}</h2>
                  <StatusBadge status={pipeline.status} />
                </div>
                <p className="page-subtitle" style={{ marginTop: 6 }}>{pipeline.description}</p>
              </div>
              <div className="page-actions">
                {showRetry && (
                  <button type="button" className="btn btn-primary" onClick={openRetry}>
                    <Icon name="refresh" size={16} />
                    Retry Pipeline
                  </button>
                )}
                {retryState.processing && (
                  <button type="button" className="btn btn-primary" disabled>
                    <span className="spinner spinner-sm spinner-light" />
                    Retrying...
                  </button>
                )}
              </div>
            </div>

            {retryNotice && (
              <div className={retryNotice.type === 'success' ? 'notice-message' : 'error-message'} role="status" style={{ marginTop: 16 }}>
                <Icon name={retryNotice.type === 'success' ? 'checkCircle' : 'alert'} size={18} />
                <span>{retryNotice.text}</span>
              </div>
            )}

            <div className="meta-grid">
              <div className="meta-item">
                <p className="meta-label">Source</p>
                <p className="meta-value">{pipeline.source}</p>
              </div>
              <div className="meta-item">
                <p className="meta-label">Source Type</p>
                <p className="meta-value">{pipeline.sourceType}</p>
              </div>
              <div className="meta-item">
                <p className="meta-label">Destination</p>
                <p className="meta-value">{pipeline.destination}</p>
              </div>
              <div className="meta-item">
                <p className="meta-label">Schedule</p>
                <p className="meta-value">{pipeline.schedule}</p>
              </div>
              <div className="meta-item">
                <p className="meta-label">Last Run</p>
                <p className="meta-value"><Icon name="clock" size={15} />{pipeline.lastRun}</p>
              </div>
              <div className="meta-item">
                <p className="meta-label">Owner</p>
                <p className="meta-value">{pipeline.owner}</p>
              </div>
            </div>

            <div className="metrics-row">
              <div className="metric-box">
                <p className="metric-label">Duration</p>
                <p className="metric-value">{latestRun?.status === 'RUNNING' ? '—' : `${pipeline.duration} min`}</p>
              </div>
              <div className="metric-box">
                <p className="metric-label">Records Processed</p>
                <p className="metric-value">{pipeline.status === 'FAILED' ? '0' : pipeline.recordsProcessed.toLocaleString()}</p>
              </div>
              <div className="metric-box">
                <p className="metric-label">Success Rate (8 runs)</p>
                <p className="metric-value">{successRate !== null ? `${successRate}%` : '—'}</p>
              </div>
              <div className="metric-box">
                <p className="metric-label">Total Runs</p>
                <p className="metric-value">{runs.length}</p>
              </div>
            </div>
          </div>

          {failed && errors.length > 0 && (
            <div className="error-block" style={{ marginBottom: 20 }}>
              <div className="error-block-header">
                <Icon name="alert" size={18} />
                <p className="error-block-title">Latest Run Failed — {errors[0].component}</p>
                <span className={`badge badge-${errors[0].severity.toLowerCase()}`}>{errors[0].severity}</span>
              </div>
              <p className="modal-message">{errors[0].message}</p>
              <p style={{ fontSize: 12.5, color: 'var(--text-3)', marginTop: 6 }}>
                Occurred at {errors[0].timestamp} · View all errors in{' '}
                <Link to="/logs">Error Logs</Link>
              </p>
            </div>
          )}

          <div className="card">
            <div className="card-header">
              <div>
                <h3 className="card-title">Execution History</h3>
                <p className="card-subtitle">Most recent runs first</p>
              </div>
            </div>
            <DataTable
              columns={[
                { key: 'timestamp', label: 'Date', sortable: false },
                { key: 'status', label: 'Status', sortable: false, render: (v) => <StatusBadge status={v} /> },
                {
                  key: 'duration',
                  label: 'Duration',
                  sortable: false,
                  render: (v, row) => (row.status === 'RUNNING' ? 'In progress' : `${v} min`),
                },
                {
                  key: 'recordsProcessed',
                  label: 'Records',
                  sortable: false,
                  render: (v, row) => (row.status === 'FAILED' ? '0' : v.toLocaleString()),
                },
              ]}
              data={[...runs].reverse()}
              loading={false}
              emptyTitle="No execution history"
              emptyMessage="This pipeline has not been executed yet."
              emptyIcon="refresh"
            />
          </div>
        </>
      )}

      <ConfirmModal
        open={retryState.modalOpen}
        onClose={() => !retryState.processing && setRetryState({ ...retryState, modalOpen: false })}
        onConfirm={confirmRetry}
        title="Retry Pipeline"
        confirmLabel="Yes, retry pipeline"
        loading={retryState.processing}
        danger={false}
      >
        {!retryState.processing && !retryState.failed && (
          <>
            <p className="modal-message">
              You are about to re-run <strong>{pipeline?.name}</strong>. The pipeline will extract
              from <strong>{pipeline?.source}</strong> and load into <strong>{pipeline?.destination}</strong>.
            </p>
            <p className="modal-message" style={{ marginTop: 10, color: 'var(--warning)' }}>
              <strong>Note:</strong> This operation reprocesses the current batch. Downstream consumers
              may see a short delay in fresh data.
            </p>
          </>
        )}
        {retryState.processing && (
          <div className="loader-wrap" style={{ padding: '20px 0' }}>
            <div className="spinner" />
            <p className="loader-label">Re-running pipeline... This may take a few minutes.</p>
          </div>
        )}
        {retryState.failed && (
          <div className="error-message" role="alert">
            <Icon name="alert" size={18} />
            <span className="error-text">{retryState.message}</span>
          </div>
        )}
      </ConfirmModal>
    </div>
  );
}
