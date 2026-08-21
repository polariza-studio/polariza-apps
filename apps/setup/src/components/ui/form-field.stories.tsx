import type { Meta, StoryObj } from '@storybook/react-vite';

import { FormField } from './form-field';
import { TextField } from './text-field';

const meta = {
  title: 'UI/FormField',
  component: FormField,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: `
**Purpose** — pairs a label with its field and owns the relationship between
them: the gap, and the label's typography/color. Used everywhere ExerciseModal
asks for a value (Nombre del ejercicio, Sets, Reps, Descanso — 4 identical
call sites before this was extracted).

**Anatomy** — \`<label>\` (\`text-caption\`/\`leading-caption\`/\`text-foreground-secondary\`)
+ \`gap-space-3\` + the field itself, passed as \`children\` (in production
always a \`TextField\`, but FormField doesn't import or assume that — it
renders whatever it's given).

**Variants** — one. No size/orientation variants exist in the product.

**Tokens/specs** — \`gap-space-3\` between label and field, label in
\`text-caption\`/\`leading-caption\`/\`text-foreground-secondary\`. No color/size
props: the label styling is fixed, matching the one visual FormField has
everywhere it's used.

**Content** — the label is a single line; ExerciseModal's longest current
label is "Descanso (s)". A longer label wraps normally (no truncation) since
nothing constrains it to one line.

**Responsive** — no width of its own; stretches to whatever its container
provides, same as its field.

**Scope** — FormField owns the field's own anatomy only. Layout spacing
around a *list* of FormFields (ExerciseModal's \`px-space-7\`/\`pt-space-7\`/
\`pb-space-4\` wrapper around each one) is the calling layout's responsibility,
not FormField's — see the production usage note below.
        `,
      },
    },
  },
} satisfies Meta<typeof FormField>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    label: 'Nombre del ejercicio',
    htmlFor: 'story-name',
    children: null,
  },
  render: (args) => (
    <div className="w-[320px]">
      <FormField {...args}>
        <TextField id={args.htmlFor} placeholder="Nombre del ejercicio" />
      </FormField>
    </div>
  ),
};

// ExerciseModal's real usage: each FormField sits inside its own
// px-space-7/pt-space-7/pb-space-4 row — that padding belongs to the modal's
// layout (repeated per-field spacing), not to FormField itself.
export const InProductionLayout: Story = {
  args: { label: 'Nombre del ejercicio', htmlFor: 'story-layout-name', children: null },
  render: () => (
    <div className="flex w-[320px] flex-col">
      <div className="px-space-7 pt-space-7 pb-space-4">
        <FormField label="Nombre del ejercicio" htmlFor="story-layout-name">
          <TextField id="story-layout-name" placeholder="Nombre del ejercicio" />
        </FormField>
      </div>
      <div className="px-space-7 pt-space-7 pb-space-4">
        <FormField label="Sets" htmlFor="story-layout-sets">
          <TextField id="story-layout-sets" type="number" inputMode="numeric" placeholder="3" />
        </FormField>
      </div>
    </div>
  ),
};

export const LongLabel: Story = {
  args: {
    label: 'Un nombre de campo bastante más largo de lo habitual',
    htmlFor: 'story-long-label',
    children: null,
  },
  render: (args) => (
    <div className="w-[320px]">
      <FormField {...args}>
        <TextField id={args.htmlFor} placeholder="Valor" />
      </FormField>
    </div>
  ),
};
