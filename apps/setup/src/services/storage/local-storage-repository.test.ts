import { beforeEach, describe, expect, it } from 'vitest';
import { LocalStorageRepository } from './local-storage-repository';
import type { ActiveWorkout, Workout } from '../../domain/workout';
import type { Activity } from '../../domain/activity';

// In-memory Storage fake so this test doesn't need a DOM environment.
class FakeStorage implements Storage {
  private store = new Map<string, string>();

  get length(): number {
    return this.store.size;
  }
  clear(): void {
    this.store.clear();
  }
  getItem(key: string): string | null {
    return this.store.has(key) ? this.store.get(key)! : null;
  }
  key(index: number): string | null {
    return [...this.store.keys()][index] ?? null;
  }
  removeItem(key: string): void {
    this.store.delete(key);
  }
  setItem(key: string, value: string): void {
    this.store.set(key, value);
  }
}

const workout: Workout = {
  id: 'workout-1',
  name: 'Lower body',
  exercises: [{ id: 'ex-1', name: 'Hip thrust', sets: 3, targetReps: '8-10', restSeconds: 60 }],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

const activeWorkout: ActiveWorkout = {
  workoutId: 'workout-1',
  workoutName: 'Lower body',
  startedAt: new Date().toISOString(),
  pausedMs: 0,
  currentExerciseIndex: 0,
  exercises: [],
};

const activity: Activity = {
  id: 'activity-1',
  workoutId: 'workout-1',
  workoutName: 'Lower body',
  date: new Date().toISOString(),
  durationSeconds: 600,
  exercises: [],
};

describe('LocalStorageRepository', () => {
  let repository: LocalStorageRepository;

  beforeEach(() => {
    repository = new LocalStorageRepository(new FakeStorage());
  });

  it('returns empty/null for unset workouts/active workout', async () => {
    expect(await repository.getWorkouts()).toEqual([]);
    expect(await repository.getWorkout('missing')).toBeNull();
    expect(await repository.getActiveWorkout()).toBeNull();
  });

  it('creates and updates a workout by id', async () => {
    await repository.saveWorkout(workout);
    expect(await repository.getWorkout('workout-1')).toEqual(workout);

    const renamed = { ...workout, name: 'Lower body v2' };
    await repository.saveWorkout(renamed);
    const all = await repository.getWorkouts();
    expect(all).toHaveLength(1);
    expect(all[0].name).toBe('Lower body v2');
  });

  it('deletes a workout', async () => {
    await repository.saveWorkout(workout);
    await repository.deleteWorkout('workout-1');
    expect(await repository.getWorkouts()).toEqual([]);
  });

  it('round-trips and clears the active workout', async () => {
    await repository.saveActiveWorkout(activeWorkout);
    expect(await repository.getActiveWorkout()).toEqual(activeWorkout);
    await repository.clearActiveWorkout();
    expect(await repository.getActiveWorkout()).toBeNull();
  });

  it('appends saved activities without overwriting previous ones', async () => {
    expect(await repository.getActivities()).toEqual([]);
    await repository.saveActivity(activity);
    await repository.saveActivity({ ...activity, id: 'activity-2' });
    const activities = await repository.getActivities();
    expect(activities).toHaveLength(2);
    expect(activities.map((a) => a.id)).toEqual(['activity-1', 'activity-2']);
  });

  it('looks up a single activity by id', async () => {
    await repository.saveActivity(activity);
    expect(await repository.getActivity('activity-1')).toEqual(activity);
    expect(await repository.getActivity('missing')).toBeNull();
  });
});
