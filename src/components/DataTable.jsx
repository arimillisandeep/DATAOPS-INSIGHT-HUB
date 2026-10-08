import Icon from './Icon';
import { EmptyState } from './ErrorMessage';
import { Skeleton } from './Loader';

// Generic sortable table. columns: [{ key, label, sortable, render, className }]
export default function DataTable({
  columns,
  data,
  keyField = 'id',
  loading = false,
  error = null,
  emptyTitle = 'No records found',
  emptyMessage = 'Try adjusting your search or filters.',
  emptyIcon = 'database',
  sortBy,
  sortOrder,
  onSort,
  onRowClick,
  skeletonRows = 5,
  className = '',
}) {
  if (error) {
    return (
      <EmptyState
        title="Failed to load data"
        message={error}
        icon="alert"
      />
    );
  }

  if (loading) {
    return (
      <div className="table-responsive">
        <table className="table">
          <thead>
            <tr>
              {columns.map((col) => (
                <th key={col.key}>{col.label}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: skeletonRows }).map((_, r) => (
              <tr key={r}>
                {columns.map((col) => (
                  <td key={col.key}>
                    <Skeleton width="80%" height={14} />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return <EmptyState title={emptyTitle} message={emptyMessage} icon={emptyIcon} />;
  }

  return (
    <div className={`table-responsive ${className}`}>
      <table className="table">
        <thead>
          <tr>
            {columns.map((col) => {
              const active = sortBy === col.key;
              return (
                <th
                  key={col.key}
                  className={`${col.sortable !== false && onSort ? 'th-sortable' : ''} ${col.className || ''} ${active ? 'th-active' : ''}`}
                  onClick={col.sortable !== false && onSort ? () => onSort(col.key) : undefined}
                  aria-sort={active ? (sortOrder === 'asc' ? 'ascending' : 'descending') : undefined}
                >
                  <span className="th-content">
                    {col.label}
                    {col.sortable !== false && onSort && (
                      <span className={`sort-indicator ${active ? 'sort-visible' : ''}`}>
                        {active && sortOrder === 'asc' ? '▲' : '▼'}
                      </span>
                    )}
                  </span>
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {data.map((row) => (
            <tr
              key={row[keyField]}
              onClick={onRowClick ? () => onRowClick(row) : undefined}
              className={onRowClick ? 'row-clickable' : ''}
            >
              {columns.map((col) => (
                <td key={col.key} className={col.className || ''}>
                  {col.render ? col.render(row[col.key], row) : row[col.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// Small helper for sort headers that always shows an arrow affordance.
export function SortIndicator({ active, order }) {
  return (
    <span className={`sort-indicator ${active ? 'sort-visible' : ''}`}>
      <Icon name="chevronDown" size={12} />
    </span>
  );
}
