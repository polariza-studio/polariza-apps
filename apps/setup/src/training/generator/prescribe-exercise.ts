// Stage 6: assign sets, rep range, rest, and RIR to a selected exercise.
//
// suggestedWeight is deliberately left unset — spec §8.2 / §16 ("no fake
// precision"): SetUp has no workout history yet to base a load
// recommendation on, so it must not present one.

import type { Exercise } from '../../domain/exercise';
import type { OnboardingAnswers } from '../../domain/onboarding';
import type { PlannedExercise } from '../../domain/plan';
import type { PatternSlot } from './apply-priorities';
import { goalRules } from '../rules/goals';
import { focusAreaModifier, deprioritizedAreaModifier } from '../rules/priorities';

export function prescribeExercise(
  exercise: Exercise,
  slot: PatternSlot,
  answers: OnboardingAnswers,
  baseSets: number,
): PlannedExercise {
  const rules = goalRules[answers.goal];
  const hitsFocus = exercise.muscles.primary.some((m) => slot.preferredMuscles.includes(m));
  const hitsDeprioritized = exercise.muscles.primary.some((m) => slot.avoidMuscles.includes(m));

  let sets = baseSets;
  if (hitsFocus) sets += focusAreaModifier.extraSets;
  // Currently 0 (spec §4.1 step 7: deprioritizing must not remove necessary
  // training) — kept explicit so a future non-zero review is a one-line change.
  if (hitsDeprioritized) sets -= deprioritizedAreaModifier.extraSets;
  sets = Math.max(1, sets);

  return {
    exerciseId: exercise.id,
    sets,
    repRange: rules.repRange,
    restSeconds: rules.restSeconds,
    targetRir: rules.targetRir,
  };
}
