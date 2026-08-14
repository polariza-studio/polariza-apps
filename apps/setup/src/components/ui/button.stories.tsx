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
      options: ['primary', 'ghost', 'secondary', 'ghost-inverse'],
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

// `secondary` (Finish) has its own moss fill/white text but sits directly
// on the light page — not a dark-surface context, so it renders at top
// level alongside primary/ghost. `ghost-inverse` (Discard Activity) is the
// only variant that actually lives on an inverse/dark surface, so it's the
// only one wrapped in a moss backdrop here — matching how it appears in
// the product.
export const Variants: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-4">
      <Button variant="primary">Start Workout</Button>
      <Button variant="ghost">Adjust plan</Button>
      <Button variant="secondary">Finish</Button>
      <div className="flex items-center gap-4 rounded-xl bg-background-inverse p-4">
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
      <Button variant="secondary">
        <Square data-icon="inline-start" fill="currentColor" stroke="none" />
        Finish
      </Button>
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

// State labels/swatches, not real :hover/:active/:focus-visible triggers —
// this is a visual reference gallery, so each non-Default/Disabled cell
// forces the target state's classes directly (bypassing the pseudo-class)
// so it renders statically. All classes below are canonical Foundations v1
// tokens, the same ones button.tsx itself uses — nothing story-only.
const stateLabelClass = 'text-caption leading-caption text-foreground-secondary';

function StateRow({
  variant,
  hoverClassName,
  pressedClassName,
  focusRingClassName,
}: {
  variant: 'primary' | 'ghost' | 'secondary' | 'ghost-inverse';
  hoverClassName: string;
  pressedClassName: string;
  focusRingClassName: string;
}) {
  return (
    <div className="flex flex-wrap items-end gap-6">
      <div className="flex flex-col items-center gap-2">
        <Button variant={variant}>Start Workout</Button>
        <span className={stateLabelClass}>Default</span>
      </div>
      <div className="flex flex-col items-center gap-2">
        <Button variant={variant} className={hoverClassName}>
          Start Workout
        </Button>
        <span className={stateLabelClass}>Hover</span>
      </div>
      <div className="flex flex-col items-center gap-2">
        <Button variant={variant} className={pressedClassName}>
          Start Workout
        </Button>
        <span className={stateLabelClass}>Pressed</span>
      </div>
      <div className="flex flex-col items-center gap-2">
        <Button variant={variant} className={`ring-2 ring-offset-2 ${focusRingClassName}`}>
          Start Workout
        </Button>
        <span className={stateLabelClass}>Focus</span>
      </div>
      <div className="flex flex-col items-center gap-2">
        <Button variant={variant} disabled>
          Start Workout
        </Button>
        <span className={stateLabelClass}>Disabled</span>
      </div>
    </div>
  );
}

export const InteractionStates: Story = {
  render: () => (
    <div className="flex flex-col gap-10">
      <div className="flex flex-col gap-3">
        <h3 className="text-body-emphasis leading-body-emphasis text-foreground">Primary</h3>
        <StateRow
          variant="primary"
          hoverClassName="bg-button-primary-hover"
          pressedClassName="bg-button-primary-pressed"
          focusRingClassName="ring-foreground"
        />
      </div>
      <div className="flex flex-col gap-3">
        <h3 className="text-body-emphasis leading-body-emphasis text-foreground">Ghost</h3>
        <StateRow
          variant="ghost"
          hoverClassName="bg-border-subtle"
          pressedClassName="bg-border"
          focusRingClassName="ring-foreground"
        />
      </div>
      <div className="flex flex-col gap-3">
        <h3 className="text-body-emphasis leading-body-emphasis text-foreground">Secondary</h3>
        <StateRow
          variant="secondary"
          hoverClassName="bg-button-secondary-hover"
          pressedClassName="bg-button-secondary-pressed"
          focusRingClassName="ring-foreground"
        />
      </div>
      <div className="flex flex-col gap-3 rounded-xl bg-background-inverse p-6">
        <h3 className="text-body-emphasis leading-body-emphasis text-foreground-inverse">Ghost inverse</h3>
        <StateRow
          variant="ghost-inverse"
          hoverClassName="bg-button-ghost-inverse-hover"
          pressedClassName="bg-button-ghost-inverse-pressed"
          focusRingClassName="ring-foreground-inverse"
        />
      </div>
    </div>
  ),
};
