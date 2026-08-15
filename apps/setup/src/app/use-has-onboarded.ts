import { useEffect, useState } from 'react';

import { storageRepository } from '@/services/storage';

// "Valid onboarding" is checked via saved preferences, not a saved plan —
// plan generation isn't wired into the onboarding-complete flow yet (that's
// the next implementation phase, per explicit scoping). Once it is, this
// should also check for a current plan (see the "unresolved decisions"
// note in the Onboarding implementation report).
export function useHasOnboarded(): 'loading' | 'yes' | 'no' {
  const [status, setStatus] = useState<'loading' | 'yes' | 'no'>('loading');

  useEffect(() => {
    let cancelled = false;
    storageRepository.getPreferences().then((preferences) => {
      if (!cancelled) setStatus(preferences ? 'yes' : 'no');
    });
    return () => {
      cancelled = true;
    };
  }, []);

  return status;
}
