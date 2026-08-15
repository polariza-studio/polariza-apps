import { Check } from 'lucide-react';

import { cn } from '@/lib/utils';

// Measured from Paper (re-audited 2026-08-15 via paper-desktop MCP
// get_jsx on both states of the "Equipment" step's chips — the previous
// version was guessed from a screenshot and only rendered the leading
// circle when selected, so the chip's width shifted on toggle). Both
// states render the same 24px leading circle slot: an empty
// border-subtle outline when unselected, a filled lime circle + checkmark
// when selected. Padding is asymmetric (pl-space-5/pr-space-6) because
// the circle already carries the chip's left visual margin. The
// lime-tinted selected background (~22% alpha) has no existing
// Foundations token — implemented as a literal value per the
// MVP-shipping-phase instruction not to expand Foundations for a single,
// not-yet-formalized pattern; hover/active deepen that same tint rather
// than introducing new tokens, since Paper (a static design) has no
// interaction states to measure.
export function MultiSelectChip({
  label,
  selected,
  onToggle,
}: {
  label: string;
  selected: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-pressed={selected}
      className={cn(
        'flex h-12 shrink-0 items-center gap-space-3 rounded-md pl-space-5 pr-space-6 outline outline-1 transition-colors',
        selected
          ? 'outline-primary outline-offset-[-1px] bg-[color-mix(in_srgb,var(--lime)_22%,transparent)] hover:bg-[color-mix(in_srgb,var(--lime)_30%,transparent)] active:bg-[color-mix(in_srgb,var(--lime)_40%,transparent)]'
          : 'outline-border-subtle hover:bg-surface-subtle hover:outline-border active:bg-interactive-subtle active:outline-border',
      )}
    >
      <span
        className={cn(
          'flex size-6 shrink-0 items-center justify-center rounded-full transition-colors',
          selected ? 'bg-primary text-primary-foreground' : 'outline outline-1 outline-border-subtle',
        )}
      >
        {selected && <Check className="size-5 [stroke-width:1.5]" stroke="currentColor" />}
      </span>
      <span className="text-action leading-action text-foreground whitespace-nowrap">{label}</span>
    </button>
  );
}
