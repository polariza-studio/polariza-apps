// Stage 2: derive a per-role sets target from goal + experience. A
// session's primary lift, secondary lifts, and accessory work are never
// programmed with the same set count by a real coach — see
// rules/goals.ts's setsPerRole.

import type { OnboardingAnswers } from '../../domain/onboarding';
import type { ExerciseRole } from '../rules/goals';
import { goalRules } from '../rules/goals';
import { experienceRules } from '../rules/experience';

export type RoleSets = Record<ExerciseRole, number>;

export function calculateVolume(answers: OnboardingAnswers): RoleSets {
  const setsPerRole = goalRules[answers.goal].setsPerRole;
  const multiplier = experienceRules[answers.experience].volumeMultiplier;

  return {
    primary: Math.max(1, Math.round(setsPerRole.primary * multiplier)),
    secondary: Math.max(1, Math.round(setsPerRole.secondary * multiplier)),
    accessory: Math.max(1, Math.round(setsPerRole.accessory * multiplier)),
  };
}
