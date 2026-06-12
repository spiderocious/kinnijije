import { useState } from 'react';
import { AppCaptureMethods, AppVoiceCapture, AppPhotoExtract, AppMultiShot } from '@kinnijije/ui';
import { IconVoice, IconSnap, IconPot } from '@icons';

import { PreviewGrid, PreviewStamp, Section } from './preview-canvas.tsx';

export function CapturePart() {
  const [found, setFound] = useState([
    { name: 'Tomatoes' },
    { name: 'Peppers' },
    { name: 'Onions' },
    { name: 'Eggs' },
    { name: 'Leftover rice' },
    { name: 'Half a yam', uncertain: true },
  ]);

  return (
    <div>
      <PreviewStamp num="14" title="Voice & photo capture" meta="the three doors into the product" />

      <Section title="the three method tiles" description="Chunky panes with the press physics. Equal billing; the product never assumes which door you'll use.">
        <div className="max-w-[420px]">
          <AppCaptureMethods
            methods={[
              { id: 'type', icon: <IconPot size={22} />, name: 'Type it', sub: 'Tomatoes, rice, chicken, eggs…' },
              { id: 'say', icon: <IconVoice size={22} />, name: 'Say it', sub: 'Hold and talk, like a voice note' },
              { id: 'snap', icon: <IconSnap size={22} />, name: 'Snap it', sub: 'Photo of your fridge or counter' },
            ]}
          />
        </div>
      </Section>

      <Section title="voice + photo extraction" description="Hold-to-record shows a transcript before extraction. Photo extraction tags found items; uncertain ones dashed.">
        <PreviewGrid cols={2}>
          <AppVoiceCapture
            micIcon={<IconVoice size={36} />}
            transcript={'“I have like… half a tuber of yam, some titus fish, palm oil, two onions and I think there’s rice…”'}
          />
          <AppPhotoExtract
            family="stew"
            found={found}
            onRemove={(name) => setFound((xs) => xs.filter((x) => x.name !== name))}
          />
        </PreviewGrid>
      </Section>

      <Section title="multi-shot" description="Snap the fridge, the shelf, the counter; results merge. Each thumb keeps its source tag.">
        <div className="max-w-[420px]">
          <AppMultiShot
            shots={[
              { id: '1', family: 'stew', tag: 'Fridge' },
              { id: '2', family: 'beans', tag: 'Pantry' },
              { id: '3', family: 'fried', tag: 'Counter' },
            ]}
          />
        </div>
      </Section>
    </div>
  );
}
