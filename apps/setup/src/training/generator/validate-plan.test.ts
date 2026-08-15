import { describe, expect, it } from 'vitest';
import { validatePlan } from './validate-plan';
import type { Exercise } from '../../domain/exercise';
import type { PlannedExercise, TrainingDay, TrainingPlan } from '../../domain/plan';
import type { SplitDefinition } from '../rules/splits';

const demands = { technical: 'low', balance: 'low', mobility: 'low', systemic: 'low' } as const;

const library: Exercise[] = [
  {
    id: 'squat-1',
    name: 'Squat',
    category: 'strength',
    strengthType: 'compound',
    movementPattern: 'squat',
    muscles: { primary: ['quadriceps'], secondary: [] },
    equipment: [],
    difficulty: 'beginner',
    suitableGoals: ['muscle'],
    demands,
    technique: { description: 'A squat.', setup: [], execution: [], cues: [], commonMistakes: [] },
    trackingMode: 'reps-weight',
  },
  {
    id: 'advanced-lift',
    name: 'Advanced barbell lift',
    category: 'strength',
    strengthType: 'compound',
    movementPattern: 'squat',
    muscles: { primary: ['quadriceps'], secondary: [] },
    equipment: ['barbell'],
    difficulty: 'advanced',
    suitableGoals: ['muscle'],
    demands,
    technique: { description: 'An advanced lift.', setup: [], execution: [], cues: [], commonMistakes: [] },
    trackingMode: 'reps-weight',
  },
];

// A single-day split requiring only 'squat' — matches the fixture plans
// below, which only ever exercise the squat pattern.
const split: SplitDefinition = {
  id: 'full-body-2day',
  days: [
    { name: 'Full Body A', primaryPattern: 'squat', secondaryPatterns: [], optionalPatterns: [] },
  ],
};

function reps(overrides: Partial<Extract<PlannedExercise['prescription'], { mode: 'reps-weight' }>> = {}) {
  return {
    mode: 'reps-weight' as const,
    sets: 3,
    repRange: [8, 12] as [number, number],
    restSeconds: 60,
    ...overrides,
  };
}

function planWithDay(overrides: Partial<TrainingDay> = {}): TrainingPlan {
  return {
    id: 'plan-1',
    createdAt: new Date().toISOString(),
    preferences: {
      name: 'Test User',
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
        name: 'Full Body A',
        estimatedDurationMinutes: 15,
        exercises: [{ exerciseId: 'squat-1', role: 'primary', prescription: reps() }],
        ...overrides,
      },
    ],
  };
}

describe('validatePlan', () => {
  it('accepts a valid plan with no errors or warnings', () => {
    const result = validatePlan(planWithDay(), library, split);
    expect(result.errors).toEqual([]);
  });

  it('rejects a plan with no days', () => {
    const plan = planWithDay();
    plan.days = [];
    expect(validatePlan(plan, library, split).errors.some((e) => e.includes('no training days'))).toBe(true);
  });

  it('rejects an unknown exercise ID', () => {
    const plan = planWithDay({
      exercises: [{ exerciseId: 'unknown', role: 'primary', prescription: reps() }],
    });
    expect(validatePlan(plan, library, split).errors.some((e) => e.includes('unknown exercise'))).toBe(true);
  });

  it('rejects an empty day', () => {
    const plan = planWithDay({ exercises: [] });
    expect(validatePlan(plan, library, split).errors.some((e) => e.includes('no exercises'))).toBe(true);
  });

  it('rejects non-positive sets', () => {
    const plan = planWithDay({
      exercises: [{ exerciseId: 'squat-1', role: 'primary', prescription: reps({ sets: 0 }) }],
    });
    expect(validatePlan(plan, library, split).errors.some((e) => e.includes('non-positive sets'))).toBe(true);
  });

  it('rejects an invalid rep range', () => {
    const plan = planWithDay({
      exercises: [{ exerciseId: 'squat-1', role: 'primary', prescription: reps({ repRange: [12, 8] }) }],
    });
    expect(validatePlan(plan, library, split).errors.some((e) => e.includes('invalid repRange'))).toBe(true);
  });

  it('rejects negative rest seconds', () => {
    const plan = planWithDay({
      exercises: [{ exerciseId: 'squat-1', role: 'primary', prescription: reps({ restSeconds: -1 }) }],
    });
    expect(validatePlan(plan, library, split).errors.some((e) => e.includes('negative restSeconds'))).toBe(true);
  });

  it('rejects an exercise above the experience ceiling', () => {
    const plan = planWithDay({
      exercises: [{ exerciseId: 'advanced-lift', role: 'primary', prescription: reps() }],
    });
    expect(
      validatePlan(plan, library, split).errors.some((e) => e.includes("exceeds the user's experience level")),
    ).toBe(true);
  });

  it('rejects an exercise requiring equipment the user does not have', () => {
    const plan = planWithDay();
    plan.preferences.experience = 'experienced';
    plan.days[0].exercises = [{ exerciseId: 'advanced-lift', role: 'primary', prescription: reps() }];
    expect(
      validatePlan(plan, library, split).errors.some((e) => e.includes("equipment the user doesn't have")),
    ).toBe(true);
  });

  it('rejects a day missing a required movement pattern', () => {
    const noPatternLibrary: Exercise[] = [
      { ...library[0], id: 'other', movementPattern: 'hinge' },
    ];
    const plan = planWithDay({
      exercises: [{ exerciseId: 'other', role: 'primary', prescription: reps() }],
    });
    expect(
      validatePlan(plan, noPatternLibrary, split).errors.some((e) => e.includes('missing its required')),
    ).toBe(true);
  });

  it('rejects a day estimated well over the session-duration constraint', () => {
    const plan = planWithDay({ estimatedDurationMinutes: 90 });
    expect(
      validatePlan(plan, library, split).errors.some((e) => e.includes('exceeding the')),
    ).toBe(true);
  });
});
