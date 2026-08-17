import type { OnboardingAnswers } from '@/domain/onboarding';

// Matches Paper's actual onboarding flow. Redesigned 2026-08-18: the old
// subjective "Experience" question was replaced by two observable
// questions (`trainingHistory`, `currentStrengthTrainingFrequency`), and
// the old "weight"/"height" steps (added 2026-08-17 for a starting-load
// calibration model that was never built, and never consumed by
// anything) were dropped along with them — see domain/onboarding.ts's
// comment on `TrainingHistory` (the legacy `experience`/`ExperienceLevel`
// field itself was fully removed 2026-08-19 once the generator finished
// migrating to trainingHistory/currentStrengthTrainingFrequency). "Focus" (focusAreas)
// stays removed, as it already was before this redesign (2026-08-17):
// the field/generator capability is untouched, onboarding just doesn't
// ask for it — it remains reachable from Adjust Plan. Two spec steps
// still have no Paper screen and are deliberately deferred, not built:
// "Areas not to prioritize" (deprioritizedAreas) and "Relevant context"
// (context, the injury/pregnancy/postpartum safety step).
//
// `equipment` only applies when `trainingEnvironment` is 'home' (Paper
// counts environment+equipment as one step, shared step number, split
// across two conditional screens) — same pattern used before this
// redesign, unchanged.
export type OnboardingStepId =
  | 'name'
  | 'goal'
  | 'trainingHistory'
  | 'currentStrengthTrainingFrequency'
  | 'daysPerWeek'
  | 'sessionDuration'
  | 'trainingEnvironment'
  | 'equipment';

// Step counter ("N of 7") groups trainingEnvironment/equipment as a
// single number — this maps each OnboardingStepId to the position shown
// in that counter, not to its index in the steps array.
export const ONBOARDING_STEP_COUNT = 7;

const STEP_NUMBERS: Record<OnboardingStepId, number> = {
  name: 1,
  goal: 2,
  trainingHistory: 3,
  currentStrengthTrainingFrequency: 4,
  daysPerWeek: 5,
  sessionDuration: 6,
  trainingEnvironment: 7,
  equipment: 7,
};

export function getStepNumber(stepId: OnboardingStepId): number {
  return STEP_NUMBERS[stepId];
}

export function getOnboardingSteps(answers: Partial<OnboardingAnswers>): OnboardingStepId[] {
  const steps: OnboardingStepId[] = [
    'name',
    'goal',
    'trainingHistory',
    'currentStrengthTrainingFrequency',
    'daysPerWeek',
    'sessionDuration',
    'trainingEnvironment',
  ];
  if (answers.trainingEnvironment === 'home') steps.push('equipment');
  return steps;
}
