import { createContext, useContext, useCallback, type ReactNode, type InputHTMLAttributes } from 'react';
import './Radio.css';

// ========================
// Types
// ========================

export interface RadioOption {
  value: string | number;
  label: ReactNode;
  disabled?: boolean;
  description?: string;
}

interface RadioGroupContextValue {
  value: string | number | undefined;
  onChange: (value: string | number) => void;
  disabled: boolean;
  name: string;
}

const RadioGroupCtx = createContext<RadioGroupContextValue | null>(null);

// ========================
// Radio Component
// ========================

interface RadioProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'type'> {
  value: string | number;
  label?: ReactNode;
  description?: string;
  onChange?: (value: string | number) => void;
}

export default function Radio({
  value,
  label,
  description,
  disabled: disabledProp,
  className = '',
  ...rest
}: RadioProps) {
  const ctx = useContext(RadioGroupCtx);

  const isChecked = ctx ? ctx.value === value : undefined;
  const isDisabled = ctx ? ctx.disabled || disabledProp : disabledProp ?? false;
  const name = ctx?.name;

  const handleChange = useCallback(() => {
    if (isDisabled) return;
    if (ctx) {
      ctx.onChange(value);
    } else {
      rest.onChange?.({ target: { value } } as any);
    }
  }, [ctx, value, isDisabled, rest]);

  return (
    <label
      className={`radio ${isChecked ? 'radio--checked' : ''} ${isDisabled ? 'radio--disabled' : ''} ${className}`}
    >
      <input
        type="radio"
        className="radio__input"
        name={name}
        value={value}
        checked={isChecked}
        disabled={isDisabled}
        onChange={handleChange}
        {...rest}
      />
      <span className="radio__indicator">
        {isChecked && <span className="radio__dot" />}
      </span>
      {(label || description) && (
        <span className="radio__text">
          {label && <span className="radio__label">{label}</span>}
          {description && <span className="radio__desc">{description}</span>}
        </span>
      )}
    </label>
  );
}

// ========================
// RadioGroup Component
// ========================

interface RadioGroupProps {
  options: RadioOption[];
  value?: string | number;
  defaultValue?: string | number;
  onChange?: (value: string | number) => void;
  disabled?: boolean;
  layout?: 'horizontal' | 'vertical';
  variant?: 'default' | 'button';
  name?: string;
  className?: string;
}

let groupId = 0;

export function RadioGroup({
  options,
  value: controlledValue,
  defaultValue,
  onChange,
  disabled = false,
  layout = 'vertical',
  variant = 'default',
  name: nameProp,
  className = '',
}: RadioGroupProps) {
  const name = nameProp || `radio-group-${++groupId}`;

  const handleChange = useCallback(
    (val: string | number) => {
      onChange?.(val);
    },
    [onChange]
  );

  return (
    <RadioGroupCtx.Provider
      value={{ value: controlledValue ?? defaultValue, onChange: handleChange, disabled, name }}
    >
      <div
        className={`radio-group radio-group--${layout} ${variant === 'button' ? 'radio-group--button' : ''} ${className}`}
        role="radiogroup"
      >
        {options.map((option) => {
          const isChecked = (controlledValue ?? defaultValue) === option.value;
          const isDisabled = disabled || option.disabled;

          if (variant === 'button') {
            return (
              <label
                key={option.value}
                className={`radio-btn ${isChecked ? 'radio-btn--checked' : ''} ${isDisabled ? 'radio-btn--disabled' : ''}`}
              >
                <input
                  type="radio"
                  className="radio__input"
                  name={name}
                  value={option.value}
                  checked={isChecked}
                  disabled={isDisabled}
                  onChange={() => !isDisabled && handleChange(option.value)}
                />
                {option.label}
              </label>
            );
          }

          return (
            <Radio
              key={option.value}
              value={option.value}
              label={option.label}
              description={option.description}
              disabled={option.disabled}
            />
          );
        })}
      </div>
    </RadioGroupCtx.Provider>
  );
}

export type { RadioProps, RadioGroupProps };
