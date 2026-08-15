// Weekly split definitions.
// See training/evidence/*.md — content here is PROVISIONAL, not reviewed.
//
// v2 (2026-08-16): each split's `days` array has EXACTLY as many templates
// as its frequency — no more cycling a 2-template array to fill 4 days.
// The earlier version repeated the same "Lower Body"/"Upper Body" template
// twice for a 4-day split, so both Lower days (and both Upper days) ended
// up near-identical. Every occurrence of a repeated day name (Lower A vs
// Lower B, Upper A vs Upper B) now has a genuinely distinct primary
// emphasis by design.

import type { MovementPattern } from '../../domain/exercise';

export type SplitId =
  | 'full-body-2day'
  | 'full-body-3day'
  | 'lower-upper-athletic-3day'
  | 'upper-lower'
  | 'upper-lower-push-pull-legs';

export type SplitDayTemplate = {
  name: string;
  // The day's main lift — always guaranteed a bodyweight-only, beginner
  // candidate (see exercise-library.ts's coverage comment).
  primaryPattern: MovementPattern;
  // Mandatory, substantial complementary lifts — like primaryPattern,
  // only ever equipment-flexible patterns (squat/hinge/lunge/
  // horizontal-push/vertical-push/horizontal-pull/core/carry).
  //
  // CAN repeat primaryPattern or each other (changed 2026-08-16) — a
  // template may deliberately want two exercises sharing a broad pattern
  // in one session (e.g. hinge + hinge for Hip Thrust + Romanian
  // Deadlift on a lower-body day, see 'lower-upper-athletic-3day' below)
  // when they serve genuinely different training functions despite the
  // shared pattern label. session-quality-pass.ts's redundancy dedup is
  // what actually guards against a same-pattern pairing that ISN'T a
  // deliberate choice (e.g. two exercises with the same strengthType and
  // the same primary-muscle set) — see that file's isRedundant. A
  // template author repeating a pattern is asserting "these two are not
  // redundant"; the dedup pass is the safety net if that assertion turns
  // out wrong for the specific exercises selected.
  secondaryPatterns: MovementPattern[];
  // Ordered by priority. How many actually get included is goal-driven
  // (rules/session-composition.ts's accessoryBudgetByGoal), then further
  // capped by duration/experience — see assign-movement-patterns.ts.
  // Never equipment-required to guarantee coverage (unlike primary/
  // secondary): dropped gracefully if there's no compatible candidate.
  optionalPatterns: MovementPattern[];
};

export type SplitDefinition = {
  id: SplitId;
  // One template per day of the week this split is used for — no cycling.
  days: SplitDayTemplate[];
};

