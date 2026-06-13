import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { EP } from '@kinnijije/api';
import type { Prompt, PromptKey } from '@kinnijije/core';

import { api } from '@shared/api/client.ts';
import { QK } from '@shared/api/query-keys.ts';

export function usePrompts() {
  return useQuery({
    queryKey: QK.prompts,
    queryFn: () => api.get<{ prompts: Prompt[] }>(EP.ADMIN_PROMPTS).then((d) => d.prompts),
    staleTime: 60_000,
  });
}

export function useUpdatePrompt() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ key, template, notes }: { key: PromptKey; template: string; notes?: string }) =>
      api
        .put<{ prompt: Prompt }>(EP.ADMIN_PROMPT(key), {
          template,
          ...(notes !== undefined ? { notes } : {}),
        })
        .then((d) => d.prompt),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: QK.prompts });
    },
  });
}
