import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { IconButton } from '@/components/ui/icon-button';
import { withLineBreaks } from '@/lib/text';
import { MultiSelectChip } from '@/features/onboarding/MultiSelectChip';

// Multi-select sibling of SingleChoicePicker — same shell (back-arrow-only
// header, title/description, its own "Save changes" button, nothing
// committed to the shared draft until Save), chips instead of rows since
// more than one value can be selected. Same MultiSelectChip the main
// Settings screen already uses inline for Equipment.
export function MultiChoicePicker<T>({
  title,
  description,
  options,
  initialValue,
  onSave,
}: {
  title: string;
  description?: string;
  options: { value: T; label: string }[];
  initialValue: T[];
  onSave: (value: T[]) => void;
}) {
  const navigate = useNavigate();
  const [selected, setSelected] = useState<T[]>(initialValue);

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

          <div className="flex flex-wrap justify-center gap-space-6 py-space-7">
            {options.map((option, index) => {
              const isSelected = selected.includes(option.value);
              return (
                <MultiSelectChip
                  key={index}
                  label={option.label}
                  selected={isSelected}
                  onToggle={() =>
                    setSelected(
                      isSelected ? selected.filter((value) => value !== option.value) : [...selected, option.value],
                    )
                  }
                />
              );
            })}
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
