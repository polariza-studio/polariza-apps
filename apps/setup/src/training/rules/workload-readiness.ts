// Initial workload readiness — replaces the old ExperienceLevel-driven
// volumeMultiplier/maxExercisesPerSession (training/rules/experience.ts,
// removed 2026-08-19). Combines TWO independent onboarding signals into
// one bounded, transparent value:
//
//   trainingHistory                 -> baseline (how much lifetime exposure)
//   currentStrengthTrainingFrequency -> a small, bounded adjustment on top
//     (how ready their body is RIGHT NOW — current frequency can only ever
//     apply a detraining discount or a modest conditioning bonus, never
//     swing the baseline by more than one step, and never on its own
//     determine readiness)
//
// Deliberately NOT the same axis as exercise complexity
// (training/rules/exercise-complexity.ts), which reads trainingHistory
// only — a user training 5 days/week on a short history can have high
// workload readiness while still getting a beginner-appropriate exercise
// selection. See that file's comment for why the two must stay separate.
//
// PROVISIONAL — not reviewed by a certified professional, same status as
// training/rules/goals.ts.

import type { CurrentStrengthTrainingFrequency, TrainingHistory } from '../../domain/onboarding';

export type InitialWorkloadReadiness = 'minimal' | 'building' | 'standard' | 'confident';

const historyBaseline: Record<TrainingHistory, 0 | 1 | 2 | 3> = {
  'just-starting': 0,
  'less-than-6-months': 1,
  'six-to-eighteen-months': 2,
  'more-than-18-months': 3,
};

// Only ever a detraining DISCOUNT (-1) or a small conditioning BONUS
// (+1) — never lets current frequency overrule history by more than one
// step in either direction. `undefined` (currentStrengthTrainingFrequency
// unknown — always a legacy-migrated user, see
// features/onboarding/legacy-preferences-migration.ts) is neutral: no
// discount, no bonus. This is never a guess at their real frequency, it's
// the readiness formula declining to apply an adjustment it has no basis
// for.
const frequencyAdjustment: Record<CurrentStrengthTrainingFrequency, -1 | 0 | 1> = {
  none: -1,
  'one-to-two': 0,
  'three-to-four': 0,
  'five-plus': 1,
};

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

export function deriveWorkloadReadiness(
  trainingHistory: TrainingHistory,
  currentFrequency: CurrentStrengthTrainingFrequency | undefined,
): InitialWorkloadReadiness {
  const adjustment = currentFrequency === undefined ? 0 : frequencyAdjustment[currentFrequency];
  const tier = clamp(historyBaseline[trainingHistory] + adjustment, 0, 3);
  return (['minimal', 'building', 'standard', 'confident'] as const)[tier];
}

export type WorkloadReadinessRules = {
  volumeMultiplier: number;
  maxExercisesPerSession: number;
};

export const workloadReadinessRules: Record<InitialWorkloadReadiness, WorkloadReadinessRules> = {
  minimal: { volumeMultiplier: 0.75, maxExercisesPerSession: 4 },
  building: { volumeMultiplier: 0.9, maxExercisesPerSession: 6 },
  standard: { volumeMultiplier: 1.0, maxExercisesPerSession: 7 },
  confident: { volumeMultiplier: 1.15, maxExercisesPerSession: 9 },
};
