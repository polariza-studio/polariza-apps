import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';

import { Button } from './button';
import { FormField } from './form-field';
import { ModalSheet } from './modal-sheet';
import { PageHeader } from './page-header';
import { TextField } from './text-field';

const meta = {
  title: 'UI/ModalSheet',
  component: ModalSheet,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: `
**Purpose** — the bottom-sheet shell behind ExerciseModal: slides up from
the bottom on mobile, centers as a dialog on desktop. Owns only the shell
(surface, corner radius, position, enter/exit animation) — header and body
content are entirely the caller's own composition (typically \`PageHeader\`
+ \`FormField\`s + footer actions), the same way \`FormField\` doesn't own
the layout around it.

**Anatomy** — a Radix \`Dialog\` (overlay + content), with \`children\`
rendered directly inside the sheet's content area — no built-in header or
footer slots.

**Variants** — one shell. Content differs entirely per caller.

**States** — open/closed, each with its own enter/exit animation (slide
from bottom + fade). No other states of its own.

**Tokens/specs** — \`rounded-t-2xl\` (16px, top corners only) on mobile,
\`rounded-2xl\` (all corners) from \`md:\` up where it centers instead of
docking to the bottom. Background is \`var(--neutral-0)\` (#FFFFFF) — a
white surface distinct from the page's own \`--background\`
(#FAFAFA/\`--neutral-50\`) — verified against Paper's "modal" artboards,
which sit the sheet on a lighter, elevated surface than the page behind
it; production had used \`bg-background\` here before verification, which
is corrected as part of this extraction. \`max-h-[90vh]\`, scrolls
internally past that. Overlay: \`bg-black/40\`.

**Content** — no built-in width constraint beyond \`max-w-[440px]\` — same
column width used everywhere else in the app.

**Interaction** — \`onOpenChange\` is the single source of truth for
open/close, same as Radix's own Dialog contract; ModalSheet doesn't assume
a specific trigger. \`skipEntranceAnimation\` exists solely for
ExerciseModal's autofocus requirement: focusing an input synchronously
inside the same click that opens the sheet (required for mobile browsers
to open the keyboard at all) only produces the correct native
scroll-into-view nudge when no entrance animation is still running — see
ExerciseModal's \`focusNameOnMount\` for the full explanation. Exit
animation is unaffected either way.

**Responsive** — the one real responsive behavior in this component: docks
to the bottom of the viewport below \`md\`, centers as a standalone dialog
at \`md\` and up. Not two separate implementations — the same element just
repositions via \`md:\` variants.
        `,
      },
    },
  },
} satisfies Meta<typeof ModalSheet>;

export default meta;
type Story = StoryObj<typeof meta>;

function DemoContent({ onOpenChange }: { onOpenChange: (open: boolean) => void }) {
  return (
    <>
      <PageHeader title={{ emphasis: 'Nuevo', secondary: 'ejercicio' }} onClose={() => onOpenChange(false)} />
      <div className="px-space-7 pt-space-7 pb-space-4">
        <FormField label="Nombre del ejercicio" htmlFor="modal-sheet-story-name">
          <TextField id="modal-sheet-story-name" placeholder="Nombre del ejercicio" />
        </FormField>
      </div>
      <div className="flex flex-col gap-space-6 px-space-7 py-[32px]">
        <Button variant="primary" className="w-full" onClick={() => onOpenChange(false)}>
          Guardar ejercicio
        </Button>
      </div>
    </>
  );
}

export const Open: Story = {
  args: { open: true, onOpenChange: () => {}, children: null },
  render: () => {
    function OpenDemo() {
      const [open, setOpen] = useState(true);
      return (
        <ModalSheet open={open} onOpenChange={setOpen}>
          <DemoContent onOpenChange={setOpen} />
        </ModalSheet>
      );
    }
    return <OpenDemo />;
  },
};

// Interactive: reopen via the button once closed, to see the real
// open→close→open cycle (entrance/exit animation included).
export const Interactive: Story = {
  args: { open: false, onOpenChange: () => {}, children: null },
  render: () => {
    function InteractiveDemo() {
      const [open, setOpen] = useState(false);
      return (
        <div className="flex justify-center p-space-9">
          <Button variant="primary" onClick={() => setOpen(true)}>
            Abrir modal
          </Button>
          <ModalSheet open={open} onOpenChange={setOpen}>
            <DemoContent onOpenChange={setOpen} />
          </ModalSheet>
        </div>
      );
    }
    return <InteractiveDemo />;
  },
};
