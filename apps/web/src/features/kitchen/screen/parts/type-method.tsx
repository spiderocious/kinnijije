import { useState } from 'react';
import { Repeat, Show } from 'meemaw';

import { AppButton, AppInput } from '@kinnijije/ui';
import { IconPlus, IconSearch } from '@icons';

import { useDebouncedValue } from '@shared/hooks/use-debounced-value.ts';

import { useIngredientSuggest } from '../../api/use-ingredients.ts';

// The Type input method: a text field with live autosuggest from the
// Nigerian-weighted dictionary. Picking a suggestion (or pressing Enter) adds it.
export function TypeMethod({ onAdd }: { onAdd: (items: string[]) => void }) {
  const [text, setText] = useState('');
  const debounced = useDebouncedValue(text.trim(), 200);
  const suggest = useIngredientSuggest(debounced);

  const commit = (value: string) => {
    const v = value.trim();
    if (v.length === 0) return;
    onAdd([v]);
    setText('');
  };

  const suggestions = (suggest.data ?? []).filter((s) => s.toLowerCase() !== text.trim().toLowerCase());

  return (
    <div>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          commit(text);
        }}
      >
        <AppInput
          aria-label="Type an ingredient"
          placeholder="Tomatoes, rice, chicken, eggs…"
          value={text}
          leading={<IconSearch size={16} aria-hidden="true" />}
          trailing={
            <Show when={text.trim().length > 0}>
              <button type="submit" aria-label="Add ingredient" className="text-[var(--ink-2)]">
                <IconPlus size={18} aria-hidden="true" />
              </button>
            </Show>
          }
          onChange={(e) => setText(e.target.value)}
        />
      </form>

      <Show when={suggestions.length > 0}>
        <div className="mt-3 flex flex-wrap gap-2">
          <Repeat each={suggestions}>
            {(item) => (
              <AppButton
                key={item}
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => commit(item)}
              >
                {item}
              </AppButton>
            )}
          </Repeat>
        </div>
      </Show>
    </div>
  );
}
