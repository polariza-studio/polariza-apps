import type { Meta, StoryObj } from '@storybook/react-vite';
import { ArrowRight, Pause, Play, SlidersHorizontal, Square } from 'lucide-react';

import { Button } from './button';

const meta = {
  title: 'UI/Button',
  component: Button,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: `
**Purpose** — the primary call-to-action control across SetUp: starting/
finishing a workout, saving, adjusting a plan, discarding an activity.

**Anatomy** — a single pill (\`rounded-full\`, fixed \`h-12\`) with centered
label text and an optional icon, positioned via a \`data-icon="inline-start"
|"inline-end"\` attribute on the icon child (not a prop) so padding can
react to its presence (\`has-data-[icon=inline-start]:pl-space-6\`, etc.).

**Variants** — \`primary\` (main CTA), \`ghost\` (secondary/lower-emphasis
action), \`secondary\` (an important but lower-emphasis-than-primary action —
its own moss fill/white text, e.g. Finish — not a dark-surface variant
despite the name), \`ghost-inverse\` (the only variant that actually lives on
a dark/inverse surface, e.g. Discard Activity).

**States** — Default, Hover, Pressed, Focus, Disabled, per variant (see
Interaction States below). Text/icon color (\`currentColor\`) never changes
across Default/Hover/Pressed — only background does, so contrast never
degrades on interaction. Disabled never dims the whole button (no opacity):
\`primary\`/\`secondary\` flatten to \`ghost\`'s resting visual weight,
\`ghost-inverse\` flattens its text to \`foreground-inverse-secondary\`.

**Tokens/specs** — \`h-12\` (Tailwind's own scale — no \`space-*\` token covers
48px, approved as a direct exception), \`gap-space-5\`, \`py-space-2
px-space-7\` (\`px-space-6\` on whichever side has an icon), \`rounded-full\`,
\`text-action\`/\`leading-action\`. Icons: \`size-5\`, \`[stroke-width:1.5]\`
(Lucide's own default of 2 is wrong per the Button audit). \`shadow-button\`
applies only to \`secondary\` (its sole Paper example). Focus ring color is
per-variant: \`foreground\` (moss) for \`primary\`/\`ghost\`/\`secondary\` (all
render on the light page), \`foreground-inverse\` (white) for
\`ghost-inverse\` (the one variant on a dark surface) — not a fixed color.

**Content** — label text only, no built-in truncation (\`whitespace-nowrap\`):
a long label widens the button rather than wrapping or truncating, so
callers are responsible for keeping labels short. Icon is fully optional,
leading or trailing.

**Interaction** — the whole pill is the click target; no sub-controls.
Hover/Pressed/Focus states are real CSS (\`hover:\`/\`active:\`/
\`focus-visible:\`), not JS-driven.

**Responsive** — no width of its own (\`shrink-0\`, content-sized) unless the
caller adds \`className="w-full"\` (e.g. CreateWorkoutPage's "Guardar
Workout") — sizing is always the caller's decision, not a Button variant.
        `,
      },
    },
  },
  argTypes: {
    variant: {
      control: 'select',
      options: ['primary', 'ghost', 'secondary', 'ghost-inverse'],
    },
  },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    variant: 'primary',
    children: 'Start Workout',
  },
};

// `secondary` (Finish) has its own moss fill/white text but sits directly
// on the light page — not a dark-surface context, so it renders at top
// level alongside primary/ghost. `ghost-inverse` (Discard Activity) is the
// only variant that actually lives on an inverse/dark surface, so it's the
// only one wrapped in a moss backdrop here — matching how it appears in
// the product.
export const Variants: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-4">
      <Button variant="primary">Start Workout</Button>
      <Button variant="ghost">Adjust plan</Button>
      <Button variant="secondary">Finish</Button>
      <div className="flex items-center gap-4 rounded-xl bg-background-inverse p-4">
        <Button variant="ghost-inverse">Discard Activity</Button>
      </div>
    </div>
  ),
};

export const NoIcon: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-4">
      <Button variant="primary">Save Activity</Button>
      <div className="rounded-xl bg-background-inverse p-4">
        <Button variant="ghost-inverse">Discard Activity</Button>
      </div>
    </div>
  ),
};

