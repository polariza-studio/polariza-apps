// Exercise names the user has already typed, for input suggestions —
// derived entirely from the user's own workouts/activities. No global
// exercise library: the "suggestions" are just their own past words.

import type { Workout } from '@/domain/workout';
import type { Activity } from '@/domain/activity';

export function getKnownExerciseNames(workouts: Workout[], activities: Activity[]): string[] {
  const names = new Set<string>();
  for (const workout of workouts) {
    for (const exercise of workout.exercises) names.add(exercise.name);
  }
  for (const activity of activities) {
    for (const exercise of activity.exercises) names.add(exercise.exerciseName);
  }
  return [...names].sort((a, b) => a.localeCompare(b));
}
