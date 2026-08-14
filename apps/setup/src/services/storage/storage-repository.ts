// Storage abstraction (spec §11). The UI must depend on this interface, not
// on a specific persistence mechanism — local persistence can later be
// replaced by a remote database without rewriting the UI.

import type { OnboardingAnswers } from '../../domain/onboarding';
import type { TrainingPlan } from '../../domain/plan';
import type { ActiveWorkout } from '../../domain/workout';
import type { Activity } from '../../domain/activity';

export interface StorageRepository {
  getPreferences(): Promise<OnboardingAnswers | null>;
  savePreferences(data: OnboardingAnswers): Promise<void>;

  getCurrentPlan(): Promise<TrainingPlan | null>;
  saveCurrentPlan(plan: TrainingPlan): Promise<void>;

  getActiveWorkout(): Promise<ActiveWorkout | null>;
  saveActiveWorkout(workout: ActiveWorkout): Promise<void>;
  clearActiveWorkout(): Promise<void>;

  getActivities(): Promise<Activity[]>;
  saveActivity(activity: Activity): Promise<void>;
}
