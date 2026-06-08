import { useState, useCallback, type ReactNode } from 'react';

type TabOrientation = 'horizontal' | 'vertical';

interface TabItem {
  /** Unique key identifying this tab */
  key: string;
  /** Label displayed on the tab button */
  label: ReactNode;
  /** Content rendered when this tab is active */
  content: ReactNode;
  /** Whether this tab is disabled */
  disabled?: boolean;
}

interface TabsProps {
  /** Array of tab definitions */
  items: TabItem[];
  /** Controlled active key */
  activeKey?: string;
  /** Default active key (uncontrolled) */
  defaultActiveKey?: string;
  /** Called when the active tab changes */
  onChange?: (key: string) => void;
  /** Layout orientation. Default: 'horizontal' */
  orientation?: TabOrientation;
  /** Extra className for the wrapper */
  className?: string;
  /** Extra className for the tab list */
  tabListClassName?: string;
  /** Extra className for the tab panel area */
  tabPanelClassName?: string;
}

export default function Tabs({
  items,
  activeKey: controlledKey,
  defaultActiveKey,
  onChange,
  orientation = 'horizontal',
  className = '',
  tabListClassName = '',
  tabPanelClassName = '',
}: TabsProps) {
  const firstEnabled = items.find((i) => !i.disabled)?.key ?? items[0]?.key ?? '';
  const [internalKey, setInternalKey] = useState(defaultActiveKey ?? firstEnabled);

  const activeKey = controlledKey ?? internalKey;
  const activeItem = items.find((i) => i.key === activeKey);

  const handleTabClick = useCallback(
    (key: string) => {
      if (controlledKey === undefined) {
        setInternalKey(key);
      }
      onChange?.(key);
    },
    [controlledKey, onChange],
  );

  const isVertical = orientation === 'vertical';

  return (
    <div
      className={`flex ${isVertical ? 'flex-row gap-0' : 'flex-col'} ${className}`}
    >
      {/* Tab list */}
      <div
        role="tablist"
        aria-orientation={orientation}
        className={`
          flex shrink-0
          ${isVertical
            ? 'flex-col border-r border-[var(--border-light)] pr-0'
            : 'flex-row border-b border-[var(--border-light)] gap-0'
          }
          ${tabListClassName}
        `}
      >
        {items.map((item) => {
          const isActive = item.key === activeKey;
          return (
            <button
              key={item.key}
              role="tab"
              aria-selected={isActive}
              aria-disabled={item.disabled}
              disabled={item.disabled}
              onClick={() => !item.disabled && handleTabClick(item.key)}
              className={`
                relative px-4 py-2.5 text-sm font-medium transition-colors
                ${isVertical
                  ? 'text-left border-r-2 -mr-px'
                  : 'text-center border-b-2 -mb-px'
                }
                ${isActive
                  ? 'text-[var(--primary-600)] border-[var(--primary-600)]'
                  : item.disabled
                    ? 'text-[var(--text-muted)] border-transparent cursor-not-allowed'
                    : 'text-[var(--text-secondary)] border-transparent hover:text-[var(--text-primary)] hover:border-[var(--border-default)]'
                }
              `}
            >
              {item.label}
            </button>
          );
        })}
      </div>

      {/* Tab panel */}
      <div
        role="tabpanel"
        className={`flex-1 ${isVertical ? 'pl-4' : 'pt-4'} ${tabPanelClassName}`}
      >
        {activeItem?.content ?? null}
      </div>
    </div>
  );
}
