// Exercise library domain types.
// Spec: setup-functional-spec.md §5.3 (conceptual Exercise model) and §8.4 (technique in workout mode).

import type { Equipment, Goal } from './onboarding';

export type MovementPattern =
  | 'squat'
  | 'hinge'
  | 'lunge'
  | 'horizontal-push'
  | 'horizontal-pull'
  | 'vertical-push'
  | 'vertical-pull'
  | 'carry'
  | 'core'
  // Isolation-oriented patterns — a single-joint exercise still needs a
  // pattern to be slotted by, it just doesn't map onto one of the
  // multi-joint patterns above.
  | 'elbow-flexion'
  | 'elbow-extension'
  | 'shoulder-abduction'
  | 'knee-extension'
  | 'knee-flexion'
  | 'calf-raise'
  | 'hip-abduction'
  // Chest fly / pec deck — deliberately distinct from horizontal-push
  // (a compound press), since a fly is what lets a hypertrophy session
  // add real chest volume without just repeating the bench-press pattern
  // (which session-quality-pass.ts's redundancy dedup would collapse
  // anyway, and repeating a compound press as an "accessory" is poor
  // programming even before redundancy is considered).
  | 'horizontal-adduction';

export type MuscleGroup =
  | 'quadriceps'
  | 'hamstrings'
  | 'glutes'
  | 'calves'
  | 'adductors'
  | 'back'
  | 'chest'
  | 'shoulders'
  | 'biceps'
  | 'triceps'
  | 'core';

export type ExerciseDifficulty = 'beginner' | 'intermediate' | 'advanced';

// Category is UI/programming-role semantics (what kind of exercise this
// is); strengthType is a programming characteristic that only makes sense
// for the 'strength' category. Keeping them separate means a plank or a
// farmer carry never has to be shoehorned into compound/isolation — a
// classification that simply doesn't describe them.
export type ExerciseCategory = 'strength' | 'core' | 'carry' | 'warmup' | 'cooldown';
export type StrengthType = 'compound' | 'isolation';

// Tracking mode is intentionally the same literal union Workout Mode reads
// off `PlannedExercise.prescription.mode` (domain/plan.ts) — the two are
// meant to line up exactly so the UI never has to infer whether a number
// means reps or seconds.
export type TrackingMode =
  | 'reps'
  | 'reps-weight'
  | 'reps-side'
  | 'duration'
  | 'duration-weight'
  | 'duration-side';

export type ExerciseTechnique = {
  // One-line summary — e.g. a card subtitle before the user taps in for
  // full setup/execution/cues.
  description: string;
  setup: string[];
  execution: string[];
  cues: string[];
  commonMistakes: string[];
};

export type DemandLevel = 'low' | 'medium' | 'high';

export type ExerciseDemands = {
  technical: DemandLevel;
  balance: DemandLevel;
  mobility: DemandLevel;
  // Systemic/CNS-fatigue cost — deliberately independent of `technical`.
  // A heavy barbell squat is technical:medium but systemic:high; a leg
  // extension is technical:low and systemic:low despite both being
  // single-pattern movements. This is what caps "high-fatigue work
  // stacked in one session" in validate-plan.ts.
  systemic: DemandLevel;
};

export type Exercise = {
  id: string;
  name: string;

  category: ExerciseCategory;
  // Only meaningful when category is 'strength'. Never set for
  // core/carry/warmup/cooldown — those aren't compound-vs-isolation
  // movements in any useful sense.
  strengthType?: StrengthType;

  movementPattern: MovementPattern;

  muscles: {
    primary: MuscleGroup[];
    secondary: MuscleGroup[];
  };

  equipment: Equipment[];
  difficulty: ExerciseDifficulty;
  suitableGoals: Goal[];

  demands: ExerciseDemands;

  technique: ExerciseTechnique;

  trackingMode: TrackingMode;

  // Placeholder for future asset work — no images generated yet.
  imagePath?: string;
};
