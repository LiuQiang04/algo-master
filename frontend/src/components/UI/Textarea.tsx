import {
  useState,
  useCallback,
  useEffect,
  useRef,
  forwardRef,
  type TextareaHTMLAttributes,
} from 'react';

type TextareaSize = 'sm' | 'md' | 'lg';

interface AutoSizeConfig {
  minRows?: number;
  maxRows?: number;
}

interface TextareaProps extends Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'size'> {
  /** Textarea size preset */
  size?: TextareaSize;
  /** Auto resize configuration */
  autoSize?: boolean | AutoSizeConfig;
  /** Show character count */
  showCount?: boolean;
  /** Label text */
  label?: string;
  /** Error message */
  error?: string;
  /** Helper text */
  helperText?: string;
  /** Allow clear button */
  allowClear?: boolean;
  /** Callback when clear is clicked */
  onClear?: () => void;
}

const sizeStyles: Record<TextareaSize, string> = {
  sm: 'px-2.5 py-1.5 text-sm',
  md: 'px-3 py-2 text-sm',
  lg: 'px-4 py-2.5 text-base',
};

const lineHeight = 20; // Approximate line height in pixels

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    {
      size = 'md',
      autoSize = false,
      showCount = false,
      label,
      error,
      helperText,
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
      rows = 3,
      ...props
    },
    ref
  ) => {
    const [internalValue, setInternalValue] = useState<string>(
      String(value ?? defaultValue ?? '')
    );
    const textareaRef = useRef<HTMLTextAreaElement | null>(null);

    const currentValue = value !== undefined ? String(value) : internalValue;
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');
    const hasValue = currentValue.length > 0;

    // Calculate min/max rows
    const minRows = typeof autoSize === 'object' ? autoSize.minRows ?? rows : rows;
    const maxRows = typeof autoSize === 'object' ? autoSize.maxRows ?? Infinity : autoSize ? Infinity : rows;

    // Auto-resize function
    const adjustHeight = useCallback(() => {
      const textarea = textareaRef.current;
      if (!textarea || !autoSize) return;

      // Reset height to auto to get correct scrollHeight
      textarea.style.height = 'auto';

      // Calculate new height
      const minHeight = minRows * lineHeight;
      const maxHeight = maxRows === Infinity ? Infinity : maxRows * lineHeight;
      const newHeight = Math.min(Math.max(textarea.scrollHeight, minHeight), maxHeight);

      textarea.style.height = `${newHeight}px`;
      textarea.style.overflowY = textarea.scrollHeight > maxHeight ? 'auto' : 'hidden';
    }, [autoSize, minRows, maxRows]);

    // Adjust height on value change
    useEffect(() => {
      adjustHeight();
    }, [currentValue, adjustHeight]);

    // Adjust height on mount
    useEffect(() => {
      adjustHeight();
    }, [adjustHeight]);

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

    // Merge refs
    const setRefs = useCallback(
      (node: HTMLTextAreaElement | null) => {
        textareaRef.current = node;
        if (typeof ref === 'function') {
          ref(node);
        } else if (ref) {
          (ref as React.MutableRefObject<HTMLTextAreaElement | null>).current = node;
        }
      },
      [ref]
    );

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

        <div className="relative">
          <textarea
            ref={setRefs}
            id={inputId}
            value={value}
            defaultValue={defaultValue}
            maxLength={maxLength}
            disabled={disabled}
            readOnly={readOnly}
            onChange={handleChange}
            rows={autoSize ? minRows : rows}
            className={`
              w-full border rounded-lg transition-colors duration-150
              placeholder:text-gray-400
              focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
              disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed
              read-only:bg-gray-50 read-only:cursor-default
              ${sizeStyles[size]}
              ${autoSize ? 'resize-none' : 'resize-y'}
              ${error ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 'border-gray-300'}
              ${className}
            `}
            {...props}
          />

          {/* Bottom-right actions */}
          <div className="absolute bottom-2 right-2 flex items-center gap-1.5">
            {showCount && maxLength && (
              <span
                className={`
                  text-xs tabular-nums select-none bg-white/80 px-1.5 py-0.5 rounded
                  ${currentValue.length > maxLength ? 'text-red-500' : 'text-gray-400'}
                `}
              >
                {currentValue.length}/{maxLength}
              </span>
            )}
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
                <svg
                  viewBox="0 0 16 16"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className="w-3 h-3"
                >
                  <path d="M4 4l8 8M12 4l-8 8" />
                </svg>
              </button>
            )}
          </div>
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

Textarea.displayName = 'Textarea';

export default Textarea;
