import type {
  DaysPerWeek,
  Equipment,
  ExperienceLevel,
  FocusArea,
  Goal,
  SessionDuration,
  TrainingEnvironment,
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

export const EXPERIENCE_OPTIONS: { value: ExperienceLevel; label: string; description: string }[] = [
  { value: 'new', label: 'Just starting', description: "I'm new or getting back into it." },
  {
    value: 'some-experience',
    label: 'Some experience',
    description: 'I know the main exercises and\ntrain comfortably.',
  },
  {
    value: 'experienced',
    label: 'Experienced',
    description: 'I train regularly and know my way\naround the gym.',
  },
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

export const ENVIRONMENT_OPTIONS: { value: TrainingEnvironment; label: string }[] = [
  { value: 'gym', label: 'Gym' },
  { value: 'home', label: 'Home' },
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
