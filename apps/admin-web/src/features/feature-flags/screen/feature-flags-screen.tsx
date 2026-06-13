import { Repeat } from 'meemaw';

import type { FeatureFlag } from '@kinnijije/core';
import { AppSwitch, AppText, DrawerService } from '@kinnijije/ui';

import { errorMessage } from '@shared/helpers/error-message.ts';
import { PageHeader } from '@shared/ui/admin-shell.tsx';
import { QueryState } from '@shared/ui/query-state.tsx';

import { useFeatureFlags, useToggleFlag } from '../api/use-feature-flags.ts';

// Runtime feature switches. Toggling a switch PATCHes immediately and shows a
// toast. Gates things like photo/voice input, AI generation, and sign-ups.
export function FeatureFlagsScreen() {
  const flags = useFeatureFlags();
  const toggle = useToggleFlag();

  const onToggle = (flag: FeatureFlag, enabled: boolean) => {
    toggle.mutate(
      { key: flag.key, enabled },
      {
        onSuccess: () =>
          DrawerService.toast(`${flag.key} ${enabled ? 'enabled' : 'disabled'}`, { tone: 'success' }),
        onError: (err) => DrawerService.toast(errorMessage(err), { tone: 'warn' }),
      },
    );
  };

  return (
    <>
      <PageHeader title="Feature flags" subtitle="Turn platform features on and off" />
      <QueryState query={flags}>
        {(items) => (
          <div className="flex flex-col gap-3">
            <Repeat each={items}>
              {(flag) => (
                <div
                  key={flag.key}
                  className="flex items-center justify-between gap-4 rounded-card border-2 border-[var(--hair-2)] bg-[var(--sheet)] p-4"
                >
                  <div className="min-w-0">
                    <AppText variant="heading-3" className="font-mono text-[14px]">
                      {flag.key}
                    </AppText>
                    <AppText variant="body-sm" className="mt-0.5 text-[var(--ink-3)]">
                      {flag.description}
                    </AppText>
                  </div>
                  <AppSwitch
                    checked={flag.enabled}
                    aria-label={`Toggle ${flag.key}`}
                    onChange={(enabled) => onToggle(flag, enabled)}
                  />
                </div>
              )}
            </Repeat>
          </div>
        )}
      </QueryState>
    </>
  );
}
