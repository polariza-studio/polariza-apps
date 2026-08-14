// Onboarding domain types.
// Spec: setup-functional-spec.md §4.1 (steps 1-8) and §4.2 (generator input example).

export type Goal = 'stronger' | 'muscle' | 'athletic' | 'general-fitness';

export type ExperienceLevel = 'new' | 'some-experience' | 'experienced';

export type DaysPerWeek = 2 | 3 | 4 | 5;

export type SessionDuration = 30 | 45 | 60 | 75;

export type TrainingEnvironment = 'gym' | 'home';

export type Equipment =
  | 'bodyweight-only'
  | 'dumbbells'
  | 'resistance-bands'
  | 'bench'
  | 'barbell'
  | 'pull-up-bar'
  | 'other';

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
  goal: Goal;
  experience: ExperienceLevel;
  daysPerWeek: DaysPerWeek;
  sessionDuration: SessionDuration;
  trainingEnvironment: TrainingEnvironment;
  // Only meaningful when trainingEnvironment is 'home'; gym users get
  // rules/equipment.ts's standardGymEquipment regardless of this value.
  equipment: Equipment[];
  // "No preference" (step 6/7) is represented as an empty array, not a
  // union member — there's nothing to filter or modify when it's empty.
  focusAreas: FocusArea[];
  deprioritizedAreas: FocusArea[];
  // "None" (step 8) is represented as an empty array.
  context: TrainingContext[];
};
