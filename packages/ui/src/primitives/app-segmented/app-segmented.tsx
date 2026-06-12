import { useState } from 'react';
import { Repeat } from 'meemaw';

import { cn } from '../../utils/cn.ts';

// Segmented control — one choice, N options, ink-bordered, the chosen segment
// painted danfo. Controlled or uncontrolled. Spec: 12-selection.html (.seg).
export interface AppSegmentedOption<T extends string> {
  readonly value: T;
  readonly label: string;
}

export interface AppSegmentedProps<T extends string> {
  readonly options: ReadonlyArray<AppSegmentedOption<T>>;
  readonly value?: T;
  readonly defaultValue?: T;
  readonly onChange?: (value: T) => void;
  readonly className?: string;
  readonly 'aria-label'?: string;
}

export function AppSegmented<T extends string>({
  options,
  value,
  defaultValue,
  onChange,
  className,
  'aria-label': ariaLabel,
}: AppSegmentedProps<T>) {
  const [internal, setInternal] = useState<T | undefined>(defaultValue ?? options[0]?.value);
  const current = value ?? internal;

  const select = (next: T) => {
    if (value === undefined) setInternal(next);
    onChange?.(next);
  };

  return (
    <div
      role="tablist"
      aria-label={ariaLabel}
      className={cn(
        'grid overflow-hidden rounded-ctrl border-2 border-[var(--ink)] bg-[var(--sheet)]',
        className,
      )}
      style={{ gridTemplateColumns: `repeat(${options.length}, 1fr)` }}
    >
      <Repeat each={[...options]}>
        {(opt: AppSegmentedOption<T>, i: number) => {
          const on = opt.value === current;
          return (
            <button
              key={opt.value}
              type="button"
              role="tab"
              aria-selected={on}
              onClick={() => select(opt.value)}
              className={cn(
                'cursor-pointer border-0 px-2 py-[11px] font-sans text-[13px] font-bold text-[var(--ink-2)] transition-colors',
                i > 0 ? 'border-l-2 border-[var(--ink)]' : '',
                on ? 'bg-[var(--danfo)] font-extrabold text-[var(--ink)]' : 'hover:bg-[var(--paper-deep)]',
              )}
            >
              {opt.label}
            </button>
          );
        }}
      </Repeat>
    </div>
  );
}
