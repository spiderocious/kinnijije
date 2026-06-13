import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Show } from 'meemaw';

import { ROUTES } from '@kinnijije/core';
import type { Recipe } from '@kinnijije/core';
import { AppButton, AppStepTimer, AppText, cn } from '@kinnijije/ui';
import { IconClose } from '@icons';

import { useWakeLock } from '@shared/hooks/use-wake-lock.ts';
import { QueryState } from '@shared/ui/query-state.tsx';

import { useRecipe } from '@features/recipe/api/use-recipe.ts';

// Cook mode — full-screen takeover, one step at a time, readable from across the
// kitchen. Screen stays awake throughout. Optional per-step timer.
export function CookScreen() {
  const params = useParams();
  const id = params.id ?? '';
  const recipe = useRecipe(id);

  return (
    <QueryState query={recipe}>{(data) => <CookFlow recipe={data} recipeId={id} />}</QueryState>
  );
}

function CookFlow({ recipe, recipeId }: { recipe: Recipe; recipeId: string }) {
  const navigate = useNavigate();
  const [index, setIndex] = useState(0);
  const [timerOn, setTimerOn] = useState(false);
  useWakeLock(true);

  const total = recipe.steps.length;
  const step = recipe.steps[index];
  const isLast = index === total - 1;

  const exit = () => navigate(ROUTES.RECIPE(recipeId));
  const goNext = () => {
    setTimerOn(false);
    if (isLast) exit();
    else setIndex((i) => Math.min(i + 1, total - 1));
  };
  const goPrev = () => {
    setTimerOn(false);
    setIndex((i) => Math.max(i - 1, 0));
  };

  if (!step) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-[var(--paper)]">
      {/* Top bar */}
      <div className="flex items-center justify-between border-b-2 border-[var(--ink)] px-4 py-3">
        <button
          type="button"
          aria-label="Exit cook mode"
          onClick={exit}
          className="grid h-9 w-9 place-items-center rounded-ctrl border-2 border-[var(--ink)]"
        >
          <IconClose size={18} aria-hidden="true" />
        </button>
        <span className="font-mono text-[13px] font-bold text-[var(--ink-3)]">
          Step {index + 1} / {total}
        </span>
        <span className="w-9" />
      </div>

      {/* Progress dots */}
      <div className="flex items-center gap-1.5 px-4 py-3">
        {recipe.steps.map((s, i) => (
          <span
            key={s.index}
            className={cn(
              'h-1.5 flex-1 rounded-full',
              i <= index ? 'bg-[var(--danfo)]' : 'bg-[var(--hair-2)]',
            )}
          />
        ))}
      </div>

      {/* Step body — large + readable */}
      <div className="flex flex-1 flex-col justify-center overflow-y-auto px-6 py-4">
        <AppText variant="dish-md" className="text-[var(--ink-3)]">
          {step.heading}
        </AppText>
        <p className="mt-4 text-[22px] leading-snug text-[var(--ink)] sm:text-[26px]">
          {step.description}
        </p>

        <Show when={step.estMinutes !== undefined}>
          <div className="mt-6">
            <Show
              when={timerOn}
              fallback={
                <AppButton variant="secondary" size="md" onClick={() => setTimerOn(true)}>
                  Start {step.estMinutes}-min timer
                </AppButton>
              }
            >
              <AppStepTimer
                stepLabel={step.heading}
                seconds={(step.estMinutes ?? 0) * 60}
                autoStart
                onComplete={() => undefined}
              />
            </Show>
          </div>
        </Show>
      </div>

      {/* Bottom nav */}
      <div className="flex items-center gap-3 border-t-2 border-[var(--ink)] px-4 py-4">
        <AppButton variant="secondary" size="lg" onClick={goPrev} disabled={index === 0} className="flex-1">
          Previous
        </AppButton>
        <AppButton variant="primary" size="lg" onClick={goNext} className="flex-1">
          {isLast ? 'Done' : 'Next step'}
        </AppButton>
      </div>
    </div>
  );
}
