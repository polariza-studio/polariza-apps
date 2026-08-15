import { describe, expect, it } from 'vitest';
import { selectSplit } from './select-split';
import type { DaysPerWeek, OnboardingAnswers } from '../../domain/onboarding';

function answersWithDays(daysPerWeek: DaysPerWeek): OnboardingAnswers {
  return {
    name: 'Test User',
    goal: 'muscle',
    experience: 'some-experience',
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
  it('picks a full-body split for 2 and 3 days per week', () => {
    expect(selectSplit(answersWithDays(2)).id).toBe('full-body-2day');
    expect(selectSplit(answersWithDays(3)).id).toBe('full-body-3day');
  });

  it('picks upper-lower for 4 days and the 5-day hybrid for 5 days per week', () => {
    expect(selectSplit(answersWithDays(4)).id).toBe('upper-lower');
    expect(selectSplit(answersWithDays(5)).id).toBe('upper-lower-push-pull-legs');
  });
});
