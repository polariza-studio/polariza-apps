import { useEffect, useState } from 'react';
import { Navigate, Outlet } from 'react-router-dom';

import type { OnboardingAnswers } from '@/domain/onboarding';
import { storageRepository } from '@/services/storage';

import { AdjustPlanContext } from './adjust-plan-context';

export function AdjustPlanLayout() {
  const [original, setOriginal] = useState<OnboardingAnswers | null | undefined>(undefined);
  const [draft, setDraft] = useState<OnboardingAnswers | null | undefined>(undefined);

  useEffect(() => {
    let cancelled = false;
    storageRepository.getPreferences().then((preferences) => {
      if (cancelled) return;
      setOriginal(preferences);
      setDraft(preferences);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  if (original === undefined || draft === undefined) return null; // still loading

  if (original === null || draft === null) {
    // Shouldn't normally happen — RequireOnboarding already guards this
    // route — but nothing to adjust without saved preferences.
    return <Navigate to="/home" replace />;
  }

  function setField<K extends keyof OnboardingAnswers>(key: K, value: OnboardingAnswers[K]) {
    setDraft((current) => (current ? { ...current, [key]: value } : current));
  }

  return (
    <AdjustPlanContext.Provider value={{ original, draft, setField }}>
      <Outlet />
    </AdjustPlanContext.Provider>
  );
}
