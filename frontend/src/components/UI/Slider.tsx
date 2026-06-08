import { useState, useCallback, useRef, useEffect, type ReactNode } from 'react';

// Mark definition
export interface SliderMark {
  value: number;
  label?: ReactNode;
}

// Base slider props
interface SliderBaseProps {
  min?: number;
  max?: number;
  step?: number;
  disabled?: boolean;
  marks?: Record<number, ReactNode | string>;
  showTooltip?: boolean;
  className?: string;
}

// Single slider props
interface SliderProps extends SliderBaseProps {
  value?: number;
  defaultValue?: number;
  onChange?: (value: number) => void;
  range?: false;
}

// Range slider props
interface RangeSliderProps extends SliderBaseProps {
  value?: [number, number];
  defaultValue?: [number, number];
  onChange?: (value: [number, number]) => void;
  range: true;
}

type SliderComponentProps = SliderProps | RangeSliderProps;

// Utility functions
function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

function roundToStep(value: number, step: number, min: number): number {
  const remainder = (value - min) % step;
  if (remainder === 0) return value;
  return remainder < step / 2 ? value - remainder : value - remainder + step;
}

// Hook for slider drag logic
function useSliderDrag({
  min,
  max,
  step,
  disabled,
  onChange,
}: {
  min: number;
  max: number;
  step: number;
  disabled: boolean;
  onChange: (value: number) => void;
}) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const getValueFromPosition = useCallback(
    (clientX: number): number => {
      const track = trackRef.current;
      if (!track) return min;

      const rect = track.getBoundingClientRect();
      const percent = clamp((clientX - rect.left) / rect.width, 0, 1);
      const rawValue = min + percent * (max - min);
      return roundToStep(rawValue, step, min);
    },
    [min, max, step]
  );

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (disabled) return;
      e.preventDefault();
      setIsDragging(true);

      const value = getValueFromPosition(e.clientX);
      onChange(value);
    },
    [disabled, getValueFromPosition, onChange]
  );

  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      const value = getValueFromPosition(e.clientX);
      onChange(value);
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, getValueFromPosition, onChange]);

  // Touch support
  const handleTouchStart = useCallback(
    (e: React.TouchEvent) => {
      if (disabled) return;
      e.preventDefault();
      setIsDragging(true);

      const touch = e.touches[0];
      const value = getValueFromPosition(touch.clientX);
      onChange(value);
    },
    [disabled, getValueFromPosition, onChange]
  );

  useEffect(() => {
    if (!isDragging) return;

    const handleTouchMove = (e: TouchEvent) => {
      const touch = e.touches[0];
      const value = getValueFromPosition(touch.clientX);
      onChange(value);
    };

    const handleTouchEnd = () => {
      setIsDragging(false);
    };

    document.addEventListener('touchmove', handleTouchMove);
    document.addEventListener('touchend', handleTouchEnd);

    return () => {
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, [isDragging, getValueFromPosition, onChange]);

  return {
    trackRef,
    isDragging,
    handleMouseDown,
    handleTouchStart,
  };
}

// Single Slider component
function Slider({
  value: controlledValue,
  defaultValue = 0,
  min = 0,
  max = 100,
  step = 1,
  disabled = false,
  onChange,
  marks,
  showTooltip = true,
  className = '',
}: Omit<SliderProps, 'range'>) {
  const [internalValue, setInternalValue] = useState(defaultValue);
  const currentValue = controlledValue ?? internalValue;
  const [showTooltipState, setShowTooltipState] = useState(false);

  const handleChange = useCallback(
    (newValue: number) => {
      const clampedValue = clamp(newValue, min, max);
      if (controlledValue === undefined) {
        setInternalValue(clampedValue);
      }
      onChange?.(clampedValue);
    },
    [controlledValue, min, max, onChange]
  );

  const { trackRef, isDragging, handleMouseDown, handleTouchStart } = useSliderDrag({
    min,
    max,
    step,
    disabled,
    onChange: handleChange,
  });

  const percent = ((currentValue - min) / (max - min)) * 100;

  // Mark positions
  const markEntries = marks
    ? Object.entries(marks)
        .map(([key, label]) => ({ value: Number(key), label }))
        .sort((a, b) => a.value - b.value)
    : [];

  return (
    <div className={`relative ${className}`}>
      {/* Track */}
      <div
        ref={trackRef}
        className={`
          relative h-2 rounded-full cursor-pointer
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'bg-gray-200'}
        `}
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
      >
        {/* Filled track */}
        <div
          className="absolute h-full bg-blue-500 rounded-full"
          style={{ width: `${percent}%` }}
        />

        {/* Marks */}
        {markEntries.map((mark) => {
          const markPercent = ((mark.value - min) / (max - min)) * 100;
          return (
            <div
              key={mark.value}
              className="absolute top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-gray-400"
              style={{ left: `${markPercent}%` }}
            />
          );
        })}

        {/* Thumb */}
        <div
          className={`
            absolute top-1/2 -translate-y-1/2 -translate-x-1/2
            w-5 h-5 rounded-full bg-white border-2 border-blue-500
            shadow-sm cursor-grab
            ${isDragging ? 'cursor-grabbing scale-110' : ''}
            ${disabled ? 'cursor-not-allowed' : ''}
            transition-transform duration-100
          `}
          style={{ left: `${percent}%` }}
          onMouseEnter={() => setShowTooltipState(true)}
          onMouseLeave={() => setShowTooltipState(false)}
        />

        {/* Tooltip */}
        {showTooltip && (isDragging || showTooltipState) && (
          <div
            className="
              absolute -top-8 -translate-x-1/2
              px-2 py-1 bg-gray-800 text-white text-xs rounded
              whitespace-nowrap
            "
            style={{ left: `${percent}%` }}
          >
            {currentValue}
          </div>
        )}
      </div>

      {/* Mark labels */}
      {markEntries.length > 0 && (
        <div className="relative h-6 mt-2">
          {markEntries.map((mark) => {
            const markPercent = ((mark.value - min) / (max - min)) * 100;
            return (
              <span
                key={mark.value}
                className="absolute text-xs text-gray-500 -translate-x-1/2"
                style={{ left: `${markPercent}%` }}
              >
                {mark.label}
              </span>
            );
          })}
        </div>
      )}
    </div>
  );
}

// Range Slider component
function RangeSlider({
  value: controlledValue,
  defaultValue = [0, 100],
  min = 0,
  max = 100,
  step = 1,
  disabled = false,
  onChange,
  marks,
  showTooltip = true,
  className = '',
}: Omit<RangeSliderProps, 'range'>) {
  const [internalValue, setInternalValue] = useState(defaultValue);
  const currentValue = controlledValue ?? internalValue;
  const [activeThumb, setActiveThumb] = useState<'min' | 'max' | null>(null);
  const [showTooltipState, setShowTooltipState] = useState<'min' | 'max' | null>(null);

  const handleChange = useCallback(
    (newValue: number, thumb: 'min' | 'max') => {
      const [currentMin, currentMax] = currentValue;
      let newMin = currentMin;
      let newMax = currentMax;

      if (thumb === 'min') {
        newMin = clamp(roundToStep(newValue, step, min), min, currentMax);
      } else {
        newMax = clamp(roundToStep(newValue, step, min), currentMin, max);
      }

      const result: [number, number] = [newMin, newMax];
      if (controlledValue === undefined) {
        setInternalValue(result);
      }
      onChange?.(result);
    },
    [controlledValue, currentValue, min, max, step, onChange]
  );

  const { trackRef, isDragging, handleMouseDown, handleTouchStart } = useSliderDrag({
    min,
    max,
    step,
    disabled,
    onChange: (value) => {
      if (activeThumb) {
        handleChange(value, activeThumb);
      }
    },
  });

  const handleThumbMouseDown = useCallback(
    (thumb: 'min' | 'max') => (e: React.MouseEvent) => {
      e.stopPropagation();
      setActiveThumb(thumb);
      handleMouseDown(e);
    },
    [handleMouseDown]
  );

  const minPercent = ((currentValue[0] - min) / (max - min)) * 100;
  const maxPercent = ((currentValue[1] - min) / (max - min)) * 100;

  // Mark positions
  const markEntries = marks
    ? Object.entries(marks)
        .map(([key, label]) => ({ value: Number(key), label }))
        .sort((a, b) => a.value - b.value)
    : [];

  return (
    <div className={`relative ${className}`}>
      {/* Track */}
      <div
        ref={trackRef}
        className={`
          relative h-2 rounded-full cursor-pointer
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'bg-gray-200'}
        `}
        onMouseDown={(e) => {
          setActiveThumb(null);
          handleMouseDown(e);
        }}
        onTouchStart={handleTouchStart}
      >
        {/* Filled track */}
        <div
          className="absolute h-full bg-blue-500 rounded-full"
          style={{
            left: `${minPercent}%`,
            width: `${maxPercent - minPercent}%`,
          }}
        />

        {/* Marks */}
        {markEntries.map((mark) => {
          const markPercent = ((mark.value - min) / (max - min)) * 100;
          return (
            <div
              key={mark.value}
              className="absolute top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-gray-400"
              style={{ left: `${markPercent}%` }}
            />
          );
        })}

        {/* Min thumb */}
        <div
          className={`
            absolute top-1/2 -translate-y-1/2 -translate-x-1/2
            w-5 h-5 rounded-full bg-white border-2 border-blue-500
            shadow-sm cursor-grab z-10
            ${isDragging && activeThumb === 'min' ? 'cursor-grabbing scale-110' : ''}
            ${disabled ? 'cursor-not-allowed' : ''}
            transition-transform duration-100
          `}
          style={{ left: `${minPercent}%` }}
          onMouseDown={handleThumbMouseDown('min')}
          onMouseEnter={() => setShowTooltipState('min')}
          onMouseLeave={() => setShowTooltipState(null)}
        />

        {/* Max thumb */}
        <div
          className={`
            absolute top-1/2 -translate-y-1/2 -translate-x-1/2
            w-5 h-5 rounded-full bg-white border-2 border-blue-500
            shadow-sm cursor-grab z-10
            ${isDragging && activeThumb === 'max' ? 'cursor-grabbing scale-110' : ''}
            ${disabled ? 'cursor-not-allowed' : ''}
            transition-transform duration-100
          `}
          style={{ left: `${maxPercent}%` }}
          onMouseDown={handleThumbMouseDown('max')}
          onMouseEnter={() => setShowTooltipState('max')}
          onMouseLeave={() => setShowTooltipState(null)}
        />

        {/* Min tooltip */}
        {showTooltip && (showTooltipState === 'min' || (isDragging && activeThumb === 'min')) && (
          <div
            className="
              absolute -top-8 -translate-x-1/2
              px-2 py-1 bg-gray-800 text-white text-xs rounded
              whitespace-nowrap
            "
            style={{ left: `${minPercent}%` }}
          >
            {currentValue[0]}
          </div>
        )}

        {/* Max tooltip */}
        {showTooltip && (showTooltipState === 'max' || (isDragging && activeThumb === 'max')) && (
          <div
            className="
              absolute -top-8 -translate-x-1/2
              px-2 py-1 bg-gray-800 text-white text-xs rounded
              whitespace-nowrap
            "
            style={{ left: `${maxPercent}%` }}
          >
            {currentValue[1]}
          </div>
        )}
      </div>

      {/* Mark labels */}
      {markEntries.length > 0 && (
        <div className="relative h-6 mt-2">
          {markEntries.map((mark) => {
            const markPercent = ((mark.value - min) / (max - min)) * 100;
            return (
              <span
                key={mark.value}
                className="absolute text-xs text-gray-500 -translate-x-1/2"
                style={{ left: `${markPercent}%` }}
              >
                {mark.label}
              </span>
            );
          })}
        </div>
      )}
    </div>
  );
}

// Export both components
export default Slider;
export { RangeSlider };
