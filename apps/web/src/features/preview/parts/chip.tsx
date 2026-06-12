import { useState } from 'react';
import { AppChip } from '@kinnijije/ui';
import { Repeat } from 'meemaw';

import { ComponentRow, PreviewStamp, Section } from './preview-canvas.tsx';

export function ChipPart() {
  const [items, setItems] = useState(['Tomatoes', 'Rice', 'Onions', 'Half a yam']);

  return (
    <div>
      <PreviewStamp num="11c" title="Chips" meta="removable pills · tone = meaning" />

      <Section
        title="ingredient chips (removable)"
        description="Every typed ingredient becomes a removable pill. Click the × to remove."
      >
        <ComponentRow>
          <Repeat each={items}>
            {(it: string) => (
              <AppChip key={it} onRemove={() => setItems((xs) => xs.filter((x) => x !== it))}>
                {it}
              </AppChip>
            )}
          </Repeat>
          <AppChip tone="add" onClick={() => setItems((xs) => [...xs, `Item ${xs.length + 1}`])}>
            + Add more
          </AppChip>
        </ComponentRow>
      </Section>

      <Section title="tones" description="Green only ever means 'already in your kitchen'. Need is muted; add is dashed.">
        <ComponentRow>
          <AppChip tone="default">Default</AppChip>
          <AppChip tone="have">Tomatoes</AppChip>
          <AppChip tone="need">Tin tomatoes</AppChip>
          <AppChip tone="add">+ Add more</AppChip>
          <AppChip uncertain onRemove={() => undefined}>
            Half a yam?
          </AppChip>
        </ComponentRow>
      </Section>
    </div>
  );
}
