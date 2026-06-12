import { type ReactNode } from 'react';

import { cn } from '../../utils/cn.ts';
import { AppButton } from '../../primitives/app-button/index.ts';

// Loading + empty + error states. Loading mirrors layout; empties speak softly
// and always point back to the input loop; errors lead with a sienna edge and
// always offer the typed fallback. Spec: 25-skeletons-empty.html.

// ── Skeleton: the suggestion-card shape, shimmering ──
export interface AppSkeletonProps {
  readonly className?: string;
}

export function AppSkeleton({ className }: AppSkeletonProps) {
  return (
    <div
      className={cn(
        'overflow-hidden rounded-card border-2 border-[var(--ink)] bg-[var(--sheet)] shadow-paint',
        className,
      )}
    >
      <div className="kj-skel h-[150px] bg-[var(--paper-deep)]" />
      <div className="p-4">
        <div className="kj-skel mb-2.5 h-[22px] w-[65%] rounded bg-[var(--paper-deep)]" />
        <div className="kj-skel mb-2.5 h-3 w-[80%] rounded bg-[var(--paper-deep)]" />
        <div className="kj-skel h-3 w-1/2 rounded bg-[var(--paper-deep)]" />
      </div>
    </div>
  );
}

// ── Empty state: dashed glyph frame, italic explainer, a way out ──
export interface AppEmptyStateProps {
  readonly glyph?: ReactNode;
  readonly title: string;
  readonly description: string;
  readonly action?: ReactNode;
  readonly className?: string;
}

export function AppEmptyState({ glyph = '♡', title, description, action, className }: AppEmptyStateProps) {
  return (
    <div
      className={cn(
        'rounded-card border border-[var(--hair-2)] bg-[var(--sheet)] px-[26px] py-8 text-center',
        className,
      )}
    >
      <div className="mx-auto mb-3.5 grid h-16 w-16 place-items-center rounded-card border-2 border-dashed border-[var(--ink-4)] text-[26px] text-[var(--ink-4)]">
        {glyph}
      </div>
      <div className="font-display text-[22px] uppercase tracking-display">{title}</div>
      <p className="mx-auto my-2 max-w-[38ch] text-[13px] italic leading-relaxed text-[var(--ink-3)]">
        {description}
      </p>
      {action !== undefined ? <div className="mt-2">{action}</div> : null}
    </div>
  );
}

// ── Error state: sienna edge, plain words, the typed fallback ──
export interface AppErrorStateProps {
  readonly title: string;
  readonly description: string;
  readonly action?: ReactNode;
  readonly className?: string;
}

export function AppErrorState({ title, description, action, className }: AppErrorStateProps) {
  return (
    <div
      className={cn(
        'overflow-hidden rounded-card border border-[var(--hair-2)] bg-[var(--sheet)]',
        className,
      )}
    >
      <div className="h-[5px] bg-[var(--warn)]" />
      <div className="px-5 py-[18px]">
        <div className="text-[14px] font-extrabold text-[var(--warn)]">{title}</div>
        <p className="my-1.5 text-[12.5px] leading-relaxed text-[var(--ink-2)]">{description}</p>
        {action !== undefined ? <div className="flex gap-2.5">{action}</div> : null}
      </div>
    </div>
  );
}

// ── No-match: too few ingredients; never shames, offers two outs ──
export interface AppNoMatchProps {
  readonly title?: string;
  readonly description: string;
  readonly children?: ReactNode; // chips
  readonly onTryAnyway?: () => void;
  readonly onImprovise?: () => void;
  readonly className?: string;
}

export function AppNoMatch({
  title = 'Hmm — slim pickings',
  description,
  children,
  onTryAnyway,
  onImprovise,
  className,
}: AppNoMatchProps) {
  return (
    <div
      className={cn(
        'rounded-card border-2 border-[var(--ink)] bg-[var(--sheet)] p-[22px] text-center shadow-paint',
        className,
      )}
    >
      <div className="font-display text-[22px] uppercase tracking-display">{title}</div>
      <p className="mx-auto my-1.5 max-w-[42ch] text-[13px] leading-relaxed text-[var(--ink-2)]">
        {description}
      </p>
      {children !== undefined ? (
        <div className="mb-4 flex flex-wrap justify-center gap-1.5">{children}</div>
      ) : null}
      <div className="flex justify-center gap-3">
        <AppButton variant="secondary" onClick={onTryAnyway}>
          ↻ Try anyway
        </AppButton>
        <AppButton variant="ghost" onClick={onImprovise}>
          AI improvise
        </AppButton>
      </div>
    </div>
  );
}
