// Pure derivation over a TrainingDay + the exercise library — kept out of
// the page component per instruction. Not training-domain logic (doesn't
// influence programming), so it lives under features/workout, same
// precedent as weekly-activity.ts under features/home.

import type { Exercise, ExerciseDifficulty, MuscleGroup } from '@/domain/exercise';
import type { TrainingHistory } from '@/domain/onboarding';
import type { TrainingDay } from '@/domain/plan';
import { complexityRules } from '@/training/rules/exercise-complexity';

const DIFFICULTY_LABEL: Record<ExerciseDifficulty, string> = {
  beginner: 'Beginner',
  intermediate: 'Intermediate',
  advanced: 'Advanced',
};

// Derived from the user's trainingHistory via the same complexityRules
// table that actually governs exercise selection (see
// training/rules/exercise-complexity.ts) — not re-derived from whichever
// exercises happened to get selected. Reuses ExerciseDifficulty's 3-word
// vocabulary since that ceiling only ever has 3 achievable values; the
// underlying signal is trainingHistory's 4 tiers, not a re-creation of
// the old 3-bucket experience model.
export function getSessionLevel(trainingHistory: TrainingHistory): string {
  return DIFFICULTY_LABEL[complexityRules[trainingHistory].maxDifficulty];
}

// Union of primary muscles across the day's *main* exercises only —
// warm-up/cool-down aren't "what this workout trains".
export function getMusclesWorked(day: TrainingDay, library: Exercise[]): MuscleGroup[] {
  const byId = new Map(library.map((exercise) => [exercise.id, exercise]));
  const muscles = new Set<MuscleGroup>();
  for (const plannedExercise of day.exercises) {
    const exercise = byId.get(plannedExercise.exerciseId);
    if (!exercise) continue;
    for (const muscle of exercise.muscles.primary) muscles.add(muscle);
  }
  return [...muscles];
}

export function formatMuscleGroup(muscle: MuscleGroup): string {
  return muscle.charAt(0).toUpperCase() + muscle.slice(1);
}

// "Warm-up · N exercises · Cool-down" — real counts, not a fixed string;
// still reads correctly if a day somehow has no warm-up/cool-down entry
// (shouldn't happen post-validation, but this isn't the place to assume).
export function getStructureSummary(day: TrainingDay): string {
  const parts = [
    day.warmup.length > 0 ? 'Warm-up' : null,
    `${day.exercises.length} exercise${day.exercises.length === 1 ? '' : 's'}`,
    day.cooldown.length > 0 ? 'Cool-down' : null,
  ];
  return parts.filter((part): part is string => part !== null).join(' · ');
}

// A short, deterministic summary sentence — generated from the day's
// actual muscles worked, not invented per-workout copy.
export function getWhatToExpect(day: TrainingDay, library: Exercise[]): string {
  const muscles = getMusclesWorked(day, library).map(formatMuscleGroup);
  if (muscles.length === 0) return 'A structured session built around your current plan.';
  const list =
    muscles.length === 1
      ? muscles[0]
      : `${muscles.slice(0, -1).join(', ')} and ${muscles[muscles.length - 1]}`;
  return `This session targets your ${list.toLowerCase()} with a mix of primary and accessory work.`;
}
