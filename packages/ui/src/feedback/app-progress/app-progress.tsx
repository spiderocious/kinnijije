import { cn } from '../../utils/cn.ts';

// The linear progress family: stripe fill for journey progress, flat danfo for
// a draining timer, marching stripe for indeterminate. Spec: 24-progress.html.
export type AppProgressVariant = 'journey' | 'timer' | 'indeterminate';

export interface AppProgressBarProps {
  readonly variant?: AppProgressVariant;
  /** 0..1 for journey/timer. Ignored for indeterminate. */
  readonly value?: number;
  readonly className?: string;
  readonly 'aria-label'?: string;
}

export function AppProgressBar({
  variant = 'journey',
  value = 0,
  className,
  'aria-label': ariaLabel,
}: AppProgressBarProps) {
  const pct = Math.max(0, Math.min(1, value)) * 100;
  return (
    <div
      role="progressbar"
      aria-label={ariaLabel}
      aria-valuenow={variant === 'indeterminate' ? undefined : Math.round(pct)}
      className={cn(
        'h-3 overflow-hidden rounded-[3px] border-2 border-[var(--ink)] bg-[var(--sheet)]',
        className,
      )}
    >
      {variant === 'indeterminate' ? (
        <div className="kj-indeterminate h-full w-[30%] bg-[image:var(--stripe)]" />
      ) : variant === 'journey' ? (
        <div className="h-full bg-[image:var(--stripe)]" style={{ width: `${pct}%` }} />
      ) : (
        <div
          className="h-full border-r-2 border-[var(--ink)] bg-[var(--danfo)]"
          style={{ width: `${pct}%` }}
        />
      )}
    </div>
  );
}
