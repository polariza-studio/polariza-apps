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

// Structural (`{ prescription }`), not PlannedExercise specifically — so
// the same estimate covers both the main exercise list and the warm-up/
// cool-down entries (WarmupCooldownExercise), which share the
// prescription shape but not the rest of PlannedExercise.
export function estimateDuration(exercises: { prescription: ExercisePrescription }[]): number {
  const totalSeconds = exercises.reduce(
    (sum, exercise) => sum + exerciseSeconds(exercise.prescription) + TRANSITION_OVERHEAD_SECONDS,
    0,
  );
  return Math.round(totalSeconds / 60);
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
