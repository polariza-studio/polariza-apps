import { describe, expect, it } from 'vitest';
import { generatePlan } from './generate-plan';
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

// Covers every pattern full-body-3day's day templates require (squat,
// horizontal-push, horizontal-pull, hinge, vertical-push, core, lunge) so
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
    suitableGoals: ['muscle', 'athletic', 'general-fitness', 'stronger'],
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
    suitableGoals: ['muscle', 'athletic', 'general-fitness', 'stronger'],
    demands,
    technique: technique('dumbbell RDL'),
    trackingMode: 'reps-weight',
  },
  {
    id: 'lunge-1',
    name: 'Bodyweight lunge',
    category: 'strength',
    strengthType: 'compound',
    movementPattern: 'lunge',
    muscles: { primary: ['quadriceps', 'glutes'], secondary: [] },
    equipment: ['bodyweight-only'],
    difficulty: 'beginner',
    suitableGoals: ['muscle', 'athletic', 'general-fitness', 'stronger'],
    demands,
    technique: technique('bodyweight lunge'),
    trackingMode: 'reps-side',
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
    suitableGoals: ['muscle', 'athletic', 'general-fitness', 'stronger'],
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
    suitableGoals: ['muscle', 'athletic', 'general-fitness', 'stronger'],
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
    suitableGoals: ['muscle', 'athletic', 'general-fitness', 'stronger'],
    demands,
    technique: technique('dumbbell shoulder press'),
    trackingMode: 'reps-weight',
  },
  {
    id: 'core-1',
    name: 'Plank',
    category: 'core',
    movementPattern: 'core',
    muscles: { primary: ['core'], secondary: [] },
    equipment: ['bodyweight-only'],
    difficulty: 'beginner',
    suitableGoals: ['muscle', 'athletic', 'general-fitness', 'stronger'],
    demands,
    technique: technique('plank'),
    trackingMode: 'duration',
  },
  // Warm-up/cool-down candidates (rules/warmup-cooldown.ts). full-body-3day's
  // three days all mix lower + push + pull patterns, so these cover every
  // bucket the generated days can hit.
  {
    id: 'leg-swings',
    name: 'Leg swings',
    category: 'warmup',
    movementPattern: 'hinge',
    muscles: { primary: ['hamstrings', 'glutes'], secondary: [] },
    equipment: ['bodyweight-only'],
    difficulty: 'beginner',
    suitableGoals: ['muscle', 'athletic', 'general-fitness', 'stronger'],
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
    suitableGoals: ['muscle', 'athletic', 'general-fitness', 'stronger'],
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
    suitableGoals: ['muscle', 'athletic', 'general-fitness', 'stronger'],
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
    suitableGoals: ['muscle', 'athletic', 'general-fitness', 'stronger'],
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
    suitableGoals: ['muscle', 'athletic', 'general-fitness', 'stronger'],
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
    suitableGoals: ['muscle', 'athletic', 'general-fitness', 'stronger'],
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
    suitableGoals: ['muscle', 'athletic', 'general-fitness', 'stronger'],
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
    suitableGoals: ['muscle', 'athletic', 'general-fitness', 'stronger'],
    demands,
    technique: technique('cross-body shoulder stretch'),
    trackingMode: 'duration-side',
  },
];

const answers: OnboardingAnswers = {
  name: 'Test User',
  goal: 'muscle',
  trainingHistory: 'six-to-eighteen-months',
  currentStrengthTrainingFrequency: 'one-to-two',
  daysPerWeek: 3,
  // 30, not 45: these tests are scoped to full-body-3day specifically
  // (fixtureLibrary's own comment, plus the focus-area test's hardcoded
  // day-0 exercise IDs assume that split's exact day-1 template) — 45+
  // would now be eligible for select-split.ts's prefersWeeklyIntentSplit
  // and pick a different split these fixtures don't cover.
  sessionDuration: 30,
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
    expect(backExercise!.prescription.sets).toBeGreaterThan(otherExercise!.prescription.sets);
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

  it('orders each day primary before secondary before accessory', () => {
    const roleRank = { primary: 0, secondary: 1, accessory: 2 };
    const plan = generatePlan(answers, fixtureLibrary);
    for (const day of plan.days) {
      const ranks = day.exercises.map((e) => roleRank[e.role]);
      const sorted = [...ranks].sort((a, b) => a - b);
      expect(ranks).toEqual(sorted);
    }
  });
});
