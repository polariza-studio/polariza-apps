// Training plan domain types.
// Spec: setup-functional-spec.md §10 (core domain models).

import type { OnboardingAnswers } from './onboarding';

// Never populated by the v1 generator — spec §16 "no fake precision": with
// no recorded training history, SetUp has no basis for an exact number.
// Reserved for a future history-based progression feature.
export type LoadGuidance = {
  min?: number;
  max?: number;
  unit: 'kg';
};

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
      suggestedWeight?: LoadGuidance;
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
      suggestedWeight?: LoadGuidance;
    };

export type PlannedExercise = {
  exerciseId: string;
  // Session-context, not a property of the exercise itself (domain/exercise.ts
  // deliberately has no role field) — the same exercise can be `primary` in
  // one workout's slot and `accessory` in another's.
  role: 'primary' | 'secondary' | 'accessory';
  prescription: ExercisePrescription;
};

export type TrainingDay = {
  id: string;
  name: string;
  estimatedDurationMinutes: number;
  exercises: PlannedExercise[];
};

export type TrainingPlan = {
  id: string;
  createdAt: string;
  preferences: OnboardingAnswers;
  days: TrainingDay[];
};
