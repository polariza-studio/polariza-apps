// Stage 6b: a bounded, moderate bias toward the user's focus areas —
// applied to an already-complete, already-balanced day, never during base
// prescription (prescribe-exercise.ts). At most one exercise per day gets
// the bonus: whichever already-selected exercise best matches the focus
// muscles. This is what keeps focus from turning into a specialization
// program (spec §4.1 step 6: "this does not mean the plan exclusively
// trains those areas... additional emphasis while the plan remains
// balanced") — an earlier design applied the same bonus to every exercise
// that happened to hit a focus muscle as primary, and since focus muscles
// are also common primary/secondary program muscles by default, that
// compounded across the week (e.g. 20 sets/week for "back" against an
// 8-14 target for the goal).

import type { OnboardingAnswers } from '../../domain/onboarding';
import type { Exercise } from '../../domain/exercise';
import type { TrainingDay } from '../../domain/plan';
import { focusAreaMuscles, focusAreaModifier } from '../rules/priorities';

export function applyFocusEmphasis(
  day: TrainingDay,
  answers: OnboardingAnswers,
  exerciseLibrary: Exercise[],
): TrainingDay {
  if (answers.focusAreas.length === 0) return day;

  const focusMuscles = new Set(answers.focusAreas.flatMap((area) => focusAreaMuscles[area]));
  const byId = new Map(exerciseLibrary.map((exercise) => [exercise.id, exercise]));

  let bestIndex = -1;
  let bestHits = 0;
  day.exercises.forEach((plannedExercise, index) => {
    const exercise = byId.get(plannedExercise.exerciseId);
    if (!exercise) return;
    const hits = exercise.muscles.primary.filter((muscle) => focusMuscles.has(muscle)).length;
    if (hits > bestHits) {
      bestHits = hits;
      bestIndex = index;
    }
  });

  if (bestIndex === -1) return day;

  const exercises = day.exercises.map((plannedExercise, index) => {
    if (index !== bestIndex) return plannedExercise;
    return {
      ...plannedExercise,
      prescription: {
        ...plannedExercise.prescription,
        sets: plannedExercise.prescription.sets + focusAreaModifier.extraSets,
      },
    };
  });

  return { ...day, exercises };
}
