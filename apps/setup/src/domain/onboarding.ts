// Onboarding domain types.
// Spec: setup-functional-spec.md §4.1 (steps 1-8) and §4.2 (generator input example).

export type Goal = 'stronger' | 'muscle' | 'athletic' | 'general-fitness';

// How long the user has been strength training CONSISTENTLY — an
// observable duration, not a subjective self-rating. Replaced the old
// "Experience" onboarding question and its 3-tier ExperienceLevel
// (removed 2026-08-19 once every generator consumer migrated — see
// training/rules/exercise-complexity.ts and training/rules/
// workload-readiness.ts). Drives exercise-complexity ceiling only —
// never workload/volume on its own, see CurrentStrengthTrainingFrequency.
export type TrainingHistory =
  | 'just-starting'
  | 'less-than-6-months'
  | 'six-to-eighteen-months'
  | 'more-than-18-months';

// How often the user CURRENTLY strength trains, independent of
// `daysPerWeek` (how many days they want the NEW SetUp plan to contain).
// Combines with TrainingHistory to drive initial workload readiness
// (training/rules/workload-readiness.ts) — never affects exercise
// complexity on its own (see TrainingHistory's comment).
//
// Optional: legacy users migrated from the old `experience` field (see
// features/onboarding/legacy-preferences-migration.ts) have no real
// answer for this — it is never fabricated. `undefined` is a genuine
// "unknown" state that the generator must treat as neutral (no
// detraining discount, no frequency bonus), not defaulted to any
// specific tier.
export type CurrentStrengthTrainingFrequency = 'none' | 'one-to-two' | 'three-to-four' | 'five-plus';

export type DaysPerWeek = 2 | 3 | 4 | 5;

export type SessionDuration = 30 | 45 | 60 | 75;

export type TrainingEnvironment = 'gym' | 'home';

// 'cable' and 'machine' are gym-only tags used by the exercise library and
// rules/equipment.ts's standardGymEquipment — they're deliberately not in
// step-options.ts's EQUIPMENT_OPTIONS (Paper's home-equipment screen has
// only the 6 chips below this comment), so a home user's `equipment` array
// can never contain them; they exist purely so gym-tagged exercises
// (leg press, lat pulldown, cable row, etc.) can be filtered in.
export type Equipment =
  | 'bodyweight-only'
  | 'dumbbells'
  | 'resistance-bands'
  | 'bench'
  | 'barbell'
  | 'pull-up-bar'
  | 'other'
  | 'cable'
  | 'machine';

export type FocusArea =
  | 'glutes'
  | 'legs'
  | 'back'
  | 'arms'
  | 'shoulders'
  | 'chest'
  | 'core';

export type TrainingContext = 'injury' | 'pregnant' | 'postpartum';

export type OnboardingAnswers = {
  // Shown in Paper as onboarding's first step ("What should we call you?"),
  // not in the original spec/domain model — added 2026-08-14 per explicit
  // instruction. Used later for Home's greeting (top-left). An alias is
  // explicitly fine per Paper's own copy, not necessarily a legal name.
  name: string;
  goal: Goal;
  trainingHistory: TrainingHistory;
  // Optional — see CurrentStrengthTrainingFrequency's comment. Every
  // fresh onboarding completion sets this; only legacy-migrated records
  // may lack it.
  currentStrengthTrainingFrequency?: CurrentStrengthTrainingFrequency;
  daysPerWeek: DaysPerWeek;
  sessionDuration: SessionDuration;
  trainingEnvironment: TrainingEnvironment;
  // Only meaningful when trainingEnvironment is 'home'; gym users get
  // rules/equipment.ts's standardGymEquipment regardless of this value.
  equipment: Equipment[];
  // Not asked in onboarding (removed 2026-08-17 — product decision, not a
  // deferred build) — always saved as [] on completion, so a first plan
  // is balanced by default. Still fully live outside onboarding: the
  // generator (apply-priorities.ts, apply-focus-emphasis.ts) and Adjust
  // Plan both read/write this field normally.
  focusAreas: FocusArea[];
  // deprioritizedAreas and context have no screen in Paper's current
  // onboarding flow (7 steps: Name/Goal/Training history/Current
  // training/Days/Time/Equipment) — deliberately deferred 2026-08-14, not
  // dropped. The onboarding UI always saves these as [] for now; the
  // fields stay required here since the rest of the domain (generator,
  // safety rules) already depends on them existing.
  deprioritizedAreas: FocusArea[];
  // "None" (step 8) is represented as an empty array.
  context: TrainingContext[];
};

// Order-insensitive: re-picking the same multi-select set in a different
// order isn't a change worth generating a new plan over. Nullish-safe:
// `equipment` is never asked (and so never set) for gym-track users, and
// preferences saved before this comparison existed may predate it too.
function sameItems<T>(a: T[] | undefined, b: T[] | undefined): boolean {
  const itemsA = a ?? [];
  const itemsB = b ?? [];
  if (itemsA.length !== itemsB.length) return false;
  const bSet = new Set(itemsB);
  return itemsA.every((item) => bSet.has(item));
}

// Used by both first-time onboarding (unused there in practice — there's
// nothing to compare against yet) and Adjust Plan, to decide whether
// "Save changes" actually needs to regenerate the plan.
export function answersEqual(a: OnboardingAnswers, b: OnboardingAnswers): boolean {
  return (
    a.name === b.name &&
    a.goal === b.goal &&
    a.trainingHistory === b.trainingHistory &&
    a.currentStrengthTrainingFrequency === b.currentStrengthTrainingFrequency &&
    a.daysPerWeek === b.daysPerWeek &&
    a.sessionDuration === b.sessionDuration &&
    a.trainingEnvironment === b.trainingEnvironment &&
    sameItems(a.equipment, b.equipment) &&
    sameItems(a.focusAreas, b.focusAreas)
  );
}
