import { useNavigate } from 'react-router-dom';

import {
  CURRENT_FREQUENCY_OPTIONS,
  DAYS_OPTIONS,
  DURATION_OPTIONS,
  ENVIRONMENT_OPTIONS,
  FOCUS_OPTIONS,
  GOAL_OPTIONS,
  TRAINING_HISTORY_OPTIONS,
} from '@/features/onboarding/step-options';

import { useAdjustPlan } from './adjust-plan-context';
import { MultiChoicePicker } from './MultiChoicePicker';
import { SingleChoicePicker } from './SingleChoicePicker';

// Titles/descriptions are the same copy as the matching onboarding step
// (spec: same question, just asked again from Adjust Plan) — Paper's one
// fully-designed instance (Days) uses this exact text.

export function AdjustPlanGoalPage() {
  const { draft, setField } = useAdjustPlan();
  const navigate = useNavigate();
  return (
    <SingleChoicePicker
      title={'What do you want to get\nfrom your training?'}
      description={'Pick the goal that matters most\nto you right now.'}
      options={GOAL_OPTIONS}
      initialValue={draft.goal}
      onSave={(value) => {
        setField('goal', value);
        navigate('/adjust-plan');
      }}
    />
  );
}

// Replaces the old AdjustPlanExperiencePage (2026-08-19) — same concept
// and options as onboarding's Training history step (step-options.ts's
// TRAINING_HISTORY_OPTIONS), reused verbatim per product decision.
export function AdjustPlanTrainingHistoryPage() {
  const { draft, setField } = useAdjustPlan();
  const navigate = useNavigate();
  return (
    <SingleChoicePicker
      title={'How long have you been\nstrength training consistently?'}
      description={'This helps us choose the right\nstarting level.'}
      options={TRAINING_HISTORY_OPTIONS}
      initialValue={draft.trainingHistory}
      onSave={(value) => {
        setField('trainingHistory', value);
        navigate('/adjust-plan');
      }}
    />
  );
}

// Same concept/options as onboarding's Current training step. A legacy
// user migrated from the old `experience` field may have no real answer
// yet (services/storage/legacy-preferences-migration.ts never fabricates
// one) — SingleChoicePicker simply starts with nothing selected in that
// case, same as any other unanswered picker.
export function AdjustPlanCurrentFrequencyPage() {
  const { draft, setField } = useAdjustPlan();
  const navigate = useNavigate();
  return (
    <SingleChoicePicker
      title="How often do you strength train right now?"
      description="This helps us set a realistic starting workload."
      options={CURRENT_FREQUENCY_OPTIONS}
      initialValue={draft.currentStrengthTrainingFrequency}
      onSave={(value) => {
        setField('currentStrengthTrainingFrequency', value);
        navigate('/adjust-plan');
      }}
    />
  );
}

export function AdjustPlanDaysPage() {
  const { draft, setField } = useAdjustPlan();
  const navigate = useNavigate();
  return (
    <SingleChoicePicker
      title={'How many days do you\nwant to train?'}
      description="We'll build your weekly plan around this."
      options={DAYS_OPTIONS}
      initialValue={draft.daysPerWeek}
      onSave={(value) => {
        setField('daysPerWeek', value);
        navigate('/adjust-plan');
      }}
    />
  );
}

export function AdjustPlanEnvironmentPage() {
  const { draft, setField } = useAdjustPlan();
  const navigate = useNavigate();
  return (
    <SingleChoicePicker
      title="Where will you train?"
      options={ENVIRONMENT_OPTIONS}
      initialValue={draft.trainingEnvironment}
      onSave={(value) => {
        setField('trainingEnvironment', value);
        navigate('/adjust-plan');
      }}
    />
  );
}

// No Paper mockup exists for this screen yet (Focus only got a summary
// row on the main Settings screen — see AdjustPlanPage) — title/
// description are placeholder copy following the same voice as the other
// pickers above, not audited against a design. Flag for review.
export function AdjustPlanFocusPage() {
  const { draft, setField } = useAdjustPlan();
  const navigate = useNavigate();
  return (
    <MultiChoicePicker
      title="What would you like to focus on?"
      description="Optional — leave blank for a balanced plan."
      options={FOCUS_OPTIONS}
      initialValue={draft.focusAreas}
      onSave={(value) => {
        setField('focusAreas', value);
        navigate('/adjust-plan');
      }}
    />
  );
}

export function AdjustPlanTimePage() {
  const { draft, setField } = useAdjustPlan();
  const navigate = useNavigate();
  return (
    <SingleChoicePicker
      title={'How much time do you\nusually have?'}
      description="Per workout."
      options={DURATION_OPTIONS}
      initialValue={draft.sessionDuration}
      onSave={(value) => {
        setField('sessionDuration', value);
        navigate('/adjust-plan');
      }}
    />
  );
}
