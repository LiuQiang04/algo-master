import { useState, useCallback, useRef, useEffect, type ReactNode } from 'react';
import { ChevronDown } from 'lucide-react';

export interface CollapseItem {
  key: string;
  title: ReactNode;
  content: ReactNode;
  disabled?: boolean;
  extra?: ReactNode;
}

interface CollapseProps {
  items: CollapseItem[];
  defaultActiveKey?: string[];
  activeKey?: string[];
  onChange?: (keys: string[]) => void;
  accordion?: boolean;
  expandIcon?: ReactNode | ((isActive: boolean) => ReactNode);
  className?: string;
  bordered?: boolean;
}

function CollapsePanel({
  item,
  isActive,
  onToggle,
  expandIcon,
  bordered,
}: {
  item: CollapseItem;
  isActive: boolean;
  onToggle: () => void;
  expandIcon?: ReactNode | ((isActive: boolean) => ReactNode);
  bordered: boolean;
}) {
  const contentRef = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState<number | undefined>(undefined);

  // Measure content height for animation
  useEffect(() => {
    if (contentRef.current) {
      setHeight(contentRef.current.scrollHeight);
    }
  }, [item.content, isActive]);

  // Re-measure on window resize
  useEffect(() => {
    const handleResize = () => {
      if (contentRef.current && isActive) {
        setHeight(contentRef.current.scrollHeight);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isActive]);

  const renderExpandIcon = () => {
    if (typeof expandIcon === 'function') {
      return expandIcon(isActive);
    }
    if (expandIcon) {
      return expandIcon;
    }
    return (
      <ChevronDown
        size={16}
        className={`transform transition-transform duration-200 ${isActive ? 'rotate-180' : ''}`}
      />
    );
  };

  return (
    <div
      className={`
        ${bordered ? 'border border-gray-200 rounded-lg mb-2' : 'border-b border-gray-200 last:border-b-0'}
        ${item.disabled ? 'opacity-50' : ''}
      `}
    >
      {/* Header */}
      <button
        type="button"
        className={`
          w-full flex items-center gap-3 px-4 py-3 text-left
          transition-colors duration-150
          ${item.disabled ? 'cursor-not-allowed' : 'cursor-pointer hover:bg-gray-50'}
          ${bordered ? 'rounded-t-lg' : ''}
        `}
        onClick={item.disabled ? undefined : onToggle}
        aria-expanded={isActive}
        disabled={item.disabled}
      >
        <span className="flex-shrink-0 text-gray-400">
          {renderExpandIcon()}
        </span>
        <span className="flex-1 font-medium text-gray-900">
          {item.title}
        </span>
        {item.extra && (
          <span className="flex-shrink-0 text-gray-500">
            {item.extra}
          </span>
        )}
      </button>

      {/* Content */}
      <div
        className="overflow-hidden transition-all duration-200 ease-in-out"
        style={{
          height: isActive ? (height ? `${height}px` : 'auto') : '0px',
          opacity: isActive ? 1 : 0,
        }}
      >
        <div
          ref={contentRef}
          className={`px-4 pb-4 ${bordered ? '' : 'pt-0'}`}
        >
          {item.content}
        </div>
      </div>
    </div>
  );
}

export default function Collapse({
  items,
  defaultActiveKey = [],
  activeKey: controlledActiveKey,
  onChange,
  accordion = false,
  expandIcon,
  className = '',
  bordered = true,
}: CollapseProps) {
  const [internalActiveKey, setInternalActiveKey] = useState<string[]>(defaultActiveKey);

  // Use controlled or uncontrolled active key
  const activeKey = controlledActiveKey ?? internalActiveKey;

  const handleToggle = useCallback(
    (key: string) => {
      let newActiveKey: string[];

      if (accordion) {
        // Accordion mode: only one panel can be open
        newActiveKey = activeKey.includes(key) ? [] : [key];
      } else {
        // Normal mode: toggle individual panels
        newActiveKey = activeKey.includes(key)
          ? activeKey.filter((k) => k !== key)
          : [...activeKey, key];
      }

      setInternalActiveKey(newActiveKey);
      onChange?.(newActiveKey);
    },
    [activeKey, accordion, onChange]
  );

  return (
    <div className={className}>
      {items.map((item) => (
        <CollapsePanel
          key={item.key}
          item={item}
          isActive={activeKey.includes(item.key)}
          onToggle={() => handleToggle(item.key)}
          expandIcon={expandIcon}
          bordered={bordered}
        />
      ))}
    </div>
  );
}
