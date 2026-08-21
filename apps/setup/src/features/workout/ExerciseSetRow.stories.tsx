import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';

import { ExerciseSetRow } from './ExerciseSetRow';

const meta = {
  title: 'UI/ExerciseSetRow',
  component: ExerciseSetRow,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: `
**Purpose** — one editable set during an active workout: the Set N chip
next to the Reps/Peso inputs. Only the editable version — see the
component note for why it isn't unified with ActivityDetailPage's
read-only set row (different structure, different purpose, both correctly
kept separate).

**Anatomy** — a fixed-width "Set N" chip beside a bordered card containing
two \`TextField\`s (Reps, Peso) separated by a vertical divider.

**Variants** — one. Content is entirely controlled via the \`reps\`/\`weight\`
props.

**States** — Default (empty, placeholder-driven) and Filled — no other
states of its own; the two \`TextField\`s carry whatever states TextField
itself has (see UI/TextField — notably, no visible focus ring, a
documented gap there, not fixed here either).

**Tokens/specs** — row: \`gap-space-5\`, \`items-start\`. Chip: \`w-12\` (48px),
\`rounded-lg\`, \`bg-interactive-subtle\`, \`p-space-2\`,
\`text-label\`/\`leading-label\`/\`text-foreground-secondary\`, centered. Card:
\`border-border-subtle\`, \`rounded-lg\`, \`p-space-5\`, \`gap-space-5\` between
Reps/divider/Peso. Field labels: \`text-caption\`/\`leading-caption\`/
\`text-foreground-secondary\`, \`gap-space-1\` above their \`TextField\`.
Divider: \`w-px\`, \`bg-border-subtle\`, \`self-stretch\`. Verified
pixel-for-pixel against Paper's "workout-started"/"workout-paused"
artboards.

**Content** — Reps is numeric (\`type="number" inputMode="numeric"\`),
seeded from the workout's own target reps as a placeholder. Peso is text
(\`inputMode="decimal"\`) since it accepts a comma or dot decimal
separator — WorkoutActivePage normalizes that itself before parsing, not
this component.

**Interaction** — purely two independent \`TextField\`s; no interaction of
its own beyond what typing in either does. \`reps\`/\`weight\` are plain
\`{ value, onChange, placeholder? }\` — the row doesn't know about sets,
workouts, or drafts; WorkoutActivePage owns that (including tracking the
weight field's raw text separately while typing, so a trailing "." or
partial decimal isn't clobbered by re-deriving from the numeric value on
every render).

**Responsive** — no width of its own; the two fields split evenly
(\`flex-1\` each) across whatever width the card has.
        `,
      },
    },
  },
} satisfies Meta<typeof ExerciseSetRow>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Empty: Story = {
  args: {
    setNumber: 1,
    reps: { value: '', onChange: () => {}, placeholder: '8-10' },
    weight: { value: '', onChange: () => {} },
  },
};

export const Filled: Story = {
  args: {
    setNumber: 2,
    reps: { value: 8, onChange: () => {}, placeholder: '8-10' },
    weight: { value: 40, onChange: () => {} },
  },
};

// Try it: typing in either field updates the values below, exactly like
// WorkoutActivePage's own controlled state.
function Demo() {
  const [reps, setReps] = useState('');
  const [weight, setWeight] = useState('');
  return (
    <div className="w-[320px]">
      <ExerciseSetRow
        setNumber={1}
        reps={{ value: reps, onChange: (event) => setReps(event.target.value), placeholder: '8-10' }}
        weight={{ value: weight, onChange: (event) => setWeight(event.target.value) }}
      />
    </div>
  );
}

export const Interactive: Story = {
  args: {
    setNumber: 1,
    reps: { value: '', onChange: () => {} },
    weight: { value: '', onChange: () => {} },
  },
  render: () => <Demo />,
};
