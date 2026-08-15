import { ArrowLeft } from 'lucide-react';

import { IconButton } from '@/components/ui/icon-button';
import { ONBOARDING_STEP_COUNT } from './steps';

// Measured from Paper's onboarding screens (audited 2026-08-14) — shared
// chrome for every step: leading slot (Back, or the "SetUp" wordmark on
// step 1, which has nothing to go back to) + "Plan your Workout" title,
// then "N of 7 · Label" counter, then a 7-segment cumulative progress bar
// (segments 1..stepNumber filled, not just the current one — confirmed via
// get_computed_styles on two adjacent segments on the same screen).
export function OnboardingHeader({
  stepNumber,
  stepLabel,
  onBack,
}: {
  stepNumber: number;
  stepLabel: string;
  onBack?: () => void;
}) {
  return (
    <div className="flex flex-col">
      <div className="flex h-16 shrink-0 items-center p-space-7">
        <div className="flex flex-1 items-center justify-between gap-space-1">
          {onBack ? (
            <IconButton aria-label="Go back" onClick={onBack}>
              <ArrowLeft />
            </IconButton>
          ) : (
            <span className="text-body-emphasis leading-body-emphasis text-foreground">SetUp</span>
          )}
          <span className="text-body leading-body text-foreground-secondary">Plan your Workout</span>
        </div>
      </div>
      <div className="flex flex-col gap-space-3 px-space-7 pb-space-7">
        <div className="flex items-baseline gap-space-1 pt-space-5">
          <span className="text-label leading-label text-foreground-secondary">
            {stepNumber} of {ONBOARDING_STEP_COUNT}
          </span>
          <span className="text-label leading-label text-foreground-secondary">·</span>
          <span className="text-label leading-label text-foreground">{stepLabel}</span>
        </div>
        <div className="flex h-[3px] gap-[2px]">
          {Array.from({ length: ONBOARDING_STEP_COUNT }, (_, index) => (
            <div
              key={index}
              className={index < stepNumber ? 'flex-1 bg-primary' : 'flex-1 bg-border-subtle'}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
