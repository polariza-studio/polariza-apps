import { describe, expect, it } from 'vitest';
import { selectSplit } from './select-split';
import type { DaysPerWeek, OnboardingAnswers } from '../../domain/onboarding';

function answersWithDays(daysPerWeek: DaysPerWeek): OnboardingAnswers {
  return {
    name: 'Test User',
    goal: 'muscle',
    trainingHistory: 'six-to-eighteen-months',
    currentStrengthTrainingFrequency: 'one-to-two',
    daysPerWeek,
    sessionDuration: 45,
    trainingEnvironment: 'gym',
    equipment: [],
    focusAreas: [],
    deprioritizedAreas: [],
    context: [],
  };
}

describe('selectSplit', () => {
  it('picks a full-body split for 2 days per week', () => {
    expect(selectSplit(answersWithDays(2)).id).toBe('full-body-2day');
  });

  it('picks full-body-3day for 3 days/week when not eligible for the weekly-intent split', () => {
    // Same 3-day frequency as the eligible case below, but each answer
    // fails prefersWeeklyIntentSplit for a different reason.
    expect(selectSplit({ ...answersWithDays(3), trainingHistory: 'just-starting' }).id).toBe('full-body-3day');
    expect(selectSplit({ ...answersWithDays(3), trainingHistory: 'less-than-6-months' }).id).toBe('full-body-3day');
    expect(selectSplit({ ...answersWithDays(3), sessionDuration: 30 }).id).toBe('full-body-3day');
    expect(selectSplit({ ...answersWithDays(3), goal: 'stronger' }).id).toBe('full-body-3day');
  });

  it('picks the weekly-intent split for 3 days/week when trainingHistory/duration/goal allow it', () => {
    expect(selectSplit(answersWithDays(3)).id).toBe('lower-upper-athletic-3day');
  });

  it('picks upper-lower for 4 days and the 5-day hybrid for 5 days per week', () => {
    expect(selectSplit(answersWithDays(4)).id).toBe('upper-lower');
    expect(selectSplit(answersWithDays(5)).id).toBe('upper-lower-push-pull-legs');
  });
});
