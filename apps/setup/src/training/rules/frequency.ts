// Training-days-per-week → allowed weekly splits.
// See training/evidence/*.md — content here is PROVISIONAL, not reviewed.

import type { DaysPerWeek } from '../../domain/onboarding';
import type { SplitId } from './splits';

// PROVISIONAL — not reviewed, placeholder only. First entry is the default
// split used by generator/select-split.ts.
export const allowedSplitsByFrequency: Record<DaysPerWeek, SplitId[]> = {
  2: ['full-body'],
  3: ['full-body'],
  4: ['upper-lower'],
  5: ['upper-lower'],
};
