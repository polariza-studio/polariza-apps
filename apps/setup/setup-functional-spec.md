# SetUp — Functional Product Specification (MVP)

**Product:** SetUp
**Tagline:** Plan & track your workouts.
**Product description:** SetUp is a simple app to plan, organize, and track your workouts.

## 1. Why it exists

SetUp started from a simple, everyday need: making workouts easier to plan and follow. It helps users build a routine around their goals, choose appropriate exercises, understand how to perform them correctly, and guides them through the workout while they train.

The product should remain simple, functional, intuitive, and visually considered. The MVP should solve the core workout-planning and workout-following problem without adding unnecessary fitness, social, coaching, or analytics features.

## 2. MVP goal

The first release should allow a user to:

- Complete an onboarding about how they want to train.
- Receive a personalized training plan based on those answers.
- See their current plan and a simple visual summary of completed activity on Home.
- Start one of the workouts in the plan.
- Follow the workout exercise by exercise.
- Understand the correct technique for each exercise.
- Record what they actually do during each set.
- Pause, resume, or finish a workout.
- Save or discard the completed activity.
- See saved activity reflected in the weekly history on Home.
- Change their training preferences and generate a new plan.

This is the complete MVP scope.

## 3. Core product loop

```
ONBOARDING
    ↓
Generate personalized plan
    ↓
HOME
    ↓
Workout overview
    ↓
Start workout
    ↓
WORKOUT MODE
Exercise → Sets → Rest → Technique → Next exercise
    ↓
Workout complete
    ↓
Save activity / Discard activity
    ↓
HOME
```

Secondary loop:

```
HOME
    ↓
Plan settings
    ↓
Update onboarding preferences
    ↓
Generate new plan
    ↓
HOME
```

## 4. Functional areas

### 4.1 Onboarding

**Purpose**

Collect only the information that materially affects the training plan.

The onboarding is not a medical questionnaire and should not collect information simply because it is common in fitness apps.

**Step 1 — Goal**

Question: *What's your main goal?*

Single selection:
- Get stronger
- Build muscle
- Feel fit & athletic
- Improve general fitness

The selected goal affects programming variables such as exercise selection, volume, rep ranges, rest periods, and plan structure.

**Step 2 — Training experience**

Question: *What's your training experience?*

Single selection:
- New to strength training — *I'm learning the basics or haven't trained consistently.*
- Some experience — *I know the main exercises and train with confidence.*
- Experienced — *I've trained consistently and understand loading and technique.*

Experience may affect: exercise complexity, starting volume, loading recommendations, progression, exercise alternatives.

**Step 3 — Training days**

Question: *How many days do you want to train?*

Single selection: 2 days/week · 3 days/week · 4 days/week · 5 days/week

The number of days affects the weekly split and distribution of training volume.

The user must be able to change this later from Plan Settings.

**Step 4 — Session duration**

Question: *How long do you want each workout to be?*

Single selection: 30 min · 45 min · 60 min · 75+ min

Duration affects the approximate number of exercises and amount of work that can reasonably fit in each session.

These values should be treated as planning constraints, not exact promised workout times.

**Step 5 — Training environment and equipment**

Question: *Where do you train?*

- Gym
- Home

If **Gym** is selected, the MVP may assume access to standard gym equipment.

If **Home** is selected, ask: *What equipment do you have?*

Multi-selection: Bodyweight only · Dumbbells · Resistance bands · Bench · Barbell · Pull-up bar · Other

The generator must only select exercises compatible with the available equipment.

**Step 6 — Focus areas**

Question: *Anything you want to focus on?*

Multi-selection: No preference · Glutes · Legs · Back · Arms · Shoulders · Chest · Core

This does not mean the plan exclusively trains those areas. It means those areas may receive additional emphasis while the plan remains balanced.

**Step 7 — Areas not to prioritize**

Question: *Anything you don't want to focus on?*

Multi-selection: No preference · Glutes · Legs · Back · Arms · Shoulders · Chest · Core

This should not remove necessary training for those areas. It means the generator should avoid assigning additional development volume to them when possible.

**Step 8 — Relevant context**

Question: *Is there anything we should take into account?*

Initial options: None · I have an injury or physical limitation · I'm pregnant · I'm postpartum

