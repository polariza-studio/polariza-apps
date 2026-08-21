import type { Meta, StoryObj } from '@storybook/react-vite';
import { MemoryRouter } from 'react-router-dom';

import { ActivityRow } from './activity-row';
import type { Activity } from '@/domain/activity';

const activity: Activity = {
  id: 'a1',
  workoutId: 'w1',
  workoutName: 'Lower body',
  date: '2026-08-18T09:00:00.000Z',
  durationSeconds: 45 * 60,
  exercises: [
    { exerciseName: 'Hip Thrust', sets: [{ reps: 8, weight: 40 }] },
    { exerciseName: 'Sentadilla Búlgara', sets: [{ reps: 10, weight: 20 }] },
  ],
};

const meta = {
  title: 'UI/ActivityRow',
  component: ActivityRow,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: `
**Purpose** — the date-badge + card row for one logged activity, used
identically in Home's "Tu actividad" preview and the full History list
(previously an identical block copy-pasted in both pages).

**Anatomy** — a \`Link\` containing a fixed-width date badge (day + month)
and a bordered card (workout name + exercise/duration meta). The whole row
is the click target — there's no separate button inside it.

**Variants** — one. Content (name, date, meta) is entirely data-driven from
the \`activity\` prop.

**States** — Default, Hover (\`bg-interactive-subtle\` on the card),
Pressed (\`bg-border-subtle\`), Focus (\`ring-2 ring-foreground\` on the whole
row). Hover/Pressed are scoped to the card only via a \`group\` on the
\`Link\` — the date badge keeps its own fixed \`interactive-subtle\` fill
regardless of row state.

**Tokens/specs** — row: \`gap-space-5\` (20px), \`items-start\` (verified
against Paper's "historial"/"home" artboards — the date badge sits flush
with the card's top edge, not vertically centered; production had this as
\`items-center\` before verification, which is corrected here). Date badge:
\`w-12\` (48px), \`rounded-lg\`, \`bg-interactive-subtle\`, day and month both
\`text-label\`/\`leading-label\`/\`text-foreground-secondary\` — identical
treatment for both, per Paper (production had emphasized the day via
\`text-label-emphasis\`/\`text-foreground\`, which Paper's design doesn't
have — also corrected here). Card: \`border-border-subtle\`, \`rounded-lg\`,
\`px-space-6 py-space-5\`, \`gap-space-3\` between name and meta. Name:
\`text-heading\`/\`leading-heading\`/\`font-light\`/\`text-foreground\`. Meta:
\`text-caption\`/\`leading-caption\`/\`text-foreground-secondary\`.

**Content** — workout name has no truncation — a long name simply wraps the
card taller. Meta is always "N ejercicios · M min", derived from the
activity's own exercise count and duration; there's no "no exercises"
state since a saved activity always has at least one.

**Interaction** — the entire row is one \`Link\` (\`to\` prop, from the
caller). Hover/Pressed act only on the card's visual fill (via \`group\`),
not the date badge; Focus rings the whole row.

**Responsive** — no width of its own; fills whatever \`flex-col\` list it's
placed in (both real uses are inside the shared \`max-w-[440px]\` content
column).
        `,
      },
    },
  },
  decorators: [
    (Story) => (
      <MemoryRouter>
        <div className="w-[350px]">
          <Story />
        </div>
      </MemoryRouter>
    ),
  ],
} satisfies Meta<typeof ActivityRow>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    activity,
    to: '/history/a1',
  },
};

export const LongWorkoutName: Story = {
  args: {
    activity: { ...activity, workoutName: 'Tren inferior + Core + Movilidad completa' },
    to: '/history/a1',
  },
};

export const List: Story = {
  args: { activity, to: '/history/a1' },
  render: () => (
    <div className="flex flex-col gap-space-5">
      <ActivityRow activity={activity} to="/history/a1" />
      <ActivityRow
        activity={{ ...activity, id: 'a2', workoutName: 'Upper body', date: '2026-08-16T09:00:00.000Z', durationSeconds: 32 * 60 }}
        to="/history/a2"
      />
    </div>
  ),
};
