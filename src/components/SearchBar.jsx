import { useEffect, useRef, useState } from 'react';
import Icon from './Icon';

// Search input with built-in debouncing so callers receive stable values.
export default function SearchBar({ value, onChange, placeholder = 'Search...', debounceMs = 300, loading = false }) {
  const [text, setText] = useState(value || '');
  const timer = useRef(null);

  useEffect(() => {
    setText(value || '');
  }, [value]);

  useEffect(() => {
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, []);

  const handleChange = (e) => {
    const next = e.target.value;
    setText(next);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => onChange(next), debounceMs);
  };

  const clear = () => {
    setText('');
    onChange('');
  };

  return (
    <div className="searchbar">
      <Icon name="search" size={18} className="searchbar-icon" />
      <input
        type="text"
        className="searchbar-input"
        placeholder={placeholder}
        value={text}
        onChange={handleChange}
        aria-label={placeholder}
      />
      {loading && <span className="searchbar-spinner spinner spinner-sm" aria-hidden="true" />}
      {text && (
        <button type="button" className="searchbar-clear" onClick={clear} aria-label="Clear search">
          <Icon name="x" size={16} />
        </button>
      )}
    </div>
  );
}
