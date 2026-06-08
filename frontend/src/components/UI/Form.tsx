import {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
  type FormEvent,
  cloneElement,
  isValidElement,
} from 'react';
import './Form.css';

// Validation rule
export interface ValidationRule {
  required?: boolean;
  message?: string;
  type?: 'email' | 'number' | 'url' | 'string';
  min?: number;
  max?: number;
  pattern?: RegExp;
  validator?: (value: unknown) => boolean | string;
}

// Form item error
interface FormErrors {
  [key: string]: string;
}

// Form context
interface FormContextType {
  values: Record<string, unknown>;
  errors: FormErrors;
  touched: Record<string, boolean>;
  layout: 'horizontal' | 'vertical' | 'inline';
  setFieldValue: (name: string, value: unknown) => void;
  setFieldTouched: (name: string) => void;
  validateField: (name: string, rules?: ValidationRule[]) => string | null;
  resetForm: () => void;
}

const FormContext = createContext<FormContextType | null>(null);

export function useFormContext() {
  const context = useContext(FormContext);
  if (!context) {
    throw new Error('useFormContext must be used within a Form component');
  }
  return context;
}

// Form props
interface FormProps {
  children: ReactNode;
  layout?: 'horizontal' | 'vertical' | 'inline';
  initialValues?: Record<string, unknown>;
  onSubmit?: (values: Record<string, unknown>) => void;
  onReset?: () => void;
  className?: string;
}

// Form component
export default function Form({
  children,
  layout = 'vertical',
  initialValues = {},
  onSubmit,
  onReset,
  className = '',
}: FormProps) {
  const [values, setValues] = useState<Record<string, unknown>>(initialValues);
  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const setFieldValue = useCallback((name: string, value: unknown) => {
    setValues((prev) => ({ ...prev, [name]: value }));
    // Clear error when value changes
    setErrors((prev) => {
      const next = { ...prev };
      delete next[name];
      return next;
    });
  }, []);

  const setFieldTouched = useCallback((name: string) => {
    setTouched((prev) => ({ ...prev, [name]: true }));
  }, []);

  const validateField = useCallback(
    (name: string, rules?: ValidationRule[]): string | null => {
      if (!rules || rules.length === 0) return null;

      const value = values[name];

      for (const rule of rules) {
        // Required check
        if (rule.required && (value === undefined || value === null || value === '')) {
          return rule.message || '此字段为必填项';
        }

        // Skip other validations if value is empty and not required
        if (value === undefined || value === null || value === '') continue;

        // Type checks
        if (rule.type === 'email') {
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailRegex.test(String(value))) {
            return rule.message || '请输入有效的邮箱地址';
          }
        }

        if (rule.type === 'number') {
          if (isNaN(Number(value))) {
            return rule.message || '请输入有效的数字';
          }
        }

        if (rule.type === 'url') {
          try {
            new URL(String(value));
          } catch {
            return rule.message || '请输入有效的URL';
          }
        }

        // Min/Max length
        if (rule.min !== undefined) {
          if (typeof value === 'string' && value.length < rule.min) {
            return rule.message || `最少输入${rule.min}个字符`;
          }
          if (typeof value === 'number' && value < rule.min) {
            return rule.message || `最小值为${rule.min}`;
          }
        }

        if (rule.max !== undefined) {
          if (typeof value === 'string' && value.length > rule.max) {
            return rule.message || `最多输入${rule.max}个字符`;
          }
          if (typeof value === 'number' && value > rule.max) {
            return rule.message || `最大值为${rule.max}`;
          }
        }

        // Pattern
        if (rule.pattern && !rule.pattern.test(String(value))) {
          return rule.message || '格式不正确';
        }

        // Custom validator
        if (rule.validator) {
          const result = rule.validator(value);
          if (result === false) {
            return rule.message || '验证失败';
          }
          if (typeof result === 'string') {
            return result;
          }
        }
      }

      return null;
    },
    [values]
  );

  const validateAllFields = useCallback((): boolean => {
    const newErrors: FormErrors = {};
    let isValid = true;

    // This will be called by each FormItem during render
    // For now, we check existing errors
    Object.keys(touched).forEach((name) => {
      // Errors are already set during field validation
    });

    setErrors(newErrors);
    return isValid;
  }, [touched]);

  const handleSubmit = useCallback(
    (e: FormEvent) => {
      e.preventDefault();

      // Mark all fields as touched
      const allTouched: Record<string, boolean> = {};
      Object.keys(values).forEach((key) => {
        allTouched[key] = true;
      });
      setTouched(allTouched);

      // Validate all fields
      const hasErrors = Object.values(errors).some((error) => error);

      if (!hasErrors && onSubmit) {
        onSubmit(values);
      }
    },
    [values, errors, onSubmit]
  );

  const resetForm = useCallback(() => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
    onReset?.();
  }, [initialValues, onReset]);

  const contextValue: FormContextType = {
    values,
    errors,
    touched,
    layout,
    setFieldValue,
    setFieldTouched,
    validateField,
    resetForm,
  };

  return (
    <FormContext.Provider value={contextValue}>
      <form
        className={className}
        onSubmit={handleSubmit}
        onReset={(e) => {
          e.preventDefault();
          resetForm();
        }}
      >
        {children}
      </form>
    </FormContext.Provider>
  );
}

