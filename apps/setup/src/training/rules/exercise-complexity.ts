// Exercise-complexity ceiling — replaces training/rules/experience.ts
// (removed 2026-08-19). Driven by TrainingHistory ONLY — deliberately
// never reads CurrentStrengthTrainingFrequency. Someone training 5
// days/week on a short training history is still technically
// inexperienced; how OFTEN someone currently trains says nothing about
// how much movement-pattern/technique exposure they've accumulated. See
// training/rules/workload-readiness.ts for the (separate) signal that
// DOES read current frequency.
//
// `maxDifficulty` only has 3 achievable values because ExerciseDifficulty
// itself is a 3-value type on the exercise library (domain/exercise.ts)
// — that's a pre-existing constraint of the exercise metadata, not a
// re-creation of the old 3-tier experience model. What genuinely
// differentiates all 4 trainingHistory tiers is `stabilityWeight`, a
// continuous ranking preference (select-exercises.ts's stabilityFit),
// not a hard bucket — 'just-starting' and 'less-than-6-months' share a
// difficulty ceiling but rank candidates differently.
//
// PROVISIONAL — not reviewed by a certified professional, same status as
// training/rules/goals.ts.

import type { TrainingHistory } from '../../domain/onboarding';
import type { ExerciseDifficulty } from '../../domain/exercise';

export type ComplexityRules = {
  maxDifficulty: ExerciseDifficulty;
  // Weight on select-exercises.ts's stabilityFit ranking term (technical +
  // balance demand aversion). 0 = no preference at all (same as the old
  // experience !== 'new' behavior).
  stabilityWeight: number;
};

export const complexityRules: Record<TrainingHistory, ComplexityRules> = {
  'just-starting': { maxDifficulty: 'beginner', stabilityWeight: 0.2 },
  'less-than-6-months': { maxDifficulty: 'beginner', stabilityWeight: 0.1 },
  'six-to-eighteen-months': { maxDifficulty: 'intermediate', stabilityWeight: 0 },
  'more-than-18-months': { maxDifficulty: 'advanced', stabilityWeight: 0 },
};
