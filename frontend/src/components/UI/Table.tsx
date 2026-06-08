import { useState, useMemo, useCallback, type ReactNode } from 'react';
import { ChevronUp, ChevronDown, ChevronsUpDown, ChevronLeft, ChevronRight } from 'lucide-react';

// Column definition
export interface TableColumn<T = Record<string, unknown>> {
  key: string;
  title: string;
  sortable?: boolean;
  filterable?: boolean;
  width?: number | string;
  align?: 'left' | 'center' | 'right';
  render?: (value: unknown, record: T, index: number) => ReactNode;
  filterOptions?: { label: string; value: string }[];
}

// Sort state
interface SortState {
  key: string;
  direction: 'asc' | 'desc';
}

// Pagination config
interface PaginationConfig {
  pageSize: number;
  showSizeChanger?: boolean;
  pageSizeOptions?: number[];
}

// Table props
interface TableProps<T = Record<string, unknown>> {
  columns: TableColumn<T>[];
  data: T[];
  rowKey?: string | ((record: T) => string);
  pagination?: PaginationConfig;
  onSelect?: (selectedKeys: string[]) => void;
  selectedRowKeys?: string[];
  loading?: boolean;
  emptyText?: string;
  className?: string;
  striped?: boolean;
  bordered?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

type SortDirection = 'asc' | 'desc';

const sizeStyles = {
  sm: 'text-xs',
  md: 'text-sm',
  lg: 'text-base',
};

const cellPadding = {
  sm: 'px-3 py-1.5',
  md: 'px-4 py-2.5',
  lg: 'px-5 py-3',
};

export default function Table<T extends Record<string, unknown>>({
  columns,
  data,
  rowKey = 'id',
  pagination,
  onSelect,
  selectedRowKeys: controlledSelectedKeys,
  loading = false,
  emptyText = '暂无数据',
  className = '',
  striped = true,
  bordered = false,
  size = 'md',
}: TableProps<T>) {
  // Sort state
  const [sort, setSort] = useState<SortState | null>(null);

  // Filter state
  const [filters, setFilters] = useState<Record<string, string>>({});

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(pagination?.pageSize || 10);

  // Selection state
  const [internalSelectedKeys, setInternalSelectedKeys] = useState<string[]>([]);
  const selectedKeys = controlledSelectedKeys ?? internalSelectedKeys;

  // Get row key
  const getRowKey = useCallback(
    (record: T, index: number): string => {
      if (typeof rowKey === 'function') return rowKey(record);
      return String(record[rowKey] ?? index);
    },
    [rowKey]
  );

  // Handle sort
  const handleSort = useCallback(
    (key: string) => {
      setSort((prev) => {
        if (prev?.key === key) {
          if (prev.direction === 'asc') return { key, direction: 'desc' };
          return null; // Remove sort
        }
        return { key, direction: 'asc' };
      });
      setCurrentPage(1);
    },
    []
  );

  // Handle filter
  const handleFilter = useCallback(
    (key: string, value: string) => {
      setFilters((prev) => {
        const next = { ...prev };
        if (value) {
          next[key] = value;
        } else {
          delete next[key];
        }
        return next;
      });
      setCurrentPage(1);
    },
    []
  );

  // Apply filters and sort
  const processedData = useMemo(() => {
    let result = [...data];

    // Apply filters
    Object.entries(filters).forEach(([key, value]) => {
      result = result.filter((record) => {
        const cellValue = String(record[key] ?? '').toLowerCase();
        return cellValue.includes(value.toLowerCase());
      });
    });

    // Apply sort
    if (sort) {
      result.sort((a, b) => {
        const aVal = a[sort.key];
        const bVal = b[sort.key];

        if (aVal === bVal) return 0;
        if (aVal === null || aVal === undefined) return 1;
        if (bVal === null || bVal === undefined) return -1;

        const comparison = String(aVal).localeCompare(String(bVal), undefined, { numeric: true });
        return sort.direction === 'asc' ? comparison : -comparison;
      });
    }

    return result;
  }, [data, filters, sort]);

  // Pagination
  const totalItems = processedData.length;
  const totalPages = Math.ceil(totalItems / pageSize);
  const paginatedData = useMemo(() => {
    if (!pagination) return processedData;
    const start = (currentPage - 1) * pageSize;
    return processedData.slice(start, start + pageSize);
  }, [processedData, currentPage, pageSize, pagination]);

  // Selection handlers
  const handleSelectAll = useCallback(
    (checked: boolean) => {
      const newKeys = checked ? paginatedData.map((record, i) => getRowKey(record, i)) : [];
      setInternalSelectedKeys(newKeys);
      onSelect?.(newKeys);
    },
    [paginatedData, getRowKey, onSelect]
  );

  const handleSelectRow = useCallback(
    (key: string, checked: boolean) => {
      const newKeys = checked
        ? [...selectedKeys, key]
        : selectedKeys.filter((k) => k !== key);
      setInternalSelectedKeys(newKeys);
      onSelect?.(newKeys);
    },
    [selectedKeys, onSelect]
  );

  const isAllSelected = paginatedData.length > 0 && paginatedData.every((record, i) => selectedKeys.includes(getRowKey(record, i)));
  const isIndeterminate = selectedKeys.length > 0 && !isAllSelected;

  // Render sort icon
  const renderSortIcon = (columnKey: string) => {
    if (sort?.key === columnKey) {
      return sort.direction === 'asc' ? (
        <ChevronUp size={14} className="text-blue-500" />
      ) : (
        <ChevronDown size={14} className="text-blue-500" />
      );
    }
    return <ChevronsUpDown size={14} className="text-gray-400" />;
  };

  // Render filter
  const renderFilter = (column: TableColumn<T>) => {
    if (!column.filterable) return null;

    if (column.filterOptions) {
      return (
        <select
          className="mt-1 w-full text-xs border border-gray-200 rounded px-1 py-0.5 bg-white"
          value={filters[column.key] || ''}
          onChange={(e) => handleFilter(column.key, e.target.value)}
        >
          <option value="">全部</option>
          {column.filterOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      );
    }

    return (
      <input
        type="text"
        className="mt-1 w-full text-xs border border-gray-200 rounded px-1 py-0.5"
        placeholder="筛选..."
        value={filters[column.key] || ''}
        onChange={(e) => handleFilter(column.key, e.target.value)}
      />
    );
  };

  return (
    <div className={`overflow-x-auto ${className}`}>
      <table className={`w-full ${sizeStyles[size]} ${bordered ? 'border border-gray-200' : ''}`}>
        {/* Header */}
        <thead>
          <tr className="bg-gray-50 border-b border-gray-200">
            {/* Select all checkbox */}
            {onSelect && (
              <th className={`${cellPadding[size]} w-10`}>
                <input
                  type="checkbox"
                  checked={isAllSelected}
                  ref={(el) => {
                    if (el) el.indeterminate = isIndeterminate;
                  }}
                  onChange={(e) => handleSelectAll(e.target.checked)}
                  className="rounded border-gray-300"
                />
              </th>
            )}

            {columns.map((column) => (
              <th
                key={column.key}
                className={`
                  ${cellPadding[size]} font-semibold text-gray-600
                  ${column.sortable ? 'cursor-pointer select-none hover:bg-gray-100' : ''}
                  ${column.align === 'center' ? 'text-center' : column.align === 'right' ? 'text-right' : 'text-left'}
                `}
                style={{ width: column.width }}
                onClick={column.sortable ? () => handleSort(column.key) : undefined}
              >
                <div className="flex items-center gap-1">
                  <span>{column.title}</span>
                  {column.sortable && renderSortIcon(column.key)}
                </div>
                {renderFilter(column)}
              </th>
            ))}
          </tr>
        </thead>

        {/* Body */}
        <tbody>
          {loading ? (
            <tr>
              <td
                colSpan={columns.length + (onSelect ? 1 : 0)}
                className="text-center py-8 text-gray-500"
              >
                <div className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  <span>加载中...</span>
                </div>
              </td>
            </tr>
          ) : paginatedData.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length + (onSelect ? 1 : 0)}
                className="text-center py-8 text-gray-500"
              >
                {emptyText}
              </td>
            </tr>
          ) : (
            paginatedData.map((record, rowIndex) => {
              const key = getRowKey(record, rowIndex);
              const isSelected = selectedKeys.includes(key);

              return (
                <tr
                  key={key}
                  className={`
                    border-b border-gray-100 transition-colors
                    ${isSelected ? 'bg-blue-50' : striped && rowIndex % 2 === 1 ? 'bg-gray-50' : ''}
                    hover:bg-gray-100
                  `}
                >
                  {/* Row checkbox */}
                  {onSelect && (
                    <td className={cellPadding[size]}>
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={(e) => handleSelectRow(key, e.target.checked)}
                        className="rounded border-gray-300"
                      />
                    </td>
                  )}

                  {columns.map((column, colIndex) => {
                    const value = record[column.key];
                    const rendered = column.render
                      ? column.render(value, record, rowIndex)
                      : (value as ReactNode);

                    return (
                      <td
                        key={column.key}
                        className={`
                          ${cellPadding[size]}
                          ${column.align === 'center' ? 'text-center' : column.align === 'right' ? 'text-right' : 'text-left'}
                        `}
                      >
                        {rendered}
                      </td>
                    );
                  })}
                </tr>
              );
            })
          )}
        </tbody>
      </table>

      {/* Pagination */}
      {pagination && totalPages > 1 && (
        <div className="flex items-center justify-between mt-4 px-2">
          <div className="text-sm text-gray-500">
            共 {totalItems} 条
          </div>

          <div className="flex items-center gap-2">
            {/* Page size selector */}
            {pagination.showSizeChanger && (
              <select
                className="text-sm border border-gray-200 rounded px-2 py-1"
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setCurrentPage(1);
                }}
              >
                {(pagination.pageSizeOptions || [10, 20, 50, 100]).map((size) => (
                  <option key={size} value={size}>
                    {size} 条/页
                  </option>
                ))}
              </select>
            )}

            {/* Page buttons */}
            <div className="flex items-center gap-1">
              <button
                className="p-1 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => p - 1)}
              >
                <ChevronLeft size={16} />
              </button>

              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let page: number;
                if (totalPages <= 5) {
                  page = i + 1;
                } else if (currentPage <= 3) {
                  page = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  page = totalPages - 4 + i;
                } else {
                  page = currentPage - 2 + i;
                }

                return (
                  <button
                    key={page}
                    className={`
                      w-8 h-8 rounded text-sm font-medium transition-colors
                      ${page === currentPage
                        ? 'bg-blue-500 text-white'
                        : 'hover:bg-gray-100 text-gray-700'
                      }
                    `}
                    onClick={() => setCurrentPage(page)}
                  >
                    {page}
                  </button>
                );
              })}

              <button
                className="p-1 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((p) => p + 1)}
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
