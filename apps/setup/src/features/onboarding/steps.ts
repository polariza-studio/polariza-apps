import type { OnboardingAnswers } from '@/domain/onboarding';

// Matches Paper's actual onboarding flow, audited 2026-08-14 — not the
// original 8-step spec/domain list. Two spec steps have no Paper screen
// and are deliberately deferred, not built yet: "Areas not to prioritize"
// (deprioritizedAreas) and "Relevant context" (context, the injury/
// pregnancy/postpartum safety step). "Name" is new — in Paper, not in the
// original spec — and is included per explicit instruction.
//
// "Focus" (focusAreas) was removed from onboarding 2026-08-17 — product
// decision, not a Paper mismatch: the field/generator capability stays
// (see domain/onboarding.ts), onboarding just no longer asks for it,
// always saving it as [] (see use-onboarding.ts). It remains reachable
// from Adjust Plan.
//
// "weight"/"height" are new 2026-08-17, also with no Paper screen yet —
// see domain/onboarding.ts's comment on why they're collected (a future
// starting-load calibration model, not generic profile data).
//
// `equipment` only applies when `trainingEnvironment` is 'home' (Paper
// counts environment+equipment as one step, shared step number, split
// across two conditional screens).
export type OnboardingStepId =
  | 'name'
  | 'weight'
  | 'height'
  | 'goal'
  | 'experience'
  | 'daysPerWeek'
  | 'sessionDuration'
  | 'trainingEnvironment'
  | 'equipment';

// Step counter ("N of 8") groups trainingEnvironment/equipment as a
// single number — this maps each OnboardingStepId to the position shown
// in that counter, not to its index in the steps array.
export const ONBOARDING_STEP_COUNT = 8;

const STEP_NUMBERS: Record<OnboardingStepId, number> = {
  name: 1,
  weight: 2,
  height: 3,
  goal: 4,
  experience: 5,
  daysPerWeek: 6,
  sessionDuration: 7,
  trainingEnvironment: 8,
  equipment: 8,
};

export function getStepNumber(stepId: OnboardingStepId): number {
  return STEP_NUMBERS[stepId];
}

export function getOnboardingSteps(answers: Partial<OnboardingAnswers>): OnboardingStepId[] {
  const steps: OnboardingStepId[] = [
    'name',
    'weight',
    'height',
    'goal',
    'experience',
    'daysPerWeek',
    'sessionDuration',
    'trainingEnvironment',
  ];
  if (answers.trainingEnvironment === 'home') steps.push('equipment');
  return steps;
}
