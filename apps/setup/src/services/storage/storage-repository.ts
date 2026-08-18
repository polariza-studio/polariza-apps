// Storage abstraction. The UI must depend on this interface, not on a
// specific persistence mechanism — local persistence can later be
// replaced by a remote database without rewriting the UI.

import type { ActiveWorkout, Workout } from '../../domain/workout';
import type { Activity } from '../../domain/activity';

export interface StorageRepository {
  getWorkouts(): Promise<Workout[]>;
  getWorkout(id: string): Promise<Workout | null>;
  saveWorkout(workout: Workout): Promise<void>;
  deleteWorkout(id: string): Promise<void>;

  getActiveWorkout(): Promise<ActiveWorkout | null>;
  saveActiveWorkout(workout: ActiveWorkout): Promise<void>;
  clearActiveWorkout(): Promise<void>;

  getActivities(): Promise<Activity[]>;
  getActivity(id: string): Promise<Activity | null>;
  saveActivity(activity: Activity): Promise<void>;
}
