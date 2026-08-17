// Stage 6: assign sets and a mode-appropriate prescription (reps or
// duration, matching the exercise's own trackingMode) to a selected
// exercise, plus its session role.
//
// suggestedLoad (reps-weight / reps-weight-side / duration-weight only)
// is computed from Exercise.startingLoad — ONE curated reference per
// exercise (never a lookup table, never derived from another exercise) —
// scaled by trainingHistory, currentStrengthTrainingFrequency, and the
// exercise's own ACTUAL prescribed rep range/RIR (computed just above
// this call, after accessoryRepRange's adjustment, so the load formula
// reflects exactly what the user will be asked to do, not a pre-
// adjustment guess). See training/rules/starting-load.ts for the full
// formula. It's undefined whenever the exercise has no startingLoad
// entry, or for every non-weight-tracked mode. This is only ever a
// *stable fallback* baked into the plan — Workout Mode may override the
// displayed value with newer activity history at runtime without ever
// writing back into this field, and the user can edit it regardless of
// where it came from (spec §16 "no fake precision" is about inventing
// precision with no basis; a reviewed starting reference run through a
// bounded, disclosed formula is the opposite of that).
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
import { computeStartingLoad } from '../rules/starting-load';

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
  const adjustedSets = accessorySets(exercise, slot.role, sets);

  // Each branch narrows `mode` to the exact literal(s) it returns —
  // deliberately not one combined "duration-ish" or "reps-ish" branch
  // for the weight-tracked variants, since a returned object's `mode`
  // field has to match a single discriminated-union member exactly (see
  // domain/plan.ts's ExercisePrescription comment on why grouped
  // literals silently break narrowing elsewhere in the pipeline).
  if (mode === 'duration-weight') {
    const rules = durationRules[slot.role];
    // No rep range/RIR for a duration-based prescription — the
    // prescription-load band is neutral (x1.0) for this mode, see
    // starting-load.ts's prescriptionLoadBand.
    const suggestedLoad = exercise.startingLoad
      ? computeStartingLoad(exercise.startingLoad, answers.trainingHistory, answers.currentStrengthTrainingFrequency, undefined, undefined)
      : undefined;
    return { mode, sets: adjustedSets, durationSeconds: rules.durationSeconds, restSeconds: rules.restSeconds, suggestedLoad };
  }
  if (mode === 'duration' || mode === 'duration-side') {
    const rules = durationRules[slot.role];
    return { mode, sets: adjustedSets, durationSeconds: rules.durationSeconds, restSeconds: rules.restSeconds };
  }
  if (mode === 'reps-weight' || mode === 'reps-weight-side') {
    const rules = goalRules[answers.goal][slot.role];
    const repRange = accessoryRepRange(exercise, slot.role, rules.repRange);
    const suggestedLoad = exercise.startingLoad
      ? computeStartingLoad(exercise.startingLoad, answers.trainingHistory, answers.currentStrengthTrainingFrequency, repRange, rules.targetRir)
      : undefined;
    return { mode, sets: adjustedSets, repRange, restSeconds: rules.restSeconds, targetRir: rules.targetRir, suggestedLoad };
  }

  const rules = goalRules[answers.goal][slot.role];
  const repRange = accessoryRepRange(exercise, slot.role, rules.repRange);
  return { mode, sets: adjustedSets, repRange, restSeconds: rules.restSeconds, targetRir: rules.targetRir };
}

// Small, function-driven refinements layered on top of the role-based
// base prescription (goalRules/durationRules) — grounded in
// exercise.category/strengthType, real domain properties, never a
// specific exercise ID (spec: two accessory-tier exercises can
// legitimately carry different prescriptions because of what they ARE,
// not because of which one they happen to be — see the Golden Plan
// benchmark's Lateral Raise 2×12-15 vs Pallof Press 3×10/side vs Biceps
// Curl 2×10, all "accessory" but not identical).
//
// Core/anti-rotation accessory work (dead bug, Pallof press) is
// conventionally programmed with more, lighter sets than strength
// accessory work — it's stability/endurance training, not load
// progression, so an extra set costs little fatigue.
function accessorySets(exercise: Exercise, role: PatternSlot['role'], baseSets: number): number {
  if (role === 'accessory' && exercise.category === 'core') return baseSets + 1;
  return baseSets;
}

// Isolation accessory work (lateral raise, biceps curl, face pull)
// tolerates and benefits from higher reps than compound accessory work —
// small muscle, low systemic cost, closer to a "pump" stimulus than a
// strength stimulus. Compound accessory work keeps the role's own range.
function accessoryRepRange(
  exercise: Exercise,
  role: PatternSlot['role'],
  baseRange: [number, number],
): [number, number] {
  if (role === 'accessory' && exercise.strengthType === 'isolation') {
    return [baseRange[0] + 2, baseRange[1] + 2];
  }
  return baseRange;
}
