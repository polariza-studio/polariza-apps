import type { Meta, StoryObj } from '@storybook/react-vite';

import { PageHeader } from './page-header';

const meta = {
  title: 'UI/PageHeader',
  component: PageHeader,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: `
**Purpose** — the back/title/close row at the top of a screen or a modal
sheet. Covers the 3 real compositions in the product: back only
(HistoryPage), back + title (ActivityDetailPage), title + close
(CreateWorkoutPage, and ExerciseModal's sheet header).

**Anatomy** — up to 3 slots in one fixed-height row: an optional back
IconButton (ArrowLeft), an optional two-tone title, an optional close
IconButton (X). No usage combines back with close today.

**Variants** — the 3 compositions above, chosen by which props are passed
(\`onBack\`, \`title\`, \`onClose\`) — not separate named variants.

**States** — none of its own; back/close are plain IconButtons and inherit
IconButton's own hover/pressed/focus states (see UI/IconButton).

**Tokens/specs** — \`h-16\` (64px — Tailwind's own scale, no space-* token
covers 64px, same direct-exception precedent as Button's \`h-12\`),
\`p-space-7\` (20px, all sides), \`flex items-center justify-between\`, always
\`w-full\`. Verified pixel-for-pixel against Paper's "historial",
"historial-workout-detail", "crear-workout" and "modal" artboards — all
four share this exact height/padding. Title: \`text-body\`/\`leading-body\`,
emphasis half in \`text-foreground\`, secondary half in
\`text-foreground-secondary\`, joined by " · ". Back/close icon color:
\`text-foreground\` on both.

**One spec, no per-screen spacing.** Production had drifted into two
different outer paddings before this was caught (History/ActivityDetail:
\`px-space-7 pt-space-7\`, no bottom padding; CreateWorkout/ExerciseModal:
\`p-space-7\`, all sides) — checked against Paper, that was implementation
drift, not an intentional difference: all 4 header artboards specify the
identical 64px/20px box. PageHeader now owns that spacing itself; every
caller wraps it only in the shared \`mx-auto max-w-[440px]\` width
constraint, with no padding of its own layered on top.

**Interaction** — \`onBack\`/\`onClose\` are plain click handlers; PageHeader
doesn't assume navigation or a specific closing mechanism. Inside
ExerciseModal, \`onClose\` is wired to the same \`onOpenChange(false)\` the
dialog's own root already receives — behaviorally identical to wrapping the
button in Radix's \`Dialog.Close\`, just without requiring PageHeader to know
about Dialog at all.

**Content** — \`titleAs\` (default \`"span"\`) lets the title render as a
different element — used by ExerciseModal to render it as a Radix
\`Dialog.Title\` (required for the dialog's own accessibility wiring) instead
of a plain \`<span>\`. The two-tone formatting is identical either way.

**Responsive** — no width of its own beyond \`w-full\`; the surrounding
\`mx-auto max-w-[440px]\` content column (same as every other section on
these screens) is the caller's concern, not PageHeader's.
        `,
      },
    },
  },
} satisfies Meta<typeof PageHeader>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Back: Story = {
  args: {
    onBack: () => {},
  },
};

export const BackWithTitle: Story = {
  args: {
    onBack: () => {},
    title: { emphasis: 'Workout', secondary: 'Detalles' },
  },
};

export const TitleWithClose: Story = {
  args: {
    title: { emphasis: 'Nuevo', secondary: 'workout' },
    onClose: () => {},
  },
};

// The same spec (h-16, p-space-7) rendered across all 3 compositions —
// only the width constraint (mx-auto max-w-[440px], the same one used
// everywhere else on these screens) comes from the caller.
export const AllCompositions: Story = {
  render: () => (
    <div className="flex flex-col gap-6">
      <div className="mx-auto w-full max-w-[440px] rounded-lg outline outline-1 outline-border-subtle">
        <PageHeader onBack={() => {}} />
      </div>
      <div className="mx-auto w-full max-w-[440px] rounded-lg outline outline-1 outline-border-subtle">
        <PageHeader onBack={() => {}} title={{ emphasis: 'Workout', secondary: 'Detalles' }} />
      </div>
      <div className="mx-auto w-full max-w-[440px] rounded-lg outline outline-1 outline-border-subtle">
        <PageHeader title={{ emphasis: 'Nuevo', secondary: 'workout' }} onClose={() => {}} />
      </div>
    </div>
  ),
};

// Demonstrates the `titleAs` override with a plain element (`h2`) — the
// real use (Radix `Dialog.Title` inside ExerciseModal) needs a live Dialog
// context to render, so it isn't reproduced here; the mechanism is the
// same either way.
export const TitleAsCustomElement: Story = {
  args: {
    title: { emphasis: 'Editar', secondary: 'ejercicio' },
    titleAs: 'h2',
    onClose: () => {},
  },
};
