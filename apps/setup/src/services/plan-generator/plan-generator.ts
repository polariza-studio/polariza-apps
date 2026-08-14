// The contract the frontend depends on (spec §12). The UI must not depend
// directly on a specific AI provider or on the internal training engine —
// only on this interface, the same way it only depends on
// StorageRepository for persistence.

import type { OnboardingAnswers } from '../../domain/onboarding';
import type { TrainingPlan } from '../../domain/plan';

export interface PlanGenerator {
  generate(answers: OnboardingAnswers): Promise<TrainingPlan>;
}
