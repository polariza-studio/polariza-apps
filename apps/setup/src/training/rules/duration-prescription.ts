// Prescription for duration-tracked exercises (planks, carries, held
// stretches) — the goals.ts rep/rest/RIR model doesn't apply to these, and
// in practice coaches don't differentiate hold/carry duration much by goal
// the way they differentiate rep ranges, so this is role-scaled only.
// PROVISIONAL — not reviewed.

import type { ExerciseRole } from './goals';

export type DurationProgrammingRules = {
  sets: number;
  durationSeconds: number;
  restSeconds: number;
};

export const durationRules: Record<ExerciseRole, DurationProgrammingRules> = {
  primary: { sets: 3, durationSeconds: 40, restSeconds: 60 },
  secondary: { sets: 3, durationSeconds: 35, restSeconds: 45 },
  accessory: { sets: 2, durationSeconds: 30, restSeconds: 30 },
};
