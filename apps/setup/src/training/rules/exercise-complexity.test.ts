import { describe, expect, it } from 'vitest';
import { complexityRules } from './exercise-complexity';

describe('complexityRules', () => {
  it('caps difficulty ceiling at beginner for the two shortest history tiers', () => {
    expect(complexityRules['just-starting'].maxDifficulty).toBe('beginner');
    expect(complexityRules['less-than-6-months'].maxDifficulty).toBe('beginner');
  });

  it('raises the ceiling for six-to-eighteen-months and more-than-18-months', () => {
    expect(complexityRules['six-to-eighteen-months'].maxDifficulty).toBe('intermediate');
    expect(complexityRules['more-than-18-months'].maxDifficulty).toBe('advanced');
  });

  it('grades stabilityWeight across all 4 tiers, not a binary just-starting/other split', () => {
    expect(complexityRules['just-starting'].stabilityWeight).toBeGreaterThan(
      complexityRules['less-than-6-months'].stabilityWeight,
    );
    expect(complexityRules['less-than-6-months'].stabilityWeight).toBeGreaterThan(0);
    expect(complexityRules['six-to-eighteen-months'].stabilityWeight).toBe(0);
    expect(complexityRules['more-than-18-months'].stabilityWeight).toBe(0);
  });
});
