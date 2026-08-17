import { describe, expect, it } from 'vitest';
import { computeStartingLoad, prescriptionLoadBand } from './starting-load';
import type { SuggestedLoad } from '../../domain/exercise';

describe('prescriptionLoadBand', () => {
  it('is neutral (1.0) when repRange/targetRir are unavailable (duration-weight exercises)', () => {
    expect(prescriptionLoadBand(undefined, undefined)).toBe(1.0);
  });

  it('bands a low-rep, low-RIR primary prescription as heavy', () => {
    // stronger primary: 3-6 reps, RIR 1-3 -> effectiveReps 6.5
    expect(prescriptionLoadBand([3, 6], [1, 3])).toBe(1.15);
  });

  it('bands a moderate prescription as unchanged', () => {
    // muscle primary: 6-10 reps, RIR 1-3 -> effectiveReps 10
    expect(prescriptionLoadBand([6, 10], [1, 3])).toBe(1.0);
  });

  it('bands a high-rep accessory prescription as light', () => {
    // muscle accessory: 10-15 reps, RIR 0-2 -> effectiveReps 13.5
    expect(prescriptionLoadBand([10, 15], [0, 2])).toBe(0.85);
  });
});

describe('computeStartingLoad', () => {
  const dumbbellRdlReference: SuggestedLoad = { type: 'two-dumbbells', weightPerDumbbell: 12, unit: 'kg' };

  it('matches the worked example: six-to-eighteen-months/three-to-four/moderate -> unchanged reference', () => {
    const result = computeStartingLoad(dumbbellRdlReference, 'six-to-eighteen-months', 'three-to-four', [8, 12], [1, 3]);
    expect(result).toEqual({ type: 'two-dumbbells', weightPerDumbbell: 12, unit: 'kg' });
  });

  it('rounds two-dumbbells/single-dumbbell to the nearest 2kg', () => {
    const result = computeStartingLoad(dumbbellRdlReference, 'just-starting', 'none', [8, 12], [1, 3]);
    // 12 * 0.7 * 0.9 * 1.0 = 7.56 -> nearest 2kg = 8
    expect(result).toEqual({ type: 'two-dumbbells', weightPerDumbbell: 8, unit: 'kg' });
  });

  it('rounds barbell to the nearest 2.5kg with no universal 20kg floor', () => {
    const lightBarbellReference: SuggestedLoad = { type: 'barbell', weight: 17.5, unit: 'kg' };
    // 17.5 * 0.7 (just-starting) * 0.9 (none) * 1.0 (moderate) = 11.025 -> nearest 2.5kg = 10
    const result = computeStartingLoad(lightBarbellReference, 'just-starting', 'none', [8, 12], [1, 3]);
    expect(result).toEqual({ type: 'barbell', weight: 10, unit: 'kg' });
  });

  it('rounds machine/cable to the nearest 5kg', () => {
    const cableReference: SuggestedLoad = { type: 'cable', weight: 30, unit: 'kg' };
    const result = computeStartingLoad(cableReference, 'more-than-18-months', 'five-plus', [8, 12], [1, 3]);
    // 30 * 1.2 * 1.0 * 1.0 = 36 -> nearest 5kg = 35
    expect(result).toEqual({ type: 'cable', weight: 35, unit: 'kg' });
  });

  it('treats unknown currentStrengthTrainingFrequency as neutral (no detraining discount)', () => {
    const withUnknown = computeStartingLoad(dumbbellRdlReference, 'six-to-eighteen-months', undefined, [8, 12], [1, 3]);
    const withMiddle = computeStartingLoad(dumbbellRdlReference, 'six-to-eighteen-months', 'three-to-four', [8, 12], [1, 3]);
    expect(withUnknown).toEqual(withMiddle);
  });

  it('never rounds below one increment step', () => {
    const tinyReference: SuggestedLoad = { type: 'single-dumbbell', weight: 1, unit: 'kg' };
    const result = computeStartingLoad(tinyReference, 'just-starting', 'none', [10, 15], [0, 2]);
    expect((result as { weight: number }).weight).toBeGreaterThanOrEqual(2);
  });
});
