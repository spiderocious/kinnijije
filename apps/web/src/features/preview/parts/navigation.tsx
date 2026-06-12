import { useState } from 'react';
import { AppShell, AppTabBar, AppSettingsDrawer, AppAvatar } from '@kinnijije/ui';
import { IconSave, IconPot, IconUser } from '@icons';

import { PreviewStamp, Section } from './preview-canvas.tsx';

export function NavigationPart() {
  const [tab, setTab] = useState('cook');

  return (
    <div>
      <PreviewStamp num="29" title="Navigation · PWA shell" meta="three tabs, one puck" />

      <Section
        title="the shell"
        description="Wordmark top-left with the yellow 'Jije', avatar top-right, and the pot-puck centre tab raised above the bar — same press physics as every primary."
      >
        <div className="w-[390px] overflow-hidden rounded-[22px] border-2 border-[var(--ink)] shadow-paint">
          <AppShell
            right={<AppAvatar name="Adewale Adeniji" size="sm" />}
            bottom={
              <AppTabBar
                active={tab}
                onChange={setTab}
                left={{ id: 'fav', label: 'Favourites', icon: <IconSave size={22} /> }}
                center={{ id: 'cook', label: 'Cook', icon: <IconPot size={24} /> }}
                right={{ id: 'you', label: 'You', icon: <IconUser size={22} /> }}
              />
            }
          >
            <div className="min-h-[220px]">
              <div className="mb-2 text-[11px] font-bold uppercase tracking-overline text-[var(--ink-3)]">
                Home
              </div>
              <div className="mb-2.5 rounded-card border border-[var(--hair-2)] bg-[var(--sheet)] px-4 py-3.5">
                <div className="text-[13.5px] font-bold">Good evening, Ade</div>
                <div className="mt-0.5 text-[12px] text-[var(--ink-3)]">
                  Wetin dey your kitchen tonight?
                </div>
              </div>
            </div>
          </AppShell>
        </div>
      </Section>

      <Section title="settings drawer" description="Signboard header with the stripe, plain rows, the one crimson row last and unadorned.">
        <AppSettingsDrawer
          name="Adewale Adeniji"
          email="ade@example.com"
          rows={[
            { id: 'cuisine', icon: '◐', label: 'Cuisine preferences' },
            { id: 'difficulty', icon: '▲', label: 'Difficulty · Medium' },
            { id: 'measure', icon: '⚖', label: 'Measurements · Nigerian' },
            { id: 'account', icon: '✉', label: 'Email & password' },
            { id: 'about', icon: '♡', label: 'About & privacy' },
            { id: 'signout', icon: '→', label: 'Sign out' },
            { id: 'delete', icon: '✕', label: 'Delete account', critical: true },
          ]}
        />
      </Section>
    </div>
  );
}
