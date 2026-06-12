import { type ReactNode } from 'react';
import { Repeat } from 'meemaw';

import { cn } from '../../utils/cn.ts';

// The three method tiles — chunky panes with the press physics. Equal billing;
// the product never assumes which door you'll use. Spec: 14-capture.html (.mtile).
export interface CaptureMethod {
  readonly id: string;
  readonly icon: ReactNode;
  readonly name: string;
  readonly sub: string;
}

export interface AppCaptureMethodsProps {
  readonly methods: readonly CaptureMethod[];
  readonly onPick?: (id: string) => void;
  readonly className?: string;
}

export function AppCaptureMethods({ methods, onPick, className }: AppCaptureMethodsProps) {
  return (
    <div className={cn('flex flex-col gap-2.5', className)}>
      <Repeat each={[...methods]}>
        {(m: CaptureMethod) => (
          <button
            key={m.id}
            type="button"
            onClick={() => onPick?.(m.id)}
            className={cn(
              'grid grid-cols-[46px_1fr_auto] items-center gap-3.5 rounded-card border-2 border-[var(--ink)] bg-[var(--sheet)] px-4 py-3.5 text-left shadow-paint-sm',
              'transition-[transform,box-shadow] duration-[120ms] ease-signboard',
              'active:translate-x-[3px] active:translate-y-[3px] active:shadow-none',
            )}
          >
            <span className="grid h-[46px] w-[46px] place-items-center rounded-ctrl border-2 border-[var(--ink)] bg-[var(--danfo)] text-[var(--ink)]">
              {m.icon}
            </span>
            <span>
              <span className="block font-display text-[19px] tracking-display">{m.name}</span>
              <span className="mt-px block text-[11.5px] text-[var(--ink-3)]">{m.sub}</span>
            </span>
            <span className="text-[16px] text-[var(--ink-3)]">→</span>
          </button>
        )}
      </Repeat>
    </div>
  );
}
