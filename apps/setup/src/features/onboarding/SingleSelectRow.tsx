import { withLineBreaks } from '@/lib/text';

// Measured from Paper (re-audited 2026-08-15 via paper-desktop MCP
// get_jsx). Two row heights depending on whether a description is
// present: p-space-6 (16px, rows with a description — Goal, Experience)
// vs p-space-5 (12px, fixed 48px height — Days, Time, Environment; was
// p-space-4/10px, off by one step on the scale). Paper added a selected
// visual mid-session (same lime tint/outline MultiSelectChip already
// uses — bg lime 22% + outline-primary, offset -1px) so it now persists
// across Back: use-onboarding.ts derives `selected` from the stored
// answer rather than transient tap state, and delays auto-advance so the
// selection is visible before the screen changes. hover/active are this
// component's own addition on top of Paper's resting/selected pair,
// since a static design can't show them.
const RESTING =
  'outline-border-subtle hover:bg-surface-subtle hover:outline-border active:bg-interactive-subtle active:outline-border';
const SELECTED =
  'outline-primary outline-offset-[-1px] bg-[color-mix(in_srgb,var(--lime)_22%,transparent)] hover:bg-[color-mix(in_srgb,var(--lime)_30%,transparent)] active:bg-[color-mix(in_srgb,var(--lime)_40%,transparent)]';

export function SingleSelectRow({
  label,
  description,
  selected = false,
  onSelect,
}: {
  label: string;
  description?: string;
  selected?: boolean;
  onSelect: () => void;
}) {
  const interaction = `transition-colors ${selected ? SELECTED : RESTING}`;

  if (description) {
    return (
      <button
        type="button"
        onClick={onSelect}
        aria-pressed={selected}
        className={`flex w-full items-center gap-space-6 rounded-md p-space-6 text-left outline outline-1 ${interaction}`}
      >
        <span className="flex flex-1 flex-col items-center gap-space-3">
          <span className="text-action leading-action text-foreground text-center">{label}</span>
          <span className="text-caption leading-caption text-foreground-secondary text-center">
            {withLineBreaks(description)}
          </span>
        </span>
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      className={`flex h-12 w-full shrink-0 items-center gap-space-6 rounded-md p-space-5 text-left outline outline-1 ${interaction}`}
    >
      <span className="flex-1 text-action leading-action text-foreground text-center">{label}</span>
    </button>
  );
}
