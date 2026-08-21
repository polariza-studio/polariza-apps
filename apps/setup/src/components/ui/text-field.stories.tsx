import type { Meta, StoryObj } from '@storybook/react-vite';

import { TextField } from './text-field';

const meta = {
  title: 'UI/TextField',
  component: TextField,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: `
**Purpose** — the borderless, display-md input used wherever a field sits
directly on the page or a modal, not inside a bordered container: workout
name, exercise name/sets/reps/rest, the active-workout set's reps/weight.

**Anatomy** — a single native \`<input>\`. No label, no icon, no affix slots —
TextField is the field only; pairing it with a label is FormField's job (see
UI/FormField), not TextField's.

**Variants** — one visual. \`type\`, \`inputMode\`, \`min\`, \`list\`, \`autoFocus\`,
\`ref\`, \`disabled\`, etc. are native \`<input>\` props passed straight through
for each call site's own needs (numeric entry, datalist suggestions, focus
timing) — not component variants.

**States** — Default, Filled, Disabled (native, no custom styling of its
own). Focus has no visible ring by current implementation — see
"Focus" below; this is a documented gap, not an inferred fix.

**Tokens/specs** — \`text-display-md\`/\`leading-display-md\`, \`font-light\`,
\`text-foreground\`, placeholder at \`text-foreground/30\`, no border, no
background, full width.

**Content** — placeholder-driven, no label of its own (see FormField for the
label composition). Long values scroll within the input natively; nothing
truncates.

**Interaction/Focus** — every real call site sets \`outline-none\` and
TextField applies no custom \`:focus\` treatment, so there is currently no
visible focus indicator on any TextField in the product. Documented here as
a gap, not fixed — fixing it is a design decision, not something to infer
while writing stories.

**Responsive** — always \`w-full\`; sizing is entirely the containing layout's
responsibility, not a TextField concern.
        `,
      },
    },
  },
  argTypes: {
    type: {
      control: 'select',
      options: ['text', 'number'],
    },
  },
} satisfies Meta<typeof TextField>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    placeholder: 'Nombre del workout',
  },
  render: (args) => (
    <div className="w-[320px]">
      <TextField {...args} />
    </div>
  ),
};

export const Filled: Story = {
  args: {
    defaultValue: 'Squat',
  },
  render: (args) => (
    <div className="w-[320px]">
      <TextField {...args} />
    </div>
  ),
};

// type="number" + inputMode="numeric" — ExerciseModal's Sets/Descanso, and
// the active workout's Reps field.
export const Numeric: Story = {
  args: {
    type: 'number',
    inputMode: 'numeric',
    placeholder: '3',
  },
  render: (args) => (
    <div className="w-[160px]">
      <TextField {...args} />
    </div>
  ),
};

// Native <input disabled> — a real capability passed straight through
// (TextField applies no custom disabled styling of its own), not
// currently used at any of the 7 real call sites.
export const Disabled: Story = {
  args: {
    defaultValue: 'Squat',
    disabled: true,
  },
  render: (args) => (
    <div className="w-[320px]">
      <TextField {...args} />
    </div>
  ),
};

// Every real call site sets `outline-none` and TextField has no custom
// focus/hover treatment of its own (unlike Button/IconButton's Foundations
// v1 ladder) — so there is currently no visible :focus indicator on any
// TextField in the product. Documented as a gap, not fixed here: fixing it
// is a design decision, not something to infer while writing stories.
export const FocusVisibility: Story = {
  args: {
    defaultValue: 'Squat',
  },
  render: (args) => (
    <div className="flex w-[320px] flex-col gap-space-3">
      <span className="text-caption leading-caption text-foreground-secondary">
        Focused (tab to it or click in) — no visible ring, by current implementation
      </span>
      <TextField {...args} autoFocus />
    </div>
  ),
};
