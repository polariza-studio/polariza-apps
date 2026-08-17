import { describe, expect, it } from 'vitest';
import { formatSuggestedLoad, resolveInitialWeight, resolveInitialWeightDisplay } from './active-workout';
import type { Activity } from '@/domain/activity';
import type { Exercise, SuggestedLoad } from '@/domain/exercise';
import type { ExercisePrescription } from '@/domain/plan';

const prescription: ExercisePrescription = {
  mode: 'reps-weight',
  sets: 3,
  repRange: [8, 12],
  restSeconds: 90,
  targetRir: [1, 3],
  suggestedLoad: { type: 'two-dumbbells', weightPerDumbbell: 12, unit: 'kg' },
};

function activityWithSet(weight: number, completed: boolean, completedAt: string): Activity {
  return {
    id: 'a1',
    planId: 'plan-1',
    trainingDayId: 'day-1',
    startedAt: completedAt,
    completedAt,
    durationSeconds: 600,
    warmup: [],
    cooldown: [],
    exercises: [
      {
        exerciseId: 'dumbbell-rdl',
        sets: [{ mode: 'reps-weight', setNumber: 1, completed, reps: 10, weight }],
      },
    ],
  };
}

describe('resolveInitialWeight', () => {
  it('ignores an incomplete set and falls back to the curated suggestedLoad', () => {
    const activities = [activityWithSet(14, false, '2026-08-19T10:00:00.000Z')];
    expect(resolveInitialWeight('dumbbell-rdl', 1, undefined, prescription, activities)).toBe(12);
  });

  it('uses a completed set from history over the curated suggestedLoad', () => {
    const activities = [activityWithSet(14, true, '2026-08-19T10:00:00.000Z')];
    expect(resolveInitialWeight('dumbbell-rdl', 1, undefined, prescription, activities)).toBe(14);
  });

  it('falls back to suggestedLoad when no activities exist at all', () => {
    expect(resolveInitialWeight('dumbbell-rdl', 1, undefined, prescription, [])).toBe(12);
  });
});

describe('formatSuggestedLoad', () => {
  it('matches the approved formats exactly for every load type', () => {
    expect(formatSuggestedLoad({ type: 'two-dumbbells', weightPerDumbbell: 8, unit: 'kg' })).toBe('2 × 8 kg');
    expect(formatSuggestedLoad({ type: 'single-dumbbell', weight: 12, unit: 'kg' })).toBe('12 kg');
    expect(formatSuggestedLoad({ type: 'barbell', weight: 40, unit: 'kg' })).toBe('40 kg total');
    expect(formatSuggestedLoad({ type: 'machine', weight: 30, unit: 'kg' })).toBe('30 kg');
    expect(formatSuggestedLoad({ type: 'cable', weight: 20, unit: 'kg' })).toBe('20 kg');
    expect(formatSuggestedLoad({ type: 'bodyweight' })).toBeUndefined();
  });
});

describe('resolveInitialWeightDisplay', () => {
  const exercise: Exercise = {
    id: 'dumbbell-rdl',
    name: 'Dumbbell Romanian deadlift',
    category: 'strength',
    strengthType: 'compound',
    movementPattern: 'hinge',
    muscles: { primary: ['hamstrings', 'glutes'], secondary: [] },
    equipment: ['dumbbells'],
    difficulty: 'beginner',
    suitableGoals: ['muscle'],
    demands: { technical: 'low', balance: 'low', mobility: 'low', systemic: 'low' },
    technique: { description: '', setup: [], execution: [], cues: [], commonMistakes: [] },
    trackingMode: 'reps-weight',
    startingLoad: { type: 'two-dumbbells', weightPerDumbbell: 12, unit: 'kg' } satisfies SuggestedLoad,
  };

  it('preserves the two-dumbbells format through resolution, whether from history or the reference', () => {
    expect(resolveInitialWeightDisplay(exercise, 1, undefined, prescription, [])).toBe('2 × 12 kg');
    const activities = [activityWithSet(14, true, '2026-08-19T10:00:00.000Z')];
    expect(resolveInitialWeightDisplay(exercise, 1, undefined, prescription, activities)).toBe('2 × 14 kg');
  });
});
