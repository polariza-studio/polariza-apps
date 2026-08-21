import type { Meta, StoryObj } from '@storybook/react-vite';

import { WeeklyActivity } from './WeeklyActivity';
import { getWeeklyActivitySummary } from './weekly-activity';
import type { Activity } from '@/domain/activity';

function activityOn(daysAgo: number, minutes: number): Activity {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  return {
    id: `a-${daysAgo}`,
    workoutId: 'w1',
    workoutName: 'Lower body',
    date: date.toISOString(),
    durationSeconds: minutes * 60,
    exercises: [{ exerciseName: 'Hip Thrust', sets: [{ reps: 8, weight: 40 }] }],
  };
}

const meta = {
  title: 'UI/WeeklyActivity',
  component: WeeklyActivity,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: `
**Purpose** — Home's "Esta semana" block: the week's total training
minutes plus a 7-day bar chart. Extracted as one unit, not split into a
separate stat + chart, because Paper treats them as a single frame — the
stat and the chart share the same underlying week data and are never
shown apart.

**Anatomy** — a stat line (label + big number + unit) above a bar chart
(7 bars + 7 day-letter labels, Monday-first).

**Variants** — one. Content is entirely driven by the \`weekly\` prop
(from \`getWeeklyActivitySummary\`).

**States** — none of its own; it's a pure read-out with no interaction.

**Tokens/specs** — stat block: \`gap-space-3\`, label in
\`text-body\`/\`leading-body\`/\`text-foreground-secondary\`, number in
\`text-display-lg\`/\`leading-display-lg\`/\`text-foreground\`. Chart: bars
\`w-3\` (12px), max height 67px, \`justify-between\` (no explicit gap —
the row width does the spacing), \`2px\` gap between the bar row and the
label row, \`px-space-1\` side inset. Labels:
\`text-label-emphasis\`/\`leading-label-emphasis\`, centered under each bar.
Verified pixel-for-pixel against Paper's "home" artboard, including the
three-tier color system — bars and labels share the same color per day:

| Tone | Color | Meaning |
| --- | --- | --- |
| \`active\` | \`var(--foreground)\` (moss, 100%) | A day with saved activity |
| \`past\` | \`var(--foreground-secondary)\` (moss, 60%) | A day before today, no activity |
| \`future\` | \`color-mix(in srgb, var(--moss) 20%, transparent)\` | A day after today |

\`future\`'s 20% tint has no dedicated semantic token of its own — it's a
third opacity step beyond \`foreground\`/\`foreground-secondary\`, inlined
rather than named, matching Paper exactly (confirmed via
\`get_computed_styles\`: \`#294000\`/\`#29400099\`/\`#29400033\` are exactly
100%/60%/20% moss).

**Content** — bar height is capped at 67px and scaled against a fixed
45-minute reference session (\`getWeeklyActivitySummary\`), not the week's
own busiest day, so the chart doesn't visually resize week to week. A day
with any logged activity gets a minimum 8px bar even if very short, so it
never reads as "no activity."

**Interaction** — none; purely a read-out.

**Responsive** — no width of its own; fills whatever container it's
placed in (Home's \`max-w-[440px]\` content column).
        `,
      },
    },
  },
} satisfies Meta<typeof WeeklyActivity>;

export default meta;
type Story = StoryObj<typeof meta>;

export const MidWeek: Story = {
  args: { weekly: getWeeklyActivitySummary([activityOn(0, 45), activityOn(2, 30)]) },
  render: (args) => (
    <div className="w-[350px]">
      <WeeklyActivity {...args} />
    </div>
  ),
};

export const NoActivity: Story = {
  args: { weekly: getWeeklyActivitySummary([]) },
  render: (args) => (
    <div className="w-[350px]">
      <WeeklyActivity {...args} />
    </div>
  ),
};

export const FullWeek: Story = {
  args: {
    weekly: getWeeklyActivitySummary([
      activityOn(0, 50),
      activityOn(1, 20),
      activityOn(2, 60),
      activityOn(3, 35),
      activityOn(4, 45),
      activityOn(5, 15),
      activityOn(6, 40),
    ]),
  },
  render: (args) => (
    <div className="w-[350px]">
      <WeeklyActivity {...args} />
    </div>
  ),
};
