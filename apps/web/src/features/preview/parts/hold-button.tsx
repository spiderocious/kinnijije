import { useState } from 'react';
import { AppHoldButton } from '@kinnijije/ui';

import { PreviewStamp, Section } from './preview-canvas.tsx';

export function HoldButtonPart() {
  const [cleared, setCleared] = useState(false);

  return (
    <div>
      <PreviewStamp num="10b" title="Hold button" meta="the irreversible ornament" />
      <Section
        title="hold to confirm"
        description="Solid crimson + hold-to-confirm with a visible fill — the only solid red object in the system. Releasing early cancels."
      >
        <div className="max-w-[360px] rounded-card border border-[var(--hair-2)] bg-[var(--sheet)] p-5">
          <p className="mb-3 text-[13px] leading-relaxed text-[var(--ink-2)]">
            <strong>Clear all favourites?</strong> 14 saved recipes will be removed. Hold the button
            for 2 seconds — releasing early cancels.
          </p>
          <AppHoldButton onConfirm={() => setCleared(true)} holdMs={1600}>
            {cleared ? '✓ Cleared' : 'Hold to clear all favourites'}
          </AppHoldButton>
          {cleared ? (
            <button
              type="button"
              onClick={() => setCleared(false)}
              className="mt-3 text-[12px] font-bold text-[var(--ink-3)] underline"
            >
              reset demo
            </button>
          ) : null}
        </div>
      </Section>
    </div>
  );
}
