// Stage 9: a session-level quality pass, run on each day before the plan
// is returned — not just validated afterward. Two checks, both scoped to
// never REMOVE a primary/secondary (structurally required) exercise, only
// ever trimming/substituting accessory-tier work:
//
// 1. Movement redundancy — two exercises serving the same purpose in one
//    session (plank + dead bug + hanging knee raise; bodyweight calf
//    raise + machine calf raise) because slots happened to be available,
//    not because the session's programming intent called for both.
//
//    Redundancy-aware, not merely same-pattern (changed 2026-08-16):
//    splits.ts's day templates may now deliberately request the SAME
//    broad MovementPattern twice in one session (e.g. hinge + hinge, for
//    a Hip Thrust + Romanian Deadlift lower day) when that's a genuine
//    programming choice, not accidental slot-filling — sharing a pattern
//    string is no longer treated as inherently redundant. What actually
//    makes two exercises redundant: same pattern, same strengthType
//    (compound vs isolation — a compound row and an isolation face pull
//    sharing horizontal-pull are never redundant), AND the same primary-
//    muscle set (Hip Thrust: glutes only; Romanian Deadlift: hamstrings
//    + glutes — different sets, so genuinely not redundant despite both
//    being 'hinge'; Goblet Squat/Bodyweight Squat/Leg Press: all
//    quadriceps+glutes, all 'squat', all compound — genuinely redundant,
//    keep only the first). "Redundant" here means functional-overlap.ts's
//    score reaches its ceiling (1 — full primary-muscle-set equality
//    within a same-pattern, same-strengthType pair); a partial-overlap
//    pair (e.g. Deadlift/RDL) isn't touched by this pass at all — that
//    case is a select-exercises.ts ranking preference, not a removal,
//    since it only ever shows up between primary/secondary exercises
//    this pass is scoped to never drop (see below). Only ever drops a
//    LATER accessory-tier exercise redundant with something already
//    kept (any role) — never a primary/secondary, and never on the
//    strength of the FIRST occurrence of a pattern.
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
import { functionalOverlap } from './functional-overlap';

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

  const deduped = dedupeRedundantWork(day.exercises, byId);
  const capped = capHighSystemicWork(deduped, byId, exerciseLibrary, answers);

  return { ...day, exercises: capped };
}

// Full functional overlap (score === 1) — same pattern, same
// strengthType, identical primary-muscle set. Anything less (a
// Deadlift/RDL-style partial overlap) is deliberately NOT redundant by
// this definition; see functional-overlap.ts's comment for why that
// distinction matters and select-exercises.ts for where partial overlap
// is handled instead (as a ranking preference, not a removal).
function isRedundant(a: Exercise, b: Exercise): boolean {
  return functionalOverlap(a, b) >= 1;
}

// Exercises are already ordered primary → secondary → accessory (the
// pipeline never reorders). Only an ACCESSORY-tier exercise can be
// dropped here, and only when it's redundant with something already kept
// (any role, earlier in the list) — a primary/secondary exercise is
// never removed even if two required slots happen to resolve to
// genuinely redundant exercises (that means the day template asked for
// it, which is a split-design decision, not something this pass should
// silently override).
function dedupeRedundantWork(
  exercises: PlannedExercise[],
  byId: Map<string, Exercise>,
): PlannedExercise[] {
  const kept: PlannedExercise[] = [];
  for (const plannedExercise of exercises) {
    const exercise = byId.get(plannedExercise.exerciseId);
    if (!exercise) {
      kept.push(plannedExercise);
      continue;
    }
    const redundant =
      plannedExercise.role === 'accessory' &&
      kept.some((keptExercise) => {
        const other = byId.get(keptExercise.exerciseId);
        return other ? isRedundant(exercise, other) : false;
      });
    if (!redundant) kept.push(plannedExercise);
  }
  return kept;
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
