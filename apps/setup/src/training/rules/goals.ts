// Goal-based programming rules: rep ranges, rest, RIR, sets per exercise.
// See training/evidence/{strength,hypertrophy,athletic,general-fitness}.md —
// content here is PROVISIONAL, not reviewed.

import type { Goal } from '../../domain/onboarding';

export type GoalProgrammingRules = {
  repRange: [number, number];
  restSeconds: number;
  targetRir: [number, number];
  setsPerExercise: number;
};

// PROVISIONAL — not reviewed, placeholder only.
export const goalRules: Record<Goal, GoalProgrammingRules> = {
  stronger: { repRange: [3, 6], restSeconds: 180, targetRir: [1, 3], setsPerExercise: 4 },
  muscle: { repRange: [8, 12], restSeconds: 90, targetRir: [1, 3], setsPerExercise: 3 },
  athletic: { repRange: [6, 10], restSeconds: 90, targetRir: [2, 4], setsPerExercise: 3 },
  'general-fitness': {
    repRange: [8, 12],
    restSeconds: 60,
    targetRir: [2, 4],
    setsPerExercise: 3,
  },
};
