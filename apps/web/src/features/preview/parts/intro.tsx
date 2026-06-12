import { PreviewStamp } from './preview-canvas.tsx';

export function IntroPart() {
  return (
    <div>
      <PreviewStamp num="00" title="KinniJije UI" meta="buka signboard · full danfo" />
      <div className="max-w-[64ch] space-y-4 text-[14px] leading-relaxed text-[var(--ink-2)]">
        <p>
          This is the live component preview for{' '}
          <span className="font-semibold text-[var(--ink)]">@kinnijije/ui</span> — the production
          sibling of the Studio HTML spec. Every component is shipped in the{' '}
          <span className="font-semibold text-[var(--ink)]">buka-signboard</span> stance: warm cream
          paper, danfo yellow as the one action colour (always with ink text and an ink border), leaf
          green reserved for &ldquo;you have it&rdquo; and Verified, cold crimson for irreversible
          actions only.
        </p>
        <div className="border-2 border-[var(--ink)] bg-[var(--sheet)] p-5 shadow-paint">
          <div className="font-display text-[22px] uppercase tracking-display">The rules</div>
          <ul className="mt-3 space-y-1.5 text-[13px]">
            <li>
              <b>Panes act</b> (ink border + paint shadow), <b>plates hold</b> (hairline).
            </li>
            <li>One yellow action per screen — the signboard points at one thing.</li>
            <li>Numbers shout in tabular mono; dish names are painted in Bebas caps.</li>
            <li>Red never decorates — the food photography owns red.</li>
          </ul>
        </div>
        <p className="text-[13px] text-[var(--ink-3)]">
          Pick a component from the sidebar. Spec lives at{' '}
          <span className="font-mono text-[12px]">
            design-system/projects/kinnijije/preview/*.html
          </span>
          .
        </p>
      </div>
    </div>
  );
}
