import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { withLineBreaks } from '@/lib/text';
import { MultiSelectChip } from './MultiSelectChip';
import { OnboardingHeader } from './OnboardingHeader';
import { SingleSelectRow } from './SingleSelectRow';
import { StartScreen } from './StartScreen';
import {
  CURRENT_FREQUENCY_OPTIONS,
  DAYS_OPTIONS,
  DURATION_OPTIONS,
  EQUIPMENT_MODE_OPTIONS,
  EQUIPMENT_OPTIONS,
  GOAL_OPTIONS,
  TRAINING_HISTORY_OPTIONS,
} from './step-options';
import { getStepNumber } from './steps';
import { useOnboarding } from './use-onboarding';

// Question/description copy is Paper's exact text (audited 2026-08-14). A
// few titles/descriptions carry an embedded '\n' where Paper hard-wraps
// the copy for readability (re-audited via paper-desktop MCP 2026-08-15)
// — rendered via withLineBreaks() at the call site below, not left to CSS
// reflow (which could break at a different point at this column's actual
// width).
const STEP_COPY: Record<string, { label: string; title: string; description?: string }> = {
  name: {
    label: 'Name',
    title: 'What should we call you?',
    description: 'No need to share your real name.\nAn alias works perfectly.',
  },
  goal: {
    label: 'Goal',
    title: 'What do you want to get\nfrom your training?',
    description: 'Pick the goal that matters most\nto you right now.',
  },
  trainingHistory: {
    label: 'Training history',
    title: 'How long have you been\nstrength training consistently?',
    description: 'This helps us choose the right\nstarting level.',
  },
  currentStrengthTrainingFrequency: {
    label: 'Current training',
    title: 'How often do you strength\ntrain right now?',
    description: 'This helps us set a realistic\nstarting workload.',
  },
  daysPerWeek: {
    label: 'Days',
    title: 'How many days do you\nwant to train?',
    description: "We'll build your weekly plan around this.",
  },
  sessionDuration: {
    label: 'Time',
    title: 'How much time do you\nusually have?',
    description: 'Per workout. Warm-up and\ncool-down included.',
  },
  trainingEnvironment: { label: 'Equipment', title: 'What equipment can you use?' },
  equipment: {
    label: 'Equipment',
    title: 'What equipment do you have?',
    description: 'Select everything you can use.',
  },
};

