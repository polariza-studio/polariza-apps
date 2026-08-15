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
import { assignWarmupCooldown } from './assign-warmup-cooldown';
import { estimateDuration } from './estimate-duration';
import { validatePlan } from './validate-plan';
import { hasUnsupportedContext } from '../rules/safety';
import { resolveAvailableEquipment } from '../rules/equipment';

export function generatePlan(answers: OnboardingAnswers, exerciseLibrary: Exercise[]): TrainingPlan {
  // Structural safety guarantee (spec §4.1 step 8): this call exists so any
  // future change that makes context influence the pipeline is visible in
  // code review. Its result must never gate different programming
  // behavior — see generate-plan.test.ts's context-invariance assertion.
  hasUnsupportedContext(answers.context);

  const split = selectSplit(answers);
  const roleSets = calculateVolume(answers);
  const movementDays = assignMovementPatterns(split, answers, roleSets);
  const prioritizedDays = applyPriorities(movementDays, answers);
  const selectedDays = selectExercises(prioritizedDays, answers, exerciseLibrary);
  const availableEquipment = resolveAvailableEquipment(answers.trainingEnvironment, answers.equipment);

  const days: TrainingDay[] = selectedDays.map((day, index) => {
    const exercises = day.exercises.map(({ exercise, slot }) =>
      prescribeExercise(exercise, slot, answers, roleSets),
    );
    const { warmup, cooldown } = assignWarmupCooldown(
      split.days[index].primaryPattern,
      split.id,
      exerciseLibrary,
      availableEquipment,
    );
    const baseDay: TrainingDay = {
      id: `day-${index + 1}`,
      name: day.name,
      estimatedDurationMinutes: 0,
      warmup,
      exercises,
      cooldown,
    };
    // Focus emphasis (bounded, ≤1 exercise/day) and the quality pass
    // (redundancy dedup + high-systemic cap) can both change a day's
    // sets/exercise list, so duration is estimated once, after both, not
    // from the raw selection. Both only ever touch the main `exercises`
    // list — warm-up/cool-down are fixed, not subject to focus bias or
    // fatigue-cap trimming.
    const emphasized = applyFocusEmphasis(baseDay, answers, exerciseLibrary);
    const qualityChecked = sessionQualityPass(emphasized, exerciseLibrary, answers);
    const estimatedDurationMinutes = estimateDuration([
      ...qualityChecked.warmup,
      ...qualityChecked.exercises,
      ...qualityChecked.cooldown,
    ]);
    return { ...qualityChecked, estimatedDurationMinutes };
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
