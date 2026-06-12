import { AppAvatar } from '@kinnijije/ui';

import { ComponentRow, PreviewStamp, Section } from './preview-canvas.tsx';

export function AvatarPart() {
  return (
    <div>
      <PreviewStamp num="26b" title="Avatar" meta="initials on danfo tint" />
      <Section
        title="one account, one avatar"
        description="Deliberately underplayed — this product is about the kitchen, not the profile. Initials derive from the name."
      >
        <ComponentRow align="center">
          <AppAvatar name="Adewale Adeniji" size="lg" />
          <AppAvatar name="Adewale Adeniji" size="md" />
          <AppAvatar name="Adewale Adeniji" size="sm" />
          <AppAvatar name="Ngozi" size="md" />
        </ComponentRow>
      </Section>
    </div>
  );
}
