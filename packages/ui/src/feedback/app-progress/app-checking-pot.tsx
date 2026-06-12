import { Repeat } from 'meemaw';

import { cn } from '../../utils/cn.ts';

// The suggestion wait — the product's one theatrical loading state. A lid lifts,
// steam rises, the stage line tells the truth about what's happening. ~3s, never
// longer without a message. Spec: 24-progress.html (.finding / .pot).
export interface AppCheckingPotProps {
  readonly message?: string;
  readonly sub?: string;
  /** The stage line; mark the active ones. */
  readonly stages?: ReadonlyArray<{ label: string; active: boolean }>;
  readonly className?: string;
}

const DEFAULT_STAGES = [
  { label: 'Reading kitchen', active: true },
  { label: 'Matching recipes', active: true },
  { label: 'Plating 3 picks', active: false },
];

export function AppCheckingPot({
  message = 'Checking the pot…',
  sub,
  stages = DEFAULT_STAGES,
  className,
}: AppCheckingPotProps) {
  return (
    <div
      className={cn(
        'rounded-card border-2 border-[var(--ink)] bg-[var(--sheet)] px-6 py-[26px] text-center shadow-paint',
        className,
      )}
    >
      <div className="relative mx-auto mb-3.5 h-16 w-[84px]">
        <span className="kj-steam absolute -top-1.5 left-[22px] font-mono text-[13px] text-[var(--ink-3)]">~</span>
        <span className="kj-steam kj-steam-2 absolute -top-1.5 left-[42px] font-mono text-[13px] text-[var(--ink-3)]">~</span>
        <span className="kj-steam kj-steam-3 absolute -top-1.5 left-[60px] font-mono text-[13px] text-[var(--ink-3)]">~</span>
        <div className="kj-lid absolute left-0 right-0 top-2.5 h-3 rounded-md bg-[var(--ink)]" />
        <div className="kj-lid absolute left-1/2 top-0.5 h-2 w-3.5 -translate-x-1/2 rounded-[3px] border-2 border-[var(--ink)] bg-[var(--danfo)]" />
        <div className="absolute bottom-0 left-1.5 right-1.5 h-11 rounded-b-lg rounded-t bg-[var(--ink)]" />
      </div>
      <div className="font-display text-[22px] uppercase tracking-display">{message}</div>
      {sub !== undefined ? (
        <div className="mt-1.5 text-[12.5px] text-[var(--ink-3)]">{sub}</div>
      ) : null}
      <div className="mt-4 flex justify-center gap-2 text-[11px] font-bold text-[var(--ink-3)]">
        <Repeat each={[...stages]}>
          {(st: { label: string; active: boolean }, i: number) => (
            <span key={st.label} className="flex items-center gap-2">
              {i > 0 ? <span>·</span> : null}
              <span
                className={st.active ? 'border-b-[2.5px] border-[var(--danfo)] text-[var(--ink)]' : ''}
              >
                {st.label}
              </span>
            </span>
          )}
        </Repeat>
      </div>
    </div>
  );
}
