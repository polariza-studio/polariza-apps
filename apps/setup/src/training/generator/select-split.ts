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
// enough training BACKGROUND and session time to actually use it —
// otherwise its longer, less-templated Athletic Full Body day would just
// get trimmed back down or padded, which isn't the point of offering a
// second archetype at all. trainingHistory-only gate (not
// InitialWorkloadReadiness, changed 2026-08-19): this is fundamentally
// about accumulated movement-pattern/technique breadth (the Athletic day
// mixes hinge+unilateral+pull+push+carry in one session), not workload
// tolerance — a user training 5 days/week on a short history still
// shouldn't get steered here just because their current frequency is
// high. Requires at least six-to-eighteen-months, matching the same
// grouping the legacy-experience bridge already used ('just-starting'
// and 'less-than-6-months' both mapped to the old 'new' tier). Goal-
// agnostic beyond that, except 'stronger': the value here is weekly
// day-intent structure and session depth, which benefits most goals, but
// 'stronger' is already well served by the leaner, primary-lift-focused
// full-body-3day and shouldn't be nudged toward a higher-exercise-count
// week just because one exists.
function prefersWeeklyIntentSplit(answers: OnboardingAnswers): boolean {
  return (
    answers.daysPerWeek === 3 &&
    (answers.trainingHistory === 'six-to-eighteen-months' || answers.trainingHistory === 'more-than-18-months') &&
    answers.sessionDuration >= 45 &&
    answers.goal !== 'stronger'
  );
}
