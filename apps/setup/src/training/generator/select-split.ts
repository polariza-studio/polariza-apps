// Stage 1: pick a weekly split for the user's training frequency, with an
// optional goal-specific override where rules/frequency.ts defines one.
//
// WEEK INTENT lives here: which archetype (interchangeable full-body days
// vs. a deliberate lower/upper/athletic week) — SESSION COMPOSITION
// (which exercises actually serve that intent) is downstream, in
// assign-movement-patterns.ts / select-exercises.ts.

import type { OnboardingAnswers } from '../../domain/onboarding';
import type { SplitDefinition } from '../rules/splits';
import { allowedSplitsByFrequency, splitOverridesByGoal } from '../rules/frequency';
import { splitDefinitions } from '../rules/splits';

export function selectSplit(answers: OnboardingAnswers): SplitDefinition {
  const override = splitOverridesByGoal[answers.goal]?.[answers.daysPerWeek];
  if (override) return splitDefinitions[override];

  if (prefersWeeklyIntentSplit(answers)) {
    return splitDefinitions['lower-upper-athletic-3day'];
  }

  const [defaultSplitId] = allowedSplitsByFrequency[answers.daysPerWeek];
  return splitDefinitions[defaultSplitId];
}

// The richer lower/upper/athletic-full-body archetype (splits.ts) is
// selected instead of the default full-body-3day only when the user has
// enough training background and session time to actually use it —
// otherwise its longer, less-templated Athletic Full Body day would just
// get trimmed back down or padded, which isn't the point of offering a
// second archetype at all. Goal-agnostic beyond that, except 'stronger':
// the value here is weekly day-intent structure and session depth,
// which benefits most goals, but 'stronger' is already well served by
// the leaner, primary-lift-focused full-body-3day and shouldn't be
// nudged toward a higher-exercise-count week just because one exists.
function prefersWeeklyIntentSplit(answers: OnboardingAnswers): boolean {
  return (
    answers.daysPerWeek === 3 &&
    answers.experience !== 'new' &&
    answers.sessionDuration >= 45 &&
    answers.goal !== 'stronger'
  );
}
