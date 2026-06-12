import { useState } from 'react';
import {
  AppFavouritesList,
  AppMarketList,
  AppHaveNeed,
  AppHonestyBar,
  type FavouriteItem,
} from '@kinnijije/ui';

import { PreviewStamp, Section } from './preview-canvas.tsx';

const SEED: FavouriteItem[] = [
  { id: '1', name: 'Ewa Agoyin + Agege Bread', family: 'beans', provenance: 'verified', time: '1H 10M', note: 'cooked 3 times' },
  { id: '2', name: 'Party Jollof + Dodo', family: 'jollof', provenance: 'verified', time: '45M', note: 'saved Tue' },
  { id: '3', name: 'Sardine Spaghetti, My Way', family: 'fried', provenance: 'ai', time: '≈ 30M', note: 'saved 28 May' },
  { id: '4', name: 'Catfish Pepper Soup', family: 'soup', provenance: 'verified', time: '50M', note: 'saved 12 May' },
];

export function ListsPart() {
  const [items, setItems] = useState<FavouriteItem[]>(SEED);

  return (
    <div>
      <PreviewStamp num="20" title="Lists & needs" meta="no tables — this is a kitchen" />

      <Section
        title="favourites (swipe a row left to unsave)"
        description="The most-visited list. Photo thumb, Verified/AI badge inline, mono time, Cook again. Swipe reveals one quiet unsave action; removing is reversible."
      >
        <div className="max-w-[520px]">
          <AppFavouritesList
            items={items}
            swipeable
            onUnsave={(id) => setItems((xs) => xs.filter((x) => x.id !== id))}
          />
          {items.length < SEED.length ? (
            <button
              type="button"
              onClick={() => setItems(SEED)}
              className="mt-3 text-[12px] font-bold text-[var(--ink-3)] underline"
            >
              restore demo list
            </button>
          ) : null}
        </div>
      </Section>

      <Section title="market run + have/need" description="Tickable quantities in Nigerian measures; the have/need chip split. Green only ever means 'in your kitchen'.">
        <div className="grid max-w-[760px] gap-5 sm:grid-cols-2">
          <AppMarketList
            forDish="Party Jollof + Dodo"
            items={[
              { id: 'a', name: 'Long-grain rice', qty: '2 derica', got: true },
              { id: 'b', name: 'Tin tomatoes', qty: '1 small tin' },
              { id: 'c', name: 'Ripe plantain', qty: '3 fingers' },
            ]}
          />
          <AppHaveNeed
            have={['Tomatoes', 'Rice', 'Onions', 'Peppers', 'Vegetable oil']}
            need={['Tin tomatoes', 'Ripe plantain']}
          />
        </div>
      </Section>

      <Section title="cook-time honesty" description="Verified vs AI cook times never display with the same confidence.">
        <div className="max-w-[460px]">
          <AppHonestyBar verifiedMin={45} aiMin={50} />
        </div>
      </Section>
    </div>
  );
}
