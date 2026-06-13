import { AppText } from '@kinnijije/ui';

// Read-only pretty-printed JSON (or string) panel for an AI in/out value. Scrolls
// horizontally on small screens rather than breaking the layout.
export function JsonBlock({ label, value }: { label: string; value: unknown }) {
  const text =
    typeof value === 'string' ? value : value === undefined ? '—' : JSON.stringify(value, null, 2);
  return (
    <div>
      <AppText variant="caption">{label}</AppText>
      <pre className="mt-1.5 max-h-80 overflow-auto rounded-card border-2 border-[var(--hair-2)] bg-[var(--paper)] p-3 font-mono text-[12px] leading-relaxed text-[var(--ink-2)]">
        {text}
      </pre>
    </div>
  );
}
