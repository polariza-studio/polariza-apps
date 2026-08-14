// Saved activity domain types.
// Spec: setup-functional-spec.md §10 (core domain models) and §9 (workout completion).

import type { CompletedSet } from './workout';

export type Activity = {
  id: string;
  planId: string;
  trainingDayId: string;
  startedAt: string;
  completedAt: string;
  durationSeconds: number;
  exercises: {
    exerciseId: string;
    sets: CompletedSet[];
  }[];
};
