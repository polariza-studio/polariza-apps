// Session-duration → exercise-count constraints.
// See training/evidence/*.md — content here is PROVISIONAL, not reviewed.

import type { SessionDuration } from '../../domain/onboarding';

export type DurationConstraints = {
  minExercises: number;
  maxExercises: number;
};

// PROVISIONAL — not reviewed, placeholder only.
export const durationConstraints: Record<SessionDuration, DurationConstraints> = {
  30: { minExercises: 3, maxExercises: 4 },
  45: { minExercises: 5, maxExercises: 6 },
  60: { minExercises: 6, maxExercises: 8 },
  75: { minExercises: 7, maxExercises: 9 },
};
