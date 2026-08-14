// Stage 8: structural validation. This is integrity-checking (every
// reference resolves, every number is sane) — not training science, so it's
// implemented as real, finished logic rather than a provisional stub.

import type { Exercise } from '../../domain/exercise';
import type { TrainingPlan } from '../../domain/plan';

export function validatePlan(plan: TrainingPlan, exerciseLibrary: Exercise[]): string[] {
  const errors: string[] = [];
  const knownExerciseIds = new Set(exerciseLibrary.map((exercise) => exercise.id));

  if (plan.days.length === 0) {
    errors.push('Plan has no training days.');
  }

  for (const day of plan.days) {
    if (day.exercises.length === 0) {
      errors.push(`Day "${day.name}" (${day.id}) has no exercises.`);
    }

    for (const plannedExercise of day.exercises) {
      const label = `Exercise "${plannedExercise.exerciseId}" in day "${day.name}"`;

      if (!knownExerciseIds.has(plannedExercise.exerciseId)) {
        errors.push(`${label} references an unknown exercise ID.`);
      }
      if (plannedExercise.sets <= 0) {
        errors.push(`${label} has non-positive sets (${plannedExercise.sets}).`);
      }
      const [min, max] = plannedExercise.repRange;
      if (min <= 0 || min > max) {
        errors.push(`${label} has an invalid repRange (${min}-${max}).`);
      }
      if (plannedExercise.restSeconds < 0) {
        errors.push(`${label} has negative restSeconds.`);
      }
    }
  }

  return errors;
}