**MVP safety behavior**

Special physical/medical contexts should not be treated as ordinary personalization variables.

Until dedicated, reviewed programming logic exists for a context, SetUp should not automatically generate a specialized plan for it.

The architecture should allow these contexts to be supported later without redesigning the entire onboarding or training engine.

### 4.2 Plan generation

**Principle**

Plan generation must not consist of sending onboarding answers to an LLM and accepting an unconstrained workout plan.

SetUp should have its own structured training domain consisting of:
- Training evidence/documentation
- Deterministic programming rules
- Structured exercise library
- Plan generation engine
- Validation layer

AI may be added later as an interpretation or explanation layer, but it should not be the source of truth for training logic.

**Generator input**

Example:

```json
{
  "goal": "athletic",
  "experience": "intermediate",
  "daysPerWeek": 3,
  "sessionDuration": 45,
  "trainingEnvironment": "gym",
  "equipment": [],
  "focusAreas": ["glutes", "back"],
  "deprioritizedAreas": ["shoulders"],
  "context": []
}
```

**Generator responsibilities**

The generator should:
- Select an appropriate weekly split.
- Determine reasonable training volume.
- Distribute muscle groups and movement patterns across the week.
- Apply focus-area modifiers.
- Avoid unnecessary emphasis on deprioritized areas.
- Filter exercises by equipment.
- Filter or rank exercises by experience/technical difficulty.
- Select exercises from the approved exercise library.
- Assign sets, reps, rest and RIR guidance.
- Estimate session duration.
- Validate the completed plan before returning it.

**Important**

All generated exercises must reference known `Exercise` records by ID. The generator must not invent exercises that do not exist in the SetUp exercise library.

## 5. Training knowledge architecture

Training knowledge should live in the repository and be version controlled.

Suggested structure:

```
src/
  training/
    evidence/
    rules/
    exercises/
    generator/
```

### 5.1 training/evidence/

Human-readable documentation explaining the reasoning behind programming rules.

Possible files:

```
evidence/
  strength.md
  hypertrophy.md
  athletic.md
  general-fitness.md
  safety.md
  sources.md
```

This content is documentation, not runtime logic.

Rules should be traceable back to reliable training guidance or reviewed internal decisions.

### 5.2 training/rules/

Structured deterministic programming rules.

Suggested files:

```
rules/
  goals.ts
  experience.ts
  frequency.ts
  duration.ts
  splits.ts
  priorities.ts
  equipment.ts
  safety.ts
```

Examples of decisions handled here:
- permitted rep ranges by goal
- sets by exercise role
- rest ranges
- RIR targets
- allowed splits by training frequency
- exercise count constraints by duration
- volume modifiers for focus areas
- exercise complexity by experience

These rules must be independent from UI components.

### 5.3 training/exercises/

Structured exercise library.

For MVP, start with a small but representative library rather than attempting to create hundreds of exercises.

Each exercise should eventually contain enough structured information for both plan generation and the Technique UI.

Example conceptual model:

```ts
type Exercise = {
  id: string;
  name: string;

  movementPattern: MovementPattern;

  muscles: {
    primary: MuscleGroup[];
    secondary: MuscleGroup[];
  };

  equipment: Equipment[];
  difficulty: ExerciseDifficulty;
  suitableGoals: Goal[];

  technique: {
    setup: string[];
    execution: string[];
    cues: string[];
    commonMistakes: string[];
  };

  demands?: {
    technical?: "low" | "medium" | "high";
    balance?: "low" | "medium" | "high";
    mobility?: "low" | "medium" | "high";
  };
};
```

The exercise library must contain data only, not presentation components.

### 5.4 training/generator/

The plan-generation engine.

Suggested decomposition:

```
generator/
  generate-plan.ts
  select-split.ts
  calculate-volume.ts
  assign-movement-patterns.ts
  apply-priorities.ts
  select-exercises.ts
  prescribe-exercise.ts
  estimate-duration.ts
  validate-plan.ts
```

Avoid implementing the generator as one large function.

The logic should be modular, testable, understandable, and deterministic where possible.

Conceptual flow:

