import type { Meta, StoryObj } from '@storybook/react-vite';
import { Play, SkipBack, SkipForward, Square } from 'lucide-react';

import { Button } from './button';
import { BottomActions } from './bottom-actions';

const meta = {
  title: 'UI/BottomActions',
  component: BottomActions,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: `
**Purpose** — the sticky action surface pinned to the bottom of a screen:
CreateWorkoutPage's single "Guardar Workout" button, WorkoutActivePage's
Anterior/Siguiente/Finalizar row. Encapsulates the sticky surface, its
spacing, and the scroll-driven shadow — both real screens already shared
the \`useBottomShadow\` hook before this extraction; only the surrounding
markup was duplicated.

**Anatomy** — an outer sticky, full-width surface (\`bg-background\`,
\`px-space-7 pt-space-7 pb-8\`) containing an inner \`mx-auto max-w-[440px]\`
row (\`flex items-center gap-space-6\`) that renders \`children\` as-is.

**Variants** — none. It adapts to whatever \`children\` it's given — one
button or several — rather than exposing \`oneButton\`/\`twoButtons\` props.
A single button fills the row via its own \`className="w-full"\`, exactly as
it did in its previous non-flex wrapper.

**States** — shadow on / shadow off, driven entirely by \`useBottomShadow\`:
appears the instant the page has more content below the fold, disappears
once scrolled to the bottom. Not a prop — there's no way to force it from
the outside, by design (it reflects real scroll position).

**Tokens/specs** — \`px-space-7 pt-space-7 pb-8\`, \`gap-space-6\` between
actions, shadow \`0 -2px 35px rgba(41,64,0,0.1)\` (the same raw shadow value
both original screens used — no Foundations token covers it yet).

**Interaction** — purely a layout/surface component; clicks are whatever
the passed-in \`Button\`s do. Sticky to the viewport bottom, not the nearest
scroll container.

**Responsive** — no behavior of its own beyond the shared \`max-w-[440px]\`
content column used everywhere else in the app.
        `,
      },
    },
  },
} satisfies Meta<typeof BottomActions>;

export default meta;
type Story = StoryObj<typeof meta>;

// `ready` drives useBottomShadow's real scroll listener — true here so the
// stories below render as they would on an actual (non-scrolled) screen.
export const SingleAction: Story = {
  args: { ready: true, children: null },
  render: () => (
    <BottomActions ready>
      <Button variant="primary" className="w-full">
        Guardar Workout
      </Button>
    </BottomActions>
  ),
};

export const TwoActions: Story = {
  args: { ready: true, children: null },
  render: () => (
    <BottomActions ready>
      <Button variant="ghost" className="flex-1">
        <SkipBack data-icon="inline-start" fill="currentColor" stroke="currentColor" />
        Anterior
      </Button>
      <Button variant="primary" className="flex-1">
        Siguiente
        <SkipForward data-icon="inline-end" fill="currentColor" stroke="currentColor" />
      </Button>
    </BottomActions>
  ),
};

export const PausedState: Story = {
  args: { ready: true, children: null },
  render: () => (
    <BottomActions ready>
      <Button variant="primary" className="flex-1">
        <Play data-icon="inline-start" fill="currentColor" stroke="none" />
        Reanudar
      </Button>
      <Button variant="secondary" className="flex-1">
        <Square data-icon="inline-start" fill="currentColor" stroke="none" />
        Finalizar
      </Button>
    </BottomActions>
  ),
};

// The shadow is driven by the real document/window scroll position
// (useBottomShadow), not a story-only class — so this story leaves the
// content in normal flow, taller than the viewport, rather than nesting it
// in its own overflow-auto container (which the hook wouldn't see:
// scroll/resize listeners here are on `window`). Scroll the Storybook
// canvas itself to see the shadow appear once there's more content below,
// then disappear at the very bottom — exactly like on a real page.
export const WithScrollableContent: Story = {
  args: { ready: true, children: null },
  render: () => (
    <div className="flex min-h-svh flex-col bg-background">
      <div className="flex-1 space-y-4 p-space-7">
        {Array.from({ length: 12 }, (_, i) => (
          <div key={i} className="rounded-lg bg-interactive-subtle p-space-6 text-body leading-body text-foreground">
            Contenido de ejemplo {i + 1}
          </div>
        ))}
      </div>
      <BottomActions ready>
        <Button variant="primary" className="w-full">
          Guardar Workout
        </Button>
      </BottomActions>
    </div>
  ),
};
