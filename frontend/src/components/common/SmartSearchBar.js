import React, { useState, useEffect } from 'react';
import { Search } from 'lucide-react';

const SmartSearchBar = ({ value, onChange, placeholder = "Search complaints...", debounceMs = 300 }) => {
  const [localValue, setLocalValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      onChange(localValue);
    }, debounceMs);

    return () => clearTimeout(handler);
  }, [localValue, onChange, debounceMs]);

  return (
    <div className="relative w-full max-w-md">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <Search className="h-5 w-5 text-white/40" />
      </div>
      <input
        type="text"
        className="input-glass pl-10 pr-4 py-2 w-full text-sm placeholder-white/40"
        placeholder={placeholder}
        value={localValue}
        onChange={(e) => setLocalValue(e.target.value)}
      />
    </div>
  );
};

export default SmartSearchBar;
