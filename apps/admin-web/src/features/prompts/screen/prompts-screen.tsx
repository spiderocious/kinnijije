import type { Prompt, PromptKey } from '@kinnijije/core';

import { PageHeader } from '@shared/ui/admin-shell.tsx';
import { QueryState } from '@shared/ui/query-state.tsx';

import { usePrompts } from '../api/use-prompts.ts';
import { PromptCard } from './parts/prompt-card.tsx';

const KEYS: PromptKey[] = ['vision', 'parse', 'generate'];

// Edit the AI prompt templates. The backend keeps every key's active version;
// saving a card creates a new active version. Tunes the Nigerian-first system
// prompts without a deploy.
export function PromptsScreen() {
  const prompts = usePrompts();

  return (
    <>
      <PageHeader
        title="Prompts"
        subtitle="Tune the AI’s instructions — each save creates a new active version"
      />
      <QueryState query={prompts}>
        {(all) => {
          const activeByKey = new Map<PromptKey, Prompt>();
          for (const p of all) {
            if (p.active) activeByKey.set(p.key, p);
          }
          return (
            <div className="flex flex-col gap-5">
              {KEYS.map((key) => (
                <PromptCard key={key} promptKey={key} active={activeByKey.get(key)} />
              ))}
            </div>
          );
        }}
      </QueryState>
    </>
  );
}
