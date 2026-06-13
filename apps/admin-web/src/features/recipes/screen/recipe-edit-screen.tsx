import { useMemo, useState, type FormEvent } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Show } from 'meemaw';

import { ROUTES } from '@kinnijije/core';
import { AppButton, AppPill, DrawerService } from '@kinnijije/ui';

import { errorMessage } from '@shared/helpers/error-message.ts';
import { PageHeader } from '@shared/ui/admin-shell.tsx';
import { QueryState } from '@shared/ui/query-state.tsx';

import {
  useCreateRecipe,
  useDeleteRecipe,
  usePublishRecipe,
  useRecipe,
  useUpdateRecipe,
} from '../api/use-recipes.ts';
import {
  EMPTY_FORM,
  formToPayload,
  recipeToForm,
  validateForm,
  type RecipeFormState,
} from '../helpers/recipe-form.ts';
import { GenerateDraftButton } from './parts/generate-draft-button.tsx';
import { HeroUpload } from './parts/hero-upload.tsx';
import { IngredientsEditor } from './parts/ingredients-editor.tsx';
import { MetaFields } from './parts/meta-fields.tsx';
import { StepsEditor } from './parts/steps-editor.tsx';

// Create + edit a recipe. /recipes/new → create; /recipes/:id → edit an existing
// one. The screen is the composition root; field groups live in parts/ and the
// form ↔ payload coercion in helpers/.
export function RecipeEditScreen() {
  const params = useParams();
  const id = params.id;

  // Editing an existing recipe requires loading it first.
  const recipeQuery = useRecipe(id);

  if (id) {
    return (
      <QueryState query={recipeQuery}>
        {(recipe) => <EditForm key={recipe.id} initial={recipeToForm(recipe)} recipeId={recipe.id} recipeStatus={recipe.status} recipeSource={recipe.source} heroNode={<HeroUpload recipe={recipe} />} />}
      </QueryState>
    );
  }

  return <EditForm initial={EMPTY_FORM} />;
}

interface EditFormProps {
  readonly initial: RecipeFormState;
  readonly recipeId?: string;
  readonly recipeStatus?: 'draft' | 'published';
  readonly recipeSource?: 'seed' | 'ai';
  readonly heroNode?: React.ReactNode;
}

function EditForm({ initial, recipeId, recipeStatus, recipeSource, heroNode }: EditFormProps) {
  const navigate = useNavigate();
  const [form, setForm] = useState<RecipeFormState>(initial);
  const [submitted, setSubmitted] = useState(false);

  const create = useCreateRecipe();
  const update = useUpdateRecipe(recipeId ?? '');
  const publish = usePublishRecipe();
  const remove = useDeleteRecipe();

  const errors = useMemo(() => (submitted ? validateForm(form) : {}), [submitted, form]);
  const patch = (p: Partial<RecipeFormState>) => setForm((f) => ({ ...f, ...p }));

  const isEditing = recipeId !== undefined;
  const saving = create.isPending || update.isPending;
  const source = recipeSource ?? 'seed';

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    const validation = validateForm(form);
    if (Object.keys(validation).length > 0) return;

    if (isEditing) {
      update.mutate(formToPayload(form, { status: recipeStatus ?? 'draft', source }), {
        onSuccess: () => DrawerService.toast('Recipe saved', { tone: 'success' }),
        onError: (err) => DrawerService.toast(errorMessage(err, 'Save failed'), { tone: 'warn' }),
      });
    } else {
      create.mutate(formToPayload(form, { status: 'draft', source: 'seed' }), {
        onSuccess: (recipe) => {
          DrawerService.toast('Recipe created as a draft', { tone: 'success' });
          navigate(ROUTES.ADMIN_RECIPE(recipe.id), { replace: true });
        },
        onError: (err) => DrawerService.toast(errorMessage(err, 'Create failed'), { tone: 'warn' }),
      });
    }
  };

  const onTogglePublish = () => {
    if (!recipeId) return;
    const next = recipeStatus !== 'published';
    publish.mutate(
      { id: recipeId, publish: next },
      {
        onSuccess: () =>
          DrawerService.toast(next ? 'Recipe published' : 'Recipe unpublished', { tone: 'success' }),
        onError: (err) => DrawerService.toast(errorMessage(err), { tone: 'warn' }),
      },
    );
  };

  const onDelete = () => {
    if (!recipeId) return;
    DrawerService.critical('Delete this recipe?', {
      description: 'This permanently removes the recipe. This cannot be undone.',
      confirmLabel: 'Delete recipe',
      confirmPhrase: 'DELETE',
      confirmPrompt: 'Type DELETE to confirm',
      onConfirm: () => {
        remove.mutate(recipeId, {
          onSuccess: () => {
            DrawerService.toast('Recipe deleted', { tone: 'success' });
            navigate(ROUTES.ADMIN_RECIPES, { replace: true });
          },
          onError: (err) => DrawerService.toast(errorMessage(err), { tone: 'warn' }),
        });
      },
    });
  };

  return (
    <>
      <PageHeader
        title={isEditing ? 'Edit recipe' : 'New recipe'}
        subtitle={isEditing ? undefined : 'Created as a draft — publish when it’s ready'}
        action={
          <Show when={isEditing}>
            <div className="flex items-center gap-2">
              <AppPill tone={recipeStatus === 'published' ? 'easy' : 'warn'} small>
                {recipeStatus}
              </AppPill>
              <AppButton variant="secondary" size="sm" onClick={onTogglePublish} loading={publish.isPending}>
                {recipeStatus === 'published' ? 'Unpublish' : 'Publish'}
              </AppButton>
            </div>
          </Show>
        }
      />

      <Show when={!isEditing}>
        <div className="mb-5">
          <GenerateDraftButton
            onGenerated={(recipe) => navigate(ROUTES.ADMIN_RECIPE(recipe.id), { replace: true })}
          />
        </div>
      </Show>

      <form onSubmit={onSubmit} noValidate className="flex flex-col gap-6">
        <section className="rounded-card border-2 border-[var(--ink)] bg-[var(--sheet)] p-4 shadow-paint sm:p-5">
          <MetaFields form={form} errors={errors} onPatch={patch} />
        </section>

        <Show when={heroNode !== undefined}>
          <section>{heroNode}</section>
        </Show>

        <section className="rounded-card border-2 border-[var(--ink)] bg-[var(--sheet)] p-4 shadow-paint sm:p-5">
          <IngredientsEditor
            rows={form.ingredients}
            onChange={(ingredients) => patch({ ingredients })}
            error={errors.ingredients}
          />
        </section>

        <section className="rounded-card border-2 border-[var(--ink)] bg-[var(--sheet)] p-4 shadow-paint sm:p-5">
          <StepsEditor rows={form.steps} onChange={(steps) => patch({ steps })} error={errors.steps} />
        </section>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <AppButton type="submit" variant="primary" size="lg" loading={saving} disabled={saving}>
            {isEditing ? 'Save changes' : 'Create draft'}
          </AppButton>
          <Show when={isEditing}>
            <AppButton type="button" variant="crit" size="md" onClick={onDelete}>
              Delete
            </AppButton>
          </Show>
        </div>
      </form>
    </>
  );
}
