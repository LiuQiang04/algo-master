import { useState, useRef, useEffect, useCallback } from 'react';
import { X, Search, Plus, Check } from 'lucide-react';

export interface TagOption {
  id: string;
  label: string;
  color?: string;
}

interface TagSelectorProps {
  options: TagOption[];
  selected: string[];
  onChange: (selected: string[]) => void;
  maxSelected?: number;
  allowCreate?: boolean;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

const defaultColors = [
  '#3b82f6', // blue
  '#22c55e', // green
  '#f59e0b', // amber
  '#ef4444', // red
  '#8b5cf6', // violet
  '#06b6d4', // cyan
  '#ec4899', // pink
  '#f97316', // orange
];

export default function TagSelector({
  options,
  selected,
  onChange,
  maxSelected,
  allowCreate = false,
  placeholder = '选择标签...',
  className = '',
  disabled = false,
}: TagSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Focus input when opening
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const selectedTags = options.filter((opt) => selected.includes(opt.id));
  const isMaxReached = maxSelected !== undefined && selected.length >= maxSelected;

  // Filter options based on search
  const filteredOptions = options.filter((opt) =>
    opt.label.toLowerCase().includes(search.toLowerCase())
  );

  // Check if search text matches an existing option
  const exactMatch = options.some(
    (opt) => opt.label.toLowerCase() === search.toLowerCase()
  );

  const handleToggle = useCallback(
    (id: string) => {
      if (disabled) return;
      if (selected.includes(id)) {
        onChange(selected.filter((s) => s !== id));
      } else if (!isMaxReached) {
        onChange([...selected, id]);
      }
    },
    [selected, onChange, isMaxReached, disabled]
  );

  const handleRemove = useCallback(
    (id: string) => {
      if (disabled) return;
      onChange(selected.filter((s) => s !== id));
    },
    [selected, onChange, disabled]
  );

  const handleCreate = useCallback(() => {
    if (!allowCreate || !search.trim() || exactMatch || disabled) return;
    const newId = `custom-${Date.now()}`;
    const newOption: TagOption = {
      id: newId,
      label: search.trim(),
      color: defaultColors[options.length % defaultColors.length],
    };
    // Add to options (parent should handle this via onChange)
    onChange([...selected, newId]);
    setSearch('');
  }, [allowCreate, search, exactMatch, selected, onChange, options.length, disabled]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' && allowCreate && search.trim() && !exactMatch) {
        e.preventDefault();
        handleCreate();
      } else if (e.key === 'Escape') {
        setIsOpen(false);
      }
    },
    [allowCreate, search, exactMatch, handleCreate]
  );

  return (
    <div
      ref={containerRef}
      className={`relative ${className}`}
    >
      {/* Selected tags display */}
      <div
        className={`
          flex flex-wrap items-center gap-1.5 min-h-[40px] px-3 py-2
          border rounded-lg cursor-pointer transition-colors
          ${disabled
            ? 'bg-gray-50 border-gray-200 cursor-not-allowed'
            : isOpen
              ? 'border-blue-400 ring-2 ring-blue-100'
              : 'border-gray-300 hover:border-gray-400'
          }
        `}
        onClick={() => !disabled && setIsOpen(true)}
      >
        {selectedTags.length === 0 && !isOpen && (
          <span className="text-gray-400 text-sm">{placeholder}</span>
        )}

        {selectedTags.map((tag) => (
          <span
            key={tag.id}
            className="inline-flex items-center gap-1 px-2 py-0.5 text-sm rounded-full"
            style={{
              backgroundColor: tag.color ? `${tag.color}20` : '#f3f4f6',
              color: tag.color || '#374151',
            }}
          >
            {tag.label}
            {!disabled && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemove(tag.id);
                }}
                className="hover:opacity-70 transition-opacity"
              >
                <X size={14} />
              </button>
            )}
          </span>
        ))}

        {isOpen && (
          <input
            ref={inputRef}
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="搜索..."
            className="flex-1 min-w-[80px] outline-none text-sm bg-transparent"
            disabled={disabled}
          />
        )}
      </div>

      {/* Dropdown */}
      {isOpen && !disabled && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
          {/* Search results */}
          {filteredOptions.length > 0 ? (
            <div className="py-1">
              {filteredOptions.map((option) => {
                const isSelected = selected.includes(option.id);
                const isDisabled = !isSelected && isMaxReached;

                return (
                  <button
                    key={option.id}
                    type="button"
                    className={`
                      w-full flex items-center gap-2 px-3 py-2 text-sm text-left
                      transition-colors
                      ${isDisabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50 cursor-pointer'}
                      ${isSelected ? 'bg-blue-50' : ''}
                    `}
                    onClick={() => !isDisabled && handleToggle(option.id)}
                    disabled={isDisabled}
                  >
                    {option.color && (
                      <span
                        className="w-3 h-3 rounded-full flex-shrink-0"
                        style={{ backgroundColor: option.color }}
                      />
                    )}
                    <span className="flex-1">{option.label}</span>
                    {isSelected && (
                      <Check size={16} className="text-blue-500" />
                    )}
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="px-3 py-4 text-sm text-gray-500 text-center">
              未找到匹配项
            </div>
          )}

          {/* Create new tag option */}
          {allowCreate && search.trim() && !exactMatch && (
            <button
              type="button"
              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-blue-600 hover:bg-blue-50 transition-colors border-t border-gray-100"
              onClick={handleCreate}
              disabled={isMaxReached}
            >
              <Plus size={16} />
              <span>创建 "{search.trim()}"</span>
            </button>
          )}

          {/* Max selected indicator */}
          {maxSelected !== undefined && (
            <div className="px-3 py-2 text-xs text-gray-400 border-t border-gray-100">
              已选择 {selected.length}/{maxSelected}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
