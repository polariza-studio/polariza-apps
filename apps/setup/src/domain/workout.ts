// Workout domain types — SetUp V1.
// A workout is entirely user-authored: a name plus a free-text list of
// exercises. No predefined exercise library, no generated plan — see
// domain/activity.ts for what actually happened when the user trains it.

export type WorkoutExercise = {
  id: string;
  name: string;
  sets: number;
  // Free text, not a strict numeric range — matches how the user actually
  // writes reps ("8-10", "12", "AMRAP", ...). Only Activity's performed
  // sets are ever real numbers.
  targetReps: string;
  restSeconds: number;
};

export type Workout = {
  id: string;
  name: string;
  exercises: WorkoutExercise[];
  createdAt: string;
  updatedAt: string;
};

// Runtime state for a workout in progress — persisted so a refresh/reopen
// resumes exactly where the user left off. Built once from a Workout at
// start time; editing the source Workout afterward doesn't affect an
// already-started session.
export type ActiveSet = {
  reps?: number;
  weight?: number;
  completed: boolean;
};

export type ActiveExercise = {
  name: string;
  targetReps: string;
  restSeconds: number;
  sets: ActiveSet[];
};

export type ActiveWorkout = {
  workoutId: string;
  workoutName: string;
  startedAt: string;
  pausedAt?: string;
  // Total milliseconds spent paused so far, from completed pause segments
  // (excludes any pause currently in progress, tracked via `pausedAt`).
  pausedMs: number;
  currentExerciseIndex: number;
  exercises: ActiveExercise[];
};
