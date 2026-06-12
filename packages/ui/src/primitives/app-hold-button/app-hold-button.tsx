import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';

import { cn } from '../../utils/cn.ts';

// The irreversible ornament: solid crimson + hold-to-confirm with a visible
// fill. The only solid red object in the system. Releasing early cancels.
// Spec: 10-buttons.html (the holdrow / hold-btn).
export interface AppHoldButtonProps {
  readonly children: ReactNode;
  readonly onConfirm: () => void;
  /** Hold duration in ms before confirm fires. Default 2000. */
  readonly holdMs?: number;
  readonly disabled?: boolean;
  readonly className?: string;
}

export function AppHoldButton({
  children,
  onConfirm,
  holdMs = 2000,
  disabled = false,
  className,
}: AppHoldButtonProps) {
  const [progress, setProgress] = useState(0); // 0..1
  const rafRef = useRef<number | null>(null);
  const startRef = useRef<number | null>(null);
  const firedRef = useRef(false);

  const stop = useCallback(() => {
    if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
    startRef.current = null;
    if (!firedRef.current) setProgress(0);
  }, []);

  const tick = useCallback(
    (now: number) => {
      if (startRef.current === null) startRef.current = now;
      const elapsed = now - startRef.current;
      const p = Math.min(1, elapsed / holdMs);
      setProgress(p);
      if (p >= 1) {
        if (!firedRef.current) {
          firedRef.current = true;
          onConfirm();
        }
        return;
      }
      rafRef.current = requestAnimationFrame(tick);
    },
    [holdMs, onConfirm],
  );

  const start = useCallback(() => {
    if (disabled || firedRef.current) return;
    rafRef.current = requestAnimationFrame(tick);
  }, [disabled, tick]);

  useEffect(() => {
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return (
    <button
      type="button"
      disabled={disabled}
      onPointerDown={start}
      onPointerUp={stop}
      onPointerLeave={stop}
      onPointerCancel={stop}
      className={cn(
        'relative w-full overflow-hidden rounded-ctrl border-2 border-[var(--crit)] bg-[var(--crit)]',
        'h-10 px-[18px] font-sans text-[13.5px] font-extrabold text-[#FBF2EE]',
        'cursor-pointer select-none transition-[filter] focus-visible:outline-none',
        'focus-visible:shadow-[0_0_0_3px_rgba(161,18,18,0.45)]',
        'disabled:cursor-not-allowed disabled:opacity-45',
        className,
      )}
    >
      <span
        className="pointer-events-none absolute inset-y-0 left-0 bg-[rgba(0,0,0,0.22)]"
        style={{ width: `${progress * 100}%` }}
      />
      <span className="relative">{children}</span>
    </button>
  );
}