```
OnboardingAnswers
      ↓
selectSplit()
      ↓
calculateVolume()
      ↓
assignMovementPatterns()
      ↓
applyPriorities()
      ↓
filter/selectExercises()
      ↓
assignSetsRepsRestRIR()
      ↓
estimateDuration()
      ↓
validatePlan()
      ↓
TrainingPlan
```

## 6. Home

Home is the main recurring screen after onboarding.

It has two primary responsibilities.

### 6.1 Weekly activity

Show a simple visual representation of activity completed during the current week.

The MVP does not need: calories, streaks, achievements, detailed charts, training load analytics, complex statistics.

A simple weekly visualization based on saved workout duration is sufficient.

Example:

```
This week
102 min

M   T   W   T   F   S   S
|       |
|       |
```

Only saved activities affect this visualization. Discarded workouts must not appear.

### 6.2 Current plan

Show the current generated plan.

Example:

```
Your Plan

Day 1
Lower body
6 exercises · 45–55 min

Day 2
Upper body
6 exercises · 45–55 min

Day 3
Full body
7 exercises · 45–55 min
```

Selecting a training day opens its Workout Overview.

**Plan settings**

Home should expose a Plan Settings action.

For MVP, the user does not manually edit individual exercises, days, or sets. Plan Settings reuses the onboarding preferences.

The user can change their preferences and generate a new plan.

Flow:

```
Home
  ↓
Plan Settings
  ↓
Current onboarding answers
  ↓
Change preferences
  ↓
Generate new plan
  ↓
Replace current plan
  ↓
Home
```

Before replacing an existing plan, the UI should clearly communicate that a new plan will be generated.

Historical saved activities must remain intact when the current plan changes.

## 7. Workout Overview

Selecting a day from the plan opens a pre-workout overview.

Example information:

```
Day 1
Lower body

Structure
Warm-up · 6 exercises · Cool-down

Duration
45–55 min

Level
Intermediate

Muscles worked
Quadriceps · Glutes · Hamstrings · Calves · Adductors

What to expect
Short contextual description of the session.
```

Primary CTA: **Start Workout**

The overview is informational. It should help the user understand what they are about to do without overwhelming them.

## 8. Workout Mode

Workout Mode is the core execution experience.

The app guides the user through one exercise at a time.

### 8.1 Global workout information

Display: training day, workout elapsed time, exercise position/progress, pause action.

Example:

```
Day 1 · Lower body

00:12:42

Exercise 2 of 6
```

### 8.2 Exercise information

Display: exercise name, planned sets × reps, suggested/initial weight when available, target RIR, rest guidance.

Example:

```
Hip thrust

Sets × reps
3 × 8–10

Initial weight
35–40 kg

RIR
2–3
```

Weight recommendations must eventually come from defined progression/personalization logic rather than arbitrary values.

For an initial user with no history, SetUp may need to use ranges, guidance, or user-entered weight rather than pretending to know an exact appropriate load.

### 8.3 Set tracking

Each set can be marked complete.

The user should be able to record: actual reps, actual weight.

Example:

```
Set 1     8 reps     35 kg   ✓
Set 2     9 reps     35 kg
Set 3     8 reps     40 kg
```

This data belongs to the active workout until the user saves the activity.

### 8.4 Technique

Technique should be accessible without leaving the workout flow.

For each exercise show:
- **Setup** — How to position the body/equipment before starting.
- **Execution** — Short step-by-step instructions.
- **Cues** — A few memorable prompts that help execute the movement correctly.
- **Common mistakes** — The most relevant mistakes to avoid.

The MVP may use text only initially. Images/video can be added later.

Technique content comes from the structured exercise library.

### 8.5 Rest

The prescribed rest time should be available during the workout.

A rest timer can be part of the workout flow, but the MVP should avoid making the experience unnecessarily rigid. Users should be able to continue when ready.

### 8.6 Navigation

The user can: complete sets, move to the next exercise, access technique, pause the workout, resume the workout, finish the workout early.

If the user attempts to finish before completing the planned workout, confirm the action.

Example:

```
Finish workout?

You still have 4 exercises left.

Keep training
Finish anyway
```

## 9. Workout completion

When the workout ends, show a deliberately simple completion screen.

Example:

```
Your activity

00:47:12

Good work!

[ Save activity ]

Discard activity
```

**Save activity**

