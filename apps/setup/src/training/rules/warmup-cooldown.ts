// Warm-up/cool-down selection and prescription — deliberately simple and
// deterministic (explicit instruction): one fixed exercise per body area,
// not ranked/filtered the way main-session exercises are, and a flat
// prescription with no goal/experience scaling.

import type { MovementPattern } from '../../domain/exercise';
import type { SplitId } from './splits';

export type BodyArea = 'lower' | 'upper' | 'general';

// Full-body splits always read as 'general', regardless of that day's own
// primaryPattern (a full-body day's primary is always squat/hinge/lunge
// by construction, but the *session* trains the whole body, not just
// legs — see splits.ts). Non-full-body splits fall back to a pattern
// check: squat/hinge/lunge → lower, any push/pull pattern → upper.
export function bodyAreaForDay(primaryPattern: MovementPattern, splitId: SplitId): BodyArea {
  if (splitId === 'full-body-2day' || splitId === 'full-body-3day') return 'general';
  if (primaryPattern === 'squat' || primaryPattern === 'hinge' || primaryPattern === 'lunge') return 'lower';
  if (
    primaryPattern === 'horizontal-push' ||
    primaryPattern === 'horizontal-pull' ||
    primaryPattern === 'vertical-push' ||
    primaryPattern === 'vertical-pull'
  ) {
    return 'upper';
  }
  return 'general';
}

// Exercise IDs, not a ranking — see training/exercises/exercise-library.ts.
// 'lower' and 'general' intentionally share dynamic-warmup-flow: it's
// already a full-body flow (squats, lunges, arm circles), a reasonable
// fit for both rather than inventing a near-duplicate lower-specific one.
export const WARMUP_EXERCISE_ID: Record<BodyArea, string> = {
  lower: 'dynamic-warmup-flow',
  upper: 'upper-body-dynamic-warmup',
  general: 'dynamic-warmup-flow',
};

export const COOLDOWN_EXERCISE_ID: Record<BodyArea, string> = {
  lower: 'standing-quad-stretch',
  upper: 'cross-body-shoulder-stretch',
  general: 'hamstring-stretch',
};

export type WarmupCooldownPrescriptionRules = {
  sets: number;
  durationSeconds: number;
  restSeconds: number;
};

// PROVISIONAL — not reviewed, placeholder only, and not goal/experience-
// scaled on purpose (unlike goalRules/durationRules): a warm-up/cool-down
// isn't trained volume, it's fixed preparation/recovery.
export const warmupPrescriptionRules: WarmupCooldownPrescriptionRules = {
  sets: 1,
  durationSeconds: 60,
  restSeconds: 0,
};

export const cooldownPrescriptionRules: WarmupCooldownPrescriptionRules = {
  sets: 1,
  durationSeconds: 30,
  restSeconds: 0,
};
