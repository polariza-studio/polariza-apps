// Stage 5: fill each movement-pattern slot with an approved exercise from
// the library — filtered by equipment and experience-appropriate
// difficulty, ranked by fit with focus/deprioritized areas. A slot with no
// compatible candidate is dropped rather than failing the whole plan;
// validate-plan.ts is what ultimately rejects a day left with 0 exercises.

import type { Equipment, Goal, OnboardingAnswers } from '../../domain/onboarding';
import type { Exercise } from '../../domain/exercise';
import type { PatternSlot, PrioritizedDayPlan } from './apply-priorities';
import { resolveAvailableEquipment } from '../rules/equipment';
import { experienceRules } from '../rules/experience';

const difficultyRank: Record<Exercise['difficulty'], number> = {
  beginner: 0,
  intermediate: 1,
  advanced: 2,
};

export type SelectedExercise = { exercise: Exercise; slot: PatternSlot };

export type SelectedDayPlan = {
  name: string;
  exercises: SelectedExercise[];
};

export function selectExercises(
  days: PrioritizedDayPlan[],
  answers: OnboardingAnswers,
  exerciseLibrary: Exercise[],
): SelectedDayPlan[] {
  const availableEquipment = resolveAvailableEquipment(
    answers.trainingEnvironment,
    answers.equipment,
  );
  const maxDifficultyRank = difficultyRank[experienceRules[answers.experience].maxDifficulty];

  return days.map((day) => {
    // Avoid repeating the same exercise twice within one day; reuse across
    // different days in the week is fine and normal in real programming.
    const usedExerciseIds = new Set<string>();
    const exercises: SelectedExercise[] = [];

    for (const slot of day.slots) {
      const selected = selectExerciseForSlot(
        slot,
        exerciseLibrary,
        availableEquipment,
        maxDifficultyRank,
        answers.goal,
        usedExerciseIds,
      );
      if (selected) {
        exercises.push(selected);
        usedExerciseIds.add(selected.exercise.id);
      }
    }

    return { name: day.name, exercises };
  });
}

function selectExerciseForSlot(
  slot: PatternSlot,
  library: Exercise[],
  availableEquipment: Equipment[],
  maxDifficultyRank: number,
  goal: Goal,
  usedExerciseIds: Set<string>,
): SelectedExercise | null {
  const candidates = library.filter(
    (exercise) =>
      exercise.movementPattern === slot.pattern &&
      difficultyRank[exercise.difficulty] <= maxDifficultyRank &&
      exercise.equipment.every((eq) => availableEquipment.includes(eq)) &&
      !usedExerciseIds.has(exercise.id),
  );

  if (candidates.length === 0) return null;

  const ranked = [...candidates].sort((a, b) => rank(b, slot, goal) - rank(a, slot, goal));
  return { exercise: ranked[0], slot };
}

// Goal fit is a ranking preference, not a hard filter — a hard filter could
// leave a slot with 0 candidates on a small library even when a perfectly
// usable exercise exists for a different goal.
function rank(exercise: Exercise, slot: PatternSlot, goal: Goal): number {
  const preferredHits = exercise.muscles.primary.filter((m) =>
    slot.preferredMuscles.includes(m),
  ).length;
  const avoidHits = exercise.muscles.primary.filter((m) => slot.avoidMuscles.includes(m)).length;
  const goalMatch = exercise.suitableGoals.includes(goal) ? 1 : 0;
  return preferredHits - avoidHits + goalMatch;
}
