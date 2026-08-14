import type { Meta, StoryObj } from '@storybook/react-vite';
import { ArrowRight, Pause, Play, SlidersHorizontal, Square } from 'lucide-react';

import { Button } from './button';

const meta = {
  title: 'UI/Button',
  component: Button,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    variant: {
      control: 'select',
      options: ['primary', 'ghost', 'inverse', 'ghost-inverse'],
    },
  },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    variant: 'primary',
    children: 'Start Workout',
  },
};

// `inverse` and `ghost-inverse` use --foreground-inverse (near-white) text,
// so they need a moss backdrop to read — exactly how they appear in the
// product (Workout Overview, Workout Completion, "Finish").
export const Variants: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-4">
      <Button variant="primary">Start Workout</Button>
      <Button variant="ghost">Adjust plan</Button>
      <div className="flex items-center gap-4 rounded-xl bg-background-inverse p-4">
        <Button variant="inverse">Finish</Button>
        <Button variant="ghost-inverse">Discard Activity</Button>
      </div>
    </div>
  ),
};

export const NoIcon: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-4">
      <Button variant="primary">Save Activity</Button>
      <div className="rounded-xl bg-background-inverse p-4">
        <Button variant="ghost-inverse">Discard Activity</Button>
      </div>
    </div>
  ),
};

export const LeadingIcon: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-4">
      <Button variant="primary">
        <Play data-icon="inline-start" fill="currentColor" stroke="none" />
        Start Workout
      </Button>
      <Button variant="ghost">
        <SlidersHorizontal data-icon="inline-start" />
        Adjust plan
      </Button>
      <Button variant="ghost">
        <Pause data-icon="inline-start" fill="currentColor" stroke="none" />
        Pause
      </Button>
      <div className="rounded-xl bg-background-inverse p-4">
        <Button variant="inverse">
          <Square data-icon="inline-start" fill="currentColor" stroke="none" />
          Finish
        </Button>
      </div>
    </div>
  ),
};

export const TrailingIcon: Story = {
  render: () => (
    <Button variant="primary">
      Next
      <ArrowRight data-icon="inline-end" />
    </Button>
  ),
};

export const Disabled: Story = {
  args: {
    variant: 'primary',
    children: 'Start Workout',
    disabled: true,
  },
};
