import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';

import { SwipeableWorkoutRow } from './SwipeableWorkoutRow';
import type { Workout } from '@/domain/workout';

const workout: Workout = {
  id: 'w1',
  name: 'Lower body',
  exercises: [
    { id: 'e1', name: 'Hip Thrust', sets: 3, targetReps: '8-10', restSeconds: 60 },
    { id: 'e2', name: 'Sentadilla Búlgara', sets: 3, targetReps: '10-12', restSeconds: 60 },
  ],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

const meta = {
  title: 'UI/SwipeableWorkoutRow',
  component: SwipeableWorkoutRow,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: `
**Purpose** — the workout card on Home's "Tus workouts" list. Tapping it
opens WorkoutPreviewPage (\`onStart\`, despite the name — it fires on tap,
Home decides where that navigates); swiping it left reveals
Editar/Eliminar.

**Anatomy** — a bordered card (name + exercise count + a decorative play
badge) with two circular action buttons (Editar, Eliminar) absolutely
positioned underneath its trailing edge, revealed as the card slides left.

**Variants** — one. Content is entirely data-driven from the \`workout\`
prop.

**States** — Default, Hover, Pressed, Focus (card only — see Interaction),
Open (swiped left, actions revealed — the card itself switches to
\`bg-interactive-subtle\` and suppresses its own hover/press tint, since
that tint would be redundant with the revealed-state fill and the actions
are the focus at that point), Dragging (mid-gesture — the slide transition
is disabled so the card tracks the pointer 1:1, re-enabled once the
gesture ends).

**Tokens/specs** — card: \`border-border-subtle\`, \`rounded-lg\`,
\`px-space-6 py-space-5\`, name in \`text-heading\`/\`leading-heading\`/
\`font-light\`/\`text-foreground\`, meta in \`text-caption\`/\`leading-caption\`/
\`text-foreground-secondary\`. Play badge: \`size-8\`, \`rounded-full\`,
\`bg-primary\`. Action buttons: 48×48, \`rounded-full\`, \`gap-space-5\`
between them, 20px gap between the card's trailing edge and the actions
once open (\`CARD_TO_ACTIONS_GAP\`) — Editar in
\`bg-background-inverse\`/white icon, Eliminar in a destructive red
(\`#C52D01\`, no Foundations token yet) — both share the same hover/pressed
white-mix ratio as Button's own \`secondary\` variant (92%/8%, 84%/16%),
applied on request even though these aren't literally \`<Button>\` yet.

**Content** — no truncation on the name; a long one wraps the card taller.
Exercise count always reads "N ejercicios".

**Interaction** — this is the one component in the system with real
swipe-to-reveal + drag-to-reorder-adjacent gesture rules worth spelling
out:
- **Swipe-to-reveal**: dragging left past a short intent threshold
  (\`INTENT_PX\`) snaps the card fully open, regardless of how far the
  finger actually traveled — the user never has to drag it all the way by
  hand. Swiping right (or past the threshold the other way) snaps it shut.
  Direction (horizontal swipe vs. vertical page scroll) is resolved from
  whichever axis crosses \`DIRECTION_THRESHOLD_PX\` first — a tie is
  resolved as horizontal, since this card exists specifically for the
  swipe gesture.
- **Open/closed is exclusive and parent-owned**: \`isOpen\` isn't local
  state — Home flips every other row's \`isOpen\` to \`false\` the instant
  this row commits to an open-attempt (not waiting for the gesture to
  finish), so only one row is ever open at a time.
- **Closing an open card**: tapping the card itself, swiping it back
  right, or tapping *anywhere outside it* (another card excepted — that's
  its own swipe's job) all close it.
- **Tap vs. drag resolution happens on pointer-up, not the native
  \`click\`** — the browser's own click-after-drag suppression isn't
  reliable enough across engines to trust here. The pointer-up handler
  decides tap vs. drag directly from the gesture's own recorded movement;
  the native \`click\` that still follows is suppressed for that gesture and
  only reaches the row for genuine keyboard activation (Enter/Space),
  which has no preceding pointer events at all.

**Responsive** — no width of its own; fills whatever list container it's
placed in (Home's \`max-w-[440px]\` content column).
        `,
      },
    },
  },
} satisfies Meta<typeof SwipeableWorkoutRow>;

export default meta;
type Story = StoryObj<typeof meta>;

function Demo({ workout: demoWorkout, initialOpen = false }: { workout: Workout; initialOpen?: boolean }) {
  const [isOpen, setIsOpen] = useState(initialOpen);
  return (
    <div className="w-[350px]">
      <SwipeableWorkoutRow
        workout={demoWorkout}
        isOpen={isOpen}
        onOpenChange={setIsOpen}
        onStart={() => {}}
        onEdit={() => {}}
        onDelete={() => {}}
      />
    </div>
  );
}

// Try it: swipe (or drag) left to reveal Editar/Eliminar, tap the card to
// open it (onStart), tap outside or swipe right to close.
export const Interactive: Story = {
  args: { workout, isOpen: false, onOpenChange: () => {}, onStart: () => {}, onEdit: () => {}, onDelete: () => {} },
  render: () => <Demo workout={workout} />,
};

export const Open: Story = {
  args: { workout, isOpen: true, onOpenChange: () => {}, onStart: () => {}, onEdit: () => {}, onDelete: () => {} },
  render: () => <Demo workout={workout} initialOpen />,
};

export const LongName: Story = {
  args: { workout, isOpen: false, onOpenChange: () => {}, onStart: () => {}, onEdit: () => {}, onDelete: () => {} },
  render: () => (
    <Demo
      workout={{ ...workout, name: 'Tren inferior + Core + Movilidad de cadera completa' }}
    />
  ),
};
