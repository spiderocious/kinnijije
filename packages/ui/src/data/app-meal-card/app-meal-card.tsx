import { Repeat, Show } from 'meemaw';

import { cn } from '../../utils/cn.ts';
import { AppButton } from '../../primitives/app-button/index.ts';
import { AppText } from '../../primitives/app-text/index.ts';
import { AppMatchLine } from '../app-match-line/index.ts';
import { AppPhotoPlaceholder, AppVTag, type DishFamily } from '../app-photo/index.ts';

// THE SIGNATURE OBJECT. Every meal the product proposes arrives as this card:
// the photo (appetite), the match line (the only question that matters), honest
// provenance (Verified vs AI), and exactly one action. A weak match demotes its
// own CTA to secondary — honest that it's a project, not tonight's dinner.
// Spec: 21-suggestion-card.html · 27-cards.html.
export type AppMealCardSize = 'lg' | 'sm';
export type AppMealProvenance = 'verified' | 'ai';

export interface AppMealCardProps {
  readonly name: string;
  readonly family: DishFamily;
  readonly photoSrc?: string;
  readonly provenance: AppMealProvenance;
  readonly have: number;
  readonly total: number;
  readonly need?: number;
  /** Tabular meta strip, e.g. ['45 MIN', 'SERVES 4', 'MEDIUM']. */
  readonly meta: readonly string[];
  /** Approximate cook time (AI) → the strip already carries ≈; this is for honesty only. */
  readonly size?: AppMealCardSize;
  /** Perfect-match: show the green "cook it right now" banner. */
  readonly perfect?: boolean;
  /** Weak match → CTA becomes secondary automatically when this is true. */
  readonly weak?: boolean;
  readonly ctaLabel?: string;
  readonly onOpen?: () => void;
  readonly onSave?: () => void;
  readonly className?: string;
}

export function AppMealCard({
  name,
  family,
  photoSrc,
  provenance,
  have,
  total,
  need = 0,
  meta,
  size = 'lg',
  perfect = false,
  weak = false,
  ctaLabel = 'Open recipe',
  onOpen,
  onSave,
  className,
}: AppMealCardProps) {
  const lg = size === 'lg';
  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-card border-2 border-[var(--ink)] bg-[var(--sheet)] shadow-paint',
        className,
      )}
    >
      <Show when={perfect}>
        <div className="bg-[var(--have)] px-3.5 py-1.5 text-[10.5px] font-extrabold uppercase tracking-[0.12em] text-[#F2F8EE]">
          Cook it right now — nothing to buy
        </div>
      </Show>

      <AppPhotoPlaceholder
        family={family}
        src={photoSrc}
        className={lg ? 'h-[180px]' : 'h-[120px]'}
        note={provenance === 'ai' && photoSrc === undefined ? 'category image' : undefined}
      >
        <AppVTag variant={provenance}>{provenance === 'verified' ? '✓ Verified' : 'AI'}</AppVTag>
      </AppPhotoPlaceholder>

      <div className={lg ? 'p-[18px]' : 'p-3.5'}>
        <AppText variant={lg ? 'dish-lg' : 'dish-md'}>{name}</AppText>

        <div className="my-2">
          <AppMatchLine have={have} total={total} need={need} />
        </div>

        <div className="mb-3 flex items-center gap-4 border-t border-[var(--hair)] pt-2.5 font-mono text-[11.5px] tabular-nums text-[var(--ink-2)]">
          <Repeat each={[...meta]}>{(m: string) => <span key={m}>{m}</span>}</Repeat>
        </div>

        <div className="flex items-center gap-2.5">
          <AppButton
            variant={weak ? 'secondary' : 'primary'}
            size={lg ? 'md' : 'sm'}
            onClick={onOpen}
          >
            {ctaLabel}
          </AppButton>
          <button
            type="button"
            onClick={onSave}
            className="ml-auto cursor-pointer text-[12.5px] font-bold text-[var(--ink-3)] transition-colors hover:text-[var(--ink)]"
            aria-label="Save"
          >
            ♡ Save
          </button>
        </div>
      </div>
    </div>
  );
}
