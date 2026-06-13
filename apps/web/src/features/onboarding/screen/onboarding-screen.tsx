import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Show } from 'meemaw';

import { ROUTES } from '@kinnijije/core';
import type { DifficultyFloor } from '@kinnijije/core';
import { AppButton, AppText, cn } from '@kinnijije/ui';

import { errorMessage } from '@shared/helpers/error-message.ts';

import { useUpdatePrefs } from '../api/use-prefs.ts';
import { CuisineStep } from './parts/cuisine-step.tsx';
import { DifficultyStep } from './parts/difficulty-step.tsx';

// Onboarding — 3 skippable screens. Sets cuisine biases + difficulty floor, then
// writes them via PATCH /me/prefs. Defaults (Nigerian + West African) preselected.
const TOTAL_STEPS = 3;

export function OnboardingScreen() {
  const navigate = useNavigate();
  const updatePrefs = useUpdatePrefs();
  const [step, setStep] = useState(0);
  const [cuisines, setCuisines] = useState<string[]>(['Nigerian', 'West African']);
  const [difficultyFloor, setDifficultyFloor] = useState<DifficultyFloor>('anything');

  const finish = () => {
    updatePrefs.mutate(
      { cuisines, difficultyFloor },
      { onSuccess: () => navigate(ROUTES.KITCHEN, { replace: true }) },
    );
  };

  const skip = () => navigate(ROUTES.KITCHEN, { replace: true });
  const next = () => setStep((s) => Math.min(s + 1, TOTAL_STEPS - 1));
  const back = () => setStep((s) => Math.max(s - 1, 0));

  return (
    <main className="min-h-dvh bg-[var(--paper)] px-5 py-6">
      <div className="mx-auto w-full max-w-md">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-2" aria-label={`Step ${step + 1} of ${TOTAL_STEPS}`}>
            {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
              <span
                key={i}
                className={cn(
                  'h-2 rounded-full transition-all',
                  i === step ? 'w-6 bg-[var(--danfo)]' : 'w-2 bg-[var(--hair-2)]',
                )}
              />
            ))}
          </div>
          <AppButton variant="ghost" size="sm" onClick={skip}>
            Skip
          </AppButton>
        </div>

        <Show when={step === 0}>
          <CuisineStep selected={cuisines} onChange={setCuisines} />
        </Show>
        <Show when={step === 1}>
          <DifficultyStep value={difficultyFloor} onChange={setDifficultyFloor} />
        </Show>
        <Show when={step === 2}>
          <div className="py-6 text-center">
            <AppText variant="dish-md">You’re all set</AppText>
            <AppText variant="body" className="mt-3 text-[var(--ink-2)]">
              We’ll use this to make better suggestions. You can change it anytime in settings.
            </AppText>
          </div>
        </Show>

        <Show when={updatePrefs.isError}>
          <p role="alert" className="mt-4 text-center text-[12.5px] font-semibold text-[var(--warn)]">
            {errorMessage(updatePrefs.error)}
          </p>
        </Show>

        <div className="mt-8 flex items-center gap-3">
          <Show when={step > 0}>
            <AppButton variant="secondary" size="lg" onClick={back} className="flex-1">
              Back
            </AppButton>
          </Show>
          <Show when={step < TOTAL_STEPS - 1}>
            <AppButton variant="primary" size="lg" onClick={next} className="flex-1">
              Continue
            </AppButton>
          </Show>
          <Show when={step === TOTAL_STEPS - 1}>
            <AppButton
              variant="primary"
              size="lg"
              onClick={finish}
              loading={updatePrefs.isPending}
              className="flex-1"
            >
              Start cooking
            </AppButton>
          </Show>
        </div>
      </div>
    </main>
  );
}
