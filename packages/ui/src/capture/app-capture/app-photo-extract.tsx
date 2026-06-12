import { Repeat } from 'meemaw';

import { cn } from '../../utils/cn.ts';
import { AppChip } from '../../primitives/app-chip/index.ts';
import { AppPhotoPlaceholder, type DishFamily } from '../../data/app-photo/index.ts';

// Photo extraction: found items tagged on the image, uncertain ones dashed with
// a question mark. The cook always confirms before suggestions run.
// Spec: 14-capture.html (.photobox).
export interface FoundItem {
  readonly name: string;
  readonly uncertain?: boolean;
}

export interface AppPhotoExtractProps {
  readonly family?: DishFamily;
  readonly photoSrc?: string;
  readonly found: readonly FoundItem[];
  readonly note?: string;
  readonly onRemove?: (name: string) => void;
  readonly className?: string;
}

export function AppPhotoExtract({
  family = 'stew',
  photoSrc,
  found,
  note = 'Not sure about the uncertain ones — tap × if we got it wrong, or add what we missed.',
  onRemove,
  className,
}: AppPhotoExtractProps) {
  return (
    <div
      className={cn(
        'overflow-hidden rounded-card border-2 border-[var(--ink)] bg-[var(--sheet)] shadow-paint',
        className,
      )}
    >
      <AppPhotoPlaceholder family={family} src={photoSrc} className="relative h-[170px]" note="fridge photo">
        <div className="absolute inset-3 rounded-md border-2 border-dashed border-[rgba(255,248,236,0.7)]" />
      </AppPhotoPlaceholder>
      <div className="px-4 py-3.5">
        <div className="text-[11px] font-bold uppercase tracking-overline text-[var(--ink-3)]">
          Found in your photo · {found.length}
        </div>
        <div className="my-2.5 flex flex-wrap gap-1.5">
          <Repeat each={[...found]}>
            {(f: FoundItem) => (
              <AppChip key={f.name} uncertain={f.uncertain} onRemove={() => onRemove?.(f.name)}>
                {f.name}
                {f.uncertain === true ? '?' : ''}
              </AppChip>
            )}
          </Repeat>
        </div>
        <p className="text-[11px] text-[var(--ink-3)]">{note}</p>
      </div>
    </div>
  );
}

// Multi-shot: snap the fridge, the shelf, the counter; results merge. Each thumb
// keeps its source tag so a wrong extraction is easy to trace.
export interface ShotThumb {
  readonly id: string;
  readonly family: DishFamily;
  readonly tag: string;
  readonly src?: string;
}

export interface AppMultiShotProps {
  readonly shots: readonly ShotThumb[];
  readonly onAdd?: () => void;
  readonly className?: string;
}

export function AppMultiShot({ shots, onAdd, className }: AppMultiShotProps) {
  return (
    <div
      className={cn(
        'rounded-card border border-[var(--hair-2)] bg-[var(--sheet)] px-5 py-[18px]',
        className,
      )}
    >
      <div className="mb-2.5 text-[11px] font-bold uppercase tracking-overline text-[var(--ink-3)]">
        Three shots, one kitchen
      </div>
      <div className="flex gap-2.5">
        <Repeat each={[...shots]}>
          {(s: ShotThumb) => (
            <AppPhotoPlaceholder
              key={s.id}
              family={s.family}
              src={s.src}
              className="relative h-[76px] w-[76px] rounded-card border-[1.5px] border-[var(--hair-2)]"
            >
              <span className="absolute bottom-1 left-1 text-[8px] font-extrabold uppercase tracking-[0.08em] text-[rgba(255,248,236,0.9)]">
                {s.tag}
              </span>
            </AppPhotoPlaceholder>
          )}
        </Repeat>
        <button
          type="button"
          onClick={onAdd}
          className="grid h-[76px] w-[76px] cursor-pointer place-items-center rounded-card border-[1.5px] border-dashed border-[var(--ink-4)] text-[22px] text-[var(--ink-3)] hover:border-[var(--ink)] hover:text-[var(--ink)]"
          aria-label="Add another photo"
        >
          +
        </button>
      </div>
    </div>
  );
}
