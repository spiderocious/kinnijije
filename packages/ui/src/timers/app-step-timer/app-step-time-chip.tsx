import { useEffect, useRef, useState } from 'react';

import { cn } from '../../utils/cn.ts';

// An inline step-time estimate that becomes a live countdown when tapped. The
// running one is painted yellow. Spec: 13-timers.html (.tchip).
export interface AppStepTimeChipProps {
  /** Estimate in seconds; the chip shows mm:ss. */
  readonly seconds: number;
  readonly onComplete?: () => void;
  readonly className?: string;
}

function fmt(total: number): string {
  const m = Math.floor(Math.max(0, total) / 60);
  const s = Math.max(0, total) % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}

export function AppStepTimeChip({ seconds, onComplete, className }: AppStepTimeChipProps) {
  const [remaining, setRemaining] = useState(seconds);
  const [running, setRunning] = useState(false);
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

  return (
    <button
      type="button"
      onClick={() => setRunning((r) => !r)}
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border-[1.5px] px-2.5 py-1 font-mono text-[11.5px] font-bold',
        running
          ? 'border-[var(--ink)] bg-[var(--danfo)] text-[var(--ink)]'
          : 'border-[var(--hair-2)] bg-[var(--sheet)] text-[var(--ink)] hover:border-[var(--ink)]',
        className,
      )}
    >
      {running ? '⏱' : '▶'} {fmt(remaining)}
    </button>
  );
}
