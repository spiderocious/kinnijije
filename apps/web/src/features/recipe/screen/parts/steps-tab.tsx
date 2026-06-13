import { Repeat, Show } from 'meemaw';

import type { Recipe } from '@kinnijije/core';
import { AppText } from '@kinnijije/ui';
import { IconFlag } from '@icons';

// The numbered step list with per-step heading, description, estimated time, and
// a "flag this step" link that reports a correction.
export function StepsTab({
  recipe,
  onFlagStep,
}: {
  recipe: Recipe;
  onFlagStep: (index: number) => void;
}) {
  return (
    <ol className="flex flex-col gap-3">
      <Repeat each={recipe.steps}>
        {(step) => (
          <li
            key={step.index}
            className="rounded-card border-2 border-[var(--hair-2)] bg-[var(--sheet)] p-4"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-baseline gap-2">
                <span className="font-mono text-[13px] font-bold text-[var(--ink-3)]">
                  {step.index + 1}
                </span>
                <AppText variant="heading-3">{step.heading}</AppText>
              </div>
              <Show when={step.estMinutes !== undefined}>
                <span className="shrink-0 font-mono text-[12px] text-[var(--ink-3)]">
                  {step.estMinutes}m
                </span>
              </Show>
            </div>
            <AppText variant="body-sm" className="mt-2 text-[var(--ink-2)]">
              {step.description}
            </AppText>
            <button
              type="button"
              onClick={() => onFlagStep(step.index)}
              className="mt-2 inline-flex items-center gap-1 text-[11.5px] font-semibold text-[var(--ink-3)] hover:text-[var(--warn)]"
            >
              <IconFlag size={12} aria-hidden="true" /> This isn’t quite right
            </button>
          </li>
        )}
      </Repeat>
    </ol>
  );
}
