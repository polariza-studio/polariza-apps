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
  // Warm-up/cool-down candidates (rules/warmup-cooldown.ts). full-body-2day's
  // days cover lower + push (+pull on Full Body A) patterns.
  {
    id: 'leg-swings',
    name: 'Leg swings',
    category: 'warmup',
    movementPattern: 'hinge',
    muscles: { primary: ['hamstrings', 'glutes'], secondary: [] },
    equipment: ['bodyweight-only'],
    difficulty: 'beginner',
    suitableGoals: ['stronger'],
    demands,
    technique: technique('leg swings'),
    trackingMode: 'reps-side',
  },
  {
    id: 'arm-circles',
    name: 'Arm circles',
    category: 'warmup',
    movementPattern: 'shoulder-abduction',
    muscles: { primary: ['shoulders'], secondary: [] },
    equipment: ['bodyweight-only'],
    difficulty: 'beginner',
    suitableGoals: ['stronger'],
    demands,
    technique: technique('arm circles'),
    trackingMode: 'duration',
  },
  {
    id: 'scapular-push-up',
    name: 'Scapular push-up',
    category: 'warmup',
    movementPattern: 'horizontal-push',
    muscles: { primary: ['back'], secondary: ['shoulders'] },
    equipment: ['bodyweight-only'],
    difficulty: 'beginner',
    suitableGoals: ['stronger'],
    demands,
    technique: technique('scapular push-up'),
    trackingMode: 'reps',
  },
  {
    id: 'dead-bug',
    name: 'Dead bug',
    category: 'core',
    movementPattern: 'core',
    muscles: { primary: ['core'], secondary: [] },
    equipment: ['bodyweight-only'],
    difficulty: 'beginner',
    suitableGoals: ['stronger'],
    demands,
    technique: technique('dead bug'),
    trackingMode: 'reps-side',
  },
  {
    id: 'standing-quad-stretch',
    name: 'Standing quad stretch',
    category: 'cooldown',
    movementPattern: 'squat',
    muscles: { primary: ['quadriceps'], secondary: [] },
    equipment: ['bodyweight-only'],
    difficulty: 'beginner',
    suitableGoals: ['stronger'],
    demands,
    technique: technique('standing quad stretch'),
    trackingMode: 'duration-side',
  },
  {
    id: 'hamstring-stretch',
    name: 'Standing hamstring stretch',
    category: 'cooldown',
    movementPattern: 'hinge',
    muscles: { primary: ['hamstrings'], secondary: [] },
    equipment: ['bodyweight-only'],
    difficulty: 'beginner',
    suitableGoals: ['stronger'],
    demands,
    technique: technique('standing hamstring stretch'),
    trackingMode: 'duration-side',
  },
  {
    id: 'chest-stretch',
    name: 'Chest stretch',
    category: 'cooldown',
    movementPattern: 'horizontal-push',
    muscles: { primary: ['chest'], secondary: ['shoulders'] },
    equipment: ['bodyweight-only'],
    difficulty: 'beginner',
    suitableGoals: ['stronger'],
    demands,
    technique: technique('chest stretch'),
    trackingMode: 'duration-side',
  },
  {
    id: 'cross-body-shoulder-stretch',
    name: 'Cross-body shoulder stretch',
    category: 'cooldown',
    movementPattern: 'horizontal-pull',
    muscles: { primary: ['shoulders'], secondary: ['back'] },
    equipment: ['bodyweight-only'],
    difficulty: 'beginner',
    suitableGoals: ['stronger'],
    demands,
    technique: technique('cross-body shoulder stretch'),
    trackingMode: 'duration-side',
  },
];

// Gym environment with equipment: [] resolves to rules/equipment.ts's
// standardGymEquipment, which covers all of the fixtures above.
const answers: OnboardingAnswers = {
  name: 'Test User',
  goal: 'stronger',
  trainingHistory: 'just-starting',
  currentStrengthTrainingFrequency: 'none',
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
