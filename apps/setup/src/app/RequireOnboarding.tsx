import { Navigate } from 'react-router-dom';

import { useHasOnboarded } from './use-has-onboarded';

// Route guard: no saved onboarding answers → redirect to /onboarding.
// `null` while the (effectively synchronous, but Promise-typed for a future
// remote-storage swap) preferences read resolves — imperceptible in
// practice, not worth a loading UI for this.
export function RequireOnboarding({ children }: { children: React.ReactNode }) {
  const status = useHasOnboarded();

  if (status === 'loading') return null;
  if (status === 'no') return <Navigate to="/onboarding" replace />;

  return children;
}
