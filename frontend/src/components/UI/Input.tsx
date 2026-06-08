import { useState, useCallback, type InputHTMLAttributes, type ReactNode, forwardRef } from 'react';

/* ============================================
   Input Component - Enhanced input with prefix/suffix, count, clear
   ============================================ */

type InputSize = 'sm' | 'md' | 'lg';

interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  /** Input size preset */
  size?: InputSize;
  /** Label text */
  label?: string;
  /** Error message */
  error?: string;
  /** Helper text */
  helperText?: string;
  /** Prefix element (icon, text, etc.) */
  prefix?: ReactNode;
  /** Suffix element (icon, text, etc.) */
  suffix?: ReactNode;
  /** Show character count (requires maxLength) */
  showCount?: boolean;
  /** Show clear button when input has value */
  allowClear?: boolean;
  /** Callback when clear is clicked */
  onClear?: () => void;
}

const sizeStyles: Record<InputSize, { input: string; icon: string }> = {
  sm: { input: 'px-2.5 py-1.5 text-sm', icon: 'text-sm' },
  md: { input: 'px-3 py-2 text-sm', icon: 'text-base' },
  lg: { input: 'px-4 py-2.5 text-base', icon: 'text-lg' },
};

const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      size = 'md',
      label,
      error,
      helperText,
      prefix,
      suffix,
      showCount = false,
      allowClear = false,
      onClear,
      className = '',
      id,
      value,
      defaultValue,
      maxLength,
      disabled,
      readOnly,
      onChange,
      ...props
    },
    ref
  ) => {
    const [internalValue, setInternalValue] = useState<string>(
      String(value ?? defaultValue ?? '')
    );

    const currentValue = value !== undefined ? String(value) : internalValue;
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');
    const style = sizeStyles[size];
    const hasValue = currentValue.length > 0;

    const handleChange = useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        if (value === undefined) {
          setInternalValue(e.target.value);
        }
        onChange?.(e);
      },
      [value, onChange]
    );

    const handleClear = useCallback(() => {
      if (value === undefined) {
        setInternalValue('');
      }
      // Create a synthetic event for onChange
      if (onChange) {
        const syntheticEvent = {
          target: { value: '' },
          currentTarget: { value: '' },
        } as React.ChangeEvent<HTMLInputElement>;
        onChange(syntheticEvent);
      }
      onClear?.();
    }, [value, onChange, onClear]);

    const hasPrefix = !!prefix;
    const hasSuffix = !!suffix || allowClear || showCount;

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm font-medium text-gray-700 mb-1.5"
          >
            {label}
          </label>
        )}

        <div className="relative flex items-center">
          {/* Prefix */}
          {hasPrefix && (
            <span
              className={`
                absolute left-3 flex items-center justify-center
                text-gray-400 pointer-events-none
                ${style.icon}
              `}
            >
              {prefix}
            </span>
          )}

          <input
            ref={ref}
            id={inputId}
            value={value}
            defaultValue={defaultValue}
            maxLength={maxLength}
            disabled={disabled}
            readOnly={readOnly}
            onChange={handleChange}
            className={`
              w-full rounded-lg border transition-colors duration-150
              placeholder:text-gray-400
              focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
              disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed
              read-only:bg-gray-50 read-only:cursor-default
              ${style.input}
              ${hasPrefix ? 'pl-10' : ''}
              ${hasSuffix ? 'pr-20' : ''}
              ${error
                ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
                : 'border-gray-300'
              }
              ${className}
            `}
            {...props}
          />

          {/* Suffix area (clear + count + custom suffix) */}
          {hasSuffix && (
            <span className="absolute right-3 flex items-center gap-1.5">
              {/* Character count */}
              {showCount && maxLength && (
                <span className="text-xs text-gray-400 tabular-nums select-none">
                  {currentValue.length}/{maxLength}
                </span>
              )}

              {/* Clear button */}
              {allowClear && hasValue && !disabled && !readOnly && (
                <button
                  type="button"
                  onClick={handleClear}
                  className="
                    flex items-center justify-center w-4 h-4
                    rounded-full bg-gray-300 text-white
                    hover:bg-gray-400 transition-colors duration-150
                    cursor-pointer
                  "
                  aria-label="清除"
                >
                  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" className="w-3 h-3">
                    <path d="M4 4l8 8M12 4l-8 8" />
                  </svg>
                </button>
              )}

              {/* Custom suffix */}
              {suffix && (
                <span className={`flex items-center text-gray-400 ${style.icon}`}>
                  {suffix}
                </span>
              )}
            </span>
          )}
        </div>

        {/* Error / Helper text */}
        {error && (
          <p className="mt-1.5 text-sm text-red-600">{error}</p>
        )}
        {helperText && !error && (
          <p className="mt-1.5 text-sm text-gray-500">{helperText}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;

/* ============================================
   TextArea Component
   ============================================ */

interface TextAreaProps extends Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, 'size'> {
  label?: string;
  error?: string;
  helperText?: string;
  showCount?: boolean;
  allowClear?: boolean;
  onClear?: () => void;
}

export const TextArea = forwardRef<HTMLTextAreaElement, TextAreaProps>(
  (
    {
      label,
      error,
      helperText,
      showCount = false,
      allowClear = false,
      onClear,
      className = '',
      id,
      value,
      defaultValue,
      maxLength,
      disabled,
      readOnly,
      onChange,
      ...props
    },
    ref
  ) => {
    const [internalValue, setInternalValue] = useState<string>(
      String(value ?? defaultValue ?? '')
    );

    const currentValue = value !== undefined ? String(value) : internalValue;
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');
    const hasValue = currentValue.length > 0;

    const handleChange = useCallback(
      (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        if (value === undefined) {
          setInternalValue(e.target.value);
        }
        onChange?.(e);
      },
      [value, onChange]
    );

    const handleClear = useCallback(() => {
      if (value === undefined) {
        setInternalValue('');
      }
      if (onChange) {
        const syntheticEvent = {
          target: { value: '' },
          currentTarget: { value: '' },
        } as React.ChangeEvent<HTMLTextAreaElement>;
        onChange(syntheticEvent);
      }
      onClear?.();
    }, [value, onChange, onClear]);

    return (
      <div className="w-full">
        {label && (
          <label htmlFor={inputId} className="block text-sm font-medium text-gray-700 mb-1.5">
            {label}
          </label>
        )}

        <div className="relative">
          <textarea
            ref={ref}
            id={inputId}
            value={value}
            defaultValue={defaultValue}
            maxLength={maxLength}
            disabled={disabled}
            readOnly={readOnly}
            onChange={handleChange}
            className={`
              w-full px-3 py-2 border rounded-lg text-sm resize-y
              transition-colors duration-150
              placeholder:text-gray-400
              focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
              disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed
              read-only:bg-gray-50 read-only:cursor-default
              ${error ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 'border-gray-300'}
              ${className}
            `}
            {...props}
          />

          {/* Bottom-right actions */}
          <div className="absolute bottom-2 right-2 flex items-center gap-1.5">
            {showCount && maxLength && (
              <span className="text-xs text-gray-400 tabular-nums select-none bg-white/80 px-1 rounded">
                {currentValue.length}/{maxLength}
              </span>
            )}
            {allowClear && hasValue && !disabled && !readOnly && (
              <button
                type="button"
                onClick={handleClear}
                className="flex items-center justify-center w-4 h-4 rounded-full bg-gray-300 text-white hover:bg-gray-400 transition-colors cursor-pointer"
                aria-label="清除"
              >
                <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" className="w-3 h-3">
                  <path d="M4 4l8 8M12 4l-8 8" />
                </svg>
              </button>
            )}
          </div>
        </div>

        {error && <p className="mt-1.5 text-sm text-red-600">{error}</p>}
        {helperText && !error && <p className="mt-1.5 text-sm text-gray-500">{helperText}</p>}
      </div>
    );
  }
);

TextArea.displayName = 'TextArea';
