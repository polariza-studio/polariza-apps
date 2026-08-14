// Stage 1: pick a weekly split for the user's training frequency.

import type { OnboardingAnswers } from '../../domain/onboarding';
import type { SplitDefinition } from '../rules/splits';
import { allowedSplitsByFrequency } from '../rules/frequency';
import { splitDefinitions } from '../rules/splits';

export function selectSplit(answers: OnboardingAnswers): SplitDefinition {
  const [splitId] = allowedSplitsByFrequency[answers.daysPerWeek];
  return splitDefinitions[splitId];
}
