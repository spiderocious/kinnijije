import { useState } from 'react';
import { Show } from 'meemaw';

import type { Prompt, PromptKey } from '@kinnijije/core';
import { AppButton, AppPill, AppText, DrawerService } from '@kinnijije/ui';

import { errorMessage } from '@shared/helpers/error-message.ts';

import { useUpdatePrompt } from '../../api/use-prompts.ts';

const LABELS: Record<PromptKey, string> = {
  vision: 'Photo extraction (Vision)',
  parse: 'Ingredient parsing',
  generate: 'Recipe generation',
};

// One editable prompt template. Editing + saving creates a new active version
// (the backend versions on every edit). The active version is shown.
export function PromptCard({ promptKey, active }: { promptKey: PromptKey; active: Prompt | undefined }) {
  const update = useUpdatePrompt();
  const [draft, setDraft] = useState(active?.template ?? '');
  const dirty = draft.trim() !== (active?.template ?? '').trim();

  const save = () => {
    if (!dirty || draft.trim().length === 0) return;
    update.mutate(
      { key: promptKey, template: draft.trim() },
      {
        onSuccess: () => DrawerService.toast('Prompt saved as a new version', { tone: 'success' }),
        onError: (err) => DrawerService.toast(errorMessage(err), { tone: 'warn' }),
      },
    );
  };

  return (
    <section className="rounded-card border-2 border-[var(--ink)] bg-[var(--sheet)] p-4 shadow-paint sm:p-5">
      <div className="mb-3 flex items-center justify-between gap-2">
        <AppText variant="heading-3">{LABELS[promptKey]}</AppText>
        <AppPill tone="verified" small>
          v{active?.version ?? 0}
        </AppPill>
      </div>
      <label htmlFor={`prompt-${promptKey}`} className="sr-only">
        {LABELS[promptKey]} template
      </label>
      <textarea
        id={`prompt-${promptKey}`}
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        rows={6}
        className="w-full rounded-card border-2 border-[var(--hair-2)] bg-[var(--paper)] p-3 font-mono text-[12.5px] leading-relaxed text-[var(--ink)] outline-none transition-colors focus:border-[var(--ink)]"
      />
      <div className="mt-3 flex items-center justify-end gap-2">
        <Show when={dirty}>
          <AppButton variant="ghost" size="sm" onClick={() => setDraft(active?.template ?? '')}>
            Reset
          </AppButton>
        </Show>
        <AppButton
          variant="primary"
          size="sm"
          loading={update.isPending}
          disabled={!dirty || draft.trim().length === 0 || update.isPending}
          onClick={save}
        >
          Save new version
        </AppButton>
      </div>
    </section>
  );
}
