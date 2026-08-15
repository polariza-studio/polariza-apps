// Training plan domain types.
// Spec: setup-functional-spec.md §10 (core domain models).

import type { OnboardingAnswers } from './onboarding';
import type { SuggestedLoad } from './exercise';

// Discriminated by `mode`, which always matches the Exercise's own
// `trackingMode` (domain/exercise.ts) — so Workout Mode reads the mode tag
// once and never has to guess whether a number means reps or seconds.
//
// One member per literal mode, deliberately not grouped (e.g. NOT
// `mode: 'reps' | 'reps-side'` on a single member) — TypeScript can only
// narrow a discriminated union cleanly when each member's discriminant is
// a single literal; a grouped literal on one member silently breaks
// narrowing on the *other* members too (confirmed while wiring
// estimate-duration.ts — `prescription.repRange` stayed unreachable after
// a mode check until this was split apart).
export type ExercisePrescription =
  | {
      mode: 'reps';
      sets: number;
      repRange: [number, number];
      restSeconds: number;
      targetRir?: [number, number];
    }
  | {
      mode: 'reps-side';
      sets: number;
      repRange: [number, number];
      restSeconds: number;
      targetRir?: [number, number];
    }
  | {
      mode: 'reps-weight';
      sets: number;
      repRange: [number, number];
      restSeconds: number;
      targetRir?: [number, number];
      // The experience-matched curated fallback from Exercise.startingLoad
      // — a stable initial recommendation baked into the generated plan.
      // Workout Mode may still override the displayed value with newer
      // activity history at runtime; this field is never itself updated
      // from history. Always editable, never a requirement — spec §16.
      suggestedLoad?: SuggestedLoad;
    }
  | {
      // Unilateral and weighted (dumbbell row, walking lunge, RFESS) —
      // same shape as 'reps-weight', Workout Mode just renders two
      // tracked rows per set (one per side) instead of one.
      mode: 'reps-weight-side';
      sets: number;
      repRange: [number, number];
      restSeconds: number;
      targetRir?: [number, number];
      suggestedLoad?: SuggestedLoad;
    }
  | {
      mode: 'duration';
      sets: number;
      durationSeconds: number;
      restSeconds?: number;
    }
  | {
      mode: 'duration-side';
      sets: number;
      durationSeconds: number;
      restSeconds?: number;
    }
  | {
      mode: 'duration-weight';
      sets: number;
      durationSeconds: number;
      restSeconds?: number;
      suggestedLoad?: SuggestedLoad;
    };

export type PlannedExercise = {
  exerciseId: string;
  // Session-context, not a property of the exercise itself (domain/exercise.ts
  // deliberately has no role field) — the same exercise can be `primary` in
  // one workout's slot and `accessory` in another's.
  role: 'primary' | 'secondary' | 'accessory';
  prescription: ExercisePrescription;
};

// Warm-up/cool-down entries deliberately don't reuse PlannedExercise:
// `role` (primary/secondary/accessory) is a session-emphasis concept
// that doesn't mean anything for a warm-up, and giving it a role value
// anyway would be misleading rather than merely unused. Same
// ExercisePrescription discriminated union, though — the prescription
// shape doesn't depend on where in the session an exercise sits.
export type WarmupCooldownExercise = {
  exerciseId: string;
  prescription: ExercisePrescription;
};

export type TrainingDay = {
  id: string;
  name: string;
  estimatedDurationMinutes: number;
  // Explicit and separate from the main list, not mixed in — MVP is
  // always exactly one exercise each (rules/warmup-cooldown.ts).
  warmup: WarmupCooldownExercise[];
  exercises: PlannedExercise[];
  cooldown: WarmupCooldownExercise[];
};

export type TrainingPlan = {
  id: string;
  createdAt: string;
  preferences: OnboardingAnswers;
  days: TrainingDay[];
};
