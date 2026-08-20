import type { Meta, StoryObj } from '@storybook/react-vite';

import { TextField } from './text-field';

const meta = {
  title: 'UI/TextField',
  component: TextField,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
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

// The real usage pattern everywhere in the app: a `text-label` caption
// stacked above the field (Nombre del workout/ejercicio, Sets, Reps,
// Descanso, and the active workout's Reps/Peso) — TextField itself has no
// label prop, this composition is the call site's responsibility.
export const WithLabel: Story = {
  args: {
    id: 'story-exercise-name',
    placeholder: 'Nombre del ejercicio',
  },
  render: (args) => (
    <div className="flex w-[320px] flex-col gap-space-3">
      <label htmlFor={args.id} className="text-label leading-label text-foreground-secondary">
        Nombre del ejercicio
      </label>
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
