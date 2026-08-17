// Warm-up/cool-down selection rules. Replaces the old one-fixed-exercise-
// per-body-area model: warm-up/cool-down are now composed from the day's
// ACTUAL selected exercises (their movement patterns), not from a day
// label like "lower"/"upper" — two Lower Body days can get slightly
// different warm-ups if their actual movement demands differ. Selection
// itself lives in generator/select-warmup-cooldown.ts; this file only
// holds the pure data: pattern-bucket classification, the duration
// budget, and the priority-ordered candidate lists with their fixed
// prescriptions.

import type { MovementPattern } from '../../domain/exercise';
import type { ExercisePrescription } from '../../domain/plan';

export type MovementBucket = 'lower' | 'push' | 'pull';

const LOWER_PATTERNS: ReadonlySet<MovementPattern> = new Set([
  'squat',
  'hinge',
  'lunge',
  'knee-extension',
  'knee-flexion',
  'calf-raise',
  'hip-abduction',
]);

const PUSH_PATTERNS: ReadonlySet<MovementPattern> = new Set([
  'horizontal-push',
  'vertical-push',
  'elbow-extension',
  'horizontal-adduction',
  'shoulder-abduction',
]);

const PULL_PATTERNS: ReadonlySet<MovementPattern> = new Set(['horizontal-pull', 'vertical-pull', 'elbow-flexion']);

// Classifies a day's final (post-quality-pass) exercise patterns into
// coarse warm-up/cool-down targeting buckets. Deliberately coarser than
// MovementPattern itself — warm-up prep needs are shared across e.g.
// vertical-push and horizontal-push, so bucketing avoids picking one
// near-duplicate mobility/activation movement per pattern (spec: "avoid
// redundancy... not simply one warm-up movement per pattern"). `carry`
// and `core` patterns don't map to a bucket — they don't drive
// warm-up/cool-down targeting on their own.
export function bucketsForPatterns(patterns: MovementPattern[]): Set<MovementBucket> {
  const buckets = new Set<MovementBucket>();
  for (const pattern of patterns) {
    if (LOWER_PATTERNS.has(pattern)) buckets.add('lower');
    if (PUSH_PATTERNS.has(pattern)) buckets.add('push');
    if (PULL_PATTERNS.has(pattern)) buckets.add('pull');
  }
  return buckets;
}

// Warm-up/cool-down target duration is a share of the whole selected
// session length (spec: "2-5 minutes is a budget, not just an
// estimate"), not a lookup table keyed by the 30/45/60/75 presets —
// continuous so it scales smoothly instead of jumping at those
// boundaries. Checked against the spec's own illustrative examples:
// 30 -> 2, 45 -> 3, 60 -> 4 (within the stated "~3-4"), 75 -> 5.
export function targetWarmupCooldownMinutes(sessionDurationMinutes: number): number {
  const raw = Math.round(sessionDurationMinutes * 0.07);
  return Math.min(Math.max(raw, 2), 5);
}

export type SelectionContext = {
  buckets: Set<MovementBucket>;
  patterns: Set<MovementPattern>;
};

export type WarmupCooldownCandidate = {
  exerciseId: string;
  prescription: ExercisePrescription;
  // Whether this candidate is relevant to the day's actual exercises.
  // The generic "does the user have the required equipment" filter is
  // applied separately in select-warmup-cooldown.ts against the real
  // Exercise record, not here — keeps this predicate focused on
  // programming relevance, not equipment (which every candidate's own
  // `equipment` field already encodes, e.g. band-pull-apart naturally
  // drops out with no band available, no special-casing needed here).
  appliesTo: (context: SelectionContext) => boolean;
};

