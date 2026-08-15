import { describe, expect, it } from 'vitest';
import { MockPlanGenerator } from './mock-plan-generator';
import type { Exercise } from '../../domain/exercise';
import type { OnboardingAnswers } from '../../domain/onboarding';

function technique(name: string) {
  return {
    setup: [`Set up for ${name}.`],
    execution: [`Perform ${name}.`],
    cues: [`Cue for ${name}.`],
    commonMistakes: [`Mistake to avoid in ${name}.`],
  };
}

const fixtureLibrary: Exercise[] = [
  {
    id: 'squat-1',
    name: 'Goblet squat',
    movementPattern: 'squat',
    muscles: { primary: ['quadriceps', 'glutes'], secondary: [] },
    equipment: ['dumbbells'],
    difficulty: 'beginner',
    suitableGoals: ['stronger'],
    technique: technique('goblet squat'),
  },
  {
    id: 'hinge-1',
    name: 'Dumbbell RDL',
    movementPattern: 'hinge',
    muscles: { primary: ['hamstrings', 'glutes'], secondary: [] },
    equipment: ['dumbbells'],
    difficulty: 'beginner',
    suitableGoals: ['stronger'],
    technique: technique('dumbbell RDL'),
  },
  {
    id: 'push-1',
    name: 'Dumbbell bench press',
    movementPattern: 'horizontal-push',
    muscles: { primary: ['chest', 'triceps'], secondary: [] },
    equipment: ['dumbbells', 'bench'],
    difficulty: 'beginner',
    suitableGoals: ['stronger'],
    technique: technique('dumbbell bench press'),
  },
  {
    id: 'pull-1',
    name: 'Dumbbell row',
    movementPattern: 'horizontal-pull',
    muscles: { primary: ['back'], secondary: ['biceps'] },
    equipment: ['dumbbells'],
    difficulty: 'beginner',
    suitableGoals: ['stronger'],
    technique: technique('dumbbell row'),
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
