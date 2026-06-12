import { type ReactNode } from 'react';

import { cn } from '../../utils/cn.ts';

// Painted-gradient photo placeholder, keyed to dish family. Stands in for real
// photography (seeded dishes get real photos; AI recipes get a category image).
// The radial/linear blobs are bespoke so they live in inline style.
// Spec: _foundation.css :392-435.
export type DishFamily = 'jollof' | 'soup' | 'beans' | 'stew' | 'fried';

const GRADIENT: Record<DishFamily, string> = {
  jollof:
    'radial-gradient(ellipse at 25% 40%, #E0622E 0 18%, transparent 22%), radial-gradient(ellipse at 55% 65%, #F0A93C 0 12%, transparent 15%), radial-gradient(ellipse at 75% 35%, #8A3A1B 0 16%, transparent 19%), radial-gradient(ellipse at 42% 75%, #5C7A2E 0 9%, transparent 12%), linear-gradient(140deg, #C8531F 0%, #93371A 55%, #5E2410 100%)',
  soup: 'radial-gradient(ellipse at 35% 35%, #7E8C2E 0 16%, transparent 20%), radial-gradient(ellipse at 65% 60%, #4F5E1C 0 14%, transparent 17%), radial-gradient(ellipse at 80% 30%, #B0651E 0 10%, transparent 13%), linear-gradient(140deg, #6B7A24 0%, #485213 60%, #2E3508 100%)',
  beans:
    'radial-gradient(ellipse at 30% 45%, #B0651E 0 18%, transparent 22%), radial-gradient(ellipse at 62% 60%, #E9B33B 0 12%, transparent 15%), radial-gradient(ellipse at 75% 30%, #7A3D12 0 14%, transparent 17%), linear-gradient(140deg, #97651F 0%, #6B4413 60%, #41280A 100%)',
  stew: 'radial-gradient(ellipse at 30% 40%, #C03A1A 0 18%, transparent 22%), radial-gradient(ellipse at 60% 65%, #E0622E 0 12%, transparent 15%), radial-gradient(ellipse at 78% 32%, #6E1F0C 0 14%, transparent 17%), linear-gradient(140deg, #A92F12 0%, #75200B 60%, #471305 100%)',
  fried:
    'radial-gradient(ellipse at 32% 42%, #E9B33B 0 16%, transparent 20%), radial-gradient(ellipse at 64% 58%, #C8821F 0 13%, transparent 16%), radial-gradient(ellipse at 76% 30%, #8F5A12 0 12%, transparent 15%), linear-gradient(140deg, #D29A2A 0%, #9A6A15 60%, #5E3F0A 100%)',
};

export interface AppPhotoPlaceholderProps {
  readonly family: DishFamily;
  /** A real image URL; when present, it covers the painted fallback. */
  readonly src?: string;
  readonly alt?: string;
  /** Slot for vtag / banner overlays. */
  readonly children?: ReactNode;
  readonly className?: string;
  readonly note?: string;
}

export function AppPhotoPlaceholder({
  family,
  src,
  alt = '',
  children,
  className,
  note,
}: AppPhotoPlaceholderProps) {
  return (
    <div
      className={cn('relative overflow-hidden bg-[#C8531F]', className)}
      style={src === undefined ? { background: GRADIENT[family] } : undefined}
    >
      {src !== undefined ? (
        <img src={src} alt={alt} className="h-full w-full object-cover" />
      ) : null}
      {children}
      {note !== undefined ? (
        <span className="absolute bottom-2 right-2.5 text-[9px] font-bold uppercase tracking-[0.14em] text-[rgba(255,248,236,0.8)]">
          {note}
        </span>
      ) : null}
    </div>
  );
}

// The provenance tag pinned on a photo (Verified green / AI ink).
export interface AppVTagProps {
  readonly variant?: 'verified' | 'ai';
  readonly children: ReactNode;
  readonly className?: string;
}

export function AppVTag({ variant = 'verified', children, className }: AppVTagProps) {
  return (
    <span
      className={cn(
        'absolute left-2.5 top-2.5 inline-flex items-center gap-1.5 rounded-full border-[1.5px] border-[rgba(255,255,255,0.55)] px-2.5 py-[5px] text-[10px] font-extrabold uppercase tracking-[0.1em]',
        variant === 'verified' ? 'bg-[var(--have)] text-[#F2F8EE]' : 'bg-[var(--ink)] text-[var(--paper)]',
        className,
      )}
    >
      {children}
    </span>
  );
}
