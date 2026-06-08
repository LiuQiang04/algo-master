import { useState, useRef, useEffect, useCallback, type ReactNode } from 'react';
import { ChevronRight } from 'lucide-react';

// Menu item types
interface DropdownItemBase {
  label?: string;
  disabled?: boolean;
  danger?: boolean;
}

interface DropdownActionItem extends DropdownItemBase {
  type?: 'item';
  icon?: ReactNode;
  shortcut?: string;
  onClick?: () => void;
  children?: DropdownItem[];
}

interface DropdownSeparator {
  type: 'separator';
}

interface DropdownHeader {
  type: 'header';
  label: string;
}

export type DropdownItem = DropdownActionItem | DropdownSeparator | DropdownHeader;

interface DropdownProps {
  trigger: ReactNode;
  items: DropdownItem[];
  align?: 'left' | 'right';
  width?: number;
  className?: string;
}

export default function Dropdown({
  trigger,
  items,
  align = 'left',
  width = 200,
  className = '',
}: DropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeSubmenu, setActiveSubmenu] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const submenuTimeoutRef = useRef<ReturnType<typeof setTimeout>>();

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
        setActiveSubmenu(null);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close on Escape
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        setIsOpen(false);
        setActiveSubmenu(null);
      }
    }
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen]);

  const handleItemClick = useCallback((item: DropdownActionItem) => {
    if (item.disabled) return;
    if (!item.children?.length) {
      item.onClick?.();
      setIsOpen(false);
      setActiveSubmenu(null);
    }
  }, []);

  const handleSubmenuEnter = useCallback((index: number) => {
    if (submenuTimeoutRef.current) {
      clearTimeout(submenuTimeoutRef.current);
    }
    setActiveSubmenu(index);
  }, []);

  const handleSubmenuLeave = useCallback(() => {
    submenuTimeoutRef.current = setTimeout(() => {
      setActiveSubmenu(null);
    }, 150);
  }, []);

  const isSeparator = (item: DropdownItem): item is DropdownSeparator => item.type === 'separator';
  const isHeader = (item: DropdownItem): item is DropdownHeader => item.type === 'header';

  const renderItem = (item: DropdownItem, index: number) => {
    if (isSeparator(item)) {
      return <div key={index} className="h-px bg-gray-200 my-1" />;
    }

    if (isHeader(item)) {
      return (
        <div key={index} className="px-3 py-1.5 text-xs font-semibold text-gray-400 uppercase">
          {item.label}
        </div>
      );
    }

    const actionItem = item as DropdownActionItem;
    const hasChildren = actionItem.children && actionItem.children.length > 0;

    return (
      <div
        key={index}
        className="relative"
        onMouseEnter={() => hasChildren && handleSubmenuEnter(index)}
        onMouseLeave={handleSubmenuLeave}
      >
        <button
          type="button"
          className={`
            w-full flex items-center gap-2 px-3 py-2 text-sm text-left
            transition-colors rounded-md mx-0.5
            ${actionItem.disabled
              ? 'text-gray-400 cursor-not-allowed'
              : actionItem.danger
                ? 'text-red-600 hover:bg-red-50 cursor-pointer'
                : 'text-gray-700 hover:bg-gray-100 cursor-pointer'
            }
          `}
          onClick={() => handleItemClick(actionItem)}
          disabled={actionItem.disabled}
        >
          {actionItem.icon && (
            <span className="w-4 h-4 flex-shrink-0">{actionItem.icon}</span>
          )}
          <span className="flex-1">{actionItem.label}</span>
          {actionItem.shortcut && (
            <span className="text-xs text-gray-400 ml-2">{actionItem.shortcut}</span>
          )}
          {hasChildren && (
            <ChevronRight size={14} className="text-gray-400" />
          )}
        </button>

        {/* Submenu */}
        {hasChildren && activeSubmenu === index && (
          <div
            className="absolute left-full top-0 ml-1 bg-white border border-gray-200 rounded-lg shadow-lg py-1"
            style={{ minWidth: width }}
            onMouseEnter={() => handleSubmenuEnter(index)}
            onMouseLeave={handleSubmenuLeave}
          >
            {actionItem.children!.map((child, childIndex) => renderItem(child, childIndex))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div ref={containerRef} className={`relative inline-block ${className}`}>
      {/* Trigger */}
      <div onClick={() => setIsOpen(!isOpen)}>
        {trigger}
      </div>

      {/* Dropdown menu */}
      {isOpen && (
        <div
          className={`
            absolute z-50 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg py-1
            animate-in fade-in zoom-in-95 duration-100
            ${align === 'right' ? 'right-0' : 'left-0'}
          `}
          style={{ minWidth: width }}
        >
          {items.map((item, index) => renderItem(item, index))}
        </div>
      )}
    </div>
  );
}
