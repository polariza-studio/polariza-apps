// Stage 3: expand the split into one entry per training day, cycling the
// split's day templates to fill daysPerWeek, with one movement-pattern slot
// per exercise the day should contain (bounded by duration constraints).

import type { OnboardingAnswers } from '../../domain/onboarding';
import type { MovementPattern } from '../../domain/exercise';
import type { SplitDefinition } from '../rules/splits';
import { durationConstraints } from '../rules/duration';

export type DayMovementPlan = {
  name: string;
  patterns: MovementPattern[];
};

export function assignMovementPatterns(
  split: SplitDefinition,
  answers: OnboardingAnswers,
): DayMovementPlan[] {
  const { minExercises, maxExercises } = durationConstraints[answers.sessionDuration];
  const days: DayMovementPlan[] = [];

  for (let i = 0; i < answers.daysPerWeek; i++) {
    const template = split.days[i % split.days.length];
    days.push({
      name: template.name,
      patterns: fillPatterns(template.emphasis, minExercises, maxExercises),
    });
  }

  return days;
}

function fillPatterns(
  emphasis: MovementPattern[],
  minExercises: number,
  maxExercises: number,
): MovementPattern[] {
  const target = Math.min(Math.max(emphasis.length, minExercises), maxExercises);
  const patterns: MovementPattern[] = [];
  for (let i = 0; i < target; i++) {
    patterns.push(emphasis[i % emphasis.length]);
  }
  return patterns;
}
