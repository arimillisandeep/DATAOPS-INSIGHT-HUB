import { Link } from 'react-router-dom';
import SearchBar from '../components/SearchBar';
import Filter from '../components/Filter';
import DataTable from '../components/DataTable';
import Pagination from '../components/Pagination';
import StatusBadge from '../components/StatusBadge';
import { usePipelines } from '../hooks/usePipelines';

const STATUS_OPTIONS = [
  { value: 'ALL', label: 'All statuses' },
  { value: 'SUCCESS', label: 'Success' },
  { value: 'FAILED', label: 'Failed' },
  { value: 'RUNNING', label: 'Running' },
];

const SOURCE_OPTIONS = [
  { value: 'ALL', label: 'All sources' },
  { value: 'CSV', label: 'CSV' },
  { value: 'API', label: 'API' },
  { value: 'Database', label: 'Database' },
];

export default function Pipelines() {
  const {
    pipelines, total, loading, error, params, updateParams, resetFilters, setPage, setSort,
  } = usePipelines();

  const columns = [
    {
      key: 'name',
      label: 'Pipeline Name',
      sortable: true,
      render: (value, row) => (
        <Link to={`/pipelines/${row.id}`} style={{ fontWeight: 600, color: 'var(--text)' }}>
          {value}
        </Link>
      ),
    },
    {
      key: 'source',
      label: 'Source',
      sortable: false,
      render: (value, row) => (
        <>
          <span className="cell-main">{value}</span>
          <span className="cell-sub"> · {row.sourceType}</span>
        </>
      ),
    },
    { key: 'destination', label: 'Destination', sortable: false },
    { key: 'status', label: 'Status', sortable: true, render: (value) => <StatusBadge status={value} /> },
    { key: 'lastRun', label: 'Last Run', sortable: true },
    {
      key: 'duration',
      label: 'Duration',
      sortable: true,
      render: (value, row) => (row.status === 'RUNNING' ? 'In progress' : `${value} min`),
    },
    {
      key: 'recordsProcessed',
      label: 'Records',
      sortable: false,
      render: (value, row) => (row.status === 'FAILED' ? '—' : value.toLocaleString()),
    },
  ];

  return (
    <div>
      <div className="page-header">
        <div>
          <h2 className="page-title">Pipelines</h2>
          <p className="page-subtitle">
            {loading ? 'Loading pipelines...' : `${total} pipeline${total === 1 ? '' : 's'} monitored`}
          </p>
        </div>
      </div>

      <div className="toolbar">
        <SearchBar
          value={params.search}
          onChange={(search) => updateParams({ search, page: 1 })}
          placeholder="Search pipelines by name, source, destination, owner..."
          loading={loading}
        />
        <Filter
          label="Status"
          value={params.status}
          options={STATUS_OPTIONS}
          onChange={(status) => updateParams({ status, page: 1 })}
        />
        <Filter
          label="Source"
          value={params.source}
          options={SOURCE_OPTIONS}
          onChange={(source) => updateParams({ source, page: 1 })}
        />
        {(params.search || params.status !== 'ALL' || params.source !== 'ALL') && (
          <button type="button" className="btn btn-sm btn-ghost" onClick={resetFilters}>
            Clear filters
          </button>
        )}
      </div>

      <div className="card">
        <DataTable
          columns={columns}
          data={pipelines}
          keyField="id"
          loading={loading}
          error={error}
          sortBy={params.sortBy}
          sortOrder={params.sortOrder}
          onSort={setSort}
          emptyTitle="No pipelines match your filters"
          emptyMessage="Try a different search term or clear the active filters."
          emptyIcon="pipeline"
        />
        {!loading && !error && total > 0 && (
          <Pagination
            page={params.page}
            pageSize={params.pageSize}
            total={total}
            onChange={setPage}
          />
        )}
      </div>
    </div>
  );
}
