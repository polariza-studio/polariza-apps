// Experience-based modifiers: exercise complexity ceiling and volume scaling.
// See training/evidence/*.md — content here is PROVISIONAL, not reviewed.

import type { ExperienceLevel } from '../../domain/onboarding';
import type { ExerciseDifficulty } from '../../domain/exercise';

export type ExperienceRules = {
  maxDifficulty: ExerciseDifficulty;
  // Multiplies goals.ts's setsPerExercise before rounding.
  volumeMultiplier: number;
};

// PROVISIONAL — not reviewed, placeholder only.
export const experienceRules: Record<ExperienceLevel, ExperienceRules> = {
  new: { maxDifficulty: 'beginner', volumeMultiplier: 0.8 },
  'some-experience': { maxDifficulty: 'intermediate', volumeMultiplier: 1 },
  experienced: { maxDifficulty: 'advanced', volumeMultiplier: 1.15 },
};
