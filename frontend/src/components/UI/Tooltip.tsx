import { useState, useRef, useEffect, useCallback, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import './Tooltip.css';

export type TooltipPosition = 'top' | 'bottom' | 'left' | 'right';

interface TooltipProps {
  content: ReactNode;
  position?: TooltipPosition;
  delay?: number;
  hideDelay?: number;
  children: ReactNode;
  className?: string;
  disabled?: boolean;
}

interface Coordinates {
  top: number;
  left: number;
}

function calculatePosition(
  triggerRect: DOMRect,
  tooltipRect: DOMRect,
  position: TooltipPosition,
  gap: number
): Coordinates & { arrowLeft?: number; arrowTop?: number } {
  const scrollX = window.scrollX;
  const scrollY = window.scrollY;

  let top = 0;
  let left = 0;
  let arrowLeft: number | undefined;
  let arrowTop: number | undefined;

  switch (position) {
    case 'top':
      top = triggerRect.top + scrollY - tooltipRect.height - gap;
      left = triggerRect.left + scrollX + (triggerRect.width - tooltipRect.width) / 2;
      arrowLeft = tooltipRect.width / 2;
      break;
    case 'bottom':
      top = triggerRect.bottom + scrollY + gap;
      left = triggerRect.left + scrollX + (triggerRect.width - tooltipRect.width) / 2;
      arrowLeft = tooltipRect.width / 2;
      break;
    case 'left':
      top = triggerRect.top + scrollY + (triggerRect.height - tooltipRect.height) / 2;
      left = triggerRect.left + scrollX - tooltipRect.width - gap;
      arrowTop = tooltipRect.height / 2;
      break;
    case 'right':
      top = triggerRect.top + scrollY + (triggerRect.height - tooltipRect.height) / 2;
      left = triggerRect.right + scrollX + gap;
      arrowTop = tooltipRect.height / 2;
      break;
  }

  // 边界修正
  const padding = 8;
  if (left < padding) {
    if (arrowLeft !== undefined) arrowLeft += left - padding;
    left = padding;
  }
  if (left + tooltipRect.width > window.innerWidth - padding) {
    const overflow = left + tooltipRect.width - (window.innerWidth - padding);
    if (arrowLeft !== undefined) arrowLeft += overflow;
    left -= overflow;
  }

  return { top, left, arrowLeft, arrowTop };
}

export default function Tooltip({
  content,
  position = 'top',
  delay = 200,
  hideDelay = 100,
  children,
  className = '',
  disabled = false,
}: TooltipProps) {
  const [visible, setVisible] = useState(false);
  const [coords, setCoords] = useState<Coordinates & { arrowLeft?: number; arrowTop?: number }>({
    top: 0,
    left: 0,
  });

  const triggerRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const showTimer = useRef<ReturnType<typeof setTimeout>>();
  const hideTimer = useRef<ReturnType<typeof setTimeout>>();

  const updatePosition = useCallback(() => {
    if (!triggerRef.current || !tooltipRef.current) return;
    const triggerRect = triggerRef.current.getBoundingClientRect();
    const tooltipRect = tooltipRef.current.getBoundingClientRect();
    setCoords(calculatePosition(triggerRect, tooltipRect, position, 8));
  }, [position]);

  const handleShow = useCallback(() => {
    if (disabled) return;
    clearTimeout(hideTimer.current);
    showTimer.current = setTimeout(() => {
      setVisible(true);
    }, delay);
  }, [disabled, delay]);

  const handleHide = useCallback(() => {
    clearTimeout(showTimer.current);
    hideTimer.current = setTimeout(() => {
      setVisible(false);
    }, hideDelay);
  }, [hideDelay]);

  useEffect(() => {
    if (visible) {
      updatePosition();
      const handleScroll = () => updatePosition();
      const handleResize = () => updatePosition();
      window.addEventListener('scroll', handleScroll, true);
      window.addEventListener('resize', handleResize);
      return () => {
        window.removeEventListener('scroll', handleScroll, true);
        window.removeEventListener('resize', handleResize);
      };
    }
  }, [visible, updatePosition]);

  useEffect(() => {
    return () => {
      clearTimeout(showTimer.current);
      clearTimeout(hideTimer.current);
    };
  }, []);

  return (
    <>
      <div
        ref={triggerRef}
        className={`tooltip-trigger ${className}`}
        onMouseEnter={handleShow}
        onMouseLeave={handleHide}
        onFocus={handleShow}
        onBlur={handleHide}
      >
        {children}
      </div>
      {visible &&
        createPortal(
          <div
            ref={tooltipRef}
            className={`tooltip tooltip--${position}`}
            role="tooltip"
            style={{ top: coords.top, left: coords.left }}
          >
            <div className="tooltip__content">{content}</div>
            <div
              className="tooltip__arrow"
              style={
                coords.arrowLeft !== undefined
                  ? { left: coords.arrowLeft }
                  : coords.arrowTop !== undefined
                    ? { top: coords.arrowTop }
                    : undefined
              }
            />
          </div>,
          document.body
        )}
    </>
  );
}
