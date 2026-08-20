import type { Meta, StoryObj } from '@storybook/react-vite';

import { TextField } from './text-field';

const meta = {
  title: 'UI/TextField',
  component: TextField,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
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

// type="number" + inputMode="numeric" — Sets/Descanso in ExerciseModal, and
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
