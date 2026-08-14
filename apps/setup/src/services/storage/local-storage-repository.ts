// StorageRepository implementation backed by a Storage-compatible object.
// The storage backend is injected (defaulting to globalThis.localStorage,
// not window.localStorage, so this evaluates safely in the Node-environment
// unit-test project) so tests can supply an in-memory fake instead of
// requiring a DOM environment.

import type { OnboardingAnswers } from '../../domain/onboarding';
import type { TrainingPlan } from '../../domain/plan';
import type { ActiveWorkout } from '../../domain/workout';
import type { Activity } from '../../domain/activity';
import type { StorageRepository } from './storage-repository';

const KEYS = {
  preferences: 'setup:preferences',
  currentPlan: 'setup:current-plan',
  activeWorkout: 'setup:active-workout',
  activities: 'setup:activities',
} as const;

export class LocalStorageRepository implements StorageRepository {
  private storage: Storage;

  constructor(storage: Storage = globalThis.localStorage) {
    this.storage = storage;
  }

  async getPreferences(): Promise<OnboardingAnswers | null> {
    return this.readJson<OnboardingAnswers>(KEYS.preferences);
  }

  async savePreferences(data: OnboardingAnswers): Promise<void> {
    this.writeJson(KEYS.preferences, data);
  }

  async getCurrentPlan(): Promise<TrainingPlan | null> {
    return this.readJson<TrainingPlan>(KEYS.currentPlan);
  }

  async saveCurrentPlan(plan: TrainingPlan): Promise<void> {
    this.writeJson(KEYS.currentPlan, plan);
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
