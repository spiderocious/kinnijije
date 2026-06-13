import { Repeat, Show } from 'meemaw';

import { AppButton, AppInput } from '@kinnijije/ui';
import { IconPlus, IconClose } from '@icons';

import type { RecipeFormState } from '../../helpers/recipe-form.ts';

interface IngredientsEditorProps {
  readonly rows: RecipeFormState['ingredients'];
  readonly onChange: (rows: RecipeFormState['ingredients']) => void;
  readonly error?: string;
}

// Dynamic ingredient rows: name + optional quantity, add/remove. Stacks the two
// inputs on mobile, side-by-side on desktop.
export function IngredientsEditor({ rows, onChange, error }: IngredientsEditorProps) {
  const update = (idx: number, patch: Partial<{ name: string; quantity: string }>) =>
    onChange(rows.map((r, i) => (i === idx ? { ...r, ...patch } : r)));
  const add = () => onChange([...rows, { name: '', quantity: '' }]);
  const remove = (idx: number) =>
    onChange(rows.length > 1 ? rows.filter((_, i) => i !== idx) : rows);

  return (
    <fieldset>
      <legend className="mb-2 text-[12px] font-bold text-[var(--ink)]">Ingredients</legend>
      <div className="flex flex-col gap-2">
        <Repeat each={rows}>
          {(row, idx) => (
            <div key={idx} className="flex items-start gap-2">
              <div className="grid flex-1 grid-cols-1 gap-2 sm:grid-cols-[1fr_140px]">
                <AppInput
                  aria-label={`Ingredient ${idx + 1} name`}
                  placeholder="e.g. tomatoes"
                  value={row.name}
                  onChange={(e) => update(idx, { name: e.target.value })}
                />
                <AppInput
                  aria-label={`Ingredient ${idx + 1} quantity`}
                  placeholder="quantity"
                  value={row.quantity}
                  onChange={(e) => update(idx, { quantity: e.target.value })}
                />
              </div>
              <button
                type="button"
                aria-label={`Remove ingredient ${idx + 1}`}
                onClick={() => remove(idx)}
                className="mt-1.5 grid h-8 w-8 shrink-0 place-items-center rounded-ctrl border-2 border-[var(--hair-2)] text-[var(--ink-3)] hover:border-[var(--crit)] hover:text-[var(--crit)]"
              >
                <IconClose size={15} aria-hidden="true" />
              </button>
            </div>
          )}
        </Repeat>
      </div>
      <Show when={error !== undefined}>
        <p role="alert" className="mt-1.5 text-[11.5px] font-semibold text-[var(--warn)]">
          {error}
        </p>
      </Show>
      <AppButton
        type="button"
        variant="ghost"
        size="sm"
        leadingIcon={<IconPlus size={14} />}
        onClick={add}
        className="mt-2"
      >
        Add ingredient
      </AppButton>
    </fieldset>
  );
}
