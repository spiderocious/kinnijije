import { useState } from 'react';
import { Show } from 'meemaw';

import type { Recipe } from '@kinnijije/core';
import { AppButton, AppField, AppInput, AppText, cn } from '@kinnijije/ui';
import { IconAi } from '@icons';

import { errorMessage } from '@shared/helpers/error-message.ts';

import { useGenerateRecipe } from '../../api/use-recipes.ts';

// Generate an AI recipe draft from a few ingredients. Inline panel (not a modal)
// so the result flows straight into editing. On success the parent navigates to
// the new draft to review + publish.
export function GenerateDraftButton({ onGenerated }: { onGenerated: (recipe: Recipe) => void }) {
  const [open, setOpen] = useState(false);
  const [ingredients, setIngredients] = useState('');
  const generate = useGenerateRecipe();

  const run = () => {
    const list = ingredients
      .split(',')
      .map((s) => s.trim())
      .filter((s) => s.length > 0);
    if (list.length === 0) return;
    generate.mutate(
      { ingredients: list, cuisines: ['Nigerian', 'West African'], difficultyFloor: 'anything' },
      { onSuccess: onGenerated },
    );
  };

  return (
    <div className={cn('rounded-card border-2 border-dashed border-[var(--hair-2)] bg-[var(--paper)] p-4')}>
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <IconAi size={18} aria-hidden="true" />
          <AppText variant="heading-3">Draft with AI</AppText>
        </div>
        <AppButton variant="ghost" size="sm" onClick={() => setOpen((o) => !o)}>
          {open ? 'Hide' : 'Try it'}
        </AppButton>
      </div>

      <Show when={open}>
        <div className="mt-3 flex flex-col gap-3">
          <AppField
            label="Ingredients"
            htmlFor="gen-ingredients"
            hint="Comma-separated. The AI drafts a recipe you can edit and publish."
          >
            <AppInput
              id="gen-ingredients"
              value={ingredients}
              placeholder="rice, pepper, chicken"
              onChange={(e) => setIngredients(e.target.value)}
            />
          </AppField>
          <Show when={generate.isError}>
            <p role="alert" className="text-[11.5px] font-semibold text-[var(--warn)]">
              {errorMessage(generate.error, 'Generation failed')}
            </p>
          </Show>
          <AppButton
            type="button"
            variant="secondary"
            size="md"
            loading={generate.isPending}
            disabled={generate.isPending || ingredients.trim().length === 0}
            onClick={run}
          >
            Generate draft
          </AppButton>
        </div>
      </Show>
    </div>
  );
}
