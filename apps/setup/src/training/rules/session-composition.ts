// How much optional/accessory work a session actually gets, and how much
// simultaneous high-fatigue work one session should carry — both driven by
// programming intent (goal), not by how much time/slot budget happens to
// be left over. See training/evidence/*.md — content here is PROVISIONAL,
// not reviewed.

import type { Goal } from '../../domain/onboarding';

// Only consulted for 'stronger' now (2026-08-16) — the one goal where
// usesRemainingCapacityByGoal (below) is false, so it's the only one
// still using a fixed accessory count instead of a time-budget walk. Kept
// as a Record (not a single number) so re-enabling a fixed budget for
// another goal later is a data change, not a type change.
export const accessoryBudgetByGoal: Record<Goal, number> = {
  stronger: 1,
  muscle: 3,
  athletic: 2,
  'general-fitness': 1,
};

// MINIMUM SESSION → GOAL-BENEFICIAL, NON-REDUNDANT ADDITIONS → STOP.
//
// For goals where this is true, assign-movement-patterns.ts ignores
// accessoryBudgetByGoal and instead walks the day template's
// optionalPatterns in order, adding one at a time as long as (a) the
// estimated session time — using goal+role-derived rep/rest numbers, not
// a specific exercise, since prescription doesn't depend on which
// exercise fills a slot — still fits the user's session-duration budget,
// and (b) the template has more optional patterns left. It never pads
// with anything the template doesn't already call out as useful for that
// day, and it stops the moment the next addition wouldn't fit — duration
// is still a ceiling the loop respects, never a target it fills for its
// own sake. session-quality-pass.ts's redundancy dedup runs afterward on
// the real selected exercises and is what keeps this from becoming
// "mechanically fill every slot" — a pattern added here that resolves to
// an exercise redundant with one already in the session gets trimmed
// there, not here (this stage doesn't know which exercise will fill a
// slot yet).
//
// CHANGED 2026-08-16: was 'muscle'-only. The rule itself is now
// goal-graded by an actual programming distinction — 'stronger' is the
// one goal where deliberate leanness (few, heavy, low-redundancy lifts,
// long rest) is a defining feature of the goal itself, not just "the
// goal with the smallest number" — so it's the only one that keeps a
// fixed, small accessory count regardless of how much session time is
// available. Every other goal now uses genuinely available time to add
// non-redundant, goal-beneficial work instead of stopping at a number
// picked independent of duration/day-intent. This was previously scoped
// to 'muscle' alone because it was the one goal a reviewed fixture
// clearly under-used (a 60-min hypertrophy session landing at ~25 min);
// the same under-use applies to athletic/general-fitness sessions with
// real time budget and a rich day template (e.g.
// 'lower-upper-athletic-3day') — the fixed accessoryBudget numbers above
// were never a considered ceiling for those goals, just an earlier
// implementation's default.
export const usesRemainingCapacityByGoal: Record<Goal, boolean> = {
  stronger: false,
  muscle: true,
  athletic: true,
  'general-fitness': true,
};

// Shared by validate-plan.ts (flags a session that still exceeds this
// after the quality pass — e.g. an advanced lifter's primary+secondary
// alone reaching the cap) and session-quality-pass.ts (proactively trims
// accessory-tier high-systemic work down to this before the plan is
// returned, rather than only warning about it afterward).
export const maxHighSystemicPerSession = 2;
