// Experience-based modifiers: exercise complexity ceiling, volume scaling,
// and a per-session exercise-count safety ceiling (independent of the
// duration-derived count in duration.ts — this caps *complexity of
// managing a session*, not how much time it takes).
// See training/evidence/*.md — content here is PROVISIONAL, not reviewed.

import type { ExperienceLevel } from '../../domain/onboarding';
import type { ExerciseDifficulty } from '../../domain/exercise';

export type ExperienceRules = {
  maxDifficulty: ExerciseDifficulty;
  // Multiplies goals.ts's setsPerRole before rounding.
  volumeMultiplier: number;
  maxExercisesPerSession: number;
};

// PROVISIONAL — not reviewed, placeholder only.
export const experienceRules: Record<ExperienceLevel, ExperienceRules> = {
  new: { maxDifficulty: 'beginner', volumeMultiplier: 0.8, maxExercisesPerSession: 5 },
  'some-experience': { maxDifficulty: 'intermediate', volumeMultiplier: 1, maxExercisesPerSession: 7 },
  experienced: { maxDifficulty: 'advanced', volumeMultiplier: 1.15, maxExercisesPerSession: 9 },
};
