import { cn } from '../../utils/cn.ts';

// The match line — the decision. Green for what you have, grey for what you
// lack, readable in one glance, standing up, fridge open. Spec: 21 (.match).
export interface AppMatchLineProps {
  readonly have: number;
  readonly total: number;
  /** How many things still needed. Omit/0 = "uses all of yours". */
  readonly need?: number;
  readonly className?: string;
}

export function AppMatchLine({ have, total, need = 0, className }: AppMatchLineProps) {
  const usesAll = have >= total;
  return (
    <span className={cn('text-[12.5px] font-semibold', className)}>
      <span className="text-[var(--have)]">
        {usesAll ? `Uses all ${total} of your things` : `Uses ${have} of your ${total} things`}
      </span>
      {need > 0 ? (
        <>
          <span className="mx-1 text-[var(--ink-4)]">·</span>
          <span className="font-medium text-[var(--ink-3)]">
            needs {need} {need === 1 ? 'thing' : 'things'}
          </span>
        </>
      ) : null}
    </span>
  );
}
