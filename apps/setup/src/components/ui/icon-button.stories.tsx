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
