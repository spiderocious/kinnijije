import { useCallback, useEffect, useRef, useState } from 'react';

import { cn } from '../../utils/cn.ts';
import { AppButton } from '../../primitives/app-button/index.ts';

// The running step timer — signboard treatment, minutes in yellow, readable from
// across the kitchen. A real countdown: pause / +2 min / reset. +2 exists
// because pots don't read specs. Spec: 13-timers.html (.steptimer).
export interface AppStepTimerProps {
  readonly stepLabel: string;
  readonly instruction?: string;
  /** Starting seconds. */
  readonly seconds: number;
  readonly autoStart?: boolean;
  readonly onComplete?: () => void;
  readonly className?: string;
}

function fmt(total: number): { mm: string; ss: string } {
  const m = Math.floor(Math.max(0, total) / 60);
  const s = Math.max(0, total) % 60;
  return { mm: String(m).padStart(2, '0'), ss: String(s).padStart(2, '0') };
}

export function AppStepTimer({
  stepLabel,
  instruction,
  seconds,
  autoStart = false,
  onComplete,
  className,
}: AppStepTimerProps) {
  const [remaining, setRemaining] = useState(seconds);
  const [running, setRunning] = useState(autoStart);
  const firedRef = useRef(false);

  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => {
      setRemaining((r) => {
        if (r <= 1) {
          clearInterval(id);
          if (!firedRef.current) {
            firedRef.current = true;
            onComplete?.();
          }
          return 0;
        }
        return r - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [running, onComplete]);

  const reset = useCallback(() => {
    firedRef.current = false;
    setRemaining(seconds);
    setRunning(false);
  }, [seconds]);

  const { mm, ss } = fmt(remaining);

  return (
    <div
      className={cn(
        'rounded-card border-2 border-[var(--ink)] bg-[var(--sheet)] px-[22px] py-5 shadow-paint',
        className,
      )}
    >
      <div className="mb-3.5 flex items-baseline gap-3">
        <span className="font-display text-[22px] tracking-display">{stepLabel}</span>
        {instruction !== undefined ? (
          <span className="text-[13px] text-[var(--ink-2)]">{instruction}</span>
        ) : null}
      </div>
      <div
        className={cn(
          'relative flex items-center justify-center overflow-hidden rounded-card bg-[var(--ink)] px-6 py-[22px]',
          running && remaining > 0 ? 'kj-ticking' : '',
        )}
      >
        <span className="font-mono text-[52px] font-bold leading-none tabular-nums tracking-[-0.01em] text-[var(--paper)]">
          {mm}
          <span className="text-[var(--danfo)]">:{ss}</span>
        </span>
        <span className="absolute inset-x-0 bottom-0 h-[5px] bg-[image:var(--stripe)]" />
      </div>
      <div className="mt-3.5 flex gap-2.5">
        <AppButton variant="secondary" className="flex-1" onClick={() => setRunning((r) => !r)}>
          {running ? '⏸ Pause' : '▶ Start'}
        </AppButton>
        <AppButton variant="ghost" onClick={() => setRemaining((r) => r + 120)}>
          +2 min
        </AppButton>
        <AppButton variant="ghost" onClick={reset}>
          Reset
        </AppButton>
      </div>
    </div>
  );
}
