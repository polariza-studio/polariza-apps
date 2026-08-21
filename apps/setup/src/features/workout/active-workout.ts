// Pure logic for building/advancing an ActiveWorkout and resolving what
// reps/weight to prefill a set with — kept out of the hook/page so it's
// independently testable and so the hook stays about React state, not
// domain rules.

import type { Activity } from '@/domain/activity';
import type { ActiveExercise, ActiveWorkout, Workout } from '@/domain/workout';

// A sensible single starting number pulled out of a free-text target
// ("8-10" -> 8, "12" -> 12, "AMRAP" -> undefined) — never fake precision,
// just the first real number the user themselves wrote for this exercise.
function parseLeadingNumber(text: string): number | undefined {
  const match = text.match(/\d+/);
  return match ? Number(match[0]) : undefined;
}

// Most recent activity's matching set for this exercise name — "what did
// the user actually do last time," no averaging/smoothing/formula. An
// activity only ever holds completed, saved sets, so no in-progress-set
// filtering is needed here (unlike the old ActiveWorkout-vs-Activity
// split, an Activity is only ever written once, at Save time).
function lastPerformedSet(
  exerciseName: string,
  setNumber: number,
  activities: Activity[],
): { reps?: number; weight?: number } | undefined {
  const sorted = [...activities].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  for (const activity of sorted) {
    const match = activity.exercises.find((exercise) => exercise.exerciseName === exerciseName);
    if (!match) continue;
    return match.sets[setNumber - 1];
  }
  return undefined;
}

// Simple summary reference for the whole exercise (not per-set) — Paper's
// "Última vez: 35 kg" line. Uses Set 1's last weight as the representative
// figure.
export function lastWeightForExercise(exerciseName: string, activities: Activity[]): number | undefined {
  return lastPerformedSet(exerciseName, 1, activities)?.weight;
}

export function createActiveWorkout(workout: Workout, activities: Activity[]): ActiveWorkout {
  const exercises: ActiveExercise[] = workout.exercises.map((exercise) => ({
    name: exercise.name,
    targetReps: exercise.targetReps,
    restSeconds: exercise.restSeconds,
    sets: Array.from({ length: exercise.sets }, (_, i) => {
      const setNumber = i + 1;
      const last = lastPerformedSet(exercise.name, setNumber, activities);
      return {
        reps: last?.reps ?? parseLeadingNumber(exercise.targetReps),
        weight: last?.weight,
        completed: false,
      };
    }),
  }));

  return {
    workoutId: workout.id,
    workoutName: workout.name,
    startedAt: new Date().toISOString(),
    pausedMs: 0,
    currentExerciseIndex: 0,
    exercises,
  };
}

// Real elapsed time, always derived from wall-clock timestamps rather than
// an accumulated counter — a counter that only ticks via setInterval falls
// behind (or stalls entirely) once the tab is backgrounded or the device
// locks. Frozen automatically once `pausedAt` is set, since the end point
// then stops being `now` and becomes that fixed timestamp.
export function computeElapsedMs(workout: ActiveWorkout, now: number = Date.now()): number {
  const startedAtMs = new Date(workout.startedAt).getTime();
  const end = workout.pausedAt ? new Date(workout.pausedAt).getTime() : now;
  return Math.max(0, end - startedAtMs - (workout.pausedMs ?? 0));
}

export function computeElapsedSeconds(workout: ActiveWorkout, now?: number): number {
  return Math.floor(computeElapsedMs(workout, now) / 1000);
}

export function formatElapsed(totalSeconds: number): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  return `${pad(h)}:${pad(m)}:${pad(s)}`;
}
