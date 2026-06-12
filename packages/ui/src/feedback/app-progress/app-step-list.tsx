import { Repeat } from 'meemaw';

import { cn } from '../../utils/cn.ts';

// The extraction stepper — honest stages with mono timings. done/now/pending.
// If a stage stalls the row can swap to a retry link (app concern). Spec: 24.
export type StepState = 'done' | 'now' | 'pending';

export interface ExtractStep {
  readonly label: string;
  readonly state: StepState;
  readonly time?: string; // mono, e.g. "1.8S" or "…"
}

export interface AppStepListProps {
  readonly title?: string;
  readonly steps: readonly ExtractStep[];
  readonly className?: string;
}

export function AppStepList({ title, steps, className }: AppStepListProps) {
  return (
    <div
      className={cn(
        'rounded-card border border-[var(--hair-2)] bg-[var(--sheet)] px-5 py-[18px]',
        className,
      )}
    >
      {title !== undefined ? (
        <div className="mb-1.5 text-[11px] font-bold uppercase tracking-overline text-[var(--ink-3)]">
          {title}
        </div>
      ) : null}
      <Repeat each={[...steps]}>
        {(s: ExtractStep, i: number) => (
          <div
            key={s.label}
            className={cn(
              'grid grid-cols-[26px_1fr_auto] items-center gap-3 py-2.5',
              i > 0 ? 'border-t border-[var(--hair)]' : '',
            )}
          >
            <span
              className={cn(
                'grid h-[22px] w-[22px] place-items-center rounded-full border-2 text-[11px] font-extrabold',
                s.state === 'done'
                  ? 'border-[var(--ink)] bg-[var(--ink)] text-[var(--paper)]'
                  : s.state === 'now'
                    ? 'border-[var(--ink)] bg-[var(--danfo)] text-[var(--ink)]'
                    : 'border-[var(--hair-2)] text-transparent',
              )}
            >
              {s.state === 'done' ? '✓' : ''}
            </span>
            <span
              className={cn(
                'text-[13px] font-semibold',
                s.state === 'pending' ? 'text-[var(--ink-4)]' : 'text-[var(--ink)]',
              )}
            >
              {s.label}
            </span>
            <span className="font-mono text-[10.5px] text-[var(--ink-3)]">{s.time ?? ''}</span>
          </div>
        )}
      </Repeat>
    </div>
  );
}
