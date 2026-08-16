import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { withLineBreaks } from '@/lib/text';
import { MultiSelectChip } from './MultiSelectChip';
import { OnboardingHeader } from './OnboardingHeader';
import { SingleSelectRow } from './SingleSelectRow';
import { StartScreen } from './StartScreen';
import {
  DAYS_OPTIONS,
  DURATION_OPTIONS,
  ENVIRONMENT_OPTIONS,
  EQUIPMENT_OPTIONS,
  EXPERIENCE_OPTIONS,
  GOAL_OPTIONS,
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
  weight: {
    label: 'Weight',
    title: "What's your weight?",
    description: 'We use this to better adjust your training and starting weights.',
  },
  height: {
    label: 'Height',
    title: 'How tall are you?',
    description: 'This helps us better tailor your training.',
  },
  goal: {
    label: 'Goal',
    title: 'What do you want to get\nfrom your training?',
    description: 'Pick the goal that matters most\nto you right now.',
  },
  experience: { label: 'Experience', title: 'How experienced are you with strength training?' },
  daysPerWeek: {
    label: 'Days',
    title: 'How many days do you\nwant to train?',
    description: "We'll build your weekly plan around this.",
  },
  sessionDuration: {
    label: 'Time',
    title: 'How much time do you\nusually have?',
    description: 'Per workout.',
  },
  trainingEnvironment: { label: 'Equipment', title: 'Where will you train?' },
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
  // Local text mirrors for the two numeric fields: `answers.weightKg`/
  // `heightCm` can only ever hold a valid positive number (updateAnswer's
  // type doesn't allow undefined for a required field), but the input
  // needs to represent "empty" and "mid-edit" states while typing —
  // without this, backspacing to clear the field would have nothing to
  // set state to and the controlled input would appear stuck. Committed
  // to `answers` (and so to canAdvance) only once the text parses to a
  // valid positive number; initialized from any already-committed value
  // so going back to a completed step still shows what was entered.
  const [weightText, setWeightText] = useState(() => (answers.weightKg ? String(answers.weightKg) : ''));
  const [heightText, setHeightText] = useState(() => (answers.heightCm ? String(answers.heightCm) : ''));

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

            {stepId === 'weight' && (
              <div className="flex flex-col items-center justify-center gap-space-8 py-space-7">
                <div className="flex items-baseline gap-space-2">
                  <input
                    type="number"
                    inputMode="decimal"
                    value={weightText}
                    onChange={(event) => {
                      const text = event.target.value;
                      setWeightText(text);
                      const value = Number(text);
                      if (text !== '' && Number.isFinite(value) && value > 0) updateAnswer('weightKg', value);
                    }}
                    placeholder="55"
                    autoFocus
                    className="text-display-md leading-display-md text-foreground placeholder:text-foreground/40 w-[120px] border-none bg-transparent text-right outline-none"
                  />
                  <span className="text-display-md leading-display-md text-foreground-secondary">kg</span>
                </div>
              </div>
            )}

            {stepId === 'height' && (
              <div className="flex flex-col items-center justify-center gap-space-8 py-space-7">
                <div className="flex items-baseline gap-space-2">
                  <input
                    type="number"
                    inputMode="decimal"
                    value={heightText}
                    onChange={(event) => {
                      const text = event.target.value;
                      setHeightText(text);
                      const value = Number(text);
                      if (text !== '' && Number.isFinite(value) && value > 0) updateAnswer('heightCm', value);
                    }}
                    placeholder="165"
                    autoFocus
                    className="text-display-md leading-display-md text-foreground placeholder:text-foreground/40 w-[120px] border-none bg-transparent text-right outline-none"
                  />
                  <span className="text-display-md leading-display-md text-foreground-secondary">cm</span>
                </div>
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

            {stepId === 'experience' && (
              <div className="flex flex-col items-center gap-space-6 py-space-7">
                {EXPERIENCE_OPTIONS.map((option) => (
                  <SingleSelectRow
                    key={option.value}
                    label={option.label}
                    description={option.description}
                    selected={answers.experience === option.value}
                    onSelect={() => updateAnswer('experience', option.value)}
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
                {ENVIRONMENT_OPTIONS.map((option) => (
                  <SingleSelectRow
                    key={option.value}
                    label={option.label}
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