export function OnboardingFlow() {
  const [started, setStarted] = useState(false);
  const { stepId, isFirstStep, isLastStep, canGoNext, showsContinueButton, answers, updateAnswer, goNext, goBack } =
    useOnboarding();

  if (!started) {
    return <StartScreen onStart={() => setStarted(true)} />;
  }

  const copy = STEP_COPY[stepId];
  const stepNumber = getStepNumber(stepId);

  return (
    // bg-background stays on this full-width root so it reaches the
    // viewport edges on desktop. OnboardingHeader (top-bar + step-bar) is
    // deliberately outside the max-w-[440px] cap below — it's chrome, not
    // reading content, so it's allowed to run edge-to-edge.
    //
    // px-space-7 lives on this unconstrained wrapper, one level *outside*
    // the max-w-[440px] one, matching StartScreen's button/week-graph
    // pattern: on a wide viewport the inner content reaches the full
    // 440px (padding only eats into the *outer* unconstrained width,
    // which there's plenty of), giving 20px edge insets only once the
    // viewport itself gets narrow. Padding used to sit *inside* the
    // capped wrapper (one p-space-7 per step block) instead, which quietly
    // capped everything at 400px effective width — 40px narrower than
    // "Let's start" reaching its full 440px, which is why the two read as
    // different widths side by side.
    <div className="flex min-h-svh flex-col bg-background">
      <OnboardingHeader
        stepNumber={stepNumber}
        stepLabel={copy.label}
        onBack={isFirstStep ? undefined : goBack}
      />

      <div className="flex flex-1 flex-col px-space-7">
        <div className="mx-auto flex w-full max-w-[440px] flex-1 flex-col">
          <div className="flex flex-col items-center gap-space-9 py-space-7">
            <h1 className="text-heading leading-heading text-foreground text-center">
              {withLineBreaks(copy.title)}
            </h1>
            {copy.description && (
              <p className="text-body leading-body text-foreground-secondary text-center">
                {withLineBreaks(copy.description)}
              </p>
            )}
          </div>

          <div className={showsContinueButton ? 'flex-1 pb-[104px]' : 'flex-1'}>
            {stepId === 'name' && (
              <div className="flex flex-col items-center justify-center gap-space-8 py-space-7">
                <input
                  type="text"
                  value={answers.name ?? ''}
                  onChange={(event) => updateAnswer('name', event.target.value)}
                  placeholder="Name or alias"
                  autoFocus
                  // Left-aligned while empty, so the caret sits right
                  // before the placeholder text like a normal text field
                  // instead of floating in the middle of it; once there's
                  // a value, text-center keeps typed characters growing
                  // from the middle of the (centered) box instead of the
                  // left edge, which would otherwise read as off-center.
                  className={`text-display-md leading-display-md text-foreground placeholder:text-foreground/40 w-full max-w-[184px] border-none bg-transparent outline-none ${answers.name ? 'text-center' : 'text-left'}`}
                />
              </div>
            )}

            {stepId === 'goal' && (
              <div className="flex flex-col items-center gap-space-6 py-space-7">
                {GOAL_OPTIONS.map((option) => (
                  <SingleSelectRow
                    key={option.value}
                    label={option.label}
                    description={option.description}
                    selected={answers.goal === option.value}
                    onSelect={() => updateAnswer('goal', option.value)}
                  />
                ))}
              </div>
            )}

            {stepId === 'trainingHistory' && (
              <div className="flex flex-col items-center gap-space-6 py-space-7">
                {TRAINING_HISTORY_OPTIONS.map((option) => (
                  <SingleSelectRow
                    key={option.value}
                    label={option.label}
                    description={option.description}
                    selected={answers.trainingHistory === option.value}
                    onSelect={() => updateAnswer('trainingHistory', option.value)}
                  />
                ))}
              </div>
            )}

            {stepId === 'currentStrengthTrainingFrequency' && (
              <div className="flex flex-col items-center gap-space-6 py-space-7">
                {CURRENT_FREQUENCY_OPTIONS.map((option) => (
                  <SingleSelectRow
                    key={option.value}
                    label={option.label}
                    selected={answers.currentStrengthTrainingFrequency === option.value}
                    onSelect={() => updateAnswer('currentStrengthTrainingFrequency', option.value)}
                  />
                ))}
              </div>
            )}

            {stepId === 'daysPerWeek' && (
              <div className="flex flex-col items-center gap-space-6 py-space-7">
                {DAYS_OPTIONS.map((option) => (
                  <SingleSelectRow
                    key={option.value}
                    label={option.label}
                    selected={answers.daysPerWeek === option.value}
                    onSelect={() => updateAnswer('daysPerWeek', option.value)}
                  />
                ))}
              </div>
            )}

            {stepId === 'sessionDuration' && (
              <div className="flex flex-col items-center gap-space-6 py-space-7">
                {DURATION_OPTIONS.map((option) => (
                  <SingleSelectRow
                    key={option.value}
                    label={option.label}
                    selected={answers.sessionDuration === option.value}
                    onSelect={() => updateAnswer('sessionDuration', option.value)}
                  />
                ))}
              </div>
            )}

            {stepId === 'trainingEnvironment' && (
              <div className="flex flex-col items-center gap-space-6 py-space-7">
                {EQUIPMENT_MODE_OPTIONS.map((option) => (
                  <SingleSelectRow
                    key={option.value}
                    label={option.label}
                    description={option.description}
                    selected={answers.trainingEnvironment === option.value}
                    onSelect={() => updateAnswer('trainingEnvironment', option.value)}
                  />
                ))}
              </div>
            )}

            {stepId === 'equipment' && (
              <div className="flex flex-wrap justify-center gap-space-6 py-space-7">
                {EQUIPMENT_OPTIONS.map((option) => {
                  const selected = answers.equipment?.includes(option.value) ?? false;
                  return (
                    <MultiSelectChip
                      key={option.value}
                      label={option.label}
                      selected={selected}
                      onToggle={() => {
                        const current = answers.equipment ?? [];
                        updateAnswer(
                          'equipment',
                          selected ? current.filter((item) => item !== option.value) : [...current, option.value],
                        );
                      }}
                    />
                  );
                })}
              </div>
            )}

          </div>
        </div>
      </div>

      {showsContinueButton && (
        // Same outer-padding/inner-cap split as above: the outer fixed div
        // spans the viewport with px-space-7 insets and no width cap; the
        // inner div applies max-w-[440px] with no padding of its own, so
        // the button reaches the same true 440px as "Let's start" instead
        // of being pinched to 400px by padding living inside the cap.
        <div className="fixed inset-x-0 bottom-[32px] px-space-7">
          <div className="mx-auto w-full max-w-[440px]">
            <Button
              variant="primary"
              className="w-full"
              disabled={!canGoNext}
              onClick={() => void goNext()}
            >
              {isLastStep ? 'Create my Plan' : 'Continue'}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
