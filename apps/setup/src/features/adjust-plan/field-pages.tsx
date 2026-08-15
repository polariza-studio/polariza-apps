import { useNavigate } from 'react-router-dom';

import {
  DAYS_OPTIONS,
  DURATION_OPTIONS,
  ENVIRONMENT_OPTIONS,
  EXPERIENCE_OPTIONS,
  GOAL_OPTIONS,
} from '@/features/onboarding/step-options';

import { useAdjustPlan } from './adjust-plan-context';
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

export function AdjustPlanExperiencePage() {
  const { draft, setField } = useAdjustPlan();
  const navigate = useNavigate();
  return (
    <SingleChoicePicker
      title="How experienced are you with strength training?"
      options={EXPERIENCE_OPTIONS}
      initialValue={draft.experience}
      onSave={(value) => {
        setField('experience', value);
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
