import { AppPill } from '@kinnijije/ui';

import { ComponentRow, PreviewStamp, Section } from './preview-canvas.tsx';

export function PillPart() {
  return (
    <div>
      <PreviewStamp num="26" title="Pills & status" meta="the trust taxonomy · eight tones" />
      <Section
        title="provenance + effort"
        description="Eight tones, each keeps its single meaning everywhere. Verified is green; AI is ink outline, no fill — visibly different at any size."
      >
        <ComponentRow label="full size" align="center">
          <AppPill tone="verified">✓ Verified</AppPill>
          <AppPill tone="ai">Suggested by AI</AppPill>
          <AppPill tone="easy">Easy</AppPill>
          <AppPill tone="medium">Medium</AppPill>
          <AppPill tone="involved">Involved</AppPill>
          <AppPill tone="warn">≈ Approximate</AppPill>
          <AppPill tone="crit">Deletes forever</AppPill>
        </ComponentRow>
        <ComponentRow label="small (inline in a row)" align="center">
          <AppPill tone="verified" small>
            ✓ Verified
          </AppPill>
          <AppPill tone="ai" small>
            AI
          </AppPill>
          <AppPill tone="medium" small>
            Medium
          </AppPill>
          <AppPill tone="warn" small>
            ≈ Approximate
          </AppPill>
        </ComponentRow>
      </Section>
    </div>
  );
}
