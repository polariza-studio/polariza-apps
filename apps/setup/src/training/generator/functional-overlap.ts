// A bounded 0–1 score estimating how much two exercises compete for the
// same training "slot" in a session — same broad stimulus, not just a
// shared movement-pattern label. Built only from metadata already on
// Exercise (movementPattern, strengthType, muscles) — no new fields, no
// per-exercise special cases.
//
// 0 whenever the two aren't really comparable in the first place:
// different movementPattern (a squat and a lunge can share target
// muscles without competing for the same slot — a rear-foot-elevated
// split squat next to a barbell back squat is normal programming), or
// different strengthType (a compound row and an isolation face pull
// sharing horizontal-pull are never redundant — one IS the accessory
// answer to the other, not a duplicate of it).
//
// Within a same-pattern, same-strengthType pair, the score is the
// Jaccard overlap of their primary-muscle sets (shared ÷ union) — 1.0
// only when the sets are identical (Barbell Row vs. Inverted Row: both
// primary=[back] — maximal overlap, effectively the same exercise on a
// different implement), lower when one exercise's target is a strict
// superset of the other's (Barbell Deadlift {hamstrings, glutes, back}
// vs. Romanian Deadlift {hamstrings, glutes}: 2÷3 ≈ 0.67 — high but not
// total overlap), lower still for a partial-emphasis pair (Romanian
// Deadlift {hamstrings, glutes} vs. Hip Thrust {glutes}: 1÷2 = 0.5 —
// same broad pattern, meaningfully different emphasis, genuinely
// complementary).
//
// Two uses, both in this generator, neither a new architecture:
//  - select-exercises.ts's rank(): a continuous ranking penalty against
//    exercises already selected earlier in the same day, so a slot that
//    could duplicate an earlier pick prefers a genuinely complementary
//    alternative when one exists — a *preference*, never a filter.
//  - session-quality-pass.ts's accessory-tier dedup: thresholded at >= 1
//    (full overlap) — this is exactly the previous exact-primary-
//    muscle-set-equality check, now expressed as the ceiling case of
//    this same score instead of a second, separate rule.
import type { Exercise } from '../../domain/exercise';

export function functionalOverlap(a: Exercise, b: Exercise): number {
  if (a.id === b.id) return 0;
  if (a.movementPattern !== b.movementPattern) return 0;
  if (a.strengthType !== b.strengthType) return 0;

  const aPrimary = new Set(a.muscles.primary);
  const bPrimary = new Set(b.muscles.primary);
  const shared = [...aPrimary].filter((muscle) => bPrimary.has(muscle)).length;
  const union = new Set([...aPrimary, ...bPrimary]).size || 1;

  return shared / union;
}
