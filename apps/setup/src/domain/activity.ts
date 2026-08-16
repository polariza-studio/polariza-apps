// Saved activity domain types.
// Spec: setup-functional-spec.md §10 (core domain models) and §9 (workout completion).

import type { ActiveExercise } from './workout';

export type Activity = {
  id: string;
  planId: string;
  trainingDayId: string;
  startedAt: string;
  completedAt: string;
  durationSeconds: number;
  // Same warmup/exercises/cooldown split as TrainingDay/ActiveWorkout —
  // what was actually done, including warm-up and cool-down, not just
  // the main lifts.
  warmup: ActiveExercise[];
  exercises: ActiveExercise[];
  cooldown: ActiveExercise[];
};
