import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';

import { ReorderableExerciseList } from './ReorderableExerciseList';
import type { WorkoutExercise } from '@/domain/workout';

const exercises: WorkoutExercise[] = [
  { id: 'e1', name: 'Hip Thrust', sets: 3, targetReps: '8-10', restSeconds: 60 },
  { id: 'e2', name: 'Sentadilla Búlgara', sets: 3, targetReps: '10-12', restSeconds: 60 },
  { id: 'e3', name: 'Peso muerto rumano', sets: 4, targetReps: '6-8', restSeconds: 90 },
];

const meta = {
  title: 'UI/ReorderableExerciseList',
  component: ReorderableExerciseList,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: `
**Purpose** — the exercise list in CreateWorkoutPage: a numbered,
drag-to-reorder list where tapping a row opens it for editing.

**Anatomy** — a position chip (index-only, never travels with the card)
next to a bordered row; the row itself splits into a select button
(name + summary, fills the row) and a separate grip handle for dragging.
While dragging, a floating "ghost" copy of the card (shadow, slight
rotation) follows the pointer, and the row it was dragged from becomes an
empty placeholder until the drop.

**Variants** — one. Content is entirely data-driven from the \`exercises\`
prop.

**States** — Default, Hover/Pressed/Focus (on the row, triggered only by
the select button — see Interaction), Dragging (the dragged row hides its
own content and grip, replaced by the floating ghost).

**Tokens/specs** — chip: \`min-w-8\`, \`rounded-lg\`, \`bg-interactive-subtle\`,
\`text-label\`/\`leading-label\`/\`text-foreground-secondary\`. Row:
\`rounded-lg\`, \`outline-border-subtle\`, \`px-space-6 py-space-5\`, name in
\`text-heading\`/\`leading-heading\`/\`font-light\`/\`text-foreground\`, summary
("3 × 8-10 · 60 s") in \`text-caption\`/\`leading-caption\`/
\`text-foreground-secondary\`. Grip icon tinted at moss 30%
(\`color-mix(in srgb, var(--moss) 30%, transparent)\`, no Foundations token
for this specific tint yet). Ghost card: \`0 2px 19px var(--border-subtle)\`
shadow, 4° rotation, 200ms FLIP transition for the other rows sliding into
their new slots.

**Content** — no truncation on the name; summary is always
"Sets × Reps · Rest s", derived from the exercise's own fields.

**Interaction — the grip is a separate gesture surface from the card,
deliberately.** This is the example the design system calls out
explicitly: the row's hover/pressed/focus tint reacts only to the select
button (via a CSS \`has()\` selector scoped to that button specifically),
covering the row's full visual surface *including* the grip's area — but
the grip itself is excluded from ever triggering that tint, and nothing is
ever layered over it that could intercept its own pointer events. The grip
captures the pointer on \`pointerdown\` (not once a drag is "confirmed") so
every subsequent \`pointermove\`/\`pointerup\` for that touch is guaranteed to
reach it regardless of where the finger travels, and \`touch-action: none\`
tells the browser upfront this touch isn't for scrolling — belt-and-
suspenders with the capture, not a substitute for it. A small movement
threshold (\`DRAG_ENGAGE_THRESHOLD_PX\`) distinguishes an intentional drag
from a stray tremor on an otherwise-stationary press, with no time delay
before the drag starts. Cursor: \`grab\` at rest, \`grabbing\` while dragging.
Tapping the select button (not the grip) opens that exercise for editing.

**Responsive** — no width of its own; fills whatever container it's placed
in (CreateWorkoutPage's \`max-w-[440px]\` content column).
        `,
      },
    },
  },
} satisfies Meta<typeof ReorderableExerciseList>;

export default meta;
type Story = StoryObj<typeof meta>;

// Try it: drag a row by its grip to reorder, tap a row's name/summary to
// "select" it (logged to onSelect).
function Demo() {
  const [order, setOrder] = useState(exercises);
  return <ReorderableExerciseList exercises={order} onReorder={setOrder} onSelect={() => {}} />;
}

export const Interactive: Story = {
  args: { exercises, onReorder: () => {}, onSelect: () => {} },
  render: () => (
    <div className="w-[350px]">
      <Demo />
    </div>
  ),
};

export const SingleExercise: Story = {
  args: { exercises: exercises.slice(0, 1), onReorder: () => {}, onSelect: () => {} },
  render: (args) => (
    <div className="w-[350px]">
      <ReorderableExerciseList {...args} />
    </div>
  ),
};

export const LongName: Story = {
  args: {
    exercises: [{ ...exercises[0], name: 'Extensión de cuádriceps unilateral en máquina' }, exercises[1]],
    onReorder: () => {},
    onSelect: () => {},
  },
  render: (args) => (
    <div className="w-[350px]">
      <ReorderableExerciseList {...args} />
    </div>
  ),
};
