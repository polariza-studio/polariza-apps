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
  | 'core';

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

export type ExerciseTechnique = {
  setup: string[];
  execution: string[];
  cues: string[];
  commonMistakes: string[];
};

export type ExerciseDemands = {
  technical?: 'low' | 'medium' | 'high';
  balance?: 'low' | 'medium' | 'high';
  mobility?: 'low' | 'medium' | 'high';
};

export type Exercise = {
  id: string;
  name: string;

  movementPattern: MovementPattern;

  muscles: {
    primary: MuscleGroup[];
    secondary: MuscleGroup[];
  };

  equipment: Equipment[];
  difficulty: ExerciseDifficulty;
  suitableGoals: Goal[];

  technique: ExerciseTechnique;

  demands?: ExerciseDemands;
};