Saving should:
- Create an `Activity` record.
- Preserve completed sets/reps/weights needed for future progression.
- Add the workout duration to the weekly Home history.
- Return the user to Home.

**Discard activity**

Discarding should:
- Delete/ignore the active workout data.
- Not modify weekly activity history.
- Return the user to Home.

A confirmation may be appropriate before destructive discard if meaningful workout data exists.

## 10. Core domain models

The exact implementation can evolve, but the architecture should support at least these concepts:

`OnboardingAnswers`, `Exercise`, `ExerciseTechnique`, `TrainingPlan`, `TrainingDay`, `PlannedExercise`, `ActiveWorkout`, `ActiveExercise`, `CompletedSet`, `Activity`

Conceptually:

```ts
type TrainingPlan = {
  id: string;
  createdAt: string;
  preferences: OnboardingAnswers;
  days: TrainingDay[];
};

type TrainingDay = {
  id: string;
  name: string;
  estimatedDurationMinutes: number;
  exercises: PlannedExercise[];
};

type PlannedExercise = {
  exerciseId: string;
  sets: number;
  repRange: [number, number];
  restSeconds: number;
  targetRir?: [number, number];
  suggestedWeight?: {
    min?: number;
    max?: number;
    unit: "kg";
  };
};

type CompletedSet = {
  setNumber: number;
  reps: number;
  weight?: number;
  completed: boolean;
};

type Activity = {
  id: string;
  planId: string;
  trainingDayId: string;
  startedAt: string;
  completedAt: string;
  durationSeconds: number;
  exercises: {
    exerciseId: string;
    sets: CompletedSet[];
  }[];
};
```

These are conceptual models, not immutable implementation requirements.

## 11. Persistence for MVP

For the first version, avoid unnecessary backend complexity.

Persist locally: onboarding answers, current training plan, active workout state, saved activities, set/reps/weight history.

Use a storage abstraction so local persistence can later be replaced by a remote database without rewriting the UI.

Conceptually:

```ts
interface StorageRepository {
  getPreferences(): Promise<OnboardingAnswers | null>;
  savePreferences(data: OnboardingAnswers): Promise<void>;

  getCurrentPlan(): Promise<TrainingPlan | null>;
  saveCurrentPlan(plan: TrainingPlan): Promise<void>;

  getActiveWorkout(): Promise<ActiveWorkout | null>;
  saveActiveWorkout(workout: ActiveWorkout): Promise<void>;
  clearActiveWorkout(): Promise<void>;

  getActivities(): Promise<Activity[]>;
  saveActivity(activity: Activity): Promise<void>;
}
```

Implementation may initially use `localStorage` or another suitable browser-local persistence mechanism.

## 12. AI architecture

AI is not required to make the first functional version of the product work.

The frontend should depend on a generic plan generator contract:

```ts
interface PlanGenerator {
  generate(
    answers: OnboardingAnswers
  ): Promise<TrainingPlan>;
}
```

Initial implementation:

```
PlanGenerator
      ↑
Mock / deterministic generator
```

Future:

```
PlanGenerator
      ↑
Server-side AI-assisted generator
```

The UI must not depend directly on a specific AI provider.

Any future AI API call must happen server-side so provider credentials are never exposed in the browser.

AI may eventually help with:
- interpreting natural-language preferences
- explaining why a plan was generated
- choosing among equivalent approved exercise options
- generating natural-language plan summaries
- adapting plans based on structured workout history

AI should not bypass the training rules or invent unsupported exercises.

## 13. Recommended project organization

This is a suggested architecture, not a requirement if the existing repository already has a coherent alternative.

```
src/
  app/

  components/
    ui/

  features/
    onboarding/
    home/
    plan/
    workout/
    activity/

  training/
    evidence/
    rules/
    exercises/
    generator/

  domain/
    onboarding.ts
    exercise.ts
    plan.ts
    workout.ts
    activity.ts

  services/
    storage/

  styles/

.storybook/
```

Prefer feature/domain boundaries over organizing the entire application only by technical file type.

## 14. Design and frontend context

The visual direction has already been explored in Paper.

The product is: mobile-first, minimal, functional, visually harmonious, focused on fast use while training.

The implementation should eventually use the design system defined in code.

