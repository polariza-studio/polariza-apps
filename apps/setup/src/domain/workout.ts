// Active workout domain types.
// Spec: setup-functional-spec.md §10 names ActiveWorkout/ActiveExercise but only
// shapes CompletedSet verbatim. ActiveWorkout/ActiveExercise are designed here
// from §8's Workout Mode requirements (elapsed time, pause state, exercise
// position/progress, per-exercise recorded sets).

export type CompletedSet = {
  setNumber: number;
  reps: number;
  weight?: number;
  completed: boolean;
};

export type ActiveExercise = {
  exerciseId: string;
  sets: CompletedSet[];
};

export type ActiveWorkout = {
  planId: string;
  trainingDayId: string;
  startedAt: string;
  pausedAt?: string;
  elapsedSeconds: number;
  currentExerciseIndex: number;
  exercises: ActiveExercise[];
};
