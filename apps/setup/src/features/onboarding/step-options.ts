import type {
  CurrentStrengthTrainingFrequency,
  DaysPerWeek,
  Equipment,
  FocusArea,
  Goal,
  SessionDuration,
  TrainingEnvironment,
  TrainingHistory,
} from '@/domain/onboarding';

// Labels/descriptions are Paper's exact copy (audited 2026-08-14), not the
// functional spec's wording, where the two differ (e.g. Experience: Paper
// says "Just starting", spec says "New to strength training") — Paper is
// the visual/content source of truth, domain values are unchanged. A few
// descriptions carry an embedded '\n' where Paper hard-wraps the copy for
// readability (re-audited via paper-desktop MCP 2026-08-15) — rendered via
// withLineBreaks() at the call site, not left to CSS reflow.
export const GOAL_OPTIONS: { value: Goal; label: string; description: string }[] = [
  { value: 'stronger', label: 'Get stronger', description: 'Build overall strength.' },
  { value: 'muscle', label: 'Build muscle', description: 'Focus on muscle growth.' },
  {
    value: 'athletic',
    label: 'Feel fit & athletic',
    description: 'Build strength, movement and\noverall fitness.',
  },
  {
    value: 'general-fitness',
    label: 'Improve general fitness',
    description: 'Stay active and train your whole body.',
  },
];

// Used by both onboarding and Adjust Plan (2026-08-19: Adjust Plan's old
// Experience screen was replaced with this same question — see
// field-pages.tsx's AdjustPlanTrainingHistoryPage) — an observable
// duration instead of the old subjective self-rating. See
// domain/onboarding.ts's TrainingHistory comment.
export const TRAINING_HISTORY_OPTIONS: { value: TrainingHistory; label: string; description: string }[] = [
  { value: 'just-starting', label: "I'm just starting", description: "I'm new or getting back into it." },
  { value: 'less-than-6-months', label: 'Less than 6 months', description: "I'm still building consistency." },
  { value: 'six-to-eighteen-months', label: '6–18 months', description: "I've been training regularly for a while." },
  {
    value: 'more-than-18-months',
    label: 'More than 18 months',
    description: 'Strength training is already part of my routine.',
  },
];

// New onboarding question (2026-08-18) — CURRENT strength-training
// frequency, distinct from DAYS_OPTIONS (the frequency the user wants the
// new plan to have). See domain/onboarding.ts's CurrentStrengthTrainingFrequency.
export const CURRENT_FREQUENCY_OPTIONS: { value: CurrentStrengthTrainingFrequency; label: string }[] = [
  { value: 'none', label: "I don't currently train" },
  { value: 'one-to-two', label: '1–2 days/week' },
  { value: 'three-to-four', label: '3–4 days/week' },
  { value: 'five-plus', label: '5+ days/week' },
];

export const DAYS_OPTIONS: { value: DaysPerWeek; label: string }[] = [
  { value: 2, label: '2 days' },
  { value: 3, label: '3 days' },
  { value: 4, label: '4 days' },
  { value: 5, label: '5 days' },
];

export const DURATION_OPTIONS: { value: SessionDuration; label: string }[] = [
  { value: 30, label: '30 min' },
  { value: 45, label: '45 min' },
  { value: 60, label: '60 min' },
  { value: 75, label: '75+ min' },
];

// Kept only for Adjust Plan's Environment screen (AdjustPlanEnvironmentPage)
// — left untouched by the 2026-08-18 onboarding redesign. Onboarding
// itself uses EQUIPMENT_MODE_OPTIONS below instead (different copy: "Full
// gym"/"Home or limited equipment" with descriptions, one merged
// onboarding step rather than a plain Gym/Home picker).
export const ENVIRONMENT_OPTIONS: { value: TrainingEnvironment; label: string }[] = [
  { value: 'gym', label: 'Gym' },
  { value: 'home', label: 'Home' },
];

// Onboarding's equipment step (2026-08-18 redesign) — same underlying
// `trainingEnvironment` value as ENVIRONMENT_OPTIONS, different copy and
// with descriptions (onboarding's SingleSelectRow renders them; Adjust
// Plan's SingleChoicePicker doesn't). Selecting 'gym' skips the equipment
// chip picker entirely (existing standard-gym-equipment behavior,
// rules/equipment.ts); selecting 'home' reveals EQUIPMENT_OPTIONS below,
// still within the same onboarding step number.
export const EQUIPMENT_MODE_OPTIONS: { value: TrainingEnvironment; label: string; description: string }[] = [
  { value: 'gym', label: 'Full gym', description: 'Barbells, dumbbells, machines and cables.' },
  { value: 'home', label: 'Home or limited equipment', description: 'Tell us what you have.' },
];

// Paper's Equipment screen (audited 2026-08-14) shows only these 6 chips —
// no "Other" chip, even though the domain type supports it. Followed as-is
// per standing direction to match Paper and defer additions; flagged as an
// unresolved decision in the implementation report, not silently dropped
// from the type.
export const EQUIPMENT_OPTIONS: { value: Equipment; label: string }[] = [
  { value: 'bodyweight-only', label: 'Bodyweight' },
  { value: 'dumbbells', label: 'Dumbbells' },
  { value: 'resistance-bands', label: 'Resistance bands' },
  { value: 'bench', label: 'Bench' },
  { value: 'barbell', label: 'Barbell' },
  { value: 'pull-up-bar', label: 'Pull-up bar' },
];

export const FOCUS_OPTIONS: { value: FocusArea; label: string }[] = [
  { value: 'glutes', label: 'Glutes' },
  { value: 'legs', label: 'Legs' },
  { value: 'back', label: 'Back' },
  { value: 'chest', label: 'Chest' },
  { value: 'shoulders', label: 'Shoulders' },
  { value: 'arms', label: 'Arms' },
  { value: 'core', label: 'Core' },
];
