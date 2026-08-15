import { Navigate } from 'react-router-dom';

import { useHasOnboarded } from './use-has-onboarded';

// / itself renders nothing — it only decides where a bare visit should land.
export function RootRedirect() {
  const status = useHasOnboarded();

  if (status === 'loading') return null;

  return <Navigate to={status === 'yes' ? '/home' : '/onboarding'} replace />;
}
