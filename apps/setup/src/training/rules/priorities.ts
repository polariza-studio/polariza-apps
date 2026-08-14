// Focus-area / deprioritized-area volume modifiers.
// See training/evidence/*.md — content here is PROVISIONAL, not reviewed.

import type { FocusArea } from '../../domain/onboarding';
import type { MuscleGroup } from '../../domain/exercise';

// Maps onboarding focus areas (step 6/7 vocabulary) to the muscle groups
// used by the exercise library, since the two vocabularies don't line up
// 1:1 (e.g. "legs" spans several MuscleGroup values).
export const focusAreaMuscles: Record<FocusArea, MuscleGroup[]> = {
  glutes: ['glutes'],
  legs: ['quadriceps', 'hamstrings', 'calves', 'adductors'],
  back: ['back'],
  arms: ['biceps', 'triceps'],
  shoulders: ['shoulders'],
  chest: ['chest'],
  core: ['core'],
};

export type PriorityModifier = {
  // Added to (focus) or withheld from (deprioritized) an exercise's sets
  // when it targets that area as a primary muscle.
  extraSets: number;
};

// PROVISIONAL — not reviewed, placeholder only. Per spec §4.1 step 7,
// deprioritizing must not remove necessary training, only avoid adding to it
// — so its modifier is 0, never negative.
export const focusAreaModifier: PriorityModifier = { extraSets: 1 };
export const deprioritizedAreaModifier: PriorityModifier = { extraSets: 0 };
