import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Show } from 'meemaw';

import { ROUTES } from '@kinnijije/core';
import type { Recipe } from '@kinnijije/core';
import {
  AppButton,
  AppPill,
  AppPhotoPlaceholder,
  AppSegmented,
  AppText,
  DrawerService,
} from '@kinnijije/ui';
import { IconBack, IconCook, IconReSuggest, IconSave } from '@icons';

import { dishFamilyFor, realPhotoSrc } from '@shared/helpers/dish-family.ts';
import { errorMessage } from '@shared/helpers/error-message.ts';
import { QueryState } from '@shared/ui/query-state.tsx';

import { useKitchenSession } from '@features/kitchen/providers/kitchen-session-provider.tsx';

import { useFlagStep, useRecipe, useSaveFavourite } from '../api/use-recipe.ts';
import { IngredientsTab } from './parts/ingredients-tab.tsx';
import { StepsTab } from './parts/steps-tab.tsx';

type Tab = 'ingredients' | 'steps';

export function RecipeScreen() {
  const params = useParams();
  const id = params.id ?? '';
  const recipe = useRecipe(id);

  return (
    <div className="flex flex-col gap-4">
      <Link
        to={ROUTES.SUGGESTIONS}
        className="inline-flex items-center gap-1.5 text-[13px] font-bold text-[var(--ink-2)] hover:text-[var(--ink)]"
      >
        <IconBack size={15} aria-hidden="true" /> Suggestions
      </Link>
      <QueryState query={recipe}>{(data) => <Loaded recipe={data} />}</QueryState>
    </div>
  );
}

function Loaded({ recipe }: { recipe: Recipe }) {
  const navigate = useNavigate();
  const { ingredients } = useKitchenSession();
  const save = useSaveFavourite();
  const flag = useFlagStep();
  const [tab, setTab] = useState<Tab>('ingredients');

  const onSave = () => {
    save.mutate(recipe.id, {
      onSuccess: () => DrawerService.toast('Saved to favourites', { tone: 'success' }),
      onError: (err) => {
        // 409 = already saved — treat as a soft success.
        const msg = errorMessage(err);
        DrawerService.toast(msg.includes('already') ? 'Already in favourites' : msg, {
          tone: msg.includes('already') ? 'default' : 'warn',
        });
      },
    });
  };

  const onFlagStep = (index: number) => {
    flag.mutate(
      { recipeId: recipe.id, target: { kind: 'step', index } },
      {
        onSuccess: () => DrawerService.toast('Thanks — we’ll take a look', { tone: 'success' }),
        onError: (err) => DrawerService.toast(errorMessage(err), { tone: 'warn' }),
      },
    );
  };

  const photoSrc = realPhotoSrc(recipe.heroImageUrl, recipe.heroImageKind);

  return (
    <>
      {/* Hero */}
      <div className="overflow-hidden rounded-card border-2 border-[var(--ink)]">
        <Show
          when={photoSrc !== undefined}
          fallback={<AppPhotoPlaceholder family={dishFamilyFor(recipe.name)} className="h-48 w-full" />}
        >
          <img
            src={photoSrc}
            alt={recipe.name}
            width={800}
            height={400}
            className="h-48 w-full object-cover"
          />
        </Show>
      </div>

      <AppText variant="dish-lg">{recipe.name}</AppText>

      {/* Meta strip */}
      <div className="flex flex-wrap items-center gap-2">
        <AppPill tone={recipe.source === 'seed' ? 'verified' : 'ai'} small>
          {recipe.source === 'seed' ? 'Verified recipe' : 'Suggested by AI'}
        </AppPill>
        <span className="font-mono text-[12px] text-[var(--ink-3)]">
          {recipe.cookTimeMinutes} min · serves {recipe.serves} · {recipe.difficulty}
        </span>
      </div>

      {/* Tabs */}
      <AppSegmented<Tab>
        options={[
          { value: 'ingredients', label: 'Ingredients' },
          { value: 'steps', label: 'Steps' },
        ]}
        value={tab}
        onChange={setTab}
        aria-label="Recipe section"
      />

      <Show when={tab === 'ingredients'}>
        <IngredientsTab recipe={recipe} sessionIngredients={ingredients} />
      </Show>
      <Show when={tab === 'steps'}>
        <StepsTab recipe={recipe} onFlagStep={onFlagStep} />
      </Show>

      {/* Bottom action bar */}
      <div className="sticky bottom-3 mt-2 flex items-center gap-2 rounded-card border-2 border-[var(--ink)] bg-[var(--sheet)] p-2 shadow-paint">
        <AppButton
          variant="secondary"
          size="md"
          leadingIcon={<IconSave size={16} />}
          loading={save.isPending}
          onClick={onSave}
          aria-label="Save to favourites"
        >
          Save
        </AppButton>
        <Link to={ROUTES.SUGGESTIONS} className="shrink-0">
          <AppButton variant="ghost" size="md" leadingIcon={<IconReSuggest size={16} />}>
            Else
          </AppButton>
        </Link>
        <AppButton
          variant="primary"
          size="md"
          leadingIcon={<IconCook size={16} />}
          onClick={() => navigate(ROUTES.COOK(recipe.id))}
          className="ml-auto"
        >
          Start cooking
        </AppButton>
      </div>
    </>
  );
}
