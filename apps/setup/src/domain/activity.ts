// Saved activity domain types — SetUp V1.
// An Activity is what actually happened when the user trained a workout:
// the weights and reps they really did. This is the only "progress
// tracking" the product has — the history list itself, nothing derived.

export type ActivitySet = {
  reps?: number;
  weight?: number;
};

export type ActivityExercise = {
  exerciseName: string;
  sets: ActivitySet[];
};

export type Activity = {
  id: string;
  workoutId: string;
  workoutName: string;
  date: string;
  durationSeconds: number;
  exercises: ActivityExercise[];
};
