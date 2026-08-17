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
import { migrateLegacyPreferences } from './legacy-preferences-migration';

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

  // Self-healing migration: a record saved before the trainingHistory
  // redesign (2026-08-19) has no schema version, so this is checked on
  // every read — but only ever WRITES when migration actually happened,
  // so it's a one-time upgrade per legacy user, not a repeated cost. See
  // legacy-preferences-migration.ts for exactly what's migrated and why
  // currentStrengthTrainingFrequency is deliberately left unset rather
  // than guessed.
  async getPreferences(): Promise<OnboardingAnswers | null> {
    const raw = this.readJson<unknown>(KEYS.preferences);
    if (raw === null) return null;
    const migrated = migrateLegacyPreferences(raw);
    if (migrated === null) return null;
    if (!(raw as Record<string, unknown>).trainingHistory) {
      this.writeJson(KEYS.preferences, migrated);
    }
    return migrated;
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
