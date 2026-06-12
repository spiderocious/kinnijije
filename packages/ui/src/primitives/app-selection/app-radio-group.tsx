import { useState, type ReactNode } from 'react';
import { Repeat } from 'meemaw';

import { cn } from '../../utils/cn.ts';

// Radio group — one-of-N. The chosen dot is a yellow core in an ink ring;
// selection is a tick, not a flood fill. Spec: 12-selection.html (.rrow).
export interface AppRadioOption<T extends string> {
  readonly value: T;
  readonly label: string;
  /** Optional trailing example, mono — e.g. "derica · cup · wrap". */
  readonly example?: ReactNode;
}

export interface AppRadioGroupProps<T extends string> {
  readonly options: ReadonlyArray<AppRadioOption<T>>;
  readonly value?: T;
  readonly defaultValue?: T;
  readonly onChange?: (value: T) => void;
  readonly name?: string;
  readonly className?: string;
}

export function AppRadioGroup<T extends string>({
  options,
  value,
  defaultValue,
  onChange,
  name,
  className,
}: AppRadioGroupProps<T>) {
  const [internal, setInternal] = useState<T | undefined>(defaultValue);
  const current = value ?? internal;

  const select = (next: T) => {
    if (value === undefined) setInternal(next);
    onChange?.(next);
  };

  return (
    <div role="radiogroup" className={cn('flex flex-col', className)}>
      <Repeat each={[...options]}>
        {(opt: AppRadioOption<T>, i: number) => {
          const on = opt.value === current;
          return (
            <label
              key={opt.value}
              className={cn(
                'flex cursor-pointer items-center gap-2.5 py-2.5',
                i > 0 ? 'border-t border-[var(--hair)]' : '',
              )}
            >
              <input
                type="radio"
                name={name}
                checked={on}
                onChange={() => select(opt.value)}
                className="sr-only"
              />
              <span
                className={cn(
                  'grid h-5 w-5 shrink-0 place-items-center rounded-full border-2',
                  on ? 'border-[var(--ink)]' : 'border-[var(--ink-4)]',
                )}
              >
                {on ? (
                  <span className="h-2.5 w-2.5 rounded-full border-[1.5px] border-[var(--ink)] bg-[var(--danfo)]" />
                ) : null}
              </span>
              <span
                className={cn('text-[13.5px] text-[var(--ink)]', on ? 'font-extrabold' : 'font-semibold')}
              >
                {opt.label}
              </span>
              {opt.example !== undefined ? (
                <span className="ml-auto font-mono text-[11px] text-[var(--ink-3)]">
                  {opt.example}
                </span>
              ) : null}
            </label>
          );
        }}
      </Repeat>
    </div>
  );
}
