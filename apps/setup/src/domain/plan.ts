// Training plan domain types.
// Spec: setup-functional-spec.md §10 (core domain models).

import type { OnboardingAnswers } from './onboarding';

export type PlannedExercise = {
  exerciseId: string;
  sets: number;
  repRange: [number, number];
  restSeconds: number;
  targetRir?: [number, number];
  suggestedWeight?: {
    min?: number;
    max?: number;
    unit: 'kg';
  };
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
