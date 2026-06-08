import { useEffect, useRef, useCallback, type ReactNode } from 'react';
import Loading from './Loading';

interface InfiniteScrollProps {
  children: ReactNode;
  /** Whether more items are available to load */
  hasMore: boolean;
  /** Whether a load request is currently in flight */
  isLoading: boolean;
  /** Callback invoked when the user scrolls past the threshold */
  onLoadMore: () => void;
  /** Distance (px) from the edge that triggers loading. Default 200 */
  threshold?: number;
  /** Direction: 'bottom' loads when scrolled down, 'top' loads when scrolled up */
  direction?: 'bottom' | 'top';
  /** Optional className for the wrapper div */
  className?: string;
}

export default function InfiniteScroll({
  children,
  hasMore,
  isLoading,
  onLoadMore,
  threshold = 200,
  direction = 'bottom',
  className = '',
}: InfiniteScrollProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const callbackRef = useRef(onLoadMore);
  callbackRef.current = onLoadMore;

  const checkScroll = useCallback(() => {
    const el = containerRef.current;
    if (!el || !hasMore || isLoading) return;

    if (direction === 'bottom') {
      const distanceFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
      if (distanceFromBottom < threshold) {
        callbackRef.current();
      }
    } else {
      // direction === 'top'
      if (el.scrollTop < threshold) {
        callbackRef.current();
      }
    }
  }, [hasMore, isLoading, threshold, direction]);

  // Listen to scroll events
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    el.addEventListener('scroll', checkScroll, { passive: true });
    return () => el.removeEventListener('scroll', checkScroll);
  }, [checkScroll]);

  // Also check on mount / when deps change (handles the case where the
  // container is already at the threshold, e.g. very short content)
  useEffect(() => {
    checkScroll();
  }, [checkScroll]);

  return (
    <div ref={containerRef} className={className} style={{ overflow: 'auto' }}>
      {direction === 'top' && hasMore && isLoading && (
        <div className="flex items-center justify-center py-4">
          <Loading size="sm" />
        </div>
      )}

      {children}

      {direction === 'bottom' && hasMore && isLoading && (
        <div className="flex items-center justify-center py-4">
          <Loading size="sm" />
        </div>
      )}

      {!hasMore && (
        <div className="text-center py-4 text-sm text-gray-400">
          没有更多了
        </div>
      )}
    </div>
  );
}
