import { type ReactNode } from 'react';

// Shared preview chrome — every component part renders its samples inside these.
// Styled in the buka-signboard idiom: stamp header, break rules, panes/plates.

export function PreviewStamp({
  num,
  title,
  meta,
}: {
  readonly num: string;
  readonly title: string;
  readonly meta?: string;
}) {
  return (
    <div className="mb-9 flex items-baseline gap-4 border-b-2 border-[var(--ink)] pb-4">
      <span className="font-mono text-[11px] text-[var(--ink-3)]">{num}</span>
      <span className="flex-1 font-display text-[32px] uppercase leading-none tracking-display text-[var(--ink)]">
        {title}
      </span>
      {meta !== undefined && meta !== '' ? (
        <span className="font-mono text-[11px] text-[var(--ink-3)]">{meta}</span>
      ) : null}
    </div>
  );
}

export function Section({
  title,
  description,
  children,
}: {
  readonly title: string;
  readonly description?: string;
  readonly children: ReactNode;
}) {
  return (
    <section className="mb-12">
      <div className="mb-5 flex items-center gap-3.5">
        <span className="h-0.5 w-5.5 shrink-0 bg-[var(--ink)]" style={{ width: 22 }} />
        <span className="font-mono text-[11px] tracking-[0.04em] text-[var(--ink-3)]">{title}</span>
        <span className="h-px flex-1 bg-[var(--hair)]" />
      </div>
      {description !== undefined && description !== '' ? (
        <p className="mb-5 max-w-[72ch] text-[13px] leading-relaxed text-[var(--ink-2)]">
          {description}
        </p>
      ) : null}
      {children}
    </section>
  );
}

// A labelled cell holding one or more live samples.
export function ComponentRow({
  label,
  children,
  align = 'start',
}: {
  readonly label?: string;
  readonly children: ReactNode;
  readonly align?: 'start' | 'center';
}) {
  return (
    <div className="mb-4">
      {label !== undefined && label !== '' ? (
        <div className="mb-2 font-mono text-[10px] uppercase tracking-[0.1em] text-[var(--ink-3)]">
          {label}
        </div>
      ) : null}
      <div
        className={`flex flex-wrap gap-4 ${align === 'center' ? 'items-center' : 'items-start'}`}
      >
        {children}
      </div>
    </div>
  );
}

// A grid for laying out cards/specimens 2- or 3-up.
export function PreviewGrid({
  cols = 2,
  children,
}: {
  readonly cols?: 1 | 2 | 3;
  readonly children: ReactNode;
}) {
  const map = { 1: 'grid-cols-1', 2: 'grid-cols-1 sm:grid-cols-2', 3: 'grid-cols-1 sm:grid-cols-3' };
  return <div className={`grid gap-5 ${map[cols]}`}>{children}</div>;
}
