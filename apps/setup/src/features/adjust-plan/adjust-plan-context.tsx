import { createContext, useContext } from 'react';

import type { OnboardingAnswers } from '@/domain/onboarding';

// Shared between AdjustPlanLayout (owns the state, loaded once from
// storage) and its route children (main settings screen + the field
// pickers) — a plain context instead of prop-drilling through the
// router's <Outlet>, since the pickers are separate routes, not
// nested JSX.
export type AdjustPlanContextValue = {
  original: OnboardingAnswers;
  draft: OnboardingAnswers;
  setField: <K extends keyof OnboardingAnswers>(key: K, value: OnboardingAnswers[K]) => void;
};

export const AdjustPlanContext = createContext<AdjustPlanContextValue | null>(null);

export function useAdjustPlan(): AdjustPlanContextValue {
  const value = useContext(AdjustPlanContext);
  if (!value) throw new Error('useAdjustPlan must be used within AdjustPlanLayout');
  return value;
}
