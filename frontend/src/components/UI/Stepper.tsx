import { type ReactNode } from 'react';
import { Check, Loader2 } from 'lucide-react';
import './Stepper.css';

export type StepStatus = 'wait' | 'process' | 'finish';

export interface StepItem {
  title: string;
  description?: string;
  icon?: ReactNode;
  status?: StepStatus;
}

interface StepperProps {
  current: number;
  steps: StepItem[];
  direction?: 'horizontal' | 'vertical';
  onChange?: (step: number) => void;
  className?: string;
}

function getStepStatus(index: number, current: number, explicit?: StepStatus): StepStatus {
  if (explicit) return explicit;
  if (index < current) return 'finish';
  if (index === current) return 'process';
  return 'wait';
}

export default function Stepper({
  current,
  steps,
  direction = 'horizontal',
  onChange,
  className = '',
}: StepperProps) {
  const clickable = !!onChange;

  return (
    <div className={`stepper stepper--${direction} ${className}`}>
      {steps.map((step, index) => {
        const status = getStepStatus(index, current, step.status);
        const isLast = index === steps.length - 1;

        return (
          <div
            key={index}
            className={`stepper__item stepper__item--${status} ${clickable ? 'stepper__item--clickable' : ''}`}
            onClick={() => clickable && onChange(index)}
          >
            {/* 连接线 + 圆圈 */}
            <div className="stepper__indicator">
              <div className="stepper__circle">
                {status === 'finish' ? (
                  <Check size={16} />
                ) : status === 'process' ? (
                  step.icon || <Loader2 size={16} className="stepper__spinner" />
                ) : step.icon ? (
                  step.icon
                ) : (
                  <span className="stepper__number">{index + 1}</span>
                )}
              </div>
              {!isLast && <div className="stepper__line" />}
            </div>

            {/* 文字内容 */}
            <div className="stepper__content">
              <div className="stepper__title">{step.title}</div>
              {step.description && (
                <div className="stepper__desc">{step.description}</div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
