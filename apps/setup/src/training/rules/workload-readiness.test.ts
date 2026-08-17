import { describe, expect, it } from 'vitest';
import { deriveWorkloadReadiness, workloadReadinessRules } from './workload-readiness';

describe('deriveWorkloadReadiness', () => {
  it('matches the documented profiles A-E', () => {
    expect(deriveWorkloadReadiness('just-starting', 'none')).toBe('minimal');
    expect(deriveWorkloadReadiness('less-than-6-months', 'three-to-four')).toBe('building');
    expect(deriveWorkloadReadiness('six-to-eighteen-months', 'three-to-four')).toBe('standard');
    expect(deriveWorkloadReadiness('more-than-18-months', 'none')).toBe('standard');
    expect(deriveWorkloadReadiness('more-than-18-months', 'five-plus')).toBe('confident');
  });

  it('never lets a detraining discount push below minimal', () => {
    expect(deriveWorkloadReadiness('just-starting', 'none')).toBe('minimal');
  });

  it('never lets a frequency bonus push above confident', () => {
    expect(deriveWorkloadReadiness('more-than-18-months', 'five-plus')).toBe('confident');
  });

  it('treats unknown currentStrengthTrainingFrequency as neutral (same as one-to-two/three-to-four)', () => {
    expect(deriveWorkloadReadiness('six-to-eighteen-months', undefined)).toBe(
      deriveWorkloadReadiness('six-to-eighteen-months', 'three-to-four'),
    );
    // Unknown means no adjustment at all (baseline only), not the same as
    // Profile D's explicit 'none' (-1 detraining discount).
    expect(deriveWorkloadReadiness('more-than-18-months', undefined)).toBe('confident');
  });

  it('a short history with high current frequency is not automatically treated as maximally ready', () => {
    // less-than-6-months + five-plus-days should land at 'standard', not 'confident'.
    expect(deriveWorkloadReadiness('less-than-6-months', 'five-plus')).toBe('standard');
  });
});

describe('workloadReadinessRules', () => {
  it('is monotonically non-decreasing across the 4 tiers', () => {
    const tiers = ['minimal', 'building', 'standard', 'confident'] as const;
    for (let i = 1; i < tiers.length; i++) {
      expect(workloadReadinessRules[tiers[i]].volumeMultiplier).toBeGreaterThan(
        workloadReadinessRules[tiers[i - 1]].volumeMultiplier,
      );
      expect(workloadReadinessRules[tiers[i]].maxExercisesPerSession).toBeGreaterThan(
        workloadReadinessRules[tiers[i - 1]].maxExercisesPerSession,
      );
    }
  });
});
