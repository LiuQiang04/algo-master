import { useState, useCallback, useMemo, useRef, type ReactNode } from 'react';
import { ChevronRight, Search, GripVertical } from 'lucide-react';

/* ============================================
   Types
   ============================================ */

interface TreeNode {
  key: string;
  title: ReactNode;
  children?: TreeNode[];
  disabled?: boolean;
  icon?: ReactNode;
  /** Custom data attached to this node */
  [key: string]: unknown;
}

type SelectionMode = 'none' | 'single' | 'multiple';

interface TreeProps {
  /** Tree data */
  data: TreeNode[];
  /** Currently selected keys (controlled) */
  selectedKeys?: string[];
  /** Default selected keys (uncontrolled) */
  defaultSelectedKeys?: string[];
  /** Selection mode. Default: 'none' */
  selectionMode?: SelectionMode;
  /** Called when selection changes */
  onSelect?: (keys: string[], node: TreeNode) => void;
  /** Currently expanded keys (controlled) */
  expandedKeys?: string[];
  /** Default expanded keys (uncontrolled) */
  defaultExpandedKeys?: string[];
  /** Expand all nodes on mount. Default: false */
  defaultExpandAll?: boolean;
  /** Called when expansion changes */
  onExpand?: (keys: string[]) => void;
  /** Whether to show the search filter bar. Default: false */
  searchable?: boolean;
  /** Search placeholder text */
  searchPlaceholder?: string;
  /** Whether to enable drag-and-drop reordering. Default: false */
  draggable?: boolean;
  /** Called when a node is dropped onto another */
  onDrop?: (dragKey: string, dropKey: string, position: 'before' | 'after' | 'inside') => void;
  /** Render custom content for a node */
  renderNode?: (node: TreeNode) => ReactNode;
  /** Extra className for the wrapper */
  className?: string;
}

/* ============================================
   Helpers
   ============================================ */

/** Collect all keys from the tree */
function collectAllKeys(nodes: TreeNode[]): string[] {
  const keys: string[] = [];
  const walk = (list: TreeNode[]) => {
    for (const node of list) {
      keys.push(node.key);
      if (node.children?.length) walk(node.children);
    }
  };
  walk(nodes);
  return keys;
}

/** Check if a node or any descendant matches the search query */
function nodeMatchesQuery(node: TreeNode, query: string): boolean {
  const q = query.toLowerCase();
  if (typeof node.title === 'string' && node.title.toLowerCase().includes(q)) {
    return true;
  }
  return node.children?.some((child) => nodeMatchesQuery(child, q)) ?? false;
}

/** Filter tree data by search query */
function filterTree(nodes: TreeNode[], query: string): TreeNode[] {
  if (!query) return nodes;
  return nodes
    .filter((node) => nodeMatchesQuery(node, query))
    .map((node) => ({
      ...node,
      children: node.children ? filterTree(node.children, query) : undefined,
    }));
}

/** Find a node by key in the tree */
function findNode(nodes: TreeNode[], key: string): TreeNode | undefined {
  for (const node of nodes) {
    if (node.key === key) return node;
    if (node.children) {
      const found = findNode(node.children, key);
      if (found) return found;
    }
  }
  return undefined;
}

/* ============================================
   TreeItem (internal)
   ============================================ */

interface TreeItemProps {
  node: TreeNode;
  depth: number;
  expandedKeys: Set<string>;
  selectedKeys: Set<string>;
  selectionMode: SelectionMode;
  onToggleExpand: (key: string) => void;
  onToggleSelect: (key: string, node: TreeNode) => void;
  renderNode?: (node: TreeNode) => ReactNode;
  draggable: boolean;
  onDragStart: (key: string) => void;
  onDragOver: (e: React.DragEvent, key: string) => void;
  onDrop: (key: string) => void;
  onDragEnd: () => void;
  dragOverKey: string | null;
  dragPosition: 'before' | 'after' | 'inside' | null;
}

