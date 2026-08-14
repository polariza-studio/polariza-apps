// Stage 4: attach preferred/avoided muscle groups (derived from focus and
// deprioritized areas) to every movement-pattern slot, so later stages can
// rank exercise candidates and adjust prescribed volume — without changing
// which movement patterns are trained (spec §4.1 steps 6-7: focus areas add
// emphasis, they don't replace balanced programming).

import type { OnboardingAnswers } from '../../domain/onboarding';
import type { MovementPattern, MuscleGroup } from '../../domain/exercise';
import type { DayMovementPlan } from './assign-movement-patterns';
import { focusAreaMuscles } from '../rules/priorities';

export type PatternSlot = {
  pattern: MovementPattern;
  preferredMuscles: MuscleGroup[];
  avoidMuscles: MuscleGroup[];
};

export type PrioritizedDayPlan = {
  name: string;
  slots: PatternSlot[];
};

export function applyPriorities(
  days: DayMovementPlan[],
  answers: OnboardingAnswers,
): PrioritizedDayPlan[] {
  const preferredMuscles = answers.focusAreas.flatMap((area) => focusAreaMuscles[area]);
  const avoidMuscles = answers.deprioritizedAreas.flatMap((area) => focusAreaMuscles[area]);

  return days.map((day) => ({
    name: day.name,
    slots: day.patterns.map((pattern) => ({ pattern, preferredMuscles, avoidMuscles })),
  }));
}
