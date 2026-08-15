import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { IconButton } from '@/components/ui/icon-button';
import { withLineBreaks } from '@/lib/text';
import { SingleSelectRow } from '@/features/onboarding/SingleSelectRow';

// Reused for Goal/Experience/Days/Time (Paper only fully designed one
// instance, "adjust plan-days" — the other three follow the same
// structure: back arrow only header (no wordmark/step-bar, unlike
// onboarding's), title (+ optional description), a plain list of
// SingleSelectRow's no-description variant, and its own "Save changes"
// button — selecting a row doesn't auto-advance here, it stays local
// until Save is tapped, then commits to the shared draft and goes back.
export function SingleChoicePicker<T>({
  title,
  description,
  options,
  initialValue,
  onSave,
}: {
  title: string;
  description?: string;
  options: { value: T; label: string }[];
  initialValue: T;
  onSave: (value: T) => void;
}) {
  const navigate = useNavigate();
  const [selected, setSelected] = useState(initialValue);

  return (
    <div className="flex min-h-svh flex-col bg-background">
      <div className="flex h-16 shrink-0 items-center p-space-7">
        <IconButton aria-label="Go back" onClick={() => navigate(-1)}>
          <ArrowLeft />
        </IconButton>
      </div>

      <div className="flex flex-1 flex-col px-space-7">
        <div className="mx-auto flex w-full max-w-[440px] flex-1 flex-col">
          <div className="flex flex-col items-center gap-space-9 py-space-7">
            <h1 className="text-heading leading-heading font-light text-foreground text-center">
              {withLineBreaks(title)}
            </h1>
            {description && (
              <p className="text-body leading-body text-foreground-secondary text-center">
                {withLineBreaks(description)}
              </p>
            )}
          </div>

          <div className="flex flex-col items-center gap-space-6 py-space-7">
            {options.map((option, index) => (
              <SingleSelectRow
                key={index}
                label={option.label}
                selected={selected === option.value}
                onSelect={() => setSelected(option.value)}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="px-space-7 py-[32px]">
        <div className="mx-auto w-full max-w-[440px]">
          <Button variant="primary" className="w-full" onClick={() => onSave(selected)}>
            Save changes
          </Button>
        </div>
      </div>
    </div>
  );
}
