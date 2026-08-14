import { describe, expect, it } from 'vitest';
import { validatePlan } from './validate-plan';
import type { Exercise } from '../../domain/exercise';
import type { TrainingDay, TrainingPlan } from '../../domain/plan';

const library: Exercise[] = [
  {
    id: 'squat-1',
    name: 'Squat',
    movementPattern: 'squat',
    muscles: { primary: ['quadriceps'], secondary: [] },
    equipment: [],
    difficulty: 'beginner',
    suitableGoals: ['muscle'],
    technique: { setup: [], execution: [], cues: [], commonMistakes: [] },
  },
];

function planWithDay(overrides: Partial<TrainingDay> = {}): TrainingPlan {
  return {
    id: 'plan-1',
    createdAt: new Date().toISOString(),
    preferences: {
      goal: 'muscle',
      experience: 'some-experience',
      daysPerWeek: 2,
      sessionDuration: 30,
      trainingEnvironment: 'home',
      equipment: [],
      focusAreas: [],
      deprioritizedAreas: [],
      context: [],
    },
    days: [
      {
        id: 'day-1',
        name: 'Full body',
        estimatedDurationMinutes: 30,
        exercises: [{ exerciseId: 'squat-1', sets: 3, repRange: [8, 12], restSeconds: 60 }],
        ...overrides,
      },
    ],
  };
}

describe('validatePlan', () => {
  it('accepts a valid plan', () => {
    expect(validatePlan(planWithDay(), library)).toEqual([]);
  });

  it('rejects a plan with no days', () => {
    const plan = planWithDay();
    plan.days = [];
    expect(validatePlan(plan, library).some((e) => e.includes('no training days'))).toBe(true);
  });

  it('rejects an unknown exercise ID', () => {
    const plan = planWithDay({
      exercises: [{ exerciseId: 'unknown', sets: 3, repRange: [8, 12], restSeconds: 60 }],
    });
    expect(validatePlan(plan, library).some((e) => e.includes('unknown exercise'))).toBe(true);
  });

  it('rejects an empty day', () => {
    const plan = planWithDay({ exercises: [] });
    expect(validatePlan(plan, library).some((e) => e.includes('no exercises'))).toBe(true);
  });

  it('rejects non-positive sets', () => {
    const plan = planWithDay({
      exercises: [{ exerciseId: 'squat-1', sets: 0, repRange: [8, 12], restSeconds: 60 }],
    });
    expect(validatePlan(plan, library).some((e) => e.includes('non-positive sets'))).toBe(true);
  });

  it('rejects an invalid rep range', () => {
    const plan = planWithDay({
      exercises: [{ exerciseId: 'squat-1', sets: 3, repRange: [12, 8], restSeconds: 60 }],
    });
    expect(validatePlan(plan, library).some((e) => e.includes('invalid repRange'))).toBe(true);
  });

  it('rejects negative rest seconds', () => {
    const plan = planWithDay({
      exercises: [{ exerciseId: 'squat-1', sets: 3, repRange: [8, 12], restSeconds: -1 }],
    });
    expect(validatePlan(plan, library).some((e) => e.includes('negative restSeconds'))).toBe(true);
  });
});
