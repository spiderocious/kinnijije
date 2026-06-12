import { AppSkeleton, AppEmptyState, AppErrorState, AppNoMatch, AppButton, AppChip } from '@kinnijije/ui';

import { PreviewGrid, PreviewStamp, Section } from './preview-canvas.tsx';

export function StatesPart() {
  return (
    <div>
      <PreviewStamp num="25" title="Skeletons & empty" meta="loading mirrors layout · empties speak softly" />

      <Section title="loading + empty" description="Skeleton is the exact shape of what's coming. Empties always point back to the input loop.">
        <PreviewGrid cols={2}>
          <AppSkeleton />
          <AppEmptyState
            title="No favourites yet"
            description="When a dish sweet you, save it here — next time it's one tap from 'what's in your kitchen?' to cooking."
            action={<AppButton variant="primary">Find tonight&rsquo;s meal</AppButton>}
          />
        </PreviewGrid>
      </Section>

      <Section title="error + no-match" description="Errors lead with a sienna edge and always offer the typed fallback. No-match never shames; offers two outs.">
        <PreviewGrid cols={2}>
          <AppErrorState
            title="Couldn't read that photo"
            description="The light's working against us — the photo came through too dark to name anything. Try the flash, or type the ingredients instead."
            action={
              <>
                <AppButton variant="secondary" size="sm">
                  ↻ Retake photo
                </AppButton>
                <AppButton variant="ghost" size="sm">
                  Type instead
                </AppButton>
              </>
            }
          />
          <AppNoMatch description="With just these two, no full meal matches. Add one or two more things — even seasoning counts.">
            <AppChip>Eggs</AppChip>
            <AppChip>Half a yam</AppChip>
            <AppChip tone="add">+ Add more</AppChip>
          </AppNoMatch>
        </PreviewGrid>
      </Section>
    </div>
  );
}
