import { createContext, useContext, useCallback, type ReactNode, type InputHTMLAttributes } from 'react';
import './Checkbox.css';

// Checkbox option
export interface CheckboxOption {
  value: string;
  label: ReactNode;
  disabled?: boolean;
}

// Checkbox Group context
interface CheckboxGroupContextType {
  value: string[];
  onChange: (value: string[]) => void;
  disabled: boolean;
  name?: string;
}

const CheckboxGroupContext = createContext<CheckboxGroupContextType | null>(null);

function useCheckboxGroupContext() {
  return useContext(CheckboxGroupContext);
}

// Single Checkbox props
interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'type'> {
  /** Checkbox label */
  label?: ReactNode;
  /** Whether checkbox is checked (controlled) */
  checked?: boolean;
  /** Default checked state (uncontrolled) */
  defaultChecked?: boolean;
  /** Change callback */
  onChange?: (checked: boolean) => void;
  /** Indeterminate state (for select all) */
  indeterminate?: boolean;
  /** Checkbox value (for use in CheckboxGroup) */
  value?: string;
}

// Single Checkbox component
export default function Checkbox({
  label,
  checked,
  defaultChecked,
  onChange,
  indeterminate = false,
  disabled = false,
  className = '',
  value,
  id,
  ...props
}: CheckboxProps) {
  const groupContext = useCheckboxGroupContext();

  // If in group, use group's value
  const isInGroup = !!groupContext;
  const isChecked = isInGroup
    ? groupContext.value.includes(value || '')
    : checked ?? defaultChecked ?? false;
  const isDisabled = isInGroup ? groupContext.disabled || disabled : disabled;

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (isDisabled) return;

      if (isInGroup && value) {
        const newValue = [...groupContext.value];
        if (e.target.checked) {
          newValue.push(value);
        } else {
          const index = newValue.indexOf(value);
          if (index > -1) {
            newValue.splice(index, 1);
          }
        }
        groupContext.onChange(newValue);
      } else {
        onChange?.(e.target.checked);
      }
    },
    [isInGroup, isDisabled, value, groupContext, onChange]
  );

  const checkboxId = id || (typeof label === 'string' ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <label
      className={`checkbox ${isChecked ? 'checkbox--checked' : ''} ${indeterminate ? 'checkbox--indeterminate' : ''} ${isDisabled ? 'checkbox--disabled' : ''} ${className}`}
      htmlFor={checkboxId}
    >
      <input
        type="checkbox"
        id={checkboxId}
        checked={isChecked}
        disabled={isDisabled}
        onChange={handleChange}
        value={value}
        className="checkbox__input"
        ref={(el) => {
          if (el) {
            el.indeterminate = indeterminate;
          }
        }}
        {...props}
      />
      <span className="checkbox__indicator">
        {isChecked && (
          <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="checkbox__check">
            <path d="M3 8l3.5 3.5L13 4" />
          </svg>
        )}
        {indeterminate && !isChecked && (
          <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" className="checkbox__check">
            <path d="M4 8h8" />
          </svg>
        )}
      </span>
      {label && <span className="checkbox__text">{label}</span>}
    </label>
  );
}

// CheckboxGroup props
interface CheckboxGroupProps {
  /** Available options */
  options: CheckboxOption[];
  /** Selected values (controlled) */
  value?: string[];
  /** Default selected values (uncontrolled) */
  defaultValue?: string[];
  /** Change callback */
  onChange?: (value: string[]) => void;
  /** Disable all checkboxes */
  disabled?: boolean;
  /** Group name for accessibility */
  name?: string;
  /** Layout direction */
  direction?: 'horizontal' | 'vertical';
  /** Show select all option */
  showSelectAll?: boolean;
  /** Select all label */
  selectAllLabel?: string;
  /** Additional class name */
  className?: string;
}

// CheckboxGroup component
export function CheckboxGroup({
  options,
  value,
  defaultValue = [],
  onChange,
  disabled = false,
  name,
  direction = 'vertical',
  showSelectAll = false,
  selectAllLabel = '全选',
  className = '',
}: CheckboxGroupProps) {
  const currentValue = value ?? defaultValue;

  const handleChange = useCallback(
    (newValue: string[]) => {
      onChange?.(newValue);
    },
    [onChange]
  );

  // Select all logic
  const selectableOptions = options.filter((opt) => !opt.disabled);
  const allSelected = selectableOptions.length > 0 && selectableOptions.every((opt) => currentValue.includes(opt.value));
  const indeterminate = !allSelected && selectableOptions.some((opt) => currentValue.includes(opt.value));

  const handleSelectAll = useCallback(
    (checked: boolean) => {
      if (checked) {
        handleChange(selectableOptions.map((opt) => opt.value));
      } else {
        handleChange([]);
      }
    },
    [handleChange, selectableOptions]
  );

  return (
    <CheckboxGroupContext.Provider
      value={{ value: currentValue, onChange: handleChange, disabled, name }}
    >
      <div className={`checkbox-group checkbox-group--${direction} ${className}`}>
        {showSelectAll && (
          <>
            <Checkbox
              label={selectAllLabel}
              checked={allSelected}
              indeterminate={indeterminate}
              onChange={handleSelectAll}
              disabled={disabled}
            />
            <div className="checkbox-group__separator" />
          </>
        )}
        {options.map((option) => (
          <Checkbox
            key={option.value}
            value={option.value}
            label={option.label}
            disabled={option.disabled}
          />
        ))}
      </div>
    </CheckboxGroupContext.Provider>
  );
}
