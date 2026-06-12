import { AppButton } from '@kinnijije/ui';
import { IconCook, IconSave, IconReSuggest } from '@icons';

import { ComponentRow, PreviewStamp, Section } from './preview-canvas.tsx';

export function ButtonPart() {
  return (
    <div>
      <PreviewStamp num="10" title="Buttons" meta="press down · spring back" />

      <Section
        title="the four weights"
        description="Primary is danfo yellow with ink text and the paint shadow — it presses down onto the shadow. Secondary is a plate with an ink border. Ghost is a yellow-underlined link. Crimson appears only beside irreversible actions."
      >
        <ComponentRow label="variants" align="center">
          <AppButton variant="primary">Suggest meals</AppButton>
          <AppButton variant="secondary">Save</AppButton>
          <AppButton variant="ghost">Start over</AppButton>
          <AppButton variant="crit">Delete</AppButton>
          <AppButton variant="crit-solid">Delete forever</AppButton>
        </ComponentRow>
      </Section>

      <Section title="sizes" description="sm / md / lg. The sm primary keeps a smaller paint shadow.">
        <ComponentRow label="primary" align="center">
          <AppButton variant="primary" size="sm">
            Cook
          </AppButton>
          <AppButton variant="primary" size="md">
            Open recipe
          </AppButton>
          <AppButton variant="primary" size="lg">
            Suggest meals
          </AppButton>
        </ComponentRow>
        <ComponentRow label="secondary" align="center">
          <AppButton variant="secondary" size="sm">
            Save
          </AppButton>
          <AppButton variant="secondary" size="md">
            Save
          </AppButton>
          <AppButton variant="secondary" size="lg">
            Save
          </AppButton>
        </ComponentRow>
      </Section>

      <Section title="with icons + states" description="Leading/trailing icons; loading and disabled.">
        <ComponentRow align="center">
          <AppButton variant="primary" leadingIcon={<IconCook size={18} />}>
            Start cooking
          </AppButton>
          <AppButton variant="secondary" leadingIcon={<IconSave size={18} />}>
            Save
          </AppButton>
          <AppButton variant="secondary" leadingIcon={<IconReSuggest size={16} />}>
            Re-suggest
          </AppButton>
          <AppButton variant="primary" loading>
            Suggest meals
          </AppButton>
          <AppButton variant="primary" disabled>
            Suggest meals
          </AppButton>
        </ComponentRow>
      </Section>

      <Section
        title="in a real action bar"
        description="The recipe foot: Start cooking is always the one yellow button; save never competes with it."
      >
        <div className="flex items-center gap-2.5 rounded-card border-2 border-[var(--ink)] bg-[var(--sheet)] p-3.5 shadow-paint">
          <AppButton variant="primary" leadingIcon={<IconCook size={18} />}>
            Start cooking
          </AppButton>
          <AppButton variant="secondary" leadingIcon={<IconSave size={18} />}>
            Save
          </AppButton>
          <span className="flex-1" />
          <AppButton variant="ghost">Suggest something else</AppButton>
        </div>
      </Section>
    </div>
  );
}
