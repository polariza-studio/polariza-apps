import type { Meta, StoryObj } from '@storybook/react-vite';
import { GalleryVerticalEnd, Plus, SportShoe } from 'lucide-react';

import { Button } from './button';
import { EmptyState } from './empty-state';

const meta = {
  title: 'UI/EmptyState',
  component: EmptyState,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: `
**Purpose** — the "nothing here yet" card shown in place of a list: Home
with no workouts, CreateWorkout with no exercises. The only 2 real uses in
the product; both share the identical structure (verified against Paper's
"home-empty" and "crear-workout-empty" artboards).

**Anatomy** — a dashed-outline card containing, in order: an icon inside a
circular badge, the copy, an optional CTA.

**Variants** — one. Icon and copy differ per call site, but the structure
and every token are the same.

**States** — none of its own. The CTA is a real \`Button\` and carries its
own states.

**Tokens/specs** — \`outline outline-1 outline-dashed outline-border\`
(moss @ 20%), \`rounded-lg\`, \`gap-space-7\` (20px) between icon/copy/CTA,
\`px-space-6 py-[32px]\` (16px inline, 32px block — no space-* token covers
32px, same direct-exception precedent as Button's \`h-12\`). Icon badge:
\`size-12\` (48px), \`rounded-full\`, \`bg-interactive-subtle\` (moss @ 4%).
Copy: \`text-body\`/\`leading-body\`/\`text-foreground-secondary\`, centered.
Icon itself: \`size-5\`, \`[stroke-width:1.5]\`, moss @ 50% — set by the
caller, not EmptyState (see Content below). Verified pixel-for-pixel
against Paper — production had been missing the \`px-space-6\` inline
padding (only had \`py-[32px]\`), which is corrected here, not carried
forward.

**Content** — \`icon\` and \`cta\` are slots (\`ReactNode\`); the copy is
\`children\`, so it can be a plain string (Home: "No hay workouts creados.")
or contain a manual \`<br/>\` for an authored line break (CreateWorkout:
"Añade tus ejercicios para\\ncrear el workout.") — EmptyState doesn't
reflow or truncate it either way.

**Responsive** — no width of its own; \`flex-1\` fills whatever flex
container it's placed in (both real uses sit inside a flex-col section
that's itself \`flex-1\`).
        `,
      },
    },
  },
} satisfies Meta<typeof EmptyState>;

export default meta;
type Story = StoryObj<typeof meta>;

export const NoWorkouts: Story = {
  args: { icon: null, children: null },
  render: () => (
    <EmptyState
      icon={
        <SportShoe className="size-5 [stroke-width:1.5]" style={{ color: 'color-mix(in srgb, var(--moss) 50%, transparent)' }} />
      }
      cta={
        <Button variant="primary">
          <Plus data-icon="inline-start" />
          Crear workout
        </Button>
      }
    >
      No hay workouts creados.
    </EmptyState>
  ),
};

export const NoExercises: Story = {
  args: { icon: null, children: null },
  render: () => (
    <EmptyState
      icon={
        <GalleryVerticalEnd
          className="size-5 [stroke-width:1.5]"
          style={{ color: 'color-mix(in srgb, var(--moss) 50%, transparent)' }}
        />
      }
      cta={
        <Button variant="primary">
          <Plus data-icon="inline-start" />
          Añadir ejercicios
        </Button>
      }
    >
      Añade tus ejercicios para
      <br />
      crear el workout.
    </EmptyState>
  ),
};

export const WithoutCta: Story = {
  args: { icon: null, children: null },
  render: () => (
    <EmptyState
      icon={
        <SportShoe className="size-5 [stroke-width:1.5]" style={{ color: 'color-mix(in srgb, var(--moss) 50%, transparent)' }} />
      }
    >
      No hay workouts creados.
    </EmptyState>
  ),
};
