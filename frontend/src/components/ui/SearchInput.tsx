import { useState } from 'react';
import Icon from './Icon';

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  isLoading?: boolean;
}

export default function SearchInput({
  value,
  onChange,
  placeholder = 'Buscar...',
  className = '',
  isLoading = false,
}: SearchInputProps) {
  const [isFocused, setIsFocused] = useState(false);

  const handleClear = () => {
    onChange('');
  };

  return (
    <div
      className={`glass-panel rounded-lg flex items-center gap-2 px-3 py-2 transition-all ${
        isFocused ? 'border-primary/50 shadow-[0_0_20px_rgba(6,182,212,0.15)]' : 'border-white/10'
      } ${className}`}
    >
      <Icon
        name="search"
        className={`w-5 h-5 transition-colors ${
          isFocused ? 'text-primary' : 'text-on-surface-variant'
        }`}
      />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        placeholder={placeholder}
        className="flex-1 bg-transparent text-on-surface font-inter text-sm placeholder:text-on-surface-variant/50 outline-none"
      />
      {isLoading && (
        <div className="w-5 h-5 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
      )}
      {value && !isLoading && (
        <button
          onClick={handleClear}
          className="w-5 h-5 rounded-full hover:bg-white/10 flex items-center justify-center text-on-surface-variant hover:text-on-surface transition-colors"
          type="button"
        >
          <Icon name="cancel" className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}
