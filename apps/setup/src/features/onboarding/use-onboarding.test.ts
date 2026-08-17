import { describe, expect, it } from 'vitest';
import { buildCompletedAnswers, canAdvance } from './use-onboarding';

describe('canAdvance', () => {
  it('gates trainingHistory and currentStrengthTrainingFrequency on being answered', () => {
    expect(canAdvance('trainingHistory', {})).toBe(false);
    expect(canAdvance('trainingHistory', { trainingHistory: 'just-starting' })).toBe(true);
    expect(canAdvance('currentStrengthTrainingFrequency', {})).toBe(false);
    expect(canAdvance('currentStrengthTrainingFrequency', { currentStrengthTrainingFrequency: 'none' })).toBe(true);
  });

  it('gates equipment on having at least one selection', () => {
    expect(canAdvance('equipment', {})).toBe(false);
    expect(canAdvance('equipment', { equipment: ['dumbbells'] })).toBe(true);
  });
});

describe('buildCompletedAnswers', () => {
  const baseDraft = {
    name: 'Test',
    goal: 'muscle' as const,
    trainingHistory: 'more-than-18-months' as const,
    currentStrengthTrainingFrequency: 'three-to-four' as const,
    daysPerWeek: 4 as const,
    sessionDuration: 60 as const,
    trainingEnvironment: 'gym' as const,
  };

  it('persists trainingHistory and currentStrengthTrainingFrequency as their own fields', () => {
    const completed = buildCompletedAnswers(baseDraft);
    expect(completed.trainingHistory).toBe('more-than-18-months');
    expect(completed.currentStrengthTrainingFrequency).toBe('three-to-four');
  });

  it('keeps current training frequency and desired days-per-week as independent fields', () => {
    const completed = buildCompletedAnswers({
      ...baseDraft,
      currentStrengthTrainingFrequency: 'none',
      daysPerWeek: 5,
    });
    // A user who currently trains 0 days/week can still want a 5-day plan
    // — nothing here should couple or overwrite one from the other.
    expect(completed.currentStrengthTrainingFrequency).toBe('none');
    expect(completed.daysPerWeek).toBe(5);
  });

  it('defaults equipment to [] and focusAreas/deprioritizedAreas/context to [] on completion', () => {
    const completed = buildCompletedAnswers(baseDraft);
    expect(completed.equipment).toEqual([]);
    expect(completed.focusAreas).toEqual([]);
    expect(completed.deprioritizedAreas).toEqual([]);
    expect(completed.context).toEqual([]);
  });

  it('preserves an explicit equipment selection for home-track users', () => {
    const completed = buildCompletedAnswers({
      ...baseDraft,
      trainingEnvironment: 'home',
      equipment: ['dumbbells', 'resistance-bands'],
    });
    expect(completed.equipment).toEqual(['dumbbells', 'resistance-bands']);
  });

  it('persists all required answers needed to generate a plan', () => {
    const completed = buildCompletedAnswers(baseDraft);
    expect(completed).toMatchObject({
      name: 'Test',
      goal: 'muscle',
      trainingHistory: 'more-than-18-months',
      currentStrengthTrainingFrequency: 'three-to-four',
      daysPerWeek: 4,
      sessionDuration: 60,
      trainingEnvironment: 'gym',
    });
  });
});
