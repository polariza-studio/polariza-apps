import type * as React from 'react';

import { TextField } from '@/components/ui/text-field';

// ExerciseSetRow v1 — one editable set during an active workout (Set N
// chip + Reps/Peso card), extracted from WorkoutActivePage. Verified
// against Paper's "workout-started"/"workout-paused" artboards — matches
// exactly, no drift to correct here.
//
// Deliberately presentational: reps/weight are plain controlled-input
// props (value + onChange), not a domain-aware API — WorkoutActivePage
// keeps owning the actual set-update logic (updateSet) and its own
// weight-draft state (raw text tracked separately from the numeric value
// while typing, so a trailing "." or partial decimal isn't clobbered on
// every render). This mirrors FormField: the row owns its own anatomy,
// not the caller's state management.
//
// Does NOT include the "Descanso: N s" rest label between sets — that
// belongs to the list of rows (WorkoutActivePage), not to a single row,
// the same way it isn't part of ExerciseSetRow's own bordered card in
// Paper either.
type FieldProps = {
  value: number | string
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void
  placeholder?: string
}

function ExerciseSetRow({
  setNumber,
  reps,
  weight,
}: {
  setNumber: number
  reps: FieldProps
  weight: FieldProps
}) {
  return (
    <div className="flex items-start justify-center gap-space-5">
      <div className="bg-interactive-subtle flex w-12 shrink-0 items-center justify-center rounded-lg p-space-2">
        <span className="text-label leading-label text-foreground-secondary text-center">Set {setNumber}</span>
      </div>
      <div className="border-border-subtle flex flex-1 items-center gap-space-5 rounded-lg border p-space-5">
        <div className="flex flex-1 flex-col items-start gap-space-1">
          <span className="text-caption leading-caption text-foreground-secondary">Reps</span>
          <TextField
            type="number"
            inputMode="numeric"
            value={reps.value}
            onChange={reps.onChange}
            placeholder={reps.placeholder}
          />
        </div>
        <div className="bg-border-subtle w-px self-stretch" />
        <div className="flex flex-1 flex-col items-start gap-space-1">
          <span className="text-caption leading-caption text-foreground-secondary">Peso (kg)</span>
          <TextField
            type="text"
            inputMode="decimal"
            value={weight.value}
            onChange={weight.onChange}
            placeholder={weight.placeholder ?? '—'}
          />
        </div>
      </div>
    </div>
  )
}

export { ExerciseSetRow }
