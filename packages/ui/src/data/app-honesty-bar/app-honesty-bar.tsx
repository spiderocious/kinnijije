import { cn } from '../../utils/cn.ts';

// The honesty bar — Verified vs AI cook times never display with the same
// confidence. A verified time is a promise; an AI time is a guess dressed
// honestly (≈ mark, the padded zone hatched). Spec: 13-timers.html (.honesty).
export interface AppHonestyBarProps {
  /** Verified time in minutes (the promise). */
  readonly verifiedMin: number;
  /** AI estimated time in minutes (already padded +30%). */
  readonly aiMin: number;
  /** Scale ceiling for the bars; defaults to max of the two * ~1.6. */
  readonly maxMin?: number;
  readonly className?: string;
}

export function AppHonestyBar({ verifiedMin, aiMin, maxMin, className }: AppHonestyBarProps) {
  const ceiling = maxMin ?? Math.max(verifiedMin, aiMin) * 1.6;
  const vPct = Math.min(100, (verifiedMin / ceiling) * 100);
  const aiPct = Math.min(100, (aiMin / ceiling) * 100);

  return (
    <div
      className={cn(
        'rounded-card border border-[var(--hair-2)] bg-[var(--sheet)] px-[22px] py-[18px]',
        className,
      )}
    >
      <span className="text-[11px] font-bold uppercase tracking-overline text-[var(--ink-3)]">
        Cook time, honestly
      </span>
      <div className="mt-3 flex flex-col gap-2.5">
        <div className="grid grid-cols-[110px_1fr_auto] items-center gap-3">
          <span className="text-[12px] font-bold">Verified</span>
          <div className="h-3.5 overflow-hidden rounded-[3px] border-[1.5px] border-[var(--hair-2)] bg-[var(--paper-deep)]">
            <div
              className="h-full border-r-[1.5px] border-[var(--ink)] bg-[var(--danfo)]"
              style={{ width: `${vPct}%` }}
            />
          </div>
          <span className="font-mono text-[11.5px]">{verifiedMin} MIN</span>
        </div>
        <div className="grid grid-cols-[110px_1fr_auto] items-center gap-3">
          <span className="text-[12px] font-bold">AI estimate</span>
          <div className="relative h-3.5 overflow-hidden rounded-[3px] border-[1.5px] border-[var(--hair-2)] bg-[var(--paper-deep)]">
            <div
              className="h-full bg-[var(--danfo)] opacity-55"
              style={{ width: `${aiPct}%` }}
            />
            <div
              className="absolute inset-y-0"
              style={{
                left: `${aiPct}%`,
                width: '14%',
                background:
                  'repeating-linear-gradient(45deg, var(--danfo-edge) 0 4px, transparent 4px 8px)',
              }}
            />
          </div>
          <span className="font-mono text-[11.5px]">≈ {aiMin} MIN</span>
        </div>
      </div>
      <p className="mt-3 text-[12px] leading-relaxed text-[var(--ink-3)]">
        AI times display with the ≈ mark and the padded zone hatched.
      </p>
    </div>
  );
}
