import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import type { OnboardingAnswers } from '@/domain/onboarding';
import { storageRepository } from '@/services/storage';

import { getOnboardingSteps, type OnboardingStepId } from './steps';

type Draft = Partial<OnboardingAnswers>;

// Single-select steps require a value. "focusAreas" is valid empty (Paper's
// "No preference" option). "equipment" requires at least one selection
// when it's shown (it only shows for home users; "Bodyweight only" is
// itself a valid equipment choice for someone with none). "name" requires
// a non-blank value — Paper's field has no stated max length or format.
function canAdvance(stepId: OnboardingStepId, answers: Draft): boolean {
  switch (stepId) {
    case 'name':
      return (answers.name?.trim().length ?? 0) > 0;
    case 'goal':
      return answers.goal !== undefined;
    case 'experience':
      return answers.experience !== undefined;
    case 'daysPerWeek':
      return answers.daysPerWeek !== undefined;
    case 'sessionDuration':
      return answers.sessionDuration !== undefined;
    case 'trainingEnvironment':
      return answers.trainingEnvironment !== undefined;
    case 'equipment':
      return (answers.equipment?.length ?? 0) > 0;
    case 'focusAreas':
      return true;
  }
}

// Steps with no visible "Continue" button in Paper (Goal/Experience/Days/
// Time/Environment) advance as soon as an option is tapped — confirmed by
// their absence of any button node in Paper across every screen checked.
// Name, Equipment, and Focus keep an explicit Continue/Create-my-plan
// button (free text, multi-select, and flow-end respectively).
const AUTO_ADVANCE_STEPS: ReadonlySet<OnboardingStepId> = new Set([
  'goal',
  'experience',
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

  async function goNext() {
    if (!canGoNext) return;
    if (!isLastStep) {
      setStepIndex((index) => index + 1);
      return;
    }
    // deprioritizedAreas/context have no screen yet (deliberately deferred,
    // see steps.ts) — always saved empty, not left undefined, since the
    // rest of the domain depends on them existing. equipment is only ever
    // asked for 'home' users (see steps.ts) — defaulted the same way for
    // 'gym' users, rather than left undefined, so every saved
    // OnboardingAnswers actually satisfies its type.
    const completed: OnboardingAnswers = {
      ...(answers as OnboardingAnswers),
      equipment: answers.equipment ?? [],
      deprioritizedAreas: [],
      context: [],
    };
    await storageRepository.savePreferences(completed);
    // Plan generation happens on the loading screen, not here.
    navigate('/loading', { replace: true });
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
      advanceTimeoutRef.current = setTimeout(() => {
        advanceTimeoutRef.current = null;
        setStepIndex((index) => Math.min(index + 1, getOnboardingSteps(next).length - 1));
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
