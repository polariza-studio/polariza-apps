// Active workout domain types.
// Spec: setup-functional-spec.md §8 (Workout Mode) and §11 (persistence —
// ActiveWorkout must survive refresh/reopen/navigation-away).

// One member per TrackingMode literal (domain/exercise.ts), same
// discriminated-union discipline as ExercisePrescription (domain/plan.ts)
// — grouping literals on one member breaks narrowing on the others.
// *-side modes are single-sided PER STEP, not per-row: a *-side
// PlannedExercise becomes two separate ActiveExercise steps (left pass,
// then right pass — see active-workout.ts's createActiveWorkout), each
// with exactly `prescription.sets` rows, all sharing that step's side.
// Rejected an earlier "double the rows within one step" design — a
// 3-set unilateral exercise showing 6 rows under a single "3 sets"
// header reads as a data bug, not a deliberate 3-per-side prescription.
// `reps`/`weight`/`durationSeconds` stay
// optional on the type — the workout may be saved before every field is
// touched — but in practice `features/workout/active-workout.ts` prefills
// `reps`/`durationSeconds` with the prescribed orientative value (spec
// §8.3's own example shows populated rows; the range/duration is real
// approved programming data, not a guess) and `weight` only when there's
// real history or a curated suggestedLoad to offer (spec §8.2's explicit
// "no history yet" exception — an empty weight field, not a fabricated
// one, is correct when nothing is known).
export type CompletedSet =
  | { mode: 'reps'; setNumber: number; completed: boolean; reps?: number }
  | { mode: 'reps-weight'; setNumber: number; completed: boolean; reps?: number; weight?: number }
  | { mode: 'reps-side'; setNumber: number; side: 'left' | 'right'; completed: boolean; reps?: number }
  | {
      mode: 'reps-weight-side';
      setNumber: number;
      side: 'left' | 'right';
      completed: boolean;
      reps?: number;
      weight?: number;
    }
  | { mode: 'duration'; setNumber: number; completed: boolean; durationSeconds?: number }
  | {
      mode: 'duration-weight';
      setNumber: number;
      completed: boolean;
      durationSeconds?: number;
      weight?: number;
    }
  | { mode: 'duration-side'; setNumber: number; side: 'left' | 'right'; completed: boolean; durationSeconds?: number };

export type ActiveExercise = {
  exerciseId: string;
  // Set only for a *-side PlannedExercise's steps — which single-sided
  // pass through the exercise this step is (see CompletedSet's comment).
  // Absent for every other exercise.
  side?: 'left' | 'right';
  sets: CompletedSet[];
};

export type WorkoutPhase = 'warmup' | 'main' | 'cooldown';

export type ActiveWorkout = {
  planId: string;
  trainingDayId: string;
  startedAt: string;
  pausedAt?: string;
  elapsedSeconds: number;
  phase: WorkoutPhase;
  // Index within the current phase's own list (warmup/exercises/cooldown
  // below) — not a global index across all three.
  currentExerciseIndex: number;
  warmup: ActiveExercise[];
  exercises: ActiveExercise[];
  cooldown: ActiveExercise[];
};
