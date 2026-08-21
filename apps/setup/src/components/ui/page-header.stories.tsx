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
sheet. Covers the 5 real compositions in the product: back only
(HistoryPage), back + title (ActivityDetailPage), title + close
(CreateWorkoutPage, and ExerciseModal's sheet header), title with neither
action (HomePage's "SetUp / Workouts" band), and close with neither back
nor title (WorkoutPreviewPage). None of these is a different component —
they're all the same PageHeader with different slots filled.

**Anatomy** — up to 3 slots in one fixed-height row: an optional back
IconButton (ArrowLeft), an optional title, an optional close IconButton
(X). No usage combines back with close today.

**Variants** — the 5 compositions above, chosen by which props are passed
(\`onBack\`, \`title\`, \`onClose\`) — not separate named variants.

**States** — none of its own; back/close are plain IconButtons and inherit
IconButton's own hover/pressed/focus states (see UI/IconButton).

**Tokens/specs** — \`h-16\` (64px — Tailwind's own scale, no space-* token
covers 64px, same direct-exception precedent as Button's \`h-12\`),
\`p-space-7\` (20px, all sides), \`flex items-center\`, \`mx-auto w-full
max-w-[480px]\`. Verified pixel-for-pixel against Paper's "historial",
"historial-workout-detail", "crear-workout", "modal", "home" and
"preview-workout" artboards — all six share the same 64px/20px box.
Back/close icon color: \`text-foreground\` (or \`text-foreground-inverse\`
with \`inverse\` — see Content below).

**Alignment isn't always \`justify-between\`.** Every composition except
one uses it — a lone back button still lands at the row's start with
nothing to push it elsewhere. Close-only (WorkoutPreviewPage) is the
exception: verified against Paper, that header is \`justify-content: end\`
— a lone *trailing* action has nothing pushing it right without saying so
explicitly, so PageHeader switches to \`justify-end\` specifically when
\`onClose\` is the only prop passed.

**Why \`max-w-[480px]\`, not \`440px\`.** Every other section on these
screens reaches the shared 440px content column by putting its padding
OUTSIDE an \`mx-auto max-w-[440px]\` box — so that box's content touches its
own edges with no further inset. PageHeader instead owns \`p-space-7\`
*inside* its own box (needed either way, for the fixed 64px height) — so
capping at 440 would inset its content a further 20px past every other
section, which is exactly the drift this fixes: \`max-w-[480px]\` (440 +
2×20) lets that same padding "eat back" to the 440px line on wide
viewports, landing flush with everything else. On narrow (mobile)
viewports the 480 cap never engages and \`p-space-7\` alone reproduces the
same 20px inset every other section gets from its own outer padding.

**Title rendering depends on whether an action is present.** \`title\` is
always \`{ emphasis, secondary? }\`. With \`onBack\` or \`onClose\` present, the
title only has one end of the row to itself, so both halves join into one
\`text-body\`/\`leading-body\` block — emphasis in \`text-foreground\`,
secondary in \`text-foreground-secondary\`, joined by " · " (e.g. "Editar ·
workout"). With neither action present (Home), the whole row is free, and
the two halves render as fully independent labels pushed to opposite edges
by \`justify-between\` — no dot: emphasis in
\`text-body-emphasis\`/\`leading-body-emphasis\`/\`text-foreground\` ("SetUp"),
secondary in \`text-body\`/\`leading-body\`/\`text-foreground-secondary\`
("Workouts") — verified against Paper's "home" artboard.

**One spec, no per-screen spacing.** Production had drifted twice on this
component before landing here — first into two different outer paddings
per screen (History/ActivityDetail: \`px-space-7 pt-space-7\`, no bottom
padding; CreateWorkout/ExerciseModal: \`p-space-7\`, all sides), then, after
fixing that, into a width mismatch (pages wrapped PageHeader in
\`mx-auto max-w-[440px]\` and its own padding inset the content a further
20px inside that, misaligning it against every section below). Both were
implementation drift, not intentional per-screen differences — checked
against Paper for the first, and against the rest of each page's own
content column for the second. PageHeader now owns both spacing and
width-capping itself; every caller (HistoryPage, ActivityDetailPage,
CreateWorkoutPage, ExerciseModal, HomePage) drops it in directly, no
wrapper div at all.

**Interaction** — \`onBack\`/\`onClose\` are plain click handlers; PageHeader
doesn't assume navigation or a specific closing mechanism. Inside
ExerciseModal, \`onClose\` is wired to the same \`onOpenChange(false)\` the
dialog's own root already receives — behaviorally identical to wrapping the
button in Radix's \`Dialog.Close\`, just without requiring PageHeader to know
about Dialog at all.

**Content** — \`titleAs\` (default \`"span"\`) lets the *joined* title render
as a different element — used by ExerciseModal to render it as a Radix
\`Dialog.Title\` (required for the dialog's own accessibility wiring) instead
of a plain \`<span>\`. It has no effect on the split (no-action) rendering,
which never needs it. \`inverse\` swaps every color token here (icon,
title) to its inverse-surface counterpart — used by WorkoutPreviewPage,
which sits on the same \`background-inverse\` surface as
WorkoutCompletePage. Mirrors IconButton's own light/inverse handling: the
icon itself always renders correctly via \`currentColor\`, \`inverse\` just
tells PageHeader which token to hand it, since its icon buttons don't sit
under an ambient text color here the way IconButton usually does.

**Responsive** — the one component in this system that self-caps its own
width rather than deferring to a caller-provided content column (see "Why
\`max-w-[480px]\`" above) — because it's also the one component dropped
directly into containers of very different native widths (a page's full
flow, Home's full-bleed hero band, ModalSheet's already-440-capped
content) and needs to land on the same 440px line in all of them without
each caller having to know that.
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

// No back, no close — the whole row is free, so emphasis/secondary split
// to opposite edges instead of joining into one block. HomePage's actual
// header, verified against Paper's "home" artboard.
export const TitleOnly: Story = {
  args: {
    title: { emphasis: 'SetUp', secondary: 'Workouts' },
  },
};

// No back, no title — the lone close button sits at the row's *end*
// (justify-end), not its start — and `inverse` swaps its color for the
// dark surface. WorkoutPreviewPage's actual header, verified against
// Paper's "preview-workout" artboard (both traits always co-occur there:
// close-only headers in this product are always on an inverse surface).
export const CloseOnlyInverse: Story = {
  args: {
    onClose: () => {},
    inverse: true,
  },
  render: (args) => (
    <div className="bg-background-inverse rounded-lg p-2">
      <PageHeader {...args} />
    </div>
  ),
};

// No wrapper div — PageHeader caps and centers itself. Deliberately placed
// in a container wider than 480px (unlike a real page's own content flow)
// to demonstrate that self-capping: every row below lands on the same
// 440px-wide, centered line purely from PageHeader's own classes, with
// nothing extra from the caller.
export const AllCompositions: Story = {
  render: () => (
    <div className="flex flex-col gap-6">
      <PageHeader onBack={() => {}} className="rounded-lg outline outline-1 outline-border-subtle" />
      <PageHeader
        onBack={() => {}}
        title={{ emphasis: 'Workout', secondary: 'Detalles' }}
        className="rounded-lg outline outline-1 outline-border-subtle"
      />
      <PageHeader
        title={{ emphasis: 'Nuevo', secondary: 'workout' }}
        onClose={() => {}}
        className="rounded-lg outline outline-1 outline-border-subtle"
      />
      <PageHeader
        title={{ emphasis: 'SetUp', secondary: 'Workouts' }}
        className="rounded-lg outline outline-1 outline-border-subtle"
      />
      <div className="bg-background-inverse rounded-lg p-2">
        <PageHeader onClose={() => {}} inverse />
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
