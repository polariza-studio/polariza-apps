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
import { estimateDuration } from './estimate-duration';
import { validatePlan } from './validate-plan';
import { hasUnsupportedContext } from '../rules/safety';

export function generatePlan(answers: OnboardingAnswers, exerciseLibrary: Exercise[]): TrainingPlan {
  // Structural safety guarantee (spec §4.1 step 8): this call exists so any
  // future change that makes context influence the pipeline is visible in
  // code review. Its result must never gate different programming
  // behavior — see generate-plan.test.ts's context-invariance assertion.
  hasUnsupportedContext(answers.context);

  const split = selectSplit(answers);
  const baseSets = calculateVolume(answers);
  const movementDays = assignMovementPatterns(split, answers);
  const prioritizedDays = applyPriorities(movementDays, answers);
  const selectedDays = selectExercises(prioritizedDays, answers, exerciseLibrary);

  const days: TrainingDay[] = selectedDays.map((day, index) => {
    const exercises = day.exercises.map(({ exercise, slot }) =>
      prescribeExercise(exercise, slot, answers, baseSets),
    );
    return {
      id: `day-${index + 1}`,
      name: day.name,
      estimatedDurationMinutes: estimateDuration(exercises),
      exercises,
    };
  });

  const plan: TrainingPlan = {
    id: `plan-${crypto.randomUUID()}`,
    createdAt: new Date().toISOString(),
    preferences: answers,
    days,
  };

  const errors = validatePlan(plan, exerciseLibrary);
  if (errors.length > 0) {
    throw new Error(`Generated plan failed validation:\n${errors.join('\n')}`);
  }

  return plan;
}
