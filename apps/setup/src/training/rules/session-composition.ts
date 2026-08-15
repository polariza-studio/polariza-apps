// How much optional/accessory work a session actually gets, and how much
// simultaneous high-fatigue work one session should carry — both driven by
// programming intent (goal), not by how much time/slot budget happens to
// be left over. See training/evidence/*.md — content here is PROVISIONAL,
// not reviewed.

import type { Goal } from '../../domain/onboarding';

// How many of a day template's ordered optionalPatterns (splits.ts)
// actually get included, for goals where usesRemainingCapacityByGoal
// (below) is false. Strength/general-fitness stay lean (primary-lift
// emphasis, low redundancy); athletic sits a bit above that with room for
// unilateral/core/carry without becoming core-heavy. Duration and
// experience still act as a hard ceiling on top of this
// (assign-movement-patterns.ts) — this number is a target driven by goal,
// never inflated just because more session time is available.
//
// Not consulted at all for goals where usesRemainingCapacityByGoal is
// true (currently just 'muscle') — see that flag's comment.
export const accessoryBudgetByGoal: Record<Goal, number> = {
  stronger: 1,
  muscle: 3,
  athletic: 2,
  'general-fitness': 1,
};

// MINIMUM SESSION → GOAL-BENEFICIAL ADDITIONS → STOP.
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
// own sake.
//
// Scoped to 'muscle' only for now: that's the one goal in the reviewed
// fixtures that was clearly leaving real training value on the table
// (a 60-min hypertrophy session landing at ~25 min, missing genuine
// complementary/isolation coverage). Strength/general-fitness are
// deliberately lean regardless of remaining time (spec intent, confirmed
// against the beginner fixtures); athletic's existing accessoryBudget
// already matches its intended "unilateral/core/carry, not core-heavy"
// scope.
export const usesRemainingCapacityByGoal: Record<Goal, boolean> = {
  stronger: false,
  muscle: true,
  athletic: false,
  'general-fitness': false,
};

// Shared by validate-plan.ts (flags a session that still exceeds this
// after the quality pass — e.g. an advanced lifter's primary+secondary
// alone reaching the cap) and session-quality-pass.ts (proactively trims
// accessory-tier high-systemic work down to this before the plan is
// returned, rather than only warning about it afterward).
export const maxHighSystemicPerSession = 2;
