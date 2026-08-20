import type { Meta, StoryObj } from '@storybook/react-vite';

// Documentation only — no product code was touched to build this. Each
// field below renders the exact <input> markup (className copied
// verbatim, character for character) from its real call site, so this
// page is a mirror of what's actually shipped, not a redesign or a
// shared component. There IS a real inconsistency between the two
// groups below — CreateWorkoutPage/ExerciseModal's five inputs carry an
// explicit `font-light`, WorkoutActivePage's two don't — left as-is on
// purpose: documenting what's built means recording that discrepancy,
// not silently resolving it.
const meta = {
  title: 'UI/TextField',
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-2">
      <span className="text-caption leading-caption text-foreground-secondary">{label}</span>
      {children}
    </div>
  );
}

export const AllUsages: Story = {
  render: () => (
    <div className="flex w-[320px] flex-col gap-8">
      <Field label="CreateWorkoutPage — workout name">
        {/* className copied verbatim from CreateWorkoutPage.tsx */}
        <input
          placeholder="Nombre del workout"
          className="text-display-md leading-display-md text-foreground placeholder:text-foreground/30 w-full border-none bg-transparent font-light outline-none"
        />
      </Field>

      <Field label="ExerciseModal — exercise name">
        {/* className copied verbatim from ExerciseModal.tsx */}
        <input
          list="story-exercise-name-suggestions"
          placeholder="Nombre del ejercicio"
          className="text-display-md leading-display-md text-foreground placeholder:text-foreground/30 w-full border-none bg-transparent font-light outline-none"
        />
      </Field>

      <Field label="ExerciseModal — sets">
        <input
          type="number"
          inputMode="numeric"
          min={1}
          placeholder="3"
          className="text-display-md leading-display-md text-foreground placeholder:text-foreground/30 w-full border-none bg-transparent font-light outline-none"
        />
      </Field>

      <Field label="ExerciseModal — reps">
        <input
          placeholder="8-10"
          className="text-display-md leading-display-md text-foreground placeholder:text-foreground/30 w-full border-none bg-transparent font-light outline-none"
        />
      </Field>

      <Field label="ExerciseModal — rest (s)">
        <input
          type="number"
          inputMode="numeric"
          min={0}
          placeholder="60"
          className="text-display-md leading-display-md text-foreground placeholder:text-foreground/30 w-full border-none bg-transparent font-light outline-none"
        />
      </Field>

      <Field label="WorkoutActivePage — set reps (no font-light, as shipped)">
        {/* className copied verbatim from WorkoutActivePage.tsx — note the
            missing font-light, unlike the five fields above. */}
        <input
          type="number"
          inputMode="numeric"
          placeholder="10"
          className="text-display-md leading-display-md text-foreground placeholder:text-foreground/30 w-full border-none bg-transparent outline-none"
        />
      </Field>

      <Field label="WorkoutActivePage — set weight (no font-light, as shipped)">
        <input
          type="text"
          inputMode="decimal"
          placeholder="—"
          className="text-display-md leading-display-md text-foreground placeholder:text-foreground/30 w-full border-none bg-transparent outline-none"
        />
      </Field>
    </div>
  ),
};