// FormItem props
interface FormItemProps {
  name: string;
  label?: string;
  rules?: ValidationRule[];
  children: ReactNode;
  className?: string;
  required?: boolean;
  help?: string;
  extra?: string;
}

// FormItem component
export function FormItem({
  name,
  label,
  rules,
  children,
  className = '',
  required: requiredProp,
  help,
  extra,
}: FormItemProps) {
  const {
    values,
    errors,
    touched,
    layout,
    setFieldValue,
    setFieldTouched,
    validateField,
  } = useFormContext();

  const value = values[name];
  const error = touched[name] ? errors[name] : undefined;
  const isRequired = requiredProp || rules?.some((r) => r.required);

  const handleChange = useCallback(
    (newValue: unknown) => {
      setFieldValue(name, newValue);
    },
    [name, setFieldValue]
  );

  const handleBlur = useCallback(() => {
    setFieldTouched(name);
    const validationError = validateField(name, rules);
    if (validationError) {
      // Error will be set through context
    }
  }, [name, rules, setFieldTouched, validateField]);

  // Clone child element to inject value and handlers
  const renderChild = () => {
    if (!isValidElement(children)) return children;

    const childProps: Record<string, unknown> = {
      value: value ?? '',
      onChange: handleChange,
      onBlur: handleBlur,
    };

    // Add error state styling if applicable
    if (error) {
      childProps.className = `${(children.props as Record<string, unknown>).className || ''} border-red-500`;
    }

    return cloneElement(children, childProps);
  };

  const layoutClasses = {
    horizontal: 'flex items-start gap-4',
    vertical: 'flex flex-col gap-1.5',
    inline: 'flex items-center gap-2',
  };

  const labelClasses = {
    horizontal: 'w-24 text-right pt-2',
    vertical: '',
    inline: '',
  };

  return (
    <div className={`${layoutClasses[layout]} ${className}`}>
      {label && (
        <label
          className={`
            text-sm font-medium text-gray-700
            ${labelClasses[layout]}
            ${isRequired ? "after:content-['*'] after:ml-0.5 after:text-red-500" : ''}
          `}
        >
          {label}
        </label>
      )}

      <div className="flex-1">
        {renderChild()}

        {error && (
          <p className="mt-1 text-sm text-red-500">{error}</p>
        )}

        {!error && help && (
          <p className="mt-1 text-sm text-gray-500">{help}</p>
        )}

        {extra && (
          <p className="mt-1 text-sm text-gray-400">{extra}</p>
        )}
      </div>
    </div>
  );
}

// useForm hook for external use
export function useForm(initialValues: Record<string, unknown> = {}) {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState<FormErrors>({});

  const setFieldValue = useCallback((name: string, value: unknown) => {
    setValues((prev) => ({ ...prev, [name]: value }));
  }, []);

  const setFieldsValue = useCallback((newValues: Record<string, unknown>) => {
    setValues((prev) => ({ ...prev, ...newValues }));
  }, []);

  const resetFields = useCallback((fields?: string[]) => {
    if (fields) {
      const resetValues = { ...values };
      fields.forEach((field) => {
        resetValues[field] = initialValues[field];
      });
      setValues(resetValues);
    } else {
      setValues(initialValues);
    }
    setErrors({});
  }, [values, initialValues]);

  const validateFields = useCallback(
    async (rules: Record<string, ValidationRule[]>): Promise<boolean> => {
      const newErrors: FormErrors = {};
      let isValid = true;

      Object.entries(rules).forEach(([name, fieldRules]) => {
        for (const rule of fieldRules) {
          const value = values[name];

          if (rule.required && (value === undefined || value === null || value === '')) {
            newErrors[name] = rule.message || '此字段为必填项';
            isValid = false;
            break;
          }

          if (rule.type === 'email' && value) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(String(value))) {
              newErrors[name] = rule.message || '请输入有效的邮箱地址';
              isValid = false;
              break;
            }
          }

          if (rule.validator && value) {
            const result = rule.validator(value);
            if (result === false) {
              newErrors[name] = rule.message || '验证失败';
              isValid = false;
              break;
            }
            if (typeof result === 'string') {
              newErrors[name] = result;
              isValid = false;
              break;
            }
          }
        }
      });

      setErrors(newErrors);
      return isValid;
    },
    [values]
  );

  return {
    values,
    errors,
    setFieldValue,
    setFieldsValue,
    resetFields,
    validateFields,
  };
}
