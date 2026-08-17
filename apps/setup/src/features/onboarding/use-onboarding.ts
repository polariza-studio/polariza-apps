import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import type { OnboardingAnswers } from '@/domain/onboarding';
import { storageRepository } from '@/services/storage';

import { getOnboardingSteps, type OnboardingStepId } from './steps';

type Draft = Partial<OnboardingAnswers>;

// Single-select steps require a value. "equipment" requires at least one
// selection when it's shown (it only shows for home users; "Bodyweight
// only" is itself a valid equipment choice for someone with none). "name"
// requires a non-blank value — Paper's field has no stated max length or
// format. Exported for direct unit testing (no React rendering needed).
export function canAdvance(stepId: OnboardingStepId, answers: Draft): boolean {
  switch (stepId) {
    case 'name':
      return (answers.name?.trim().length ?? 0) > 0;
    case 'goal':
      return answers.goal !== undefined;
    case 'trainingHistory':
      return answers.trainingHistory !== undefined;
    case 'currentStrengthTrainingFrequency':
      return answers.currentStrengthTrainingFrequency !== undefined;
    case 'daysPerWeek':
      return answers.daysPerWeek !== undefined;
    case 'sessionDuration':
      return answers.sessionDuration !== undefined;
    case 'trainingEnvironment':
      return answers.trainingEnvironment !== undefined;
    case 'equipment':
      return (answers.equipment?.length ?? 0) > 0;
  }
}

// Steps with no visible "Continue" button in Paper (Goal/Training history/
// Current training/Days/Time/Environment) advance as soon as an option is
// tapped — confirmed by their absence of any button node in Paper across
// every screen checked. Name and Equipment keep an explicit Continue/
// Create-my-plan button (free text entry and multi-select respectively —
// there's no tappable "option" to auto-advance on for either).
const AUTO_ADVANCE_STEPS: ReadonlySet<OnboardingStepId> = new Set([
  'goal',
  'trainingHistory',
  'currentStrengthTrainingFrequency',
  'daysPerWeek',
  'sessionDuration',
  'trainingEnvironment',
]);

// Auto-advance now waits this long before moving on, so the tapped
// SingleSelectRow has a moment to render its selected state (lime tint +
// outline, added to Paper 2026-08-15) before the screen changes — without
// it, `setAnswers`/`setStepIndex` land in the same tick and the selection
// is never visible. It's also why the selection has to live in `answers`
// rather than transient local state in the row: going Back afterward
// re-derives `selected` from the same answer, so a previously-picked
// option still reads as selected.
const AUTO_ADVANCE_DELAY_MS = 200;

// focusAreas/deprioritizedAreas/context have no screen (focusAreas
// deliberately removed from onboarding 2026-08-17 — product decision, not
// a deferred build; the other two are deferred, see steps.ts) — always
// saved empty, not left undefined, since the rest of the domain
// (generator, safety rules, Adjust Plan) depends on them existing. This is
// the neutral/no-focus state the generator already expects, not an
// invented default. equipment is only ever asked for 'home' users (see
// steps.ts) — defaulted the same way for 'gym' users, rather than left
// undefined, so every saved OnboardingAnswers actually satisfies its type.
// The generator now reads trainingHistory/currentStrengthTrainingFrequency
// directly (training/rules/workload-readiness.ts,
// training/rules/exercise-complexity.ts) — no legacy `experience` field
// exists anymore, nothing to derive here.
//
// Module-scope (not inside useOnboarding) and exported so it's directly
// unit-testable without rendering React. canAdvance guarantees
// `finalAnswers.trainingHistory` is set by the time this runs —
// trainingHistory's own step gates advancement on it.
export function buildCompletedAnswers(finalAnswers: Draft): OnboardingAnswers {
  return {
    ...(finalAnswers as OnboardingAnswers),
    equipment: finalAnswers.equipment ?? [],
    focusAreas: [],
    deprioritizedAreas: [],
    context: [],
  };
}

// First-time onboarding only — adjusting an existing plan goes through
// the dedicated Adjust Plan screens instead (src/features/adjust-plan),
// not this wizard.
export function useOnboarding() {
  const navigate = useNavigate();
  const [answers, setAnswers] = useState<Draft>({});
  const [stepIndex, setStepIndex] = useState(0);
  const advanceTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (advanceTimeoutRef.current) clearTimeout(advanceTimeoutRef.current);
    };
  }, []);

  const steps = useMemo(() => getOnboardingSteps(answers), [answers]);
  const stepId = steps[stepIndex];
  const isFirstStep = stepIndex === 0;
  const isLastStep = stepIndex === steps.length - 1;
  const canGoNext = canAdvance(stepId, answers);
  const showsContinueButton = !AUTO_ADVANCE_STEPS.has(stepId);

  async function completeOnboarding(finalAnswers: Draft) {
    await storageRepository.savePreferences(buildCompletedAnswers(finalAnswers));
    // Plan generation happens on the loading screen, not here.
    navigate('/loading', { replace: true });
  }

  async function goNext() {
    if (!canGoNext) return;
    if (!isLastStep) {
      setStepIndex((index) => index + 1);
      return;
    }
    await completeOnboarding(answers);
  }

  function goBack() {
    if (advanceTimeoutRef.current) {
      clearTimeout(advanceTimeoutRef.current);
      advanceTimeoutRef.current = null;
    }
    if (isFirstStep) return;
    setStepIndex((index) => index - 1);
  }

  function updateAnswer<K extends keyof OnboardingAnswers>(key: K, value: OnboardingAnswers[K]) {
    const next = { ...answers, [key]: value };
    setAnswers(next);
    // Single-select steps advance on selection rather than waiting for a
    // second "Continue" tap — see AUTO_ADVANCE_STEPS above — but only
    // after AUTO_ADVANCE_DELAY_MS, so the row's selected state is visible
    // first. Re-tapping a different option before the timeout fires
    // replaces it rather than stacking two pending advances.
    if (AUTO_ADVANCE_STEPS.has(stepId) && canAdvance(stepId, next)) {
      if (advanceTimeoutRef.current) clearTimeout(advanceTimeoutRef.current);
      // trainingEnvironment is an auto-advance step, and for a gym user
      // (no equipment step follows) it's now the *final* step — picking
      // "Gym" has to complete onboarding here, not just bump the index.
      // Bumping unconditionally left gym users stuck: min(index+1,
      // length-1) is a no-op on the last index, and this step never
      // shows a Continue button to fall back on. This only mattered once
      // focusAreas (always the true last step before) was removed.
      const isCurrentlyLastStep = stepIndex === getOnboardingSteps(next).length - 1;
      advanceTimeoutRef.current = setTimeout(() => {
        advanceTimeoutRef.current = null;
        if (isCurrentlyLastStep) {
          void completeOnboarding(next);
        } else {
          setStepIndex((index) => Math.min(index + 1, getOnboardingSteps(next).length - 1));
        }
      }, AUTO_ADVANCE_DELAY_MS);
    }
  }

  return {
    stepId,
    stepIndex,
    totalSteps: steps.length,
    isFirstStep,
    isLastStep,
    canGoNext,
    showsContinueButton,
    answers,
    updateAnswer,
    goNext,
    goBack,
  };
}
