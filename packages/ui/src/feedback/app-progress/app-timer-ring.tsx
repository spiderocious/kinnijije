import { cn } from '../../utils/cn.ts';

// The timer ring — ink-ringed like a cooker dial. Yellow while running, sienna
// for the final minute (the "come back to the pot" cue), empty when set.
// Spec: 24-progress.html (.ring).
export type TimerRingState = 'running' | 'almost' | 'ready';

export interface AppTimerRingProps {
  /** 0..1 fraction remaining (the dial fills clockwise as it drains). */
  readonly value: number;
  readonly label: string;
  readonly time: string; // mono, e.g. "07:42"
  readonly state?: TimerRingState;
  readonly className?: string;
}

const STROKE: Record<TimerRingState, string> = {
  running: 'var(--danfo)',
  almost: 'var(--warn)',
  ready: 'transparent',
};

export function AppTimerRing({ value, label, time, state = 'running', className }: AppTimerRingProps) {
  const r = 38;
  const circ = 2 * Math.PI * r;
  const offset = circ * (1 - Math.max(0, Math.min(1, value)));

  return (
    <div className={cn('text-center', className)}>
      <div className="relative inline-grid place-items-center">
        <svg width="92" height="92" className="-rotate-90">
          <circle cx="46" cy="46" r={r} fill="none" stroke="var(--hair)" strokeWidth="8" />
          {state !== 'ready' ? (
            <circle
              cx="46"
              cy="46"
              r={r}
              fill="none"
              stroke={STROKE[state]}
              strokeWidth="8"
              strokeDasharray={circ}
              strokeDashoffset={offset}
            />
          ) : null}
          <circle cx="46" cy="46" r="42.5" fill="none" stroke="var(--ink)" strokeWidth="1.5" />
          <circle cx="46" cy="46" r="33.5" fill="none" stroke="var(--ink)" strokeWidth="1.5" />
        </svg>
        <span className="absolute font-mono text-[15px] font-bold tabular-nums">{time}</span>
      </div>
      <div className="mt-1 text-[10px] font-bold uppercase tracking-[0.1em] text-[var(--ink-3)]">
        {label}
      </div>
    </div>
  );
}