// PROVISIONAL — not reviewed, placeholder only.
export const splitDefinitions: Record<SplitId, SplitDefinition> = {
  'full-body-2day': {
    id: 'full-body-2day',
    days: [
      {
        name: 'Full Body A',
        primaryPattern: 'squat',
        secondaryPatterns: ['horizontal-push', 'horizontal-pull'],
        optionalPatterns: ['core', 'elbow-flexion'],
      },
      {
        name: 'Full Body B',
        primaryPattern: 'hinge',
        secondaryPatterns: ['vertical-push', 'lunge'],
        optionalPatterns: ['core', 'calf-raise'],
      },
    ],
  },
  'full-body-3day': {
    id: 'full-body-3day',
    days: [
      {
        name: 'Full Body A',
        primaryPattern: 'squat',
        secondaryPatterns: ['horizontal-push', 'horizontal-pull'],
        optionalPatterns: ['core', 'elbow-flexion'],
      },
      {
        name: 'Full Body B',
        primaryPattern: 'hinge',
        secondaryPatterns: ['vertical-push', 'horizontal-pull'],
        optionalPatterns: ['calf-raise', 'core'],
      },
      {
        name: 'Full Body C',
        primaryPattern: 'lunge',
        secondaryPatterns: ['vertical-push', 'horizontal-pull'],
        optionalPatterns: ['core', 'hip-abduction'],
      },
    ],
  },
  // A deliberate WEEK-INTENT archetype (2026-08-16), not a fourth
  // interchangeable "Full Body A/B/C" — each day has a distinct purpose:
  // a lower/glute-emphasis day, an upper-pull-emphasis day, and an
  // athletic full-body day that intentionally mixes hinge + unilateral +
  // pull + push + carry + core in one session. Selected by
  // generator/select-split.ts alongside 'full-body-3day' (never in place
  // of it) when the user's experience/duration/goal can actually make
  // use of a richer, higher-exercise-count session — see that file's
  // prefersWeeklyIntentSplit. Pattern slots only, same as every other
  // split — which SPECIFIC exercises fill them still depends on the
  // user's equipment/goal/experience via select-exercises.ts, so this is
  // not a hardcoded reproduction of any one reference plan.
  //
  // Two days below deliberately repeat a pattern within
  // secondaryPatterns (hinge+hinge on Lower Body, horizontal-pull twice
  // on Upper Body and again on Athletic Full Body) — see splits.ts's
  // SplitDayTemplate comment on why that's allowed now and how
  // session-quality-pass.ts's redundancy check is the actual safety net.
  'lower-upper-athletic-3day': {
    id: 'lower-upper-athletic-3day',
    days: [
      {
        name: 'Lower Body',
        primaryPattern: 'hinge',
        secondaryPatterns: ['hinge', 'squat', 'lunge'],
        optionalPatterns: ['knee-flexion', 'hip-abduction', 'core'],
      },
      {
        name: 'Upper Body',
        primaryPattern: 'horizontal-pull',
        secondaryPatterns: ['vertical-pull', 'horizontal-pull'],
        optionalPatterns: ['shoulder-abduction', 'elbow-flexion', 'elbow-extension', 'core'],
      },
      {
        name: 'Athletic Full Body',
        primaryPattern: 'hinge',
        secondaryPatterns: ['lunge', 'horizontal-pull', 'horizontal-push', 'carry'],
        optionalPatterns: ['core'],
      },
    ],
  },
  'upper-lower': {
    id: 'upper-lower',
    days: [
      {
        name: 'Lower Body',
        primaryPattern: 'squat',
        secondaryPatterns: ['lunge'],
        // knee-extension listed LAST, not first: goals with a fixed
        // accessory budget (accessoryBudgetByGoal — stronger/athletic/
        // general-fitness) take optionalPatterns in list order, so
        // putting an isolation pattern first would silently replace their
        // existing core/calf-raise pick with one whose suitableGoals
        // doesn't even include their goal (leg-extension isn't tagged
        // 'stronger') — caught exactly this in the first regenerated
        // fixture. Goals using remaining capacity (currently 'muscle')
        // walk the whole list regardless of position, so ordering here
        // only matters for the fixed-budget goals.
        optionalPatterns: ['core', 'calf-raise', 'knee-extension'],
      },
      {
        name: 'Upper Body',
        primaryPattern: 'horizontal-push',
        secondaryPatterns: ['horizontal-pull'],
        optionalPatterns: ['elbow-extension', 'shoulder-abduction', 'horizontal-adduction'],
      },
      {
        name: 'Lower Body',
        primaryPattern: 'hinge',
        secondaryPatterns: ['lunge'],
        optionalPatterns: ['core', 'calf-raise', 'knee-flexion'],
      },
      {
        name: 'Upper Body',
        primaryPattern: 'vertical-push',
        secondaryPatterns: ['horizontal-pull'],
        optionalPatterns: ['vertical-pull', 'elbow-flexion', 'shoulder-abduction'],
      },
    ],
  },
  'upper-lower-push-pull-legs': {
    id: 'upper-lower-push-pull-legs',
    days: [
      {
        name: 'Upper Body',
        primaryPattern: 'horizontal-push',
        secondaryPatterns: ['horizontal-pull'],
        optionalPatterns: ['vertical-push', 'elbow-flexion'],
      },
      {
        name: 'Lower Body',
        primaryPattern: 'squat',
        secondaryPatterns: ['hinge'],
        optionalPatterns: ['lunge', 'calf-raise'],
      },
      {
        name: 'Push',
        primaryPattern: 'horizontal-push',
        secondaryPatterns: ['vertical-push'],
        optionalPatterns: ['elbow-extension', 'shoulder-abduction'],
      },
      {
        name: 'Pull',
        primaryPattern: 'horizontal-pull',
        secondaryPatterns: [],
        optionalPatterns: ['vertical-pull', 'elbow-flexion'],
      },
      {
        name: 'Legs',
        primaryPattern: 'hinge',
        secondaryPatterns: ['squat'],
        optionalPatterns: ['lunge', 'calf-raise'],
      },
    ],
  },
};
