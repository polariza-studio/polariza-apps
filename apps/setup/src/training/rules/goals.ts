// Goal-based programming rules for reps-tracked exercises: rep ranges,
// rest, RIR and sets, differentiated by the exercise's role in the session
// (primary/secondary/accessory) rather than one flat value per goal — a
// session's main lift and its accessory work are never programmed
// identically by a real coach. See training/evidence/{strength,hypertrophy,
// athletic,general-fitness}.md — content here is PROVISIONAL, not reviewed
// by a certified professional.

import type { Goal } from '../../domain/onboarding';

export type RoleProgrammingRules = {
  repRange: [number, number];
  restSeconds: number;
  targetRir: [number, number];
};

export type ExerciseRole = 'primary' | 'secondary' | 'accessory';

export type GoalProgrammingRules = {
  primary: RoleProgrammingRules;
  secondary: RoleProgrammingRules;
  accessory: RoleProgrammingRules;
  setsPerRole: Record<ExerciseRole, number>;
};

// PROVISIONAL — not reviewed, placeholder only. Rough shape: primary work
// sits closest to the goal's defining intensity/rep range; accessory work
// converges toward moderate-rep, shorter-rest, closer-to-failure regardless
// of goal — accessory volume serves the same purpose (extra muscle
// exposure without much added fatigue) whether the user is training for
// strength or hypertrophy.
export const goalRules: Record<Goal, GoalProgrammingRules> = {
  stronger: {
    primary: { repRange: [3, 6], restSeconds: 180, targetRir: [1, 3] },
    secondary: { repRange: [5, 8], restSeconds: 120, targetRir: [1, 3] },
    accessory: { repRange: [8, 12], restSeconds: 75, targetRir: [0, 2] },
    setsPerRole: { primary: 4, secondary: 3, accessory: 3 },
  },
  muscle: {
    primary: { repRange: [6, 10], restSeconds: 120, targetRir: [1, 3] },
    secondary: { repRange: [8, 12], restSeconds: 90, targetRir: [1, 3] },
    accessory: { repRange: [10, 15], restSeconds: 60, targetRir: [0, 2] },
    setsPerRole: { primary: 3, secondary: 3, accessory: 3 },
  },
  athletic: {
    primary: { repRange: [5, 8], restSeconds: 120, targetRir: [2, 4] },
    secondary: { repRange: [8, 12], restSeconds: 90, targetRir: [2, 4] },
    accessory: { repRange: [10, 15], restSeconds: 60, targetRir: [1, 3] },
    setsPerRole: { primary: 3, secondary: 3, accessory: 2 },
  },
  'general-fitness': {
    primary: { repRange: [8, 12], restSeconds: 90, targetRir: [2, 4] },
    secondary: { repRange: [10, 14], restSeconds: 75, targetRir: [2, 4] },
    accessory: { repRange: [12, 15], restSeconds: 60, targetRir: [1, 3] },
    setsPerRole: { primary: 3, secondary: 2, accessory: 2 },
  },
};
