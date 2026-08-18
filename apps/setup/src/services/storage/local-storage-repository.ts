// StorageRepository implementation backed by a Storage-compatible object.
// The storage backend is injected (defaulting to globalThis.localStorage,
// not window.localStorage, so this evaluates safely in the Node-environment
// unit-test project) so tests can supply an in-memory fake instead of
// requiring a DOM environment.
//
// Clean V1 slate: no migration from the old generated-plan/onboarding
// data — those keys are simply never read by this repository again.

import type { ActiveWorkout, Workout } from '../../domain/workout';
import type { Activity } from '../../domain/activity';
import type { StorageRepository } from './storage-repository';

const KEYS = {
  workouts: 'setup:workouts',
  activeWorkout: 'setup:active-workout',
  activities: 'setup:activities',
} as const;

export class LocalStorageRepository implements StorageRepository {
  private storage: Storage;

  constructor(storage: Storage = globalThis.localStorage) {
    this.storage = storage;
  }

  async getWorkouts(): Promise<Workout[]> {
    return this.readJson<Workout[]>(KEYS.workouts) ?? [];
  }

  async getWorkout(id: string): Promise<Workout | null> {
    const workouts = await this.getWorkouts();
    return workouts.find((workout) => workout.id === id) ?? null;
  }

  async saveWorkout(workout: Workout): Promise<void> {
    const workouts = await this.getWorkouts();
    const index = workouts.findIndex((existing) => existing.id === workout.id);
    if (index === -1) {
      workouts.push(workout);
    } else {
      workouts[index] = workout;
    }
    this.writeJson(KEYS.workouts, workouts);
  }

  async deleteWorkout(id: string): Promise<void> {
    const workouts = await this.getWorkouts();
    this.writeJson(
      KEYS.workouts,
      workouts.filter((workout) => workout.id !== id),
    );
  }

  async getActiveWorkout(): Promise<ActiveWorkout | null> {
    return this.readJson<ActiveWorkout>(KEYS.activeWorkout);
  }

  async saveActiveWorkout(workout: ActiveWorkout): Promise<void> {
    this.writeJson(KEYS.activeWorkout, workout);
  }

  async clearActiveWorkout(): Promise<void> {
    this.storage.removeItem(KEYS.activeWorkout);
  }

  async getActivities(): Promise<Activity[]> {
    return this.readJson<Activity[]>(KEYS.activities) ?? [];
  }

  async getActivity(id: string): Promise<Activity | null> {
    const activities = await this.getActivities();
    return activities.find((activity) => activity.id === id) ?? null;
  }

  async saveActivity(activity: Activity): Promise<void> {
    const activities = await this.getActivities();
    activities.push(activity);
    this.writeJson(KEYS.activities, activities);
  }

  private readJson<T>(key: string): T | null {
    const raw = this.storage.getItem(key);
    return raw === null ? null : (JSON.parse(raw) as T);
  }

  private writeJson(key: string, value: unknown): void {
    this.storage.setItem(key, JSON.stringify(value));
  }
}
