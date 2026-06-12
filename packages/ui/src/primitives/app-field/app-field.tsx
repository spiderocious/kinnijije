import { forwardRef, type InputHTMLAttributes, type ReactNode } from 'react';
import { Show } from 'meemaw';

import { cn } from '../../utils/cn.ts';

// The quiet hairline input. Hairline border, 9px corners, focuses to ink. So
// chips and the yellow button stay the loudest things on a screen. Errors note
// in sienna under the field — never red, red is reserved.
// Spec: 11-inputs.html · _foundation.css :286-305.
export interface AppInputProps extends InputHTMLAttributes<HTMLInputElement> {
  readonly leading?: ReactNode;
  readonly trailing?: ReactNode;
  readonly mono?: boolean;
  readonly invalid?: boolean;
  /** Force the focused (ink-border) look, e.g. for spec screenshots. */
  readonly active?: boolean;
}

export const AppInput = forwardRef<HTMLInputElement, AppInputProps>(function AppInput(
  { leading, trailing, mono = false, invalid = false, active = false, className, ...rest },
  ref,
) {
  return (
    <div
      className={cn(
        'flex items-center gap-2 rounded-[9px] border-[1.5px] bg-[var(--sheet)] px-3.5 py-2.5',
        'transition-colors duration-[120ms] focus-within:border-[var(--ink)]',
        invalid ? 'border-[var(--warn)]' : 'border-[var(--hair-2)]',
        active && !invalid ? 'border-[var(--ink)]' : '',
        className,
      )}
    >
      <Show when={leading !== undefined}>
        <span className="shrink-0 text-[var(--ink-4)]">{leading}</span>
      </Show>
      <input
        ref={ref}
        className={cn(
          'w-full border-0 bg-transparent p-0 text-[14px] text-[var(--ink)] outline-none',
          'placeholder:text-[var(--ink-4)]',
          mono ? 'font-mono [font-feature-settings:"tnum"_1,"lnum"_1]' : 'font-sans',
        )}
        {...rest}
      />
      <Show when={trailing !== undefined}>
        <span className="shrink-0">{trailing}</span>
      </Show>
    </div>
  );
});

// A labelled field wrapper: label + control + hint/error.
export interface AppFieldProps {
  readonly label?: string;
  readonly hint?: string;
  readonly error?: string;
  readonly htmlFor?: string;
  readonly children: ReactNode;
  readonly className?: string;
}

export function AppField({ label, hint, error, htmlFor, children, className }: AppFieldProps) {
  return (
    <label htmlFor={htmlFor} className={cn('block', className)}>
      <Show when={label !== undefined}>
        <div className="mb-1.5 text-[12px] font-bold text-[var(--ink)]">{label}</div>
      </Show>
      {children}
      <Show when={error !== undefined}>
        <div className="mt-1.5 text-[11.5px] font-semibold text-[var(--warn)]">{error}</div>
      </Show>
      <Show when={error === undefined && hint !== undefined}>
        <div className="mt-1.5 text-[11.5px] text-[var(--ink-3)]">{hint}</div>
      </Show>
    </label>
  );
}
