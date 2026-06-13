import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Repeat, Show } from 'meemaw';

import { ROUTES } from '@kinnijije/core';
import { AppButton, AppChip, AppSegmented, AppText } from '@kinnijije/ui';

import { useRecentIngredients } from '../api/use-ingredients.ts';
import { useKitchenSession } from '../providers/kitchen-session-provider.tsx';
import { PhotoMethod } from './parts/photo-method.tsx';
import { TypeMethod } from './parts/type-method.tsx';
import { VoiceMethod } from './parts/voice-method.tsx';

type Method = 'type' | 'voice' | 'photo';

const METHODS = [
  { value: 'type', label: '📝 Type' },
  { value: 'voice', label: '🎙️ Voice' },
  { value: 'photo', label: '📸 Photo' },
] as const;

// The home / kitchen-input screen — "What's in your kitchen?". One input loop:
// pick a method, assemble ingredient chips, then "Suggest meals". The chips live
// in the kitchen session so all three methods add to the same list.
export function KitchenScreen() {
  const navigate = useNavigate();
  const { ingredients, add, remove } = useKitchenSession();
  const recent = useRecentIngredients();
  const [method, setMethod] = useState<Method>('type');

  const recentToShow = (recent.data ?? []).filter((r) => !ingredients.includes(r)).slice(0, 8);

  return (
    <div className="flex flex-col gap-5">
      <AppText variant="dish-md">What’s in your kitchen?</AppText>

      <AppSegmented<Method>
        options={METHODS}
        value={method}
        onChange={setMethod}
        aria-label="Input method"
      />

      <div className="rounded-card border-2 border-[var(--ink)] bg-[var(--sheet)] p-4 shadow-paint">
        <Show when={method === 'type'}>
          <TypeMethod onAdd={add} />
        </Show>
        <Show when={method === 'voice'}>
          <VoiceMethod onAdd={add} />
        </Show>
        <Show when={method === 'photo'}>
          <PhotoMethod onAdd={add} />
        </Show>
      </div>

      {/* Assembling chips */}
      <Show when={ingredients.length > 0}>
        <section>
          <AppText variant="overline" className="text-[var(--ink-3)]">
            In your kitchen
          </AppText>
          <div className="mt-2 flex flex-wrap gap-2">
            <Repeat each={ingredients}>
              {(item) => (
                <AppChip key={item} tone="have" onRemove={() => remove(item)}>
                  {item}
                </AppChip>
              )}
            </Repeat>
          </div>
        </section>
      </Show>

      {/* Recent ingredients */}
      <Show when={recentToShow.length > 0}>
        <section>
          <AppText variant="overline" className="text-[var(--ink-3)]">
            Or pick from recent
          </AppText>
          <div className="mt-2 flex flex-wrap gap-2">
            <Repeat each={recentToShow}>
              {(item) => (
                <AppChip key={item} tone="add" onClick={() => add([item])}>
                  {item}
                </AppChip>
              )}
            </Repeat>
          </div>
        </section>
      </Show>

      {/* Suggest CTA — sticky-ish at the bottom of the flow */}
      <div className="sticky bottom-4 mt-2">
        <AppButton
          variant="primary"
          size="lg"
          disabled={ingredients.length === 0}
          onClick={() => navigate(ROUTES.SUGGESTIONS)}
          className="w-full"
        >
          Suggest meals
        </AppButton>
      </div>
    </div>
  );
}
