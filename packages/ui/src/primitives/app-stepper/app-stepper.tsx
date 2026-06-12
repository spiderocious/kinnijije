import { useState } from 'react';

import { cn } from '../../utils/cn.ts';

// Numeric stepper — −/value/+. Big touch targets, mono value, kitchen-proof.
// Steppers, not free-number fields: nobody types "4" with stew on their hands.
// Controlled or uncontrolled. Spec: 11-inputs.html (.stepper).
export interface AppStepperProps {
  readonly value?: number;
  readonly defaultValue?: number;
  readonly min?: number;
  readonly max?: number;
  readonly step?: number;
  readonly onChange?: (value: number) => void;
  /** Render the value, e.g. (v) => `${v} min`. Default: the number. */
  readonly format?: (value: number) => string;
  readonly className?: string;
  readonly 'aria-label'?: string;
}

export function AppStepper({
  value,
  defaultValue = 0,
  min = 0,
  max = Number.MAX_SAFE_INTEGER,
  step = 1,
  onChange,
  format,
  className,
  'aria-label': ariaLabel,
}: AppStepperProps) {
  const [internal, setInternal] = useState(defaultValue);
  const current = value ?? internal;

  const set = (next: number) => {
    const clamped = Math.min(max, Math.max(min, next));
    if (value === undefined) setInternal(clamped);
    onChange?.(clamped);
  };

  return (
    <div
      className={cn(
        'flex items-stretch overflow-hidden rounded-[9px] border-[1.5px] border-[var(--hair-2)] bg-[var(--sheet)]',
        className,
      )}
      role="group"
      aria-label={ariaLabel}
    >
      <button
        type="button"
        aria-label="Decrease"
        onClick={() => set(current - step)}
        disabled={current <= min}
        className="w-[34px] cursor-pointer border-0 bg-transparent font-sans text-[16px] font-bold text-[var(--ink-2)] transition-colors hover:bg-[var(--danfo-tint)] disabled:cursor-not-allowed disabled:opacity-40"
      >
        −
      </button>
      <span className="grid flex-1 place-items-center border-x border-[var(--hair)] px-2 py-2 font-mono text-[13px] font-bold [font-feature-settings:'tnum'_1,'lnum'_1]">
        {format ? format(current) : current}
      </span>
      <button
        type="button"
        aria-label="Increase"
        onClick={() => set(current + step)}
        disabled={current >= max}
        className="w-[34px] cursor-pointer border-0 bg-transparent font-sans text-[16px] font-bold text-[var(--ink-2)] transition-colors hover:bg-[var(--danfo-tint)] disabled:cursor-not-allowed disabled:opacity-40"
      >
        +
      </button>
    </div>
  );
}
