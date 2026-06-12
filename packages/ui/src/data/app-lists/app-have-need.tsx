import { Repeat } from 'meemaw';

import { cn } from '../../utils/cn.ts';
import { AppChip } from '../../primitives/app-chip/index.ts';

// The have/need split — the product's core data display in chip form. Green
// chips only ever mean "already in your kitchen". Spec: 20-lists.html (.haveneed).
export interface AppHaveNeedProps {
  readonly have: readonly string[];
  readonly need: readonly string[];
  readonly className?: string;
}

export function AppHaveNeed({ have, need, className }: AppHaveNeedProps) {
  return (
    <div
      className={cn(
        'rounded-card border border-[var(--hair-2)] bg-[var(--sheet)] px-[18px] py-4',
        className,
      )}
    >
      <div>
        <span className="text-[11px] font-bold uppercase tracking-overline text-[var(--have)]">
          You have · {have.length}
        </span>
        <div className="mt-2 flex flex-wrap gap-1.5">
          <Repeat each={[...have]}>
            {(it: string) => (
              <AppChip key={it} tone="have">
                {it}
              </AppChip>
            )}
          </Repeat>
        </div>
      </div>
      <div className="mt-4">
        <span className="text-[11px] font-bold uppercase tracking-overline text-[var(--ink-3)]">
          You need · {need.length}
        </span>
        <div className="mt-2 flex flex-wrap gap-1.5">
          <Repeat each={[...need]}>
            {(it: string) => (
              <AppChip key={it} tone="need">
                {it}
              </AppChip>
            )}
          </Repeat>
        </div>
      </div>
    </div>
  );
}
