import { describe, expect, it } from 'vitest';
import { generatePlan } from './generate-plan';
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
    suitableGoals: ['muscle', 'athletic', 'general-fitness', 'stronger'],
    technique: technique('goblet squat'),
  },
  {
    id: 'hinge-1',
    name: 'Dumbbell RDL',
    movementPattern: 'hinge',
    muscles: { primary: ['hamstrings', 'glutes'], secondary: [] },
    equipment: ['dumbbells'],
    difficulty: 'beginner',
    suitableGoals: ['muscle', 'athletic', 'general-fitness', 'stronger'],
    technique: technique('dumbbell RDL'),
  },
  {
    id: 'push-1',
    name: 'Dumbbell bench press',
    movementPattern: 'horizontal-push',
    muscles: { primary: ['chest', 'triceps'], secondary: [] },
    equipment: ['dumbbells', 'bench'],
    difficulty: 'beginner',
    suitableGoals: ['muscle', 'athletic', 'general-fitness', 'stronger'],
    technique: technique('dumbbell bench press'),
  },
  {
    id: 'pull-1',
    name: 'Dumbbell row',
    movementPattern: 'horizontal-pull',
    muscles: { primary: ['back'], secondary: ['biceps'] },
    equipment: ['dumbbells'],
    difficulty: 'beginner',
    suitableGoals: ['muscle', 'athletic', 'general-fitness', 'stronger'],
    technique: technique('dumbbell row'),
  },
  {
    id: 'core-1',
    name: 'Plank',
    movementPattern: 'core',
    muscles: { primary: ['core'], secondary: [] },
    equipment: [],
    difficulty: 'beginner',
    suitableGoals: ['muscle', 'athletic', 'general-fitness', 'stronger'],
    technique: technique('plank'),
  },
];

const answers: OnboardingAnswers = {
  name: 'Test User',
  goal: 'muscle',
  experience: 'some-experience',
  daysPerWeek: 3,
  sessionDuration: 45,
  trainingEnvironment: 'home',
  equipment: ['dumbbells', 'bench'],
  focusAreas: ['back'],
  deprioritizedAreas: [],
  context: [],
};

describe('generatePlan', () => {
  it('produces a structurally valid plan referencing only known exercises', () => {
    const plan = generatePlan(answers, fixtureLibrary);
    expect(plan.days).toHaveLength(3);
    for (const day of plan.days) {
      expect(day.exercises.length).toBeGreaterThan(0);
      for (const exercise of day.exercises) {
        expect(fixtureLibrary.some((e) => e.id === exercise.exerciseId)).toBe(true);
      }
    }
  });

  it('gives extra volume to an exercise hitting a focus area', () => {
    const plan = generatePlan(answers, fixtureLibrary);
    const backExercise = plan.days[0].exercises.find((e) => e.exerciseId === 'pull-1');
    const otherExercise = plan.days[0].exercises.find((e) => e.exerciseId === 'squat-1');
    expect(backExercise).toBeDefined();
    expect(otherExercise).toBeDefined();
    expect(backExercise!.sets).toBeGreaterThan(otherExercise!.sets);
  });

  it('is deterministic in its programming logic for the same input', () => {
    const first = generatePlan(answers, fixtureLibrary);
    const second = generatePlan(answers, fixtureLibrary);
    // id/createdAt are plan metadata (identity/timestamp), not programming
    // output, so they're excluded from this comparison by design — a fresh
    // plan is expected to get a new identity each time it's generated.
    expect(second.days).toEqual(first.days);
    expect(second.preferences).toEqual(first.preferences);
  });

  it('produces identical days regardless of context (spec §4.1 step 8 safety guarantee)', () => {
    const withoutContext = generatePlan(answers, fixtureLibrary);
    const withContext = generatePlan({ ...answers, context: ['injury'] }, fixtureLibrary);
    expect(withContext.days).toEqual(withoutContext.days);
  });
});
