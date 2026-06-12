import { useState } from 'react';
import { AppTooltip, AppPopover, AppDefinedTerm, AppButton, AppPill } from '@kinnijije/ui';
import { Show } from 'meemaw';

import { ComponentRow, PreviewGrid, PreviewStamp, Section } from './preview-canvas.tsx';

export function OverlaysPart() {
  const [defOpen, setDefOpen] = useState(false);

  return (
    <div>
      <PreviewStamp num="28" title="Tooltips & popovers" meta="ink chips · paned sheets" />

      <Section title="tooltips" description="Ink chips — solid signboard black, one line, never interactive. Hover or focus to show.">
        <ComponentRow align="center">
          <AppTooltip label="Saves to your favourites">
            <AppButton variant="secondary">♡ Save</AppButton>
          </AppTooltip>
          <AppTooltip label="≈ AI estimate, padded +30%">
            <span className="font-mono text-[12px] text-[var(--ink-2)]">≈ 35 MIN</span>
          </AppTooltip>
        </ComponentRow>
      </Section>

      <Section title="ingredient hovercard" description="A dotted-yellow underline marks any term a newer cook might not know; the card defines it and offers the honest swap.">
        <p className="max-w-[46ch] text-[13.5px] leading-[1.7] text-[var(--ink-2)]">
          Blend the{' '}
          <AppDefinedTerm onClick={() => setDefOpen((o) => !o)}>tatashe</AppDefinedTerm> with the
          rodo, then fry the base in the oil until it floats…
        </p>
        <Show when={defOpen}>
          <div className="mt-3">
            <AppPopover
              header={
                <>
                  <span className="font-display text-[22px] tracking-display">Tatashe</span>
                  <span className="ml-auto font-mono text-[10px] text-[var(--ink-3)]">PEPPER</span>
                </>
              }
            >
              Red bell pepper — the sweet, mild one that gives jollof its colour. Swap: any red bell
              pepper. Don&rsquo;t swap in rodo unless you mean it.
            </AppPopover>
          </div>
        </Show>
      </Section>

      <Section title="decision popovers" description="Popovers carry the pane treatment — little decisions. 'Why this suggestion?' explains the engine; the Verified popover is the trust story.">
        <PreviewGrid cols={2}>
          <AppPopover
            header={<span className="text-[13px] font-extrabold">Why this suggestion?</span>}
            footer={
              <AppButton variant="ghost" size="sm">
                Don&rsquo;t suggest jollof for a while
              </AppButton>
            }
          >
            You have 5 of its 6 ingredients, you&rsquo;ve cooked jollof twice this month, and it fits
            your &ldquo;Medium&rdquo; ceiling.
          </AppPopover>
          <AppPopover
            header={
              <>
                <span className="text-[13px] font-extrabold">Verified recipe</span>
                <AppPill tone="verified" small className="ml-auto">
                  ✓
                </AppPill>
              </>
            }
          >
            Written and tested by a person, with real quantities and timings. When you flag a step, a
            human reviews it.
          </AppPopover>
        </PreviewGrid>
      </Section>
    </div>
  );
}
