import { useState } from 'react';
import { AppField, AppInput, AppButton } from '@kinnijije/ui';
import { IconSearch, IconMail } from '@icons';

import { ComponentRow, PreviewStamp, Section } from './preview-canvas.tsx';

export function FieldPart() {
  const [ing, setIng] = useState('tat');
  const [pw, setPw] = useState('12345');

  return (
    <div>
      <PreviewStamp num="11" title="Inputs" meta="quiet hairline · focuses to ink" />

      <Section
        title="the ingredient field"
        description="Fields are deliberately quiet — hairline borders, 9px corners. They focus to an ink border. Type into them; they are real inputs."
      >
        <div className="max-w-[420px]">
          <AppInput
            value={ing}
            onChange={(e) => setIng(e.target.value)}
            placeholder="Tomatoes, rice, chicken, eggs…"
            active
          />
        </div>
      </Section>

      <Section title="search + mono" description="Leading glyph; mono variant for record-style entry.">
        <ComponentRow label="search">
          <div className="w-[320px]">
            <AppInput leading={<IconSearch size={15} />} placeholder="Search saved recipes…" />
          </div>
        </ComponentRow>
        <ComponentRow label="mono (typed DELETE etc.)">
          <div className="w-[220px]">
            <AppInput mono placeholder="DELETE" />
          </div>
        </ComponentRow>
      </Section>

      <Section
        title="labelled fields + error"
        description="Account forms — the generic case. Errors note in sienna under the field; never red, red is reserved."
      >
        <div className="flex max-w-[360px] flex-col gap-3.5">
          <AppField label="Email">
            <AppInput type="email" defaultValue="ade@example.com" />
          </AppField>
          <AppField label="Password" error="Too short — use at least 8 characters.">
            <AppInput
              type="password"
              value={pw}
              onChange={(e) => setPw(e.target.value)}
              invalid
            />
          </AppField>
          <AppField label="Or skip the password" hint="We'll send a one-tap sign-in link instead.">
            <AppButton variant="secondary" leadingIcon={<IconMail size={16} />} className="w-full">
              Email me a magic link
            </AppButton>
          </AppField>
        </div>
      </Section>
    </div>
  );
}
