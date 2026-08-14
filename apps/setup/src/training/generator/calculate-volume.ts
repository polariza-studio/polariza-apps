// Stage 2: derive a base sets-per-exercise count from goal + experience.

import type { OnboardingAnswers } from '../../domain/onboarding';
import { goalRules } from '../rules/goals';
import { experienceRules } from '../rules/experience';

export function calculateVolume(answers: OnboardingAnswers): number {
  const base = goalRules[answers.goal].setsPerExercise;
  const multiplier = experienceRules[answers.experience].volumeMultiplier;
  return Math.max(1, Math.round(base * multiplier));
}
