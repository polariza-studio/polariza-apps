// Stage 1: pick a weekly split for the user's training frequency, with an
// optional goal-specific override where rules/frequency.ts defines one.

import type { OnboardingAnswers } from '../../domain/onboarding';
import type { SplitDefinition } from '../rules/splits';
import { allowedSplitsByFrequency, splitOverridesByGoal } from '../rules/frequency';
import { splitDefinitions } from '../rules/splits';

export function selectSplit(answers: OnboardingAnswers): SplitDefinition {
  const override = splitOverridesByGoal[answers.goal]?.[answers.daysPerWeek];
  const [defaultSplitId] = allowedSplitsByFrequency[answers.daysPerWeek];
  return splitDefinitions[override ?? defaultSplitId];
}
