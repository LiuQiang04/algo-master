import { useState, useRef, useEffect, useCallback, useMemo, type ReactNode } from 'react';
import { ChevronDown, Check, X, Search } from 'lucide-react';

/* ============================================
   Types
   ============================================ */

interface SelectOption {
  value: string;
  label: ReactNode;
  disabled?: boolean;
  /** Custom data */
  [key: string]: unknown;
}

interface SelectGroup {
  label: string;
  options: SelectOption[];
}

type SelectItem = SelectOption | SelectGroup;

function isGroup(item: SelectItem): item is SelectGroup {
  return 'options' in item;
}

interface SelectProps {
  /** Options list */
  options: SelectItem[];
  /** Selected value(s) */
  value?: string | string[];
  /** Called when selection changes */
  onChange?: (value: string | string[]) => void;
  /** Placeholder text when nothing is selected */
  placeholder?: string;
  /** Whether to enable search filtering. Default: false */
  searchable?: boolean;
  /** Whether to allow multiple selection. Default: false */
  multiple?: boolean;
  /** Whether the select is disabled. Default: false */
  disabled?: boolean;
  /** Whether the select is clearable. Default: false */
  clearable?: boolean;
  /** Render custom option content */
  renderOption?: (option: SelectOption) => ReactNode;
  /** Render custom display for selected value(s) */
  renderSelected?: (option: SelectOption) => ReactNode;
  /** Called when the dropdown opens/closes */
  onOpenChange?: (open: boolean) => void;
  /** Extra className for the wrapper */
  className?: string;
  /** Maximum dropdown height in px. Default: 264 */
  maxDropdownHeight?: number;
}

/* ============================================
   Helpers
   ============================================ */

/** Flatten all options (including groups) for lookup */
function flatOptions(items: SelectItem[]): SelectOption[] {
  const result: SelectOption[] = [];
  for (const item of items) {
    if (isGroup(item)) {
      result.push(...item.options);
    } else {
      result.push(item);
    }
  }
  return result;
}

/** Filter items by search query */
function filterItems(items: SelectItem[], query: string): SelectItem[] {
  if (!query) return items;
  const q = query.toLowerCase();
  const result: SelectItem[] = [];
  for (const item of items) {
    if (isGroup(item)) {
      const filtered = item.options.filter(
        (opt) => typeof opt.label === 'string' && opt.label.toLowerCase().includes(q),
      );
      if (filtered.length > 0) {
        result.push({ ...item, options: filtered });
      }
    } else {
      if (typeof item.label === 'string' && item.label.toLowerCase().includes(q)) {
        result.push(item);
      }
    }
  }
  return result;
}

/* ============================================
   Select
   ============================================ */