function TreeItem({
  node,
  depth,
  expandedKeys,
  selectedKeys,
  selectionMode,
  onToggleExpand,
  onToggleSelect,
  renderNode,
  draggable,
  onDragStart,
  onDragOver,
  onDrop,
  onDragEnd,
  dragOverKey,
  dragPosition,
}: TreeItemProps) {
  const hasChildren = node.children && node.children.length > 0;
  const isExpanded = expandedKeys.has(node.key);
  const isSelected = selectedKeys.has(node.key);
  const isDragOver = dragOverKey === node.key;

  return (
    <div>
      {/* Node row */}
      <div
        className={`
          flex items-center gap-1.5 py-1.5 px-2 rounded-[var(--radius-md)] cursor-pointer
          transition-colors group relative
          ${isSelected
            ? 'bg-[var(--primary-50)] text-[var(--primary-700)]'
            : 'hover:bg-[var(--bg-card-hover)] text-[var(--text-primary)]'
          }
          ${node.disabled ? 'opacity-50 cursor-not-allowed' : ''}
        `}
        style={{ paddingLeft: depth * 20 + 8 }}
        draggable={draggable && !node.disabled}
        onDragStart={draggable ? (e) => { e.stopPropagation(); onDragStart(node.key); } : undefined}
        onDragOver={draggable ? (e) => { e.preventDefault(); onDragOver(e, node.key); } : undefined}
        onDrop={draggable ? (e) => { e.preventDefault(); e.stopPropagation(); onDrop(node.key); } : undefined}
        onDragEnd={draggable ? onDragEnd : undefined}
        onClick={() => !node.disabled && onToggleSelect(node.key, node)}
      >
        {/* Drag handle */}
        {draggable && (
          <span className="opacity-0 group-hover:opacity-40 transition-opacity cursor-grab active:cursor-grabbing">
            <GripVertical size={14} />
          </span>
        )}

        {/* Expand/collapse chevron */}
        {hasChildren ? (
          <button
            className="flex items-center justify-center w-5 h-5 shrink-0 hover:bg-[var(--bg-tertiary)] rounded transition-colors"
            onClick={(e) => {
              e.stopPropagation();
              onToggleExpand(node.key);
            }}
            aria-label={isExpanded ? '折叠' : '展开'}
          >
            <ChevronRight
              size={14}
              className={`text-[var(--text-muted)] transition-transform duration-200 ${isExpanded ? 'rotate-90' : ''}`}
            />
          </button>
        ) : (
          <span className="w-5 h-5 shrink-0" />
        )}

        {/* Custom icon */}
        {node.icon && <span className="shrink-0">{node.icon}</span>}

        {/* Selection indicator (checkbox for multiple, dot for single) */}
        {selectionMode === 'multiple' && (
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

        {/* Title */}
        <span className="flex-1 text-sm truncate select-none">
          {renderNode ? renderNode(node) : node.title}
        </span>

        {/* Drag-over indicator */}
        {isDragOver && dragPosition && (
          <div
            className={`absolute left-0 right-0 pointer-events-none ${
              dragPosition === 'before'
                ? 'top-0 border-t-2 border-[var(--primary-500)]'
                : dragPosition === 'after'
                  ? 'bottom-0 border-b-2 border-[var(--primary-500)]'
                  : 'inset-0 border-2 border-[var(--primary-500)] rounded-[var(--radius-md)] bg-[var(--primary-50)] opacity-30'
            }`}
          />
        )}
      </div>

      {/* Children */}
      {hasChildren && isExpanded && (
        <div>
          {node.children!.map((child) => (
            <TreeItem
              key={child.key}
              node={child}
              depth={depth + 1}
              expandedKeys={expandedKeys}
              selectedKeys={selectedKeys}
              selectionMode={selectionMode}
              onToggleExpand={onToggleExpand}
              onToggleSelect={onToggleSelect}
              renderNode={renderNode}
              draggable={draggable}
              onDragStart={onDragStart}
              onDragOver={onDragOver}
              onDrop={onDrop}
              onDragEnd={onDragEnd}
              dragOverKey={dragOverKey}
              dragPosition={dragPosition}
            />
          ))}
        </div>
      )}
    </div>
  );
}

/* ============================================
   Tree (main)
   ============================================ */

export default function Tree({
  data,
  selectedKeys: controlledSelectedKeys,
  defaultSelectedKeys = [],
  selectionMode = 'none',
  onSelect,
  expandedKeys: controlledExpandedKeys,
  defaultExpandedKeys,
  defaultExpandAll = false,
  onExpand,
  searchable = false,
  searchPlaceholder = '搜索节点...',
  draggable = false,
  onDrop: onDropProp,
  renderNode,
  className = '',
}: TreeProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [internalExpanded, setInternalExpanded] = useState<Set<string>>(
    () => new Set(
      defaultExpandAll
        ? collectAllKeys(data)
        : defaultExpandedKeys ?? [],
    ),
  );
  const [internalSelected, setInternalSelected] = useState<Set<string>>(
    () => new Set(defaultSelectedKeys),
  );

  // Drag state
  const dragKeyRef = useRef<string | null>(null);
  const [dragOverKey, setDragOverKey] = useState<string | null>(null);
  const [dragPosition, setDragPosition] = useState<'before' | 'after' | 'inside' | null>(null);

  const expandedKeys = controlledExpandedKeys
    ? new Set(controlledExpandedKeys)
    : internalExpanded;
  const selectedKeys = controlledSelectedKeys
    ? new Set(controlledSelectedKeys)
    : internalSelected;

  const filteredData = useMemo(() => filterTree(data, searchQuery), [data, searchQuery]);

  const handleToggleExpand = useCallback(
    (key: string) => {
      const next = new Set(expandedKeys);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      if (controlledExpandedKeys === undefined) {
        setInternalExpanded(next);
      }
      onExpand?.(Array.from(next));
    },
    [expandedKeys, controlledExpandedKeys, onExpand],
  );

  const handleToggleSelect = useCallback(
    (key: string, node: TreeNode) => {
      if (selectionMode === 'none') return;

      let next: Set<string>;
      if (selectionMode === 'single') {
        next = new Set(selectedKeys.has(key) ? [] : [key]);
      } else {
        next = new Set(selectedKeys);
        if (next.has(key)) {
          next.delete(key);
        } else {
          next.add(key);
        }
      }

      if (controlledSelectedKeys === undefined) {
        setInternalSelected(next);
      }
      onSelect?.(Array.from(next), node);
    },
    [selectedKeys, selectionMode, controlledSelectedKeys, onSelect],
  );

  // Drag handlers
  const handleDragStart = useCallback((key: string) => {
    dragKeyRef.current = key;
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent, key: string) => {
    e.preventDefault();
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const y = e.clientY - rect.top;
    const height = rect.height;

    let position: 'before' | 'after' | 'inside';
    if (y < height * 0.25) {
      position = 'before';
    } else if (y > height * 0.75) {
      position = 'after';
    } else {
      position = 'inside';
    }

    setDragOverKey(key);
    setDragPosition(position);
  }, []);

  const handleDrop = useCallback(
    (dropKey: string) => {
      const dragKey = dragKeyRef.current;
      if (dragKey && dragKey !== dropKey && dragPosition) {
        onDropProp?.(dragKey, dropKey, dragPosition);
      }
      dragKeyRef.current = null;
      setDragOverKey(null);
      setDragPosition(null);
    },
    [dragPosition, onDropProp],
  );

  const handleDragEnd = useCallback(() => {
    dragKeyRef.current = null;
    setDragOverKey(null);
    setDragPosition(null);
  }, []);

  return (
    <div className={`select-none ${className}`}>
      {/* Search bar */}
      {searchable && (
        <div className="relative mb-2">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={searchPlaceholder}
            className="w-full pl-8 pr-3 py-2 text-sm border border-[var(--border-light)] rounded-[var(--radius-md)] bg-[var(--bg-card)] text-[var(--text-primary)] focus:outline-none focus:border-[var(--primary-400)]"
          />
        </div>
      )}

      {/* Tree nodes */}
      {filteredData.length > 0 ? (
        filteredData.map((node) => (
          <TreeItem
            key={node.key}
            node={node}
            depth={0}
            expandedKeys={expandedKeys}
            selectedKeys={selectedKeys}
            selectionMode={selectionMode}
            onToggleExpand={handleToggleExpand}
            onToggleSelect={handleToggleSelect}
            renderNode={renderNode}
            draggable={draggable}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            onDragEnd={handleDragEnd}
            dragOverKey={dragOverKey}
            dragPosition={dragPosition}
          />
        ))
      ) : (
        <div className="py-6 text-center text-sm text-[var(--text-muted)]">
          没有匹配的节点
        </div>
      )}
    </div>
  );
}

export type { TreeNode };
