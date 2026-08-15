// Session-duration → exercise-count constraint.
// See training/evidence/*.md — content here is PROVISIONAL, not reviewed.
//
// A single ceiling, not a min/max range — assign-movement-patterns.ts
// always fills a day up to this count (bounded further by
// experience.ts's maxExercisesPerSession), so there's no separate "floor"
// value in active use; an earlier min/max version left real session
// budget unused whenever min < max (see assign-movement-patterns.ts's
// comment), which is what actually determined this simplification.

import type { SessionDuration } from '../../domain/onboarding';

export type DurationConstraints = {
  maxExercises: number;
};

// PROVISIONAL — not reviewed, placeholder only.
export const durationConstraints: Record<SessionDuration, DurationConstraints> = {
  30: { maxExercises: 4 },
  45: { maxExercises: 6 },
  60: { maxExercises: 8 },
  75: { maxExercises: 9 },
};