Expected frontend stack: React, TypeScript, Vite, Tailwind, shadcn/ui, Lucide icons, Storybook.

Storybook should document implemented components and states.

Paper is used for visual exploration and product composition. The implemented code is the technical source of truth for tokens, components, states, and behavior.

## 15. Explicitly out of scope for MVP

Do not implement unless the product scope is intentionally changed:

user accounts · authentication · cloud sync · social features · friends/followers · community · leaderboards · achievements · streaks · calorie tracking · nutrition · weight-loss tracking · wearable integrations · Apple Health / Google Health integrations · complex analytics · AI chat/coach · manual routine builder · manual add/remove/reorder exercises from generated plans · manual add/remove training days · marketplace/content feed · video classes · trainer profiles · subscriptions/payments · notifications · advanced progression engine · specialized medical training plans

Keep the first release focused on the core loop.

## 16. Important product principles

**Simplicity over flexibility**
If a feature adds substantial management overhead for a user, question whether it belongs in the MVP.

**The plan should be trustworthy**
Training recommendations should be generated from explicit, reviewable rules and approved exercises.

**No fake precision**
Do not present exact weights, durations, physiological outcomes, or recommendations when the system does not have enough information to support them.

**Technique is part of the product**
Exercise technique is not secondary content. It is part of the core workout experience.

**The workout should be usable in the gym**
Optimize interactions for a user who may be standing, moving, tired, holding a phone with one hand, or quickly checking the next action.

**Saved activity is the source of history**
Only workouts explicitly saved by the user appear in weekly activity.

**Changing preferences creates a new plan**
For MVP, do not build a complex plan editor. Plan Settings changes the generation inputs and produces a new plan.

**Keep domain logic separate from UI**
Training logic, exercise data, persistence, and presentation should remain separable and testable.

## 17. Suggested implementation phases

**Phase 1 — Domain foundation**

Before implementing the visual system:
- inspect existing repository
- define domain types
- define storage abstraction
- create training domain structure
- create PlanGenerator interface
- create initial mock/deterministic generator
- establish exercise schema
- establish rule schemas
- add tests for training logic

Do not invent final training rules without review.

**Phase 2 — Design system**

Implement: tokens, typography, spacing, colors, radii, core UI components, component states, Lucide icon conventions, Storybook stories.

Translate the established Paper direction into code.

**Phase 3 — Onboarding + generated plan**

Implement the onboarding and generate a valid mock/deterministic plan.

**Phase 4 — Home**

Implement current plan and weekly saved-activity visualization.

**Phase 5 — Workout**

Implement: overview, active workout, set tracking, technique, pause/resume, workout progression, finish-early behavior.

**Phase 6 — Save/discard**

Complete the full product loop and persist saved activity.

**Phase 7 — Training engine refinement**

Replace placeholder generation rules with reviewed rules and expand the exercise library.

**Phase 8 — AI, only if useful**

Add an AI-assisted server-side layer without changing the core domain contracts.

## 18. Definition of MVP success

A new user should be able to:

Open SetUp → complete onboarding → receive a plan → see the plan on Home → select a workout → understand what they're about to train → start → follow every exercise → check technique → record sets/reps/weight → finish → save the activity → return Home → see that activity reflected in the current week.

They should also be able to:

Home → Plan Settings → change training preferences → generate a new plan → continue using SetUp with the new plan.

If these two flows work reliably and feel simple on mobile, the MVP is functionally complete.

## 19. Instructions for Claude Code / Cursor

When working on this project:

- Read this document before proposing architecture or features.
- Inspect the existing repository before modifying it.
- Do not expand product scope without asking.
- Prefer simple implementations appropriate for the MVP.
- Keep training-domain logic independent from UI.
- Keep persistence behind an abstraction.
- Keep plan generation behind a PlanGenerator interface.
- Do not hardcode exercise content into UI components.
- Do not invent medical or training recommendations when rules have not yet been defined.
- Do not add unnecessary backend infrastructure, databases, or cloud infrastructure unless they become necessary.
- Reuse existing project conventions before introducing new ones.
- Keep TypeScript types strict and domain-oriented.
- Add tests for plan-generation and workout-state logic.
- Treat Paper as the visual reference and implemented code as the technical source of truth.
- Ask before making product decisions that are not covered by this specification.
