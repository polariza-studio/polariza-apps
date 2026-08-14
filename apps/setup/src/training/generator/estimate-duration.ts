// Stage 7: estimate a training day's duration from its prescribed exercises.
// PROVISIONAL formula (~3s per rep of work, plus prescribed rest) — not
// reviewed. Spec §4.1 step 4: treat as a planning constraint/estimate, never
// an exact promised workout time.

import type { PlannedExercise } from '../../domain/plan';

const SECONDS_PER_REP = 3;

export function estimateDuration(exercises: PlannedExercise[]): number {
  const totalSeconds = exercises.reduce((sum, exercise) => {
    const avgReps = (exercise.repRange[0] + exercise.repRange[1]) / 2;
    const setSeconds = avgReps * SECONDS_PER_REP + exercise.restSeconds;
    return sum + exercise.sets * setSeconds;
  }, 0);

  return Math.round(totalSeconds / 60);
}
