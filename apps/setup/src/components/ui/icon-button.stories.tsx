import type { Meta, StoryObj } from '@storybook/react-vite';
import { ArrowLeft } from 'lucide-react';

import { IconButton } from './icon-button';

const meta = {
  title: 'UI/IconButton',
  component: IconButton,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
} satisfies Meta<typeof IconButton>;

export default meta;
type Story = StoryObj<typeof meta>;

// The exact API from the approved spec — no variant/size/color prop. Color
// comes from `body`'s own `text-foreground` (index.css base layer), same
// as any other text on a light screen.
export const Back: Story = {
  args: {
    'aria-label': 'Go back',
    children: <ArrowLeft />,
  },
};

export const Disabled: Story = {
  args: {
    'aria-label': 'Go back',
    children: <ArrowLeft />,
    disabled: true,
  },
};

// Same <IconButton>, no props changed — only the ancestor's text color
// changes, exactly like Paper's Back button on its two moss screens vs.
// its three light screens.
export const LightContext: Story = {
  args: {
    'aria-label': 'Go back',
    children: <ArrowLeft />,
  },
  render: () => (
    <div className="flex items-center gap-4 rounded-xl bg-background p-4 text-foreground">
      <IconButton aria-label="Go back">
        <ArrowLeft />
      </IconButton>
    </div>
  ),
};

export const InverseContext: Story = {
  args: {
    'aria-label': 'Go back',
    children: <ArrowLeft />,
  },
  render: () => (
    <div className="flex items-center gap-4 rounded-xl bg-background-inverse p-4 text-foreground-inverse">
      <IconButton aria-label="Go back">
        <ArrowLeft />
      </IconButton>
    </div>
  ),
};

// State labels/swatches, not real :hover/:active/:focus-visible triggers —
// forces each state's classes directly (bypassing the pseudo-class) via
// `className`, so it renders statically. PROPOSED 2026-08-14, pending
// visual approval — `--icon-button-hover`/`-pressed` are provisional (see
// icon-button.tsx and index.css), not yet in Foundations.mdx.
function StateRow({ labelClassName }: { labelClassName: string }) {
  return (
    <div className="flex flex-wrap items-end gap-6">
      <div className="flex flex-col items-center gap-2">
        <IconButton aria-label="Go back">
          <ArrowLeft />
        </IconButton>
        <span className={labelClassName}>Default</span>
      </div>
      <div className="flex flex-col items-center gap-2">
        <IconButton aria-label="Go back" className="bg-[var(--icon-button-hover)]">
          <ArrowLeft />
        </IconButton>
        <span className={labelClassName}>Hover</span>
      </div>
      <div className="flex flex-col items-center gap-2">
        <IconButton aria-label="Go back" className="bg-[var(--icon-button-pressed)]">
          <ArrowLeft />
        </IconButton>
        <span className={labelClassName}>Pressed</span>
      </div>
      <div className="flex flex-col items-center gap-2">
        <IconButton aria-label="Go back" className="ring-2 ring-current">
          <ArrowLeft />
        </IconButton>
        <span className={labelClassName}>Focus</span>
      </div>
      <div className="flex flex-col items-center gap-2">
        <IconButton aria-label="Go back" disabled>
          <ArrowLeft />
        </IconButton>
        <span className={labelClassName}>Disabled</span>
      </div>
    </div>
  );
}

export const InteractionStates: Story = {
  args: {
    'aria-label': 'Go back',
    children: <ArrowLeft />,
  },
  render: () => (
    <div className="flex flex-col gap-10">
      <div className="flex flex-col gap-3">
        <h3 className="text-body-emphasis leading-body-emphasis text-foreground">Light context</h3>
        <StateRow labelClassName="text-caption leading-caption text-foreground-secondary" />
      </div>
      <div className="flex flex-col gap-3 rounded-xl bg-background-inverse p-6 text-foreground-inverse">
        <h3 className="text-body-emphasis leading-body-emphasis">Inverse context</h3>
        <StateRow labelClassName="text-caption leading-caption text-foreground-inverse-secondary" />
      </div>
    </div>
  ),
};
