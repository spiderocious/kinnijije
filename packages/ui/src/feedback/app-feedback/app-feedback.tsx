import { type ReactNode } from 'react';

import { cn } from '../../utils/cn.ts';

// Toasts, banners, callouts. Per the stance: toasts are ink slips with yellow
// accents (success never uses green — green means "you have it"); banners are
// cream strips (sienna for offline, danfo tint for the install nudge). Spec:
// 41-feedback.html.
export type FeedbackTone = 'default' | 'success' | 'warn' | 'offline' | 'install';

// ── Toast: ink slip, yellow accent, optional Undo action ──
export interface AppToastProps {
  readonly children: ReactNode;
  readonly tone?: FeedbackTone;
  readonly action?: { label: string; onClick: () => void };
  readonly className?: string;
}

export function AppToast({ children, tone = 'default', action, className }: AppToastProps) {
  return (
    <div
      className={cn(
        'flex max-w-[360px] items-center gap-3 rounded-card bg-[var(--ink)] px-4 py-3 text-[13px] font-semibold text-[var(--paper)] shadow-paint-sm',
        className,
      )}
    >
      {tone === 'success' ? <span className="font-extrabold text-[var(--danfo)]">✓</span> : null}
      <span className="flex-1">{children}</span>
      {action !== undefined ? (
        <button
          type="button"
          onClick={action.onClick}
          className="ml-auto cursor-pointer whitespace-nowrap text-[12.5px] font-extrabold text-[var(--danfo)]"
        >
          {action.label}
        </button>
      ) : null}
    </div>
  );
}

// ── Banner: cream/sienna strip with underlined action ──
export interface AppBannerProps {
  readonly title: ReactNode;
  readonly description?: ReactNode;
  readonly tone?: FeedbackTone;
  readonly icon?: ReactNode;
  readonly cta?: { label: string; onClick: () => void };
  readonly className?: string;
}

const BANNER_TONE: Record<FeedbackTone, string> = {
  default: 'bg-[var(--danfo-tint)] border-[var(--danfo-edge)] text-[var(--ink)]',
  success: 'bg-[var(--have-bg)] border-[var(--have-edge)] text-[var(--ink)]',
  warn: 'bg-[var(--warn-bg)] border-[var(--warn-edge)] text-[var(--warn)]',
  offline: 'bg-[var(--warn-bg)] border-[var(--warn-edge)] text-[var(--warn)]',
  install: 'bg-[var(--danfo-tint)] border-[var(--danfo-edge)] text-[var(--ink)]',
};

export function AppBanner({ title, description, tone = 'default', icon, cta, className }: AppBannerProps) {
  return (
    <div
      className={cn(
        'flex items-center gap-3 rounded-card border-[1.5px] px-4 py-[11px] text-[12.5px] font-semibold',
        BANNER_TONE[tone],
        className,
      )}
    >
      {icon !== undefined ? <span className="inline-flex">{icon}</span> : null}
      <span className="flex-1">
        {title}
        {description !== undefined ? (
          <span className="ml-1 font-normal opacity-90">{description}</span>
        ) : null}
      </span>
      {cta !== undefined ? (
        <button
          type="button"
          onClick={cta.onClick}
          className="ml-auto cursor-pointer whitespace-nowrap font-extrabold underline decoration-2 underline-offset-2"
        >
          {cta.label}
        </button>
      ) : null}
    </div>
  );
}

// ── Callout: inline tip (appears inside cook mode's longer waits) ──
export interface AppCalloutProps {
  readonly children: ReactNode;
  readonly className?: string;
}

export function AppCallout({ children, className }: AppCalloutProps) {
  return (
    <div
      className={cn(
        'rounded-card border-[1.5px] border-[var(--danfo-edge)] bg-[var(--danfo-tint)] px-4 py-3.5 text-[12.5px] leading-relaxed text-[var(--ink-2)]',
        className,
      )}
    >
      {children}
    </div>
  );
}
