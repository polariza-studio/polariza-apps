import { describe, expect, it } from 'vitest';
import type { Activity } from '@/domain/activity';
import type { Workout } from '@/domain/workout';
import { createActiveWorkout, formatElapsed, lastWeightForExercise } from './active-workout';

const workout: Workout = {
  id: 'workout-1',
  name: 'Lower body',
  exercises: [{ id: 'ex-1', name: 'Hip thrust', sets: 2, targetReps: '8-10', restSeconds: 60 }],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

describe('createActiveWorkout', () => {
  it('builds one set per prescribed set, reps seeded from the target, weight empty with no history', () => {
    const active = createActiveWorkout(workout, []);
    expect(active.exercises).toHaveLength(1);
    expect(active.exercises[0].sets).toHaveLength(2);
    expect(active.exercises[0].sets[0].reps).toBe(8);
    expect(active.exercises[0].sets[0].weight).toBeUndefined();
  });

  it('prefills reps/weight from the most recent activity for that exercise', () => {
    const activities: Activity[] = [
      {
        id: 'a1',
        workoutId: 'workout-1',
        workoutName: 'Lower body',
        date: new Date().toISOString(),
        durationSeconds: 600,
        exercises: [{ exerciseName: 'Hip thrust', sets: [{ reps: 9, weight: 35 }, { reps: 8, weight: 35 }] }],
      },
    ];
    const active = createActiveWorkout(workout, activities);
    expect(active.exercises[0].sets[0]).toMatchObject({ reps: 9, weight: 35 });
  });
});

describe('lastWeightForExercise', () => {
  it('returns undefined with no matching history', () => {
    expect(lastWeightForExercise('Hip thrust', [])).toBeUndefined();
  });

  it('returns set 1 weight from the most recent activity containing the exercise', () => {
    const activities: Activity[] = [
      {
        id: 'a1',
        workoutId: 'workout-1',
        workoutName: 'Lower body',
        date: '2026-08-01T00:00:00.000Z',
        durationSeconds: 600,
        exercises: [{ exerciseName: 'Hip thrust', sets: [{ reps: 8, weight: 30 }] }],
      },
      {
        id: 'a2',
        workoutId: 'workout-1',
        workoutName: 'Lower body',
        date: '2026-08-10T00:00:00.000Z',
        durationSeconds: 600,
        exercises: [{ exerciseName: 'Hip thrust', sets: [{ reps: 8, weight: 35 }] }],
      },
    ];
    expect(lastWeightForExercise('Hip thrust', activities)).toBe(35);
  });
});

describe('formatElapsed', () => {
  it('formats seconds as HH:MM:SS', () => {
    expect(formatElapsed(0)).toBe('00:00:00');
    expect(formatElapsed(3661)).toBe('01:01:01');
  });
});
