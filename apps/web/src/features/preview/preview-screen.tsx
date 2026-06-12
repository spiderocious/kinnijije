import { useMemo, useState } from 'react';
import { Repeat, Show } from 'meemaw';

import { GROUP_ORDER, PARTS, type PreviewGroup, type PreviewPart } from './registry.tsx';

export function PreviewScreen() {
  const [activeSlug, setActiveSlug] = useState<string>(PARTS[0]?.slug ?? 'intro');

  const grouped = useMemo(() => {
    return GROUP_ORDER.map((group) => ({
      group,
      parts: PARTS.filter((p) => p.group === group),
    })).filter((g) => g.parts.length > 0);
  }, []);

  const active: PreviewPart = useMemo(
    () => PARTS.find((p) => p.slug === activeSlug) ?? PARTS[0]!,
    [activeSlug],
  );

  const ActiveComponent = active.Component;

  return (
    <div className="flex min-h-screen bg-[var(--paper)] font-sans text-[var(--ink)]">
      {/* Sidebar */}
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 overflow-y-auto border-r-2 border-[var(--ink)] bg-[var(--sheet)] sm:block">
        <div className="border-b-2 border-[var(--ink)] px-5 py-4">
          <div className="font-display text-[24px] uppercase tracking-display">
            Kinni<span className="text-[var(--danfo-deep)]">Jije</span>
          </div>
          <div className="mt-0.5 font-mono text-[10px] uppercase tracking-[0.1em] text-[var(--ink-3)]">
            UI Preview
          </div>
        </div>
        <nav className="py-2">
          <Repeat each={grouped}>
            {(g: { group: PreviewGroup; parts: PreviewPart[] }) => (
              <div key={g.group} className="mb-1">
                <div className="px-5 py-2 font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--ink-4)]">
                  {g.group}
                </div>
                <Repeat each={g.parts}>
                  {(p: PreviewPart) => {
                    const on = p.slug === activeSlug;
                    return (
                      <button
                        key={p.slug}
                        type="button"
                        onClick={() => setActiveSlug(p.slug)}
                        className={`block w-full px-5 py-2 text-left text-[13px] font-semibold transition-colors ${
                          on
                            ? 'bg-[var(--danfo-tint)] text-[var(--ink)]'
                            : 'text-[var(--ink-2)] hover:bg-[var(--paper-deep)]'
                        }`}
                      >
                        {p.label}
                      </button>
                    );
                  }}
                </Repeat>
              </div>
            )}
          </Repeat>
        </nav>
      </aside>

      {/* Mobile group select */}
      <div className="block w-full sm:hidden">
        <div className="flex items-center gap-2 border-b-2 border-[var(--ink)] bg-[var(--sheet)] px-4 py-3">
          <div className="flex-1 font-display text-[20px] uppercase tracking-display">
            Kinni<span className="text-[var(--danfo-deep)]">Jije</span> UI
          </div>
          <select
            value={activeSlug}
            onChange={(e) => setActiveSlug(e.target.value)}
            className="rounded-ctrl border-2 border-[var(--ink)] bg-[var(--sheet)] px-2 py-1 font-sans text-[12px] font-semibold"
          >
            <Repeat each={[...PARTS]}>
              {(p: PreviewPart) => (
                <option key={p.slug} value={p.slug}>
                  {p.label}
                </option>
              )}
            </Repeat>
          </select>
        </div>
      </div>

      {/* Content */}
      <main className="min-w-0 flex-1">
        <Show
          when={true}
          fallback={<div className="p-10 text-[var(--ink-3)]">Select a component.</div>}
        >
          <div className="mx-auto max-w-[1100px] px-6 py-10 sm:px-12">
            <ActiveComponent />
          </div>
        </Show>
      </main>
    </div>
  );
}
