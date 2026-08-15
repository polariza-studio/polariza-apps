import { describe, expect, it } from 'vitest';
import { MockPlanGenerator } from './mock-plan-generator';
import type { Exercise } from '../../domain/exercise';
import type { OnboardingAnswers } from '../../domain/onboarding';

function technique(name: string) {
  return {
    description: `Fixture technique for ${name}.`,
    setup: [`Set up for ${name}.`],
    execution: [`Perform ${name}.`],
    cues: [`Cue for ${name}.`],
    commonMistakes: [`Mistake to avoid in ${name}.`],
  };
}

const demands = { technical: 'low', balance: 'low', mobility: 'low', systemic: 'low' } as const;

// Covers every pattern full-body-2day's day templates require (squat,
// horizontal-push, horizontal-pull, hinge, vertical-push, lunge) so
// generation doesn't hard-fail on a missing required pattern.
const fixtureLibrary: Exercise[] = [
  {
    id: 'squat-1',
    name: 'Goblet squat',
    category: 'strength',
    strengthType: 'compound',
    movementPattern: 'squat',
    muscles: { primary: ['quadriceps', 'glutes'], secondary: [] },
    equipment: ['dumbbells'],
    difficulty: 'beginner',
    suitableGoals: ['stronger'],
    demands,
    technique: technique('goblet squat'),
    trackingMode: 'reps-weight',
  },
  {
    id: 'hinge-1',
    name: 'Dumbbell RDL',
    category: 'strength',
    strengthType: 'compound',
    movementPattern: 'hinge',
    muscles: { primary: ['hamstrings', 'glutes'], secondary: [] },
    equipment: ['dumbbells'],
    difficulty: 'beginner',
    suitableGoals: ['stronger'],
    demands,
    technique: technique('dumbbell RDL'),
    trackingMode: 'reps-weight',
  },
  {
    id: 'push-1',
    name: 'Dumbbell bench press',
    category: 'strength',
    strengthType: 'compound',
    movementPattern: 'horizontal-push',
    muscles: { primary: ['chest', 'triceps'], secondary: [] },
    equipment: ['dumbbells', 'bench'],
    difficulty: 'beginner',
    suitableGoals: ['stronger'],
    demands,
    technique: technique('dumbbell bench press'),
    trackingMode: 'reps-weight',
  },
  {
    id: 'pull-1',
    name: 'Dumbbell row',
    category: 'strength',
    strengthType: 'compound',
    movementPattern: 'horizontal-pull',
    muscles: { primary: ['back'], secondary: ['biceps'] },
    equipment: ['dumbbells'],
    difficulty: 'beginner',
    suitableGoals: ['stronger'],
    demands,
    technique: technique('dumbbell row'),
    trackingMode: 'reps-weight',
  },
  {
    id: 'vertical-push-1',
    name: 'Dumbbell shoulder press',
    category: 'strength',
    strengthType: 'compound',
    movementPattern: 'vertical-push',
    muscles: { primary: ['shoulders', 'triceps'], secondary: [] },
    equipment: ['dumbbells'],
    difficulty: 'beginner',
    suitableGoals: ['stronger'],
    demands,
    technique: technique('dumbbell shoulder press'),
    trackingMode: 'reps-weight',
  },
  {
    id: 'lunge-1',
    name: 'Dumbbell walking lunge',
    category: 'strength',
    strengthType: 'compound',
    movementPattern: 'lunge',
    muscles: { primary: ['quadriceps', 'glutes'], secondary: [] },
    equipment: ['dumbbells'],
    difficulty: 'beginner',
    suitableGoals: ['stronger'],
    demands,
    technique: technique('dumbbell walking lunge'),
    trackingMode: 'reps-side',
  },
];

// Gym environment with equipment: [] resolves to rules/equipment.ts's
// standardGymEquipment, which covers all of the fixtures above.
const answers: OnboardingAnswers = {
  name: 'Test User',
  goal: 'stronger',
  experience: 'new',
  daysPerWeek: 2,
  sessionDuration: 30,
  trainingEnvironment: 'gym',
  equipment: [],
  focusAreas: [],
  deprioritizedAreas: [],
  context: [],
};

describe('MockPlanGenerator', () => {
  it('conforms to the PlanGenerator contract and only references known exercise IDs', async () => {
    const generator = new MockPlanGenerator(fixtureLibrary);
    const plan = await generator.generate(answers);
    const knownIds = new Set(fixtureLibrary.map((e) => e.id));

    expect(plan.days.length).toBeGreaterThan(0);
    for (const day of plan.days) {
      expect(day.exercises.length).toBeGreaterThan(0);
      for (const exercise of day.exercises) {
        expect(knownIds.has(exercise.exerciseId)).toBe(true);
      }
    }
  });

  it('produces a valid plan against the real production library by default', async () => {
    const generator = new MockPlanGenerator();
    const plan = await generator.generate(answers);

    expect(plan.days.length).toBeGreaterThan(0);
    for (const day of plan.days) {
      expect(day.exercises.length).toBeGreaterThan(0);
    }
  });
});
