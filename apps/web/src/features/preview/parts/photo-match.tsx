import { AppPhotoPlaceholder, AppVTag, AppMatchLine } from '@kinnijije/ui';
import { Repeat } from 'meemaw';

import { ComponentRow, PreviewGrid, PreviewStamp, Section } from './preview-canvas.tsx';

const FAMILIES = ['jollof', 'soup', 'beans', 'stew', 'fried'] as const;

export function PhotoMatchPart() {
  return (
    <div>
      <PreviewStamp num="21b" title="Photo & match" meta="painted stand-ins · the decision line" />

      <Section
        title="painted-gradient placeholders"
        description="Keyed to dish family — stands in for real photography. Seeded dishes get real photos; AI recipes get a category image."
      >
        <PreviewGrid cols={3}>
          <Repeat each={[...FAMILIES]}>
            {(f: (typeof FAMILIES)[number]) => (
              <AppPhotoPlaceholder
                key={f}
                family={f}
                className="h-[120px] rounded-card border-2 border-[var(--ink)]"
                note={f}
              >
                <AppVTag variant={f === 'fried' ? 'ai' : 'verified'}>
                  {f === 'fried' ? 'AI' : '✓ Verified'}
                </AppVTag>
              </AppPhotoPlaceholder>
            )}
          </Repeat>
        </PreviewGrid>
      </Section>

      <Section title="the match line" description="Green for what you have, grey for what you lack. Readable standing up, fridge open.">
        <ComponentRow label="partial">
          <AppMatchLine have={5} total={6} need={2} />
        </ComponentRow>
        <ComponentRow label="uses all">
          <AppMatchLine have={6} total={6} />
        </ComponentRow>
        <ComponentRow label="weak">
          <AppMatchLine have={3} total={6} need={5} />
        </ComponentRow>
      </Section>
    </div>
  );
}
