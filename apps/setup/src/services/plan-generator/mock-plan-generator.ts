// Initial PlanGenerator implementation (spec §12): deterministic, no AI
// involved. Delegates to the training engine, injecting the real exercise
// library by default. The library is also constructor-injectable so tests
// can supply their own fixtures independent of the production library.

import type { Exercise } from '../../domain/exercise';
import type { OnboardingAnswers } from '../../domain/onboarding';
import type { TrainingPlan } from '../../domain/plan';
import type { PlanGenerator } from './plan-generator';
import { generatePlan } from '../../training/generator/generate-plan';
import { exerciseLibrary as defaultExerciseLibrary } from '../../training/exercises/exercise-library';

export class MockPlanGenerator implements PlanGenerator {
  private exerciseLibrary: Exercise[];

  constructor(exerciseLibrary: Exercise[] = defaultExerciseLibrary) {
    this.exerciseLibrary = exerciseLibrary;
  }

  async generate(answers: OnboardingAnswers): Promise<TrainingPlan> {
    return generatePlan(answers, this.exerciseLibrary);
  }
}
