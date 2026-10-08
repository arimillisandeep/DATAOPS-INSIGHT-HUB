import Icon from './Icon';

// Reusable pagination control with "Showing x-y of z" summary.
export default function Pagination({ page, pageSize, total, onChange }) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const from = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const to = Math.min(total, page * pageSize);

  const pages = [];
  const maxVisible = 5;
  let start = Math.max(1, Math.min(page - Math.floor(maxVisible / 2), totalPages - maxVisible + 1));
  if (totalPages < maxVisible) start = 1;
  for (let i = start; i < Math.min(totalPages, start + maxVisible); i++) pages.push(i);

  if (total === 0) return null;

  return (
    <div className="pagination">
      <p className="pagination-summary">
        Showing <strong>{from}</strong>–<strong>{to}</strong> of <strong>{total}</strong>
      </p>
      <div className="pagination-controls">
        <button
          type="button"
          className="page-btn"
          disabled={page <= 1}
          onClick={() => onChange(page - 1)}
          aria-label="Previous page"
        >
          <Icon name="chevronLeft" size={16} />
        </button>
        {start > 1 && (
          <>
            <button type="button" className="page-btn" onClick={() => onChange(1)}>1</button>
            {start > 2 && <span className="page-ellipsis">…</span>}
          </>
        )}
        {pages.map((p) => (
          <button
            key={p}
            type="button"
            className={`page-btn ${p === page ? 'page-active' : ''}`}
            onClick={() => onChange(p)}
            aria-current={p === page ? 'page' : undefined}
          >
            {p}
          </button>
        ))}
        {start + pages.length < totalPages && (
          <>
            {start + pages.length < totalPages - 1 && <span className="page-ellipsis">…</span>}
            <button type="button" className="page-btn" onClick={() => onChange(totalPages)}>{totalPages}</button>
          </>
        )}
        <button
          type="button"
          className="page-btn"
          disabled={page >= totalPages}
          onClick={() => onChange(page + 1)}
          aria-label="Next page"
        >
          <Icon name="chevronRight" size={16} />
        </button>
      </div>
    </div>
  );
}
