// Weekly target training volume (sets per muscle group) by goal — the
// validation-layer counterpart to goals.ts's per-exercise prescriptions.
// Nothing before this tracked volume above the single-exercise level, so a
// plan could look reasonable exercise-by-exercise while still badly
// over- or under-training a muscle group across the week.
//
// PROVISIONAL — not reviewed. Ranges follow commonly-cited strength &
// conditioning guidance (e.g. hypertrophy benefiting from a wider,
// higher weekly set range than pure-strength or general-fitness goals).
// Deliberately one range per goal rather than per (goal, muscle group) —
// real programming does vary target volume by individual muscle group
// (e.g. calves commonly tolerate/need more weekly sets than a muscle like
// the low back), but that's a much larger evidence-review surface than
// v1 needs; this is a known simplification, not an oversight.
//
// A muscle group's *actual* weekly volume is the sum of every exercise's
// sets across the week where that muscle appears as a primary target —
// see validate-plan.ts.
//
// KNOWN TECHNICAL DEBT (approved as v1 scope, 2026-08-16): this is a
// coarse heuristic — goal-uniform ranges applied to every muscle group
// alike, no accounting for how much crossover volume a muscle
// legitimately gets from being primary on multiple compound patterns
// (quads/glutes/back/triceps routinely read as "exceeds target" on a
// correctly-programmed multi-day split for exactly this reason — see the
// approved MVP fixtures in generator/__fixtures__/). It is validated as
// SOFT output only: generate-plan.ts surfaces these as warnings for human
// review and nothing else. Nothing in the generator pipeline is allowed
// to branch on a weeklyVolumeTargets check, retry a slot, adjust sets, or
// otherwise auto-correct based on it — nothing does that today, and it
// must stay that way until this heuristic gets a real per-muscle-group
// review. Making it more precise, or wiring it into selection/correction
// logic, is future work, not this pass.

import type { Goal } from '../../domain/onboarding';

export type VolumeRange = [number, number];

export const weeklyVolumeTargets: Record<Goal, VolumeRange> = {
  stronger: [6, 12],
  muscle: [10, 20],
  athletic: [8, 14],
  'general-fitness': [6, 12],
};
