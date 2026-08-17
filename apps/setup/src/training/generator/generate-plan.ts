// Orchestrates the plan-generation pipeline (spec §5.4). Pure and
// synchronous: the exercise library is an explicit parameter, never a
// hidden import, so callers control what data the generator can draw from
// (production injects the real library, tests inject fixtures).
//
// Determinism note: the *programming logic* (which days, exercises, sets,
// reps, rest are produced) is fully deterministic for a given
// (answers, exerciseLibrary) pair. `id` and `createdAt` are plan metadata,
// not programming output, and legitimately vary per call (a freshly
// generated plan should get a new identity/timestamp) — see
// generate-plan.test.ts for how determinism is asserted.

import type { Exercise } from '../../domain/exercise';
import type { OnboardingAnswers } from '../../domain/onboarding';
import type { TrainingDay, TrainingPlan } from '../../domain/plan';
import { selectSplit } from './select-split';
import { calculateVolume } from './calculate-volume';
import { assignMovementPatterns } from './assign-movement-patterns';
import { applyPriorities } from './apply-priorities';
import { selectExercises } from './select-exercises';
import { prescribeExercise } from './prescribe-exercise';
import { applyFocusEmphasis } from './apply-focus-emphasis';
import { sessionQualityPass } from './session-quality-pass';
import { selectWarmupCooldown } from './select-warmup-cooldown';
import { estimateMainWorkoutSeconds, estimateWarmupCooldownSeconds } from './estimate-duration';
import { validatePlan } from './validate-plan';
import { hasUnsupportedContext } from '../rules/safety';
import { resolveAvailableEquipment } from '../rules/equipment';
import { targetWarmupCooldownMinutes } from '../rules/warmup-cooldown';

export function generatePlan(answers: OnboardingAnswers, exerciseLibrary: Exercise[]): TrainingPlan {
  // Structural safety guarantee (spec §4.1 step 8): this call exists so any
  // future change that makes context influence the pipeline is visible in
  // code review. Its result must never gate different programming
  // behavior — see generate-plan.test.ts's context-invariance assertion.
  hasUnsupportedContext(answers.context);

  const split = selectSplit(answers);
  const roleSets = calculateVolume(answers);
  // Reserve the warm-up/cool-down duration budget out of the main
  // workout's own duration-budget walk BEFORE it runs, rather than
  // generating a full-length main workout and then trying to append
  // warm-up/cool-down on top of the user's selected session duration.
  // Only affects the goals that use remaining capacity for padding (see
  // assign-movement-patterns.ts) — 'stronger' never reads sessionDuration
  // for padding, so it's untouched by this reservation either way.
  const warmupCooldownReservedSeconds = 2 * targetWarmupCooldownMinutes(answers.sessionDuration) * 60;
  const mainWorkoutBudgetSeconds = answers.sessionDuration * 60 - warmupCooldownReservedSeconds;
  const movementDays = assignMovementPatterns(split, answers, roleSets, mainWorkoutBudgetSeconds);
  const prioritizedDays = applyPriorities(movementDays, answers);
  const selectedDays = selectExercises(prioritizedDays, answers, exerciseLibrary);
  const availableEquipment = resolveAvailableEquipment(answers.trainingEnvironment, answers.equipment);

  const days: TrainingDay[] = selectedDays.map((day, index) => {
    const exercises = day.exercises.map(({ exercise, slot }) =>
      prescribeExercise(exercise, slot, answers, roleSets),
    );
    const baseDay: TrainingDay = {
      id: `day-${index + 1}`,
      name: day.name,
      estimatedDurationMinutes: 0,
      warmup: [],
      exercises,
      cooldown: [],
    };
    // Focus emphasis (bounded, ≤1 exercise/day) and the quality pass
    // (redundancy dedup + high-systemic cap) can both change a day's
    // exercise list, so warm-up/cool-down are selected AFTER both, from
    // the day's real final exercises — not from the day's label, and not
    // from the pre-quality-pass selection that might still get trimmed.
    const emphasized = applyFocusEmphasis(baseDay, answers, exerciseLibrary);
    const qualityChecked = sessionQualityPass(emphasized, exerciseLibrary, answers);

    const exerciseById = new Map(exerciseLibrary.map((exercise) => [exercise.id, exercise]));
    const dayPatterns = qualityChecked.exercises
      .map((planned) => exerciseById.get(planned.exerciseId)?.movementPattern)
      .filter((pattern): pattern is Exercise['movementPattern'] => pattern !== undefined);
    const { warmup, cooldown } = selectWarmupCooldown(
      dayPatterns,
      answers.sessionDuration,
      exerciseLibrary,
      availableEquipment,
    );

    const finalDay: TrainingDay = { ...qualityChecked, warmup, cooldown };
    const totalSeconds =
      estimateWarmupCooldownSeconds(finalDay.warmup) +
      estimateMainWorkoutSeconds(finalDay.exercises) +
      estimateWarmupCooldownSeconds(finalDay.cooldown);
    return { ...finalDay, estimatedDurationMinutes: Math.round(totalSeconds / 60) };
  });

  const plan: TrainingPlan = {
    id: `plan-${crypto.randomUUID()}`,
    createdAt: new Date().toISOString(),
    preferences: answers,
    days,
  };

  const { errors, warnings } = validatePlan(plan, exerciseLibrary, split);
  if (errors.length > 0) {
    throw new Error(`Generated plan failed validation:\n${errors.join('\n')}`);
  }
  if (warnings.length > 0 && typeof console !== 'undefined') {
    // Soft flags — surfaced for visibility, never block generation. See
    // validate-plan.ts's ValidationResult doc comment.
    console.warn(`Generated plan has quality warnings:\n${warnings.join('\n')}`);
  }

  return plan;
}
