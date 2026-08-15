// Stage 6: assign sets and a mode-appropriate prescription (reps or
// duration, matching the exercise's own trackingMode) to a selected
// exercise, plus its session role.
//
// suggestedWeight is deliberately left unset — spec §8.2 / §16 ("no fake
// precision"): SetUp has no workout history yet to base a load
// recommendation on, so it must not present one.
//
// No focus-area bonus here (a prior version added +1 set to every
// exercise that happened to hit a focus muscle as primary — since focus
// muscles are also common primary/secondary program muscles, that
// compounded across the week into a de facto specialization program,
// e.g. 20 weekly sets for "back" against an 8-14 target). See
// apply-focus-emphasis.ts, which applies a single bounded bonus per day
// as a separate step, after base prescription — focus is a moderate
// modifier on an already-balanced program, not part of the base
// prescription itself.

import type { Exercise } from '../../domain/exercise';
import type { OnboardingAnswers } from '../../domain/onboarding';
import type { ExercisePrescription, PlannedExercise } from '../../domain/plan';
import type { PatternSlot } from './apply-priorities';
import type { RoleSets } from './calculate-volume';
import { goalRules } from '../rules/goals';
import { durationRules } from '../rules/duration-prescription';

export function prescribeExercise(
  exercise: Exercise,
  slot: PatternSlot,
  answers: OnboardingAnswers,
  roleSets: RoleSets,
): PlannedExercise {
  return {
    exerciseId: exercise.id,
    role: slot.role,
    prescription: buildPrescription(exercise, slot, answers, roleSets[slot.role]),
  };
}

function buildPrescription(
  exercise: Exercise,
  slot: PatternSlot,
  answers: OnboardingAnswers,
  sets: number,
): ExercisePrescription {
  const mode = exercise.trackingMode;

  if (mode === 'duration' || mode === 'duration-side' || mode === 'duration-weight') {
    const rules = durationRules[slot.role];
    return {
      mode,
      sets,
      durationSeconds: rules.durationSeconds,
      restSeconds: rules.restSeconds,
    };
  }

  const rules = goalRules[answers.goal][slot.role];
  return {
    mode,
    sets,
    repRange: rules.repRange,
    restSeconds: rules.restSeconds,
    targetRir: rules.targetRir,
  };
}
