export default function Loader({ size = 'md', label = 'Loading...' }) {
  return (
    <div className={`loader-wrap loader-${size}`} role="status" aria-live="polite">
      <div className="spinner" />
      {label && <p className="loader-label">{label}</p>}
    </div>
  );
}

export function Skeleton({ width = '100%', height = 16, style = {} }) {
  return <div className="skeleton" style={{ width, height, ...style }} aria-hidden="true" />;
}
