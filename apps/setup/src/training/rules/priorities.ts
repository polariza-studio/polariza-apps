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
  // Added to a session's single best-focus-matching exercise — see
  // apply-focus-emphasis.ts. Deliberately not applied per-exercise across
  // every exercise that happens to hit a focus muscle: focus areas are
  // also common primary/secondary program muscles by default, so an
  // unbounded per-exercise bonus compounds across the week into a de
  // facto specialization program rather than the "moderate emphasis" the
  // product spec calls for (§4.1 step 6).
  extraSets: number;
};

// PROVISIONAL — not reviewed, placeholder only.
export const focusAreaModifier: PriorityModifier = { extraSets: 1 };

// Deprioritized areas have no modifier at all (not even a 0 one) —
// per spec §4.1 step 7, deprioritizing must never remove necessary
// training, only avoid adding to it. Since apply-focus-emphasis.ts only
// ever reads answers.focusAreas, a deprioritized area structurally can't
// receive the emphasis bonus; there's nothing else in the pipeline that
// would reduce its volume either.
