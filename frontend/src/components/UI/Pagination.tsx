import { useState, useCallback, useMemo } from 'react';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';

interface PaginationProps {
  /** Current active page (1-indexed) */
  currentPage: number;
  /** Total number of pages */
  totalPages: number;
  /** Total number of items across all pages */
  totalItems: number;
  /** Number of items per page */
  pageSize: number;
  /** Called when the page changes */
  onPageChange: (page: number) => void;
  /** Called when the page size changes */
  onPageSizeChange?: (size: number) => void;
  /** Available page size options. Default: [10, 20, 50, 100] */
  pageSizeOptions?: number[];
  /** Maximum number of visible page buttons. Default: 7 */
  siblingCount?: number;
  /** Show the page-size selector. Default: true */
  showSizeChanger?: boolean;
  /** Show "X-Y of Z" info. Default: true */
  showTotal?: boolean;
  /** Show quick jump input. Default: true */
  showQuickJumper?: boolean;
  /** Extra className for the wrapper */
  className?: string;
}

const defaultPageSizes = [10, 20, 50, 100];

/**
 * Generate the array of page numbers and ellipsis markers to display.
 * Always shows first page, last page, current page and its siblings,
 * with '...' filling the gaps.
 */
function generatePageRange(
  currentPage: number,
  totalPages: number,
  maxButtons: number,
): (number | 'ellipsis')[] {
  // If total pages fit within maxButtons, show them all
  if (totalPages <= maxButtons) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  const pages: (number | 'ellipsis')[] = [];
  const leftSibling = Math.max(currentPage - 1, 2);
  const rightSibling = Math.min(currentPage + 1, totalPages - 1);

  pages.push(1);

  if (leftSibling > 2) {
    pages.push('ellipsis');
  }

  for (let i = leftSibling; i <= rightSibling; i++) {
    pages.push(i);
  }

  if (rightSibling < totalPages - 1) {
    pages.push('ellipsis');
  }

  pages.push(totalPages);

  return pages;
}

export default function Pagination({
  currentPage,
  totalPages,
  totalItems,
  pageSize,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = defaultPageSizes,
  siblingCount = 2,
  showSizeChanger = true,
  showTotal = true,
  showQuickJumper = true,
  className = '',
}: PaginationProps) {
  const [jumpValue, setJumpValue] = useState('');

  // Max visible buttons: first + last + current + siblings*2 + 2 ellipsis
  const maxButtons = siblingCount * 2 + 5;
  const pages = useMemo(
    () => generatePageRange(currentPage, totalPages, maxButtons),
    [currentPage, totalPages, maxButtons],
  );

  const startItem = (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalItems);

  const handleJump = useCallback(() => {
    const page = parseInt(jumpValue, 10);
    if (!isNaN(page) && page >= 1 && page <= totalPages && page !== currentPage) {
      onPageChange(page);
      setJumpValue('');
    }
  }, [jumpValue, totalPages, currentPage, onPageChange]);

  const handleJumpKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') handleJump();
    },
    [handleJump],
  );

  if (totalPages <= 0) return null;

  const btnBase =
    'flex items-center justify-center border transition-colors';
  const btnEnabled =
    'text-[var(--text-primary)] border-[var(--border-light)] hover:border-[var(--primary-400)] hover:text-[var(--primary-600)]';
  const btnDisabled =
    'text-[var(--text-muted)] border-[var(--border-light)] opacity-50 cursor-not-allowed';

  return (
    <div
      className={`flex flex-wrap items-center justify-center gap-3 py-3 ${className}`}
    >
      {/* Total info */}
      {showTotal && (
        <span className="text-sm text-[var(--text-tertiary)] mr-2">
          {startItem}-{endItem} / {totalItems}
        </span>
      )}

      {/* First page */}
      <button
        className={`${btnBase} w-8 h-8 rounded-[var(--radius-md)] ${currentPage <= 1 ? btnDisabled : btnEnabled}`}
        disabled={currentPage <= 1}
        onClick={() => onPageChange(1)}
        aria-label="第一页"
      >
        <ChevronsLeft size={14} />
      </button>

      {/* Previous page */}
      <button
        className={`${btnBase} w-8 h-8 rounded-[var(--radius-md)] ${currentPage <= 1 ? btnDisabled : btnEnabled}`}
        disabled={currentPage <= 1}
        onClick={() => onPageChange(currentPage - 1)}
        aria-label="上一页"
      >
        <ChevronLeft size={14} />
      </button>

      {/* Page buttons */}
      {pages.map((p, idx) =>
        p === 'ellipsis' ? (
          <span
            key={`e-${idx}`}
            className="flex items-center justify-center w-8 h-8 text-sm text-[var(--text-muted)]"
          >
            ...
          </span>
        ) : (
          <button
            key={p}
            onClick={() => onPageChange(p)}
            className={`${btnBase} w-8 h-8 rounded-[var(--radius-md)] text-sm font-medium ${
              p === currentPage
                ? 'bg-[var(--primary-600)] text-white border-[var(--primary-600)]'
                : btnEnabled
            }`}
            aria-current={p === currentPage ? 'page' : undefined}
          >
            {p}
          </button>
        ),
      )}

      {/* Next page */}
      <button
        className={`${btnBase} w-8 h-8 rounded-[var(--radius-md)] ${currentPage >= totalPages ? btnDisabled : btnEnabled}`}
        disabled={currentPage >= totalPages}
        onClick={() => onPageChange(currentPage + 1)}
        aria-label="下一页"
      >
        <ChevronRight size={14} />
      </button>

      {/* Last page */}
      <button
        className={`${btnBase} w-8 h-8 rounded-[var(--radius-md)] ${currentPage >= totalPages ? btnDisabled : btnEnabled}`}
        disabled={currentPage >= totalPages}
        onClick={() => onPageChange(totalPages)}
        aria-label="最后一页"
      >
        <ChevronsRight size={14} />
      </button>

      {/* Quick jumper */}
      {showQuickJumper && (
        <div className="flex items-center gap-1 ml-2">
          <span className="text-sm text-[var(--text-tertiary)]">跳至</span>
          <input
            type="text"
            value={jumpValue}
            onChange={(e) => setJumpValue(e.target.value.replace(/\D/g, ''))}
            onKeyDown={handleJumpKeyDown}
            onBlur={handleJump}
            className="w-12 h-8 text-center text-sm border border-[var(--border-light)] rounded-[var(--radius-md)] bg-[var(--bg-card)] text-[var(--text-primary)] focus:outline-none focus:border-[var(--primary-400)]"
            placeholder=""
            aria-label="跳转页码"
          />
          <span className="text-sm text-[var(--text-tertiary)]">页</span>
        </div>
      )}

      {/* Page size selector */}
      {showSizeChanger && onPageSizeChange && (
        <select
          value={pageSize}
          onChange={(e) => onPageSizeChange(Number(e.target.value))}
          className="h-8 ml-2 px-2 text-sm border border-[var(--border-light)] rounded-[var(--radius-md)] bg-[var(--bg-card)] text-[var(--text-primary)] focus:outline-none focus:border-[var(--primary-400)]"
          aria-label="每页条数"
        >
          {pageSizeOptions.map((size) => (
            <option key={size} value={size}>
              {size} 条/页
            </option>
          ))}
        </select>
      )}
    </div>
  );
}
