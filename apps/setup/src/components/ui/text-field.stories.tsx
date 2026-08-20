import type { Meta, StoryObj } from '@storybook/react-vite';

// Documentation only — each field below renders the exact <input>
// markup (className copied verbatim, character for character) from its
// real call site, so this page is a mirror of what's actually shipped,
// not a redesign or a shared component. WorkoutActivePage's two fields
// were previously missing `font-light` — confirmed against Paper's
// "workout-started" artboard (both Reps and Peso are font-light there)
// and fixed directly in WorkoutActivePage.tsx, so all seven fields now
// carry the same class consistently.
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

      <Field label="WorkoutActivePage — set reps">
        {/* className copied verbatim from WorkoutActivePage.tsx */}
        <input
          type="number"
          inputMode="numeric"
          placeholder="10"
          className="text-display-md leading-display-md text-foreground placeholder:text-foreground/30 w-full border-none bg-transparent font-light outline-none"
        />
      </Field>

      <Field label="WorkoutActivePage — set weight">
        <input
          type="text"
          inputMode="decimal"
          placeholder="—"
          className="text-display-md leading-display-md text-foreground placeholder:text-foreground/30 w-full border-none bg-transparent font-light outline-none"
        />
      </Field>
    </div>
  ),
};
