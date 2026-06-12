import { useState } from 'react';
import { AppSegmented } from '@kinnijije/ui';

import { PreviewStamp, Section } from './preview-canvas.tsx';

export function SegmentedPart() {
  const [diff, setDiff] = useState('medium');

  return (
    <div>
      <PreviewStamp num="12a" title="Segmented" meta="one choice · chosen segment painted" />
      <Section
        title="how adventurous are you?"
        description="Ink-bordered, the selected segment painted danfo. Sets the default difficulty ceiling."
      >
        <div className="max-w-[360px]">
          <AppSegmented
            value={diff}
            onChange={setDiff}
            aria-label="Difficulty"
            options={[
              { value: 'easy', label: 'Easy' },
              { value: 'medium', label: 'Medium' },
              { value: 'anything', label: 'Anything' },
            ]}
          />
          <p className="mt-2.5 text-[12px] leading-relaxed text-[var(--ink-3)]">
            &ldquo;Anything&rdquo; means KinniJije can hand you banga soup on a Tuesday. Current:{' '}
            <strong>{diff}</strong>.
          </p>
        </div>
      </Section>
    </div>
  );
}
