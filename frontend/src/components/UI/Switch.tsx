import type { ReactNode } from 'react';

type SwitchSize = 'sm' | 'md' | 'lg';

interface SwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: ReactNode;
  size?: SwitchSize;
  color?: string;
  disabled?: boolean;
  loading?: boolean;
  className?: string;
  id?: string;
}

const sizeConfig: Record<SwitchSize, { track: string; thumb: string; translate: string }> = {
  sm: {
    track: 'w-8 h-4',
    thumb: 'w-3 h-3',
    translate: 'translate-x-4',
  },
  md: {
    track: 'w-11 h-6',
    thumb: 'w-5 h-5',
    translate: 'translate-x-5',
  },
  lg: {
    track: 'w-14 h-7',
    thumb: 'w-6 h-6',
    translate: 'translate-x-7',
  },
};

export default function Switch({
  checked,
  onChange,
  label,
  size = 'md',
  color,
  disabled = false,
  loading = false,
  className = '',
  id,
}: SwitchProps) {
  const config = sizeConfig[size];
  const isDisabled = disabled || loading;

  const handleClick = () => {
    if (!isDisabled) {
      onChange(!checked);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleClick();
    }
  };

  const trackStyle = checked
    ? { backgroundColor: color || '#2563eb' }
    : { backgroundColor: '#d1d5db' };

  return (
    <div className={`inline-flex items-center gap-2 ${className}`}>
      <button
        id={id}
        type="button"
        role="switch"
        aria-checked={checked}
        aria-disabled={isDisabled}
        disabled={isDisabled}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        className={`
          relative inline-flex items-center rounded-full transition-colors duration-200
          ${config.track}
          ${isDisabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
          focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2
        `}
        style={trackStyle}
      >
        <span
          className={`
            inline-block rounded-full bg-white shadow-sm transform transition-transform duration-200
            ${config.thumb}
            ${checked ? config.translate : 'translate-x-0.5'}
          `}
        >
          {loading && (
            <span className="absolute inset-0 flex items-center justify-center">
              <svg
                className="animate-spin h-3 w-3 text-gray-500"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                />
              </svg>
            </span>
          )}
        </span>
      </button>
      {label && (
        <label
          htmlFor={id}
          className={`
            text-sm font-medium select-none
            ${isDisabled ? 'text-gray-400 cursor-not-allowed' : 'text-gray-700 cursor-pointer'}
          `}
          onClick={!isDisabled ? handleClick : undefined}
        >
          {label}
        </label>
      )}
    </div>
  );
}
