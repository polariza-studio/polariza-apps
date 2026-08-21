import type { Meta, StoryObj } from '@storybook/react-vite';
import { MemoryRouter, Route, Routes } from 'react-router-dom';

import { WorkoutCompletePage } from './WorkoutCompletePage';
import type { ActiveWorkout, Workout } from '@/domain/workout';

const WORKOUT_ID = 'story-workout-complete';

const workout: Workout = {
  id: WORKOUT_ID,
  name: 'Tren inferior + Core',
  exercises: [{ id: 'e1', name: 'Hip Thrust', sets: 3, targetReps: '8-10', restSeconds: 60 }],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

// Seeds the same localStorage shape useActiveWorkout reads, with the
// workout already paused (frozen) — exactly the state the real Finalizar
// flow leaves behind right before navigating here, which is what makes
// WorkoutCompletePage.tsx render a real, non-ticking duration instead of
// bailing out to null.
function seedFinishedWorkout() {
  const startedAt = new Date(Date.now() - (47 * 60 + 12) * 1000).toISOString();
  const activeWorkout: ActiveWorkout = {
    workoutId: WORKOUT_ID,
    workoutName: workout.name,
    startedAt,
    pausedAt: new Date().toISOString(),
    pausedMs: 0,
    currentExerciseIndex: 0,
    exercises: [
      {
        name: 'Hip Thrust',
        targetReps: '8-10',
        restSeconds: 60,
        sets: [{ reps: 8, weight: 40, completed: true }],
      },
    ],
  };
  localStorage.setItem('setup:workouts', JSON.stringify([workout]));
  localStorage.setItem('setup:active-workout', JSON.stringify(activeWorkout));
}

const meta = {
  title: 'Patterns/WorkoutComplete',
  component: WorkoutCompletePage,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: `
**Why this is a Pattern, not a Component.** WorkoutCompletePage is a full
route (\`/workouts/:workoutId/complete\`), wired to \`useActiveWorkout\` and
\`useNavigate\` — there's exactly one instance of it in the product and
nothing to reuse it *as*, so it isn't abstracted into a shared component.
This page documents its visual/composition spec, using the real
production component (rendered here inside a \`MemoryRouter\` with
localStorage seeded the same way the real Finalizar flow leaves it —
not a recreated copy).

**Composition** — a full-height column on a solid surface: a 64px empty
spacer (Paper hides the back button on this screen — no way back once a
workout is finished — but keeps the reserved header height so the content
below sits at the same vertical position as every other screen), a
centered block (duration label + duration readout + "Bien hecho!"), and a
bottom action pair.

**Background — solid, not a gradient.** Verified directly against Paper's
"workout-page-ending" artboard (via its raw fill, not just a screenshot):
flat \`#294000\` — \`bg-background-inverse\` (\`--background-inverse: var(
--moss)\`), no gradient stops anywhere. An earlier version of this screen
used a hand-authored CSS gradient with a comment claiming it matched
Paper's stops; re-verified directly against the current design, which has
none, and corrected rather than carried forward.

**Tokens/specs** — spacer: \`h-16\` (matches PageHeader's own height,
without rendering one). Center block: \`gap-space-8\`, "Tiempo de entreno"
in \`text-body\`/\`leading-body\`/\`text-foreground-inverse-secondary\`,
duration in \`text-display-lg\`/\`leading-display-lg\`/\`font-light\`/
\`text-foreground-inverse\`, "Bien hecho!" in \`text-display-md\`/
\`leading-display-md\`/\`font-light\`/\`text-success\` (\`--success\` =
\`--lime-soft\`). Actions: \`gap-space-8\`, \`pt-8 pb-8\` (32px — Tailwind's
own scale, no space-* token covers it), \`Button\` \`primary\` (Guardar) +
\`ghost-inverse\` (Descartar) — both real \`Button\` variants, not
recreated styling.

**Content** — duration is frozen the instant Finalizar is pressed (see
\`use-active-workout.ts\`'s \`pauseAndPersist\`), so it never ticks on this
screen even though the same \`formatElapsed\`/\`elapsedSeconds\` plumbing as
WorkoutActivePage is used to render it.

**Interaction** — Guardar mi actividad persists the activity and returns
home; Descartar discards the in-progress attempt and returns home. Both
routes are real (\`useNavigate('/home')\`) — in this story they simply have
nowhere to land, since only the \`/complete\` route is registered here.
        `,
      },
    },
  },
} satisfies Meta<typeof WorkoutCompletePage>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => {
    seedFinishedWorkout();
    return (
      <MemoryRouter initialEntries={[`/workouts/${WORKOUT_ID}/complete`]}>
        <Routes>
          <Route path="/workouts/:workoutId/complete" element={<WorkoutCompletePage />} />
        </Routes>
      </MemoryRouter>
    );
  },
};
