import { AppIngredientCard, AppStatTile, AppRecentCard, AppButton } from '@kinnijije/ui';

import { PreviewGrid, PreviewStamp, Section } from './preview-canvas.tsx';

export function CardsPart() {
  return (
    <div>
      <PreviewStamp num="27" title="Cards" meta="panes act · plates hold" />
      <Section
        title="plate cards"
        description="The quiet, information-holding species — hairline, no shadow. (The meal card is the pane species.)"
      >
        <PreviewGrid cols={3}>
          <AppIngredientCard
            serves={4}
            rows={[
              { name: 'Long-grain rice', qty: '2 derica', have: true },
              { name: 'Fresh tomatoes', qty: '6 medium', have: true },
              { name: 'Tatashe', qty: '4', have: true },
              { name: 'Tin tomatoes', qty: '1 small', have: false },
              { name: 'Ripe plantain', qty: '3 fingers', have: false },
            ]}
          />
          <div className="flex flex-col gap-[18px]">
            <AppStatTile value="12" label="Meals cooked this month" />
            <AppRecentCard
              title="Tuesday's kitchen"
              ingredients={['Rice', 'Tomatoes', 'Tatashe', 'Onions']}
              action={
                <AppButton variant="secondary" size="sm">
                  Use these again
                </AppButton>
              }
            />
          </div>
        </PreviewGrid>
      </Section>
    </div>
  );
}
