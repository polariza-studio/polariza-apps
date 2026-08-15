// Stage 9: a session-level quality pass, run on each day before the plan
// is returned — not just validated afterward. Two checks, both scoped to
// never touch a primary/secondary (structurally required) exercise, only
// ever trimming/substituting accessory-tier work:
//
// 1. Movement redundancy — two exercises serving the same purpose in one
//    session (plank + dead bug + hanging knee raise; bodyweight calf
//    raise + machine calf raise) because slots happened to be available,
//    not because the session's programming intent called for both. By
//    construction (splits.ts's primary/secondary patterns are always
//    distinct from each other and assign-movement-patterns.ts no longer
//    cycles patterns to fill a budget), this should rarely find anything
//    to remove — it's a defensive check on the final exercise list, not
//    the primary mechanism preventing redundancy. No substitution here:
//    the pattern stays covered by the surviving exercise, so there's
//    nothing lost to replace.
//
// 2. High-systemic-fatigue stacking — more than
//    rules/session-composition.ts's cap of genuinely CNS/fatigue-taxing
//    work in one session. REPLACE BEFORE REMOVE: for each accessory-tier
//    exercise over the cap, first search for a lower-cost exercise
//    covering the same movement pattern (e.g. pull-up → lat pulldown) —
//    same slot purpose, without the fatigue cost. Only drop the slot
//    entirely if no such substitute exists in the library for this
//    user's equipment/difficulty. If a day's primary+secondary lifts
//    alone already exceed the cap (a legitimate advanced multi-primary-
//    lift day), nothing is touched — that's a programming choice, not
//    accidental stacking, and validate-plan.ts's warning still surfaces
//    it for review.

import type { Exercise } from '../../domain/exercise';
import type { OnboardingAnswers } from '../../domain/onboarding';
import type { PlannedExercise, TrainingDay } from '../../domain/plan';
import { maxHighSystemicPerSession } from '../rules/session-composition';
import { resolveAvailableEquipment } from '../rules/equipment';
import { experienceRules } from '../rules/experience';
import { findExerciseForSlot } from './select-exercises';

const difficultyRank: Record<Exercise['difficulty'], number> = {
  beginner: 0,
  intermediate: 1,
  advanced: 2,
};

const roleRank: Record<PlannedExercise['role'], number> = {
  primary: 0,
  secondary: 1,
  accessory: 2,
};

export function sessionQualityPass(
  day: TrainingDay,
  exerciseLibrary: Exercise[],
  answers: OnboardingAnswers,
): TrainingDay {
  const byId = new Map(exerciseLibrary.map((exercise) => [exercise.id, exercise]));

  const deduped = dedupeByMovementPattern(day.exercises, byId);
  const capped = capHighSystemicWork(deduped, byId, exerciseLibrary, answers);

  return { ...day, exercises: capped };
}

// Exercises are already ordered primary → secondary → accessory (the
// pipeline never reorders), so keeping the first occurrence of a pattern
// and dropping later ones structurally can't drop a primary/secondary
// exercise in favor of an accessory one — a later duplicate of a
// required pattern would have to be a required exercise appearing
// earlier too, which splits.ts's distinct-pattern invariant rules out.
function dedupeByMovementPattern(
  exercises: PlannedExercise[],
  byId: Map<string, Exercise>,
): PlannedExercise[] {
  const seenPatterns = new Set<string>();
  return exercises.filter((plannedExercise) => {
    const exercise = byId.get(plannedExercise.exerciseId);
    if (!exercise) return true;
    if (seenPatterns.has(exercise.movementPattern)) return false;
    seenPatterns.add(exercise.movementPattern);
    return true;
  });
}

function capHighSystemicWork(
  exercises: PlannedExercise[],
  byId: Map<string, Exercise>,
  exerciseLibrary: Exercise[],
  answers: OnboardingAnswers,
): PlannedExercise[] {
  const highSystemicCount = exercises.filter(
    (plannedExercise) => byId.get(plannedExercise.exerciseId)?.demands.systemic === 'high',
  ).length;
  const overBy = highSystemicCount - maxHighSystemicPerSession;
  if (overBy <= 0) return exercises;

  // Lowest-priority accessory-tier high-systemic exercises first; never a
  // primary/secondary lift.
  const overCapacity = [...exercises]
    .filter(
      (plannedExercise) =>
        plannedExercise.role === 'accessory' &&
        byId.get(plannedExercise.exerciseId)?.demands.systemic === 'high',
    )
    .sort((a, b) => roleRank[b.role] - roleRank[a.role])
    .slice(0, overBy);

  if (overCapacity.length === 0) return exercises;

  const availableEquipment = resolveAvailableEquipment(answers.trainingEnvironment, answers.equipment);
  const maxDifficultyRank = difficultyRank[experienceRules[answers.experience].maxDifficulty];
  const usedIds = new Set(exercises.map((pe) => pe.exerciseId));

  let result = exercises;
  for (const plannedExercise of overCapacity) {
    const exercise = byId.get(plannedExercise.exerciseId);
    if (!exercise) continue;

    // REPLACE BEFORE REMOVE: search for a same-pattern substitute that
    // isn't itself high-systemic (e.g. pull-up → lat pulldown), before
    // giving up the slot entirely.
    const substitute = findExerciseForSlot(
      { pattern: exercise.movementPattern, role: plannedExercise.role, preferredMuscles: [], avoidMuscles: [] },
      exerciseLibrary,
      availableEquipment,
      maxDifficultyRank,
      answers.goal,
      answers.experience,
      usedIds,
      new Map(),
      { excludeSystemicHigh: true },
    );

    if (substitute) {
      usedIds.delete(exercise.id);
      usedIds.add(substitute.id);
      result = result.map((pe) =>
        pe.exerciseId === plannedExercise.exerciseId ? { ...pe, exerciseId: substitute.id } : pe,
      );
    } else {
      result = result.filter((pe) => pe.exerciseId !== plannedExercise.exerciseId);
    }
  }

  return result;
}
