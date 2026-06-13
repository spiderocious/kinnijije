import { Repeat, Show } from 'meemaw';

import { AppButton, AppInput } from '@kinnijije/ui';
import { IconPlus, IconClose } from '@icons';

import type { RecipeFormState } from '../../helpers/recipe-form.ts';

interface StepsEditorProps {
  readonly rows: RecipeFormState['steps'];
  readonly onChange: (rows: RecipeFormState['steps']) => void;
  readonly error?: string;
}

type StepRow = RecipeFormState['steps'][number];

// Dynamic step rows: heading + description (multiline) + optional est. minutes.
export function StepsEditor({ rows, onChange, error }: StepsEditorProps) {
  const update = (idx: number, patch: Partial<StepRow>) =>
    onChange(rows.map((r, i) => (i === idx ? { ...r, ...patch } : r)));
  const add = () => onChange([...rows, { heading: '', description: '', estMinutes: '' }]);
  const remove = (idx: number) =>
    onChange(rows.length > 1 ? rows.filter((_, i) => i !== idx) : rows);

  return (
    <fieldset>
      <legend className="mb-2 text-[12px] font-bold text-[var(--ink)]">Steps</legend>
      <div className="flex flex-col gap-3">
        <Repeat each={rows}>
          {(row, idx) => (
            <div
              key={idx}
              className="rounded-card border-2 border-[var(--hair-2)] bg-[var(--paper)] p-3"
            >
              <div className="mb-2 flex items-center justify-between">
                <span className="font-mono text-[12px] font-bold text-[var(--ink-3)]">
                  Step {idx + 1}
                </span>
                <button
                  type="button"
                  aria-label={`Remove step ${idx + 1}`}
                  onClick={() => remove(idx)}
                  className="grid h-7 w-7 place-items-center rounded-ctrl border-2 border-[var(--hair-2)] text-[var(--ink-3)] hover:border-[var(--crit)] hover:text-[var(--crit)]"
                >
                  <IconClose size={14} aria-hidden="true" />
                </button>
              </div>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-[1fr_120px]">
                <AppInput
                  aria-label={`Step ${idx + 1} heading`}
                  placeholder="Heading, e.g. Fry the base"
                  value={row.heading}
                  onChange={(e) => update(idx, { heading: e.target.value })}
                />
                <AppInput
                  aria-label={`Step ${idx + 1} minutes`}
                  type="number"
                  inputMode="numeric"
                  mono
                  placeholder="mins"
                  value={row.estMinutes}
                  onChange={(e) => update(idx, { estMinutes: e.target.value })}
                />
              </div>
              <textarea
                aria-label={`Step ${idx + 1} description`}
                placeholder="What to do, in 2–4 sentences."
                value={row.description}
                onChange={(e) => update(idx, { description: e.target.value })}
                rows={2}
                className="mt-2 w-full rounded-[9px] border-[1.5px] border-[var(--hair-2)] bg-[var(--sheet)] px-3.5 py-2.5 text-[14px] text-[var(--ink)] outline-none transition-colors placeholder:text-[var(--ink-4)] focus:border-[var(--ink)]"
              />
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
        Add step
      </AppButton>
    </fieldset>
  );
}
