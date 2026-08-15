// Training-days-per-week → allowed weekly splits.
// See training/evidence/*.md — content here is PROVISIONAL, not reviewed.

import type { DaysPerWeek, Goal } from '../../domain/onboarding';
import type { SplitId } from './splits';

// First entry is the default split used by generator/select-split.ts.
// One option per frequency for v1 — deliberately not offering split
// variety we don't have an evidence-backed reason to pick between yet.
export const allowedSplitsByFrequency: Record<DaysPerWeek, SplitId[]> = {
  2: ['full-body-2day'],
  3: ['full-body-3day'],
  4: ['upper-lower'],
  5: ['upper-lower-push-pull-legs'],
};

// Lets a goal override the default split for a given frequency where
// there's a clear, evidence-backed reason to. Empty for v1 — the
// mechanism exists so a future reviewed case (e.g. a goal that clearly
// wants a different weekly structure at the same frequency) is a data
// change here, not a selectSplit.ts rewrite.
export const splitOverridesByGoal: Partial<Record<Goal, Partial<Record<DaysPerWeek, SplitId>>>> = {};
