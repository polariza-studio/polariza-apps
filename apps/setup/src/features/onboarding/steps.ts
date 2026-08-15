import type { OnboardingAnswers } from '@/domain/onboarding';

// Matches Paper's actual onboarding flow (7 steps), audited 2026-08-14 —
// not the original 8-step spec/domain list. Two spec steps have no Paper
// screen and are deliberately deferred, not built yet: "Areas not to
// prioritize" (deprioritizedAreas) and "Relevant context" (context, the
// injury/pregnancy/postpartum safety step). "Name" is new — in Paper, not
// in the original spec — and is included per explicit instruction.
// `equipment` only applies when `trainingEnvironment` is 'home' (Paper
// counts environment+equipment as one step, "6 of 7", split across two
// conditional screens).
export type OnboardingStepId =
  | 'name'
  | 'goal'
  | 'experience'
  | 'daysPerWeek'
  | 'sessionDuration'
  | 'trainingEnvironment'
  | 'equipment'
  | 'focusAreas';

// Paper's step counter ("N of 7") groups trainingEnvironment/equipment as a
// single number — this maps each OnboardingStepId to the position shown in
// that counter, not to its index in the steps array.
export const ONBOARDING_STEP_COUNT = 7;

const STEP_NUMBERS: Record<OnboardingStepId, number> = {
  name: 1,
  goal: 2,
  experience: 3,
  daysPerWeek: 4,
  sessionDuration: 5,
  trainingEnvironment: 6,
  equipment: 6,
  focusAreas: 7,
};

export function getStepNumber(stepId: OnboardingStepId): number {
  return STEP_NUMBERS[stepId];
}

export function getOnboardingSteps(answers: Partial<OnboardingAnswers>): OnboardingStepId[] {
  const steps: OnboardingStepId[] = [
    'name',
    'goal',
    'experience',
    'daysPerWeek',
    'sessionDuration',
    'trainingEnvironment',
  ];
  if (answers.trainingEnvironment === 'home') steps.push('equipment');
  steps.push('focusAreas');
  return steps;
}
