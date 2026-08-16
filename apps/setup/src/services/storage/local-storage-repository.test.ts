import { beforeEach, describe, expect, it } from 'vitest';
import { LocalStorageRepository } from './local-storage-repository';
import type { OnboardingAnswers } from '../../domain/onboarding';
import type { TrainingPlan } from '../../domain/plan';
import type { ActiveWorkout } from '../../domain/workout';
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

const preferences: OnboardingAnswers = {
  name: 'Test User',
  weightKg: 70,
  heightCm: 170,
  goal: 'muscle',
  experience: 'some-experience',
  daysPerWeek: 3,
  sessionDuration: 45,
  trainingEnvironment: 'home',
  equipment: ['dumbbells'],
  focusAreas: [],
  deprioritizedAreas: [],
  context: [],
};

const plan: TrainingPlan = {
  id: 'plan-1',
  createdAt: new Date().toISOString(),
  preferences,
  days: [],
};

const activeWorkout: ActiveWorkout = {
  planId: 'plan-1',
  trainingDayId: 'day-1',
  startedAt: new Date().toISOString(),
  elapsedSeconds: 0,
  phase: 'main',
  currentExerciseIndex: 0,
  warmup: [],
  exercises: [],
  cooldown: [],
};

const activity: Activity = {
  id: 'activity-1',
  planId: 'plan-1',
  trainingDayId: 'day-1',
  startedAt: new Date().toISOString(),
  completedAt: new Date().toISOString(),
  durationSeconds: 600,
  warmup: [],
  cooldown: [],
  exercises: [],
};

describe('LocalStorageRepository', () => {
  let repository: LocalStorageRepository;

  beforeEach(() => {
    repository = new LocalStorageRepository(new FakeStorage());
  });

  it('returns null for unset preferences/plan/active workout', async () => {
    expect(await repository.getPreferences()).toBeNull();
    expect(await repository.getCurrentPlan()).toBeNull();
    expect(await repository.getActiveWorkout()).toBeNull();
  });

  it('round-trips preferences', async () => {
    await repository.savePreferences(preferences);
    expect(await repository.getPreferences()).toEqual(preferences);
  });

  it('round-trips the current plan', async () => {
    await repository.saveCurrentPlan(plan);
    expect(await repository.getCurrentPlan()).toEqual(plan);
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
});
