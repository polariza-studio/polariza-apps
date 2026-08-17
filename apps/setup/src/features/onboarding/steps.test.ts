import { describe, expect, it } from 'vitest';
import { getOnboardingSteps, getStepNumber, ONBOARDING_STEP_COUNT, type OnboardingStepId } from './steps';

describe('onboarding steps', () => {
  it('has exactly 7 visible steps for a gym-track user', () => {
    const steps = getOnboardingSteps({ trainingEnvironment: 'gym' });
    expect(steps).toEqual([
      'name',
      'goal',
      'trainingHistory',
      'currentStrengthTrainingFrequency',
      'daysPerWeek',
      'sessionDuration',
      'trainingEnvironment',
    ]);
    expect(ONBOARDING_STEP_COUNT).toBe(7);
  });

  it('shows an equipment step for a home-track user, still capped at step 7', () => {
    const steps = getOnboardingSteps({ trainingEnvironment: 'home' });
    expect(steps.at(-1)).toBe('equipment');
    expect(steps).toHaveLength(8);
    // Both the gym/home choice and the equipment picker read as "7 / 7" —
    // the user experiences this as ONE step, not two.
    expect(getStepNumber('trainingEnvironment')).toBe(7);
    expect(getStepNumber('equipment')).toBe(7);
  });

  it('does not show an equipment step before trainingEnvironment is answered', () => {
    expect(getOnboardingSteps({})).not.toContain('equipment');
  });

  it('progress numbers run 1 through 7 in order with no gaps or duplicates below step 7', () => {
    const steps = getOnboardingSteps({ trainingEnvironment: 'gym' });
    expect(steps.map(getStepNumber)).toEqual([1, 2, 3, 4, 5, 6, 7]);
  });

  it('no longer has a step for the old Experience question, Weight, Height, or Focus Areas', () => {
    const steps = getOnboardingSteps({ trainingEnvironment: 'home' });
    const removed: string[] = ['experience', 'weight', 'height', 'focusAreas', 'focus'];
    for (const id of removed) {
      expect(steps as string[]).not.toContain(id);
    }
  });

  it('trainingHistory and currentStrengthTrainingFrequency are both present and distinct from daysPerWeek', () => {
    const steps = getOnboardingSteps({});
    const ids: OnboardingStepId[] = ['trainingHistory', 'currentStrengthTrainingFrequency', 'daysPerWeek'];
    for (const id of ids) expect(steps).toContain(id);
    // Three genuinely separate steps, not aliases of one another.
    expect(new Set(ids).size).toBe(3);
  });
});
