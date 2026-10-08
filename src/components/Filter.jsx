// Generic select filter control.
export default function Filter({ label, value, options, onChange }) {
  return (
    <div className="filter">
      {label && <span className="filter-label">{label}</span>}
      <select className="filter-select" value={value} onChange={(e) => onChange(e.target.value)} aria-label={label}>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}
