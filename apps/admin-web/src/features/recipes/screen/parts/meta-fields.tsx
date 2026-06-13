import { AppField, AppInput, AppSegmented } from '@kinnijije/ui';

import type { FormErrors, RecipeFormState } from '../../helpers/recipe-form.ts';

const DIFFICULTY_OPTIONS = [
  { value: 'easy', label: 'Easy' },
  { value: 'medium', label: 'Medium' },
  { value: 'involved', label: 'Involved' },
] as const;

interface MetaFieldsProps {
  readonly form: RecipeFormState;
  readonly errors: FormErrors;
  readonly onPatch: (patch: Partial<RecipeFormState>) => void;
}

// The scalar recipe fields. Two-column grid on desktop, single column on mobile.
export function MetaFields({ form, errors, onPatch }: MetaFieldsProps) {
  return (
    <div className="flex flex-col gap-4">
      <AppField label="Dish name" htmlFor="name" error={errors.name}>
        <AppInput
          id="name"
          value={form.name}
          invalid={errors.name !== undefined}
          placeholder="e.g. Jollof Rice"
          onChange={(e) => onPatch({ name: e.target.value })}
        />
      </AppField>

      <AppField label="Cuisines" htmlFor="cuisines" hint="Comma-separated, e.g. Nigerian, West African">
        <AppInput
          id="cuisines"
          value={form.cuisines}
          placeholder="Nigerian, West African"
          onChange={(e) => onPatch({ cuisines: e.target.value })}
        />
      </AppField>

      <AppField label="Difficulty">
        <AppSegmented
          options={DIFFICULTY_OPTIONS}
          value={form.difficulty}
          onChange={(value) => onPatch({ difficulty: value })}
          aria-label="Difficulty"
        />
      </AppField>

      <div className="grid grid-cols-2 gap-3">
        <AppField label="Cook time (mins)" htmlFor="cookTime" error={errors.cookTimeMinutes}>
          <AppInput
            id="cookTime"
            type="number"
            inputMode="numeric"
            mono
            value={form.cookTimeMinutes}
            invalid={errors.cookTimeMinutes !== undefined}
            onChange={(e) => onPatch({ cookTimeMinutes: e.target.value })}
          />
        </AppField>
        <AppField label="Serves" htmlFor="serves" error={errors.serves}>
          <AppInput
            id="serves"
            type="number"
            inputMode="numeric"
            mono
            value={form.serves}
            invalid={errors.serves !== undefined}
            onChange={(e) => onPatch({ serves: e.target.value })}
          />
        </AppField>
      </div>
    </div>
  );
}
