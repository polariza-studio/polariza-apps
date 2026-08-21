import type { Meta, StoryObj } from '@storybook/react-vite';

import { SegmentedProgress } from './SegmentedProgress';

const meta = {
  title: 'UI/SegmentedProgress',
  component: SegmentedProgress,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: `
**Purpose** — the exercise-progress bar in WorkoutActivePage's timer
header: one segment per exercise in the workout, segments through the
current one lit to show how far along the session is.

**Anatomy** — a row of equal-width segments, one per exercise.

**Variants** — one. Segment count and lit-through position are entirely
driven by \`total\`/\`current\`.

**States** — none of its own; it's a pure read-out; there's no
interaction.

**Tokens/specs** — \`h-1\` (4px tall), \`rounded-full\`, \`gap-px\` (1px)
between segments, each \`flex-1\` (equal width, filling the row). Lit:
\`bg-state-active\` (= \`--lime\`). Unlit: \`bg-state-inactive\` (= moss @
10%). Verified against Paper's "workout-started"/"workout-paused"
artboards — both agree on the 1px gap; production had been using
\`gap-space-1\` (4px), which was implementation drift, not a design choice,
and is corrected here.

**Content** — \`current\` is inclusive: segments at index \`<= current\` are
lit, so the very first exercise already shows one lit segment, not zero.

**Interaction** — none; purely a read-out driven by props.

**Responsive** — no width of its own; segments split evenly across
whatever width the row has, same as WorkoutActivePage's own
\`max-w-[440px]\` header.
        `,
      },
    },
  },
} satisfies Meta<typeof SegmentedProgress>;

export default meta;
type Story = StoryObj<typeof meta>;

export const FirstExercise: Story = {
  args: { total: 6, current: 0 },
  render: (args) => (
    <div className="w-[350px]">
      <SegmentedProgress {...args} />
    </div>
  ),
};

export const MidWorkout: Story = {
  args: { total: 6, current: 3 },
  render: (args) => (
    <div className="w-[350px]">
      <SegmentedProgress {...args} />
    </div>
  ),
};

export const LastExercise: Story = {
  args: { total: 6, current: 5 },
  render: (args) => (
    <div className="w-[350px]">
      <SegmentedProgress {...args} />
    </div>
  ),
};

export const SingleExercise: Story = {
  args: { total: 1, current: 0 },
  render: (args) => (
    <div className="w-[350px]">
      <SegmentedProgress {...args} />
    </div>
  ),
};