export default function Select({
  options,
  value,
  onChange,
  placeholder = '请选择',
  searchable = false,
  multiple = false,
  disabled = false,
  clearable = false,
  renderOption,
  renderSelected,
  onOpenChange,
  className = '',
  maxDropdownHeight = 264,
}: SelectProps) {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const wrapperRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const allFlat = useMemo(() => flatOptions(options), [options]);
  const filteredItems = useMemo(() => filterItems(options, searchQuery), [options, searchQuery]);

  // Build a map for quick label lookup
  const optionMap = useMemo(() => {
    const map = new Map<string, SelectOption>();
    for (const opt of allFlat) {
      map.set(opt.value, opt);
    }
    return map;
  }, [allFlat]);

  const selectedValues = useMemo<string[]>(() => {
    if (Array.isArray(value)) return value;
    return value !== undefined && value !== '' ? [value] : [];
  }, [value]);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handleClick = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [open]);

  // Close on ESC
  useEffect(() => {
    if (!open) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [open]);

  // Focus search input when dropdown opens
  useEffect(() => {
    if (open && searchable && inputRef.current) {
      inputRef.current.focus();
    }
  }, [open, searchable]);

  const toggleOpen = useCallback(() => {
    if (disabled) return;
    setOpen((prev) => {
      const next = !prev;
      if (!next) setSearchQuery('');
      onOpenChange?.(next);
      return next;
    });
  }, [disabled, onOpenChange]);

  const handleSelect = useCallback(
    (optValue: string, optDisabled?: boolean) => {
      if (optDisabled) return;

      if (multiple) {
        const next = selectedValues.includes(optValue)
          ? selectedValues.filter((v) => v !== optValue)
          : [...selectedValues, optValue];
        onChange?.(next);
      } else {
        onChange?.(optValue);
        setOpen(false);
        setSearchQuery('');
      }
    },
    [multiple, selectedValues, onChange],
  );

  const handleClear = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      onChange?.(multiple ? [] : '');
    },
    [multiple, onChange],
  );

  const handleRemoveTag = useCallback(
    (e: React.MouseEvent, tagValue: string) => {
      e.stopPropagation();
      onChange?.(selectedValues.filter((v) => v !== tagValue));
    },
    [selectedValues, onChange],
  );

  // Render display text
  const renderDisplay = () => {
    if (selectedValues.length === 0) {
      return <span className="text-[var(--text-muted)]">{placeholder}</span>;
    }

    if (multiple) {
      return (
        <div className="flex flex-wrap gap-1">
          {selectedValues.map((v) => {
            const opt = optionMap.get(v);
            if (!opt) return null;
            return (
              <span
                key={v}
                className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium bg-[var(--primary-50)] text-[var(--primary-700)] rounded-[var(--radius-sm)]"
              >
                {renderSelected ? renderSelected(opt) : opt.label}
                <button
                  onClick={(e) => handleRemoveTag(e, v)}
                  className="hover:text-[var(--primary-900)]"
                >
                  <X size={12} />
                </button>
              </span>
            );
          })}
        </div>
      );
    }

    const opt = optionMap.get(selectedValues[0]);
    if (!opt) return <span className="text-[var(--text-muted)]">{placeholder}</span>;
    return renderSelected ? renderSelected(opt) : opt.label;
  };

  // Render a single option
  const renderOptionItem = (opt: SelectOption) => {
    const isSelected = selectedValues.includes(opt.value);
    return (
      <div
        key={opt.value}
        className={`
          flex items-center gap-2 px-3 py-2 text-sm cursor-pointer transition-colors
          ${opt.disabled
            ? 'opacity-50 cursor-not-allowed'
            : isSelected
              ? 'bg-[var(--primary-50)] text-[var(--primary-700)]'
              : 'hover:bg-[var(--bg-card-hover)] text-[var(--text-primary)]'
          }
        `}
        onClick={() => handleSelect(opt.value, opt.disabled)}
        role="option"
        aria-selected={isSelected}
        aria-disabled={opt.disabled}
      >
        {multiple && (
          <span
            className={`
              w-4 h-4 shrink-0 rounded border-2 flex items-center justify-center transition-colors
              ${isSelected
                ? 'bg-[var(--primary-600)] border-[var(--primary-600)]'
                : 'border-[var(--border-default)]'
              }
            `}
          >
            {isSelected && (
              <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            )}
          </span>
        )}
        <span className="flex-1 truncate">
          {renderOption ? renderOption(opt) : opt.label}
        </span>
        {!multiple && isSelected && (
          <Check size={14} className="text-[var(--primary-600)] shrink-0" />
        )}
      </div>
    );
  };

  return (
    <div ref={wrapperRef} className={`relative ${className}`}>
      {/* Trigger */}
      <div
        className={`
          flex items-center gap-2 min-h-[38px] px-3 py-1.5
          border rounded-[var(--radius-lg)] cursor-pointer transition-colors
          ${open
            ? 'border-[var(--primary-400)] ring-2 ring-[var(--primary-100)]'
            : 'border-[var(--border-light)] hover:border-[var(--border-default)]'
          }
          ${disabled ? 'opacity-50 cursor-not-allowed bg-[var(--bg-tertiary)]' : 'bg-[var(--bg-card)]'}
        `}
        onClick={toggleOpen}
        role="combobox"
        aria-expanded={open}
        aria-disabled={disabled}
      >
        <div className="flex-1 min-w-0 overflow-hidden">
          {renderDisplay()}
        </div>
        <div className="flex items-center gap-1 shrink-0">
          {clearable && selectedValues.length > 0 && !disabled && (
            <button
              onClick={handleClear}
              className="p-0.5 rounded hover:bg-[var(--bg-tertiary)] text-[var(--text-muted)]"
            >
              <X size={14} />
            </button>
          )}
          <ChevronDown
            size={16}
            className={`text-[var(--text-muted)] transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
          />
        </div>
      </div>

      {/* Dropdown */}
      {open && (
        <div
          className="absolute z-50 w-full mt-1 bg-[var(--bg-card)] border border-[var(--border-light)] rounded-[var(--radius-lg)] shadow-[var(--shadow-lg)] overflow-hidden animate-[dropdownIn_150ms_ease]"
        >
          {/* Search input */}
          {searchable && (
            <div className="px-3 py-2 border-b border-[var(--border-light)]">
              <div className="relative">
                <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
                <input
                  ref={inputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="搜索..."
                  className="w-full pl-8 pr-3 py-1.5 text-sm bg-[var(--bg-secondary)] border border-[var(--border-light)] rounded-[var(--radius-md)] text-[var(--text-primary)] focus:outline-none"
                  onClick={(e) => e.stopPropagation()}
                />
              </div>
            </div>
          )}

          {/* Options list */}
          <div
            className="overflow-y-auto"
            style={{ maxHeight: maxDropdownHeight }}
            role="listbox"
          >
            {filteredItems.length === 0 ? (
              <div className="px-3 py-4 text-sm text-[var(--text-muted)] text-center">
                无匹配选项
              </div>
            ) : (
              filteredItems.map((item, idx) =>
                isGroup(item) ? (
                  <div key={`group-${idx}`}>
                    <div className="px-3 py-1.5 text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider bg-[var(--bg-secondary)]">
                      {item.label}
                    </div>
                    {item.options.map(renderOptionItem)}
                  </div>
                ) : (
                  renderOptionItem(item)
                ),
              )
            )}
          </div>
        </div>
      )}

      {/* Inline keyframe */}
      <style>{`
        @keyframes dropdownIn {
          from { opacity: 0; transform: translateY(-4px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}

export type { SelectOption, SelectGroup };
