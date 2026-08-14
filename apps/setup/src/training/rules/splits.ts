// Weekly split definitions.
// See training/evidence/*.md — content here is PROVISIONAL, not reviewed.

import type { MovementPattern } from '../../domain/exercise';

export type SplitId = 'full-body' | 'upper-lower';

export type SplitDayTemplate = {
  name: string;
  emphasis: MovementPattern[];
};

export type SplitDefinition = {
  id: SplitId;
  // Cycled to fill the user's daysPerWeek — e.g. upper-lower with 4 days
  // repeats as Lower/Upper/Lower/Upper.
  days: SplitDayTemplate[];
};

// PROVISIONAL — not reviewed, placeholder only.
export const splitDefinitions: Record<SplitId, SplitDefinition> = {
  'full-body': {
    id: 'full-body',
    days: [
      {
        name: 'Full body',
        emphasis: ['squat', 'hinge', 'horizontal-push', 'horizontal-pull', 'core'],
      },
    ],
  },
  'upper-lower': {
    id: 'upper-lower',
    days: [
      { name: 'Lower body', emphasis: ['squat', 'hinge', 'lunge'] },
      {
        name: 'Upper body',
        emphasis: ['horizontal-push', 'horizontal-pull', 'vertical-push', 'vertical-pull'],
      },
    ],
  },
};
