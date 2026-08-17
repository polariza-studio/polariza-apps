// Stage 7: estimate a training day's duration from its prescribed
// exercises. PROVISIONAL formula — not reviewed. Spec §4.1 step 4: treat
// as a planning constraint/estimate, never an exact promised workout time.
//
// Reps-tracked exercises estimate time-under-tension from the average of
// the rep range (~3s/rep); duration-tracked exercises use their
// prescribed hold/carry time directly. Both add the prescribed rest
// (defaulting to 0 for duration modes that don't specify one, e.g. a
// stretch with no real "rest" between holds), plus a fixed per-exercise
// transition overhead — walking to the next station, adjusting a
// machine/weight, re-reading the next exercise. Set-level time alone
// undercounts a real session badly: a first pass without this overhead
// estimated a 3-exercise beginner day at ~11 min against a 30-min
// request, which isn't a plausible real-world session length.

import type { Goal } from '../../domain/onboarding';
import type { ExercisePrescription } from '../../domain/plan';
import type { ExerciseRole } from '../rules/goals';
import { goalRules } from '../rules/goals';

const SECONDS_PER_REP = 3;
const TRANSITION_OVERHEAD_SECONDS = 60;

// Warm-up/cool-down movements are brief prep/recovery work, not full
// exercises with equipment setup or loading — reusing the 60s main-
// workout transition (calibrated for walking to a station, adjusting a
// machine) would blow the 2-5 minute target on its own. A separate,
// smaller, explicitly-named assumption instead of weakening the 60s
// constant globally. Applied only BETWEEN movements — see
// estimateWarmupCooldownSeconds — never after the last one, since
// there's no "next station" to walk to after the block ends.
const WARMUP_COOLDOWN_TRANSITION_SECONDS = 15;

// Structural (`{ prescription }`), not PlannedExercise specifically — so
// the same estimate covers both the main exercise list and the warm-up/
// cool-down entries (WarmupCooldownExercise), which share the
// prescription shape but not the rest of PlannedExercise.
export function estimateDuration(exercises: { prescription: ExercisePrescription }[]): number {
  return Math.round(estimateMainWorkoutSeconds(exercises) / 60);
}

// Raw seconds (not rounded to minutes) for the main exercise list, using
// the original per-exercise-including-the-last transition assumption.
// Exported alongside estimateWarmupCooldownSeconds so generate-plan.ts
// can sum all three blocks' raw seconds and round exactly once for a
// day's total — summing three independently-rounded minute figures would
// compound rounding error across blocks.
export function estimateMainWorkoutSeconds(exercises: { prescription: ExercisePrescription }[]): number {
  return exercises.reduce(
    (sum, exercise) => sum + exerciseSeconds(exercise.prescription) + TRANSITION_OVERHEAD_SECONDS,
    0,
  );
}

// Raw seconds for a warm-up or cool-down block. The 15s transition
// applies only BETWEEN movements (n-1 times for n movements) — never
// after the final one — per the MVP warm-up/cool-down duration
// assumption above.
export function estimateWarmupCooldownSeconds(exercises: { prescription: ExercisePrescription }[]): number {
  const movementSeconds = exercises.reduce((sum, exercise) => sum + exerciseSeconds(exercise.prescription), 0);
  const transitionSeconds = Math.max(exercises.length - 1, 0) * WARMUP_COOLDOWN_TRANSITION_SECONDS;
  return movementSeconds + transitionSeconds;
}

// A planning-time estimate for a slot that doesn't have a specific
// exercise chosen yet — assign-movement-patterns.ts's "is there enough
// remaining budget for one more goal-beneficial exercise" gate needs this
// *before* select-exercises.ts runs. This works because prescription
// (rep range, rest) comes entirely from goalRules[goal][role]
// (prescribe-exercise.ts) — never from which specific exercise fills the
// slot — so the estimate is exact for reps-tracked exercises. Duration-
// tracked exercises (core/carry) aren't distinguishable at this stage
// without knowing the exercise, so this always uses the reps-based
// formula; those tend to run shorter, making this a conservative
// (slightly-over) estimate, which is the safe direction for a gate that
// should err toward not overfilling a session.
export function estimateSlotSeconds(role: ExerciseRole, goal: Goal, sets: number): number {
  const rules = goalRules[goal][role];
  const avgReps = (rules.repRange[0] + rules.repRange[1]) / 2;
  return sets * (avgReps * SECONDS_PER_REP + rules.restSeconds) + TRANSITION_OVERHEAD_SECONDS;
}

function exerciseSeconds(prescription: ExercisePrescription): number {
  const restSeconds = prescription.restSeconds ?? 0;

  if (prescription.mode === 'duration' || prescription.mode === 'duration-side' || prescription.mode === 'duration-weight') {
    return prescription.sets * (prescription.durationSeconds + restSeconds);
  }

  const avgReps = (prescription.repRange[0] + prescription.repRange[1]) / 2;
  return prescription.sets * (avgReps * SECONDS_PER_REP + restSeconds);
}