export const LeadingIcon: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-4">
      <Button variant="primary">
        <Play data-icon="inline-start" fill="currentColor" stroke="none" />
        Start Workout
      </Button>
      <Button variant="ghost">
        <SlidersHorizontal data-icon="inline-start" />
        Adjust plan
      </Button>
      <Button variant="ghost">
        <Pause data-icon="inline-start" fill="currentColor" stroke="none" />
        Pause
      </Button>
      <Button variant="secondary">
        <Square data-icon="inline-start" fill="currentColor" stroke="none" />
        Finish
      </Button>
    </div>
  ),
};

export const TrailingIcon: Story = {
  render: () => (
    <Button variant="primary">
      Next
      <ArrowRight data-icon="inline-end" />
    </Button>
  ),
};

export const Disabled: Story = {
  args: {
    variant: 'primary',
    children: 'Start Workout',
    disabled: true,
  },
};

// State labels/swatches, not real :hover/:active/:focus-visible triggers —
// this is a visual reference gallery, so each non-Default/Disabled cell
// forces the target state's classes directly (bypassing the pseudo-class)
// so it renders statically. All classes below are canonical Foundations v1
// tokens, the same ones button.tsx itself uses — nothing story-only.
const stateLabelClass = 'text-caption leading-caption text-foreground-secondary';

function StateRow({
  variant,
  hoverClassName,
  pressedClassName,
  focusRingClassName,
}: {
  variant: 'primary' | 'ghost' | 'secondary' | 'ghost-inverse';
  hoverClassName: string;
  pressedClassName: string;
  focusRingClassName: string;
}) {
  return (
    <div className="flex flex-wrap items-end gap-6">
      <div className="flex flex-col items-center gap-2">
        <Button variant={variant}>Start Workout</Button>
        <span className={stateLabelClass}>Default</span>
      </div>
      <div className="flex flex-col items-center gap-2">
        <Button variant={variant} className={hoverClassName}>
          Start Workout
        </Button>
        <span className={stateLabelClass}>Hover</span>
      </div>
      <div className="flex flex-col items-center gap-2">
        <Button variant={variant} className={pressedClassName}>
          Start Workout
        </Button>
        <span className={stateLabelClass}>Pressed</span>
      </div>
      <div className="flex flex-col items-center gap-2">
        <Button variant={variant} className={`ring-2 ring-offset-2 ${focusRingClassName}`}>
          Start Workout
        </Button>
        <span className={stateLabelClass}>Focus</span>
      </div>
      <div className="flex flex-col items-center gap-2">
        <Button variant={variant} disabled>
          Start Workout
        </Button>
        <span className={stateLabelClass}>Disabled</span>
      </div>
    </div>
  );
}

export const InteractionStates: Story = {
  render: () => (
    <div className="flex flex-col gap-10">
      <div className="flex flex-col gap-3">
        <h3 className="text-body-emphasis leading-body-emphasis text-foreground">Primary</h3>
        <StateRow
          variant="primary"
          hoverClassName="bg-button-primary-hover"
          pressedClassName="bg-button-primary-pressed"
          focusRingClassName="ring-foreground"
        />
      </div>
      <div className="flex flex-col gap-3">
        <h3 className="text-body-emphasis leading-body-emphasis text-foreground">Ghost</h3>
        <StateRow
          variant="ghost"
          hoverClassName="bg-border-subtle"
          pressedClassName="bg-border"
          focusRingClassName="ring-foreground"
        />
      </div>
      <div className="flex flex-col gap-3">
        <h3 className="text-body-emphasis leading-body-emphasis text-foreground">Secondary</h3>
        <StateRow
          variant="secondary"
          hoverClassName="bg-button-secondary-hover"
          pressedClassName="bg-button-secondary-pressed"
          focusRingClassName="ring-foreground"
        />
      </div>
      <div className="flex flex-col gap-3 rounded-xl bg-background-inverse p-6">
        <h3 className="text-body-emphasis leading-body-emphasis text-foreground-inverse">Ghost inverse</h3>
        <StateRow
          variant="ghost-inverse"
          hoverClassName="bg-button-ghost-inverse-hover"
          pressedClassName="bg-button-ghost-inverse-pressed"
          focusRingClassName="ring-foreground-inverse"
        />
      </div>
    </div>
  ),
};