// Priority order = selection order: buildWarmupCooldown (see
// select-warmup-cooldown.ts) greedy-fills applicable candidates from the
// top until the duration budget is used, so earlier entries are more
// likely to be included. Mobility/prep work before rehearsal/activation
// work, general before extra/equipment-gated.
export const warmupCandidates: WarmupCooldownCandidate[] = [
  {
    exerciseId: 'leg-swings',
    prescription: { mode: 'reps-side', sets: 1, repRange: [8, 8], restSeconds: 0 },
    appliesTo: ({ buckets }) => buckets.has('lower'),
  },
  {
    exerciseId: 'arm-circles',
    prescription: { mode: 'duration', sets: 1, durationSeconds: 25, restSeconds: 0 },
    appliesTo: ({ buckets }) => buckets.has('push') || buckets.has('pull'),
  },
  {
    exerciseId: 'bodyweight-squat',
    prescription: { mode: 'reps', sets: 1, repRange: [10, 10], restSeconds: 0 },
    appliesTo: ({ patterns }) => patterns.has('squat'),
  },
  {
    exerciseId: 'bodyweight-lunge',
    prescription: { mode: 'reps-side', sets: 1, repRange: [8, 8], restSeconds: 0 },
    // Squat rehearsal takes priority when a session has both squat and
    // lunge work — one light pattern-rehearsal movement is enough, not
    // one per pattern (spec: avoid redundancy).
    appliesTo: ({ patterns }) => !patterns.has('squat') && patterns.has('lunge'),
  },
  {
    exerciseId: 'glute-bridge',
    prescription: { mode: 'reps', sets: 1, repRange: [10, 10], restSeconds: 0 },
    appliesTo: ({ buckets }) => buckets.has('lower'),
  },
  {
    exerciseId: 'scapular-push-up',
    prescription: { mode: 'reps', sets: 1, repRange: [10, 10], restSeconds: 0 },
    appliesTo: ({ buckets }) => buckets.has('push') || buckets.has('pull'),
  },
  {
    exerciseId: 'dead-bug',
    prescription: { mode: 'reps-side', sets: 1, repRange: [8, 8], restSeconds: 0 },
    // Universal low-priority top-up: without it, a bodyweight-only
    // session that only hits the push/pull buckets (arm-circles +
    // scapular-push-up) falls short of both the "usually 3-4 movements"
    // guidance and the 2-minute floor when no band is available. Reuses
    // the existing library entry rather than adding an 8th new movement.
    appliesTo: () => true,
  },
  {
    exerciseId: 'plank',
    prescription: { mode: 'duration', sets: 1, durationSeconds: 20, restSeconds: 0 },
    // Second universal top-up, lower priority than dead-bug — verified
    // empirically (real-plan generation) that a push/pull-only,
    // no-band session (e.g. a pull-focused upper-body day) still falls
    // under the 2-minute floor with only arm-circles + scapular-push-up +
    // dead-bug. A brief prep-length hold (20s — shorter than plank's own
    // accessory-tier training prescription), not the exercise's normal
    // training volume. Reuses the existing library entry, same rationale
    // as dead-bug above.
    appliesTo: () => true,
  },
  {
    exerciseId: 'band-pull-apart',
    prescription: { mode: 'reps', sets: 1, repRange: [10, 10], restSeconds: 0 },
    appliesTo: ({ buckets }) => buckets.has('pull'),
  },
];

// durationSeconds: 30 — the top of the spec's "~20-30s/side" range for
// every cool-down stretch (raised from an initial 25s after real-plan
// verification showed several common sessions, e.g. a 3-stretch Lower
// Body day, landing at ~1.8min with 25s — under the 2-minute floor once
// the 15s inter-movement transition is included).
export const cooldownCandidates: WarmupCooldownCandidate[] = [
  {
    exerciseId: 'standing-quad-stretch',
    prescription: { mode: 'duration-side', sets: 1, durationSeconds: 30, restSeconds: 0 },
    appliesTo: ({ patterns }) => patterns.has('squat') || patterns.has('lunge'),
  },
  {
    exerciseId: 'hamstring-stretch',
    prescription: { mode: 'duration-side', sets: 1, durationSeconds: 30, restSeconds: 0 },
    // Bucket-level (broadened from hinge-only after real-plan
    // verification): a squat/lunge-only day (no hinge work at all, e.g.
    // upper-lower's squat+lunge Lower Body day) still loads the
    // hamstrings meaningfully, and without this the day's cool-down
    // fell to just 2 candidates (standing-quad-stretch + hip-flexor-
    // stretch), under the 2-minute floor.
    appliesTo: ({ buckets }) => buckets.has('lower'),
  },
  {
    exerciseId: 'chest-stretch',
    prescription: { mode: 'duration-side', sets: 1, durationSeconds: 30, restSeconds: 0 },
    appliesTo: ({ buckets }) => buckets.has('push'),
  },
  {
    exerciseId: 'lat-stretch',
    prescription: { mode: 'duration-side', sets: 1, durationSeconds: 30, restSeconds: 0 },
    // Bucket-level (broadened from vertical-pull-only after real-plan
    // verification): horizontal-pull work (rows) loads the lats and
    // upper back too, not just vertical-pull (pulldowns/pull-ups) — a
    // horizontal-pull-only day (e.g. upper-lower's push+pull Upper Body
    // day) still benefits, and without this the day's cool-down fell to
    // just 2 candidates (chest-stretch + cross-body-shoulder-stretch),
    // under the 2-minute floor.
    appliesTo: ({ buckets }) => buckets.has('pull'),
  },
  {
    exerciseId: 'cross-body-shoulder-stretch',
    prescription: { mode: 'duration-side', sets: 1, durationSeconds: 30, restSeconds: 0 },
    // Not mutually exclusive with lat-stretch (changed after real-plan
    // verification): the two target genuinely different areas (lat/side
    // torso vs. rear shoulder/upper back), so a day with real horizontal-
    // AND vertical-pull volume (e.g. a pull-focused Upper Body day)
    // legitimately benefits from both — that's coverage of two areas
    // that both got worked, not 2 near-identical stretches for the same
    // one. A day with only ONE of the two pull sub-patterns still only
    // triggers the matching stretch, same as before.
    appliesTo: ({ patterns }) => patterns.has('horizontal-pull'),
  },
  {
    exerciseId: 'hip-flexor-stretch',
    prescription: { mode: 'duration-side', sets: 1, durationSeconds: 30, restSeconds: 0 },
    // Lowest priority: an extra lower-body stretch, only included as a
    // 3rd movement when the day had real lunge/split-stance demand and
    // the duration budget still has room — never forced.
    appliesTo: ({ patterns }) => patterns.has('lunge'),
  },
];
