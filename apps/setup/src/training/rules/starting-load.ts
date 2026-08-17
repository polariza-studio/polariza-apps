// Starting-load formula — replaces the old 3-tier ExperienceLevel lookup
// (domain/exercise.ts's startingLoad used to be `Record<ExperienceLevel,
// SuggestedLoad>`; it is now a single curated SuggestedLoad per exercise,
// see that file's comment). This module scales that ONE reference by
// trainingHistory, currentStrengthTrainingFrequency, and the exercise's
// actual prescribed rep range/RIR — it never reads another exercise's
// data. The relative-load ratios used to CURATE the reference table
// (training/exercises/exercise-library.ts) were a review-time sanity
// check only and do not appear anywhere in this file — each exercise's
// reference stands on its own in production.
//
// The recommendation means "a conservative first weight to try for this
// exact prescription," never "what someone like you should be able to
// lift" — see prescriptionLoadBand's comment for why prescription
// (reps/RIR), not just the user's profile, changes the number.
//
// PROVISIONAL — not reviewed by a certified professional, same status as
// training/rules/goals.ts.

import type { CurrentStrengthTrainingFrequency, TrainingHistory } from '../../domain/onboarding';
import type { SuggestedLoad } from '../../domain/exercise';

// Centered on 1.0 at 'six-to-eighteen-months' — the reference load itself
// is curated at that point, so this tier is a pass-through. Bounded
// spread (0.7x-1.2x), tighter than the old system's own per-exercise
// tier spread (which varied inconsistently exercise to exercise).
const historyLoadMultiplier: Record<TrainingHistory, number> = {
  'just-starting': 0.7,
  'less-than-6-months': 0.85,
  'six-to-eighteen-months': 1.0,
  'more-than-18-months': 1.2,
};

// Asymmetric by design, matching workload-readiness.ts's shape: current
// frequency only ever discounts for likely detraining, never inflates for
// high frequency — training 5 days/week doesn't mean any single set is
// loaded heavier, only that more volume is tolerated (workload-readiness
// handles that separately). `undefined` (unknown, always a legacy-
// migrated user) is neutral — no discount applied.
const frequencyLoadAdjustment: Record<CurrentStrengthTrainingFrequency, number> = {
  none: 0.9,
  'one-to-two': 1.0,
  'three-to-four': 1.0,
  'five-plus': 1.0,
};

// Reps-in-reserve framing: repRangeMidpoint + targetRirMidpoint estimates
// "reps to true failure" — never a %1RM claim, just an ordinal read on
// how hard the prescription itself is asking the set to be. Band edges
// were calibrated against the actual goalRules table (every goal x role
// combination), not picked blind. A primary lift prescribed 4-6 reps at
// RIR 1-3 is a near-maximal-effort set — the honest first guess is
// heavier than a comfortable 12-15 rep accessory set of the SAME
// exercise, because the prescription is asking for harder relative
// effort, not because anything new is known about the user. No separate
// role multiplier: role's effect on load is already fully mediated
// through repRange/RIR (role determines those via goalRules), so a
// standalone role term would double-count the same signal.
//
// Returns 1.0 (no adjustment) when repRange/targetRir aren't available —
// duration-weight exercises (e.g. Farmer's Carry) have no rep-based
// prescription to read.
export function prescriptionLoadBand(
  repRange: [number, number] | undefined,
  targetRir: [number, number] | undefined,
): number {
  if (!repRange || !targetRir) return 1.0;
  const repMidpoint = (repRange[0] + repRange[1]) / 2;
  const rirMidpoint = (targetRir[0] + targetRir[1]) / 2;
  const effectiveReps = repMidpoint + rirMidpoint;
  if (effectiveReps <= 9) return 1.15;
  if (effectiveReps <= 13) return 1.0;
  return 0.85;
}

// Practical equipment increments — never assume arbitrary 1kg precision.
// No barbell-specific minimum: a 20kg-bar floor would inflate
// recommendations above what's actually appropriate (e.g. Overhead Press
// for a brand-new lifter) and doesn't hold everywhere anyway (15kg bars,
// fixed barbells exist). If a computed suggestion is below what a user's
// available bar permits, that's an equipment-availability gap, not a
// reason for the engine to invent a higher number.
const LOAD_INCREMENT: Record<Exclude<SuggestedLoad['type'], 'bodyweight'>, number> = {
  'two-dumbbells': 2,
  'single-dumbbell': 2,
  barbell: 2.5,
  machine: 5,
  cable: 5,
};

function roundToIncrement(value: number, type: Exclude<SuggestedLoad['type'], 'bodyweight'>): number {
  const step = LOAD_INCREMENT[type];
  // Floor is one increment step — a pure math guard against a zero/
  // negative output, identical treatment for every load type. Never an
  // equipment-availability assumption.
  return Math.max(Math.round(value / step) * step, step);
}

function scaleLoad(reference: SuggestedLoad, factor: number): SuggestedLoad {
  switch (reference.type) {
    case 'two-dumbbells':
      return { ...reference, weightPerDumbbell: roundToIncrement(reference.weightPerDumbbell * factor, reference.type) };
    case 'bodyweight':
      return reference;
    default:
      return { ...reference, weight: roundToIncrement(reference.weight * factor, reference.type) };
  }
}

// The full first-time formula: reference (this exercise's own curated
// data point, nothing else) x history x current-frequency x prescription,
// rounded once at the end to a practical increment.
export function computeStartingLoad(
  reference: SuggestedLoad,
  trainingHistory: TrainingHistory,
  currentFrequency: CurrentStrengthTrainingFrequency | undefined,
  repRange: [number, number] | undefined,
  targetRir: [number, number] | undefined,
): SuggestedLoad {
  const frequencyFactor = currentFrequency === undefined ? 1.0 : frequencyLoadAdjustment[currentFrequency];
  const factor = historyLoadMultiplier[trainingHistory] * frequencyFactor * prescriptionLoadBand(repRange, targetRir);
  return scaleLoad(reference, factor);
}
