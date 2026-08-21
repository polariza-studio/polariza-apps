import { useCallback, useState } from 'react';
import { Dialog } from 'radix-ui';

import { Button } from '@/components/ui/button';
import { FormField } from '@/components/ui/form-field';
import { ModalSheet } from '@/components/ui/modal-sheet';
import { PageHeader } from '@/components/ui/page-header';
import { TextField } from '@/components/ui/text-field';
import type { WorkoutExercise } from '@/domain/workout';

// Bottom-sheet form for adding/editing one exercise — Paper's
// "modal"/"modal-empty" artboards. Free-text fields only, no exercise
// library: Name/Sets/Reps/Rest is the entire exercise definition, no
// weight (weight belongs to performed Activity data, not the workout).
export function ExerciseModal({
  open,
  onOpenChange,
  exercise,
  knownNames,
  onSave,
  onDelete,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  exercise: WorkoutExercise | null;
  knownNames: string[];
  onSave: (exercise: WorkoutExercise) => void;
  onDelete: (exerciseId: string) => void;
}) {
  const [name, setName] = useState('');
  const [sets, setSets] = useState('');
  const [targetReps, setTargetReps] = useState('');
  const [restSeconds, setRestSeconds] = useState('');

  // Re-seed fields whenever a different exercise is opened (or the modal
  // opens fresh for a new one) — Radix keeps this component mounted, so
  // state doesn't reset itself between opens. seededFor resets to null on
  // close so every subsequent "new exercise" open re-seeds to empty —
  // without this, two consecutive "add" sessions share the same seed key
  // ('new') and the second one silently kept the first one's saved values.
  const [seededFor, setSeededFor] = useState<string | null>(null);
  const seedKey = open ? (exercise?.id ?? 'new') : null;
  if (open && seedKey !== seededFor) {
    setName(exercise?.name ?? '');
    setSets(exercise ? String(exercise.sets) : '');
    setTargetReps(exercise?.targetReps ?? '');
    setRestSeconds(exercise ? String(exercise.restSeconds) : '');
    setSeededFor(seedKey);
  } else if (!open && seededFor !== null) {
    setSeededFor(null);
  }

  // Autofocus for a new exercise, done as a ref callback so it fires
  // synchronously in React's commit — same task as the click that opened
  // the modal, which mobile browsers require to open the keyboard at
  // all. Plain focus(), no preventScroll: the entrance animation is
  // skipped below (via `exercise ? '...animate-in...' : ''` on
  // Dialog.Content) specifically so this can be a genuinely native,
  // unmodified focus() call — with no animation running, the sheet is
  // already at its final geometry the instant this fires, so the
  // browser's own scroll-to-reveal reflow (the same one a manual tap
  // relies on) computes against the real position and produces the same
  // native nudge, not the wrong one.
  //
  // Two earlier attempts both traded one requirement for the other:
  // preventScroll:true kept the keyboard opening but suppressed that
  // native nudge entirely; awaiting getAnimations()/.finished before
  // calling focus() got the nudge right but moved the call outside the
  // click's synchronous execution and silently stopped the keyboard from
  // opening on real devices. Dropping the entrance animation for this
  // one flow removes the conflict instead of trading between its halves.
  //
  // Memoized on seedKey (not a bare inline callback): an unmemoized ref
  // callback re-fires on every re-render — typing a Set/Rep/Rest value
  // would re-trigger it and yank focus back to the name field mid-entry.
  // Keying on seedKey means it only re-fires when a genuinely new dialog
  // instance mounts (same "once per open" semantics as the re-seed logic
  // above), never on a same-session re-render.
  const focusNameOnMount = useCallback(
    (node: HTMLInputElement | null) => {
      if (node && seedKey === 'new') {
        node.focus();
      }
    },
    [seedKey],
  );

  const setsNumber = Number(sets);
  const restNumber = Number(restSeconds);
  const canSave = name.trim() !== '' && sets !== '' && setsNumber > 0 && targetReps.trim() !== '' && restSeconds !== '' && restNumber >= 0;

  function handleSave() {
    if (!canSave) return;
    onSave({
      id: exercise?.id ?? crypto.randomUUID(),
      name: name.trim(),
      sets: setsNumber,
      targetReps: targetReps.trim(),
      restSeconds: restNumber,
    });
    onOpenChange(false);
  }

  return (
    // Entrance animation is skipped only when opening for a new exercise —
    // see focusNameOnMount above for why. Editing keeps it: no exercise,
    // worked the same as always. Exit animation is untouched either way.
    <ModalSheet open={open} onOpenChange={onOpenChange} skipEntranceAnimation={!exercise}>
      <PageHeader
        title={{ emphasis: exercise ? 'Editar' : 'Nuevo', secondary: 'ejercicio' }}
        titleAs={Dialog.Title}
        onClose={() => onOpenChange(false)}
      />

      <div className="px-space-7 pt-space-7 pb-space-4">
        <FormField label="Nombre del ejercicio" htmlFor="exercise-name">
          <TextField
            id="exercise-name"
            ref={focusNameOnMount}
            list="exercise-name-suggestions"
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Nombre del ejercicio"
          />
          <datalist id="exercise-name-suggestions">
            {knownNames.map((knownName) => (
              <option key={knownName} value={knownName} />
            ))}
          </datalist>
        </FormField>
      </div>

      <div className="px-space-7 pt-space-7 pb-space-4">
        <FormField label="Sets" htmlFor="exercise-sets">
          <TextField
            id="exercise-sets"
            type="number"
            inputMode="numeric"
            min={1}
            value={sets}
            onChange={(event) => setSets(event.target.value)}
            placeholder="3"
          />
        </FormField>
      </div>

      <div className="px-space-7 pt-space-7 pb-space-4">
        <FormField label="Reps" htmlFor="exercise-reps">
          <TextField
            id="exercise-reps"
            value={targetReps}
            onChange={(event) => setTargetReps(event.target.value)}
            placeholder="8-10"
          />
        </FormField>
      </div>

      <div className="px-space-7 pt-space-7 pb-space-4">
        <FormField label="Descanso (s)" htmlFor="exercise-rest">
          <TextField
            id="exercise-rest"
            type="number"
            inputMode="numeric"
            min={0}
            value={restSeconds}
            onChange={(event) => setRestSeconds(event.target.value)}
            placeholder="60"
          />
        </FormField>
      </div>

      <div className="flex flex-col gap-space-6 px-space-7 py-[32px]">
        <Button variant="primary" className="w-full" disabled={!canSave} onClick={handleSave}>
          Guardar ejercicio
        </Button>
        {exercise && (
          <Button
            variant="ghost"
            className="w-full"
            onClick={() => {
              onDelete(exercise.id);
              onOpenChange(false);
            }}
          >
            Eliminar ejercicio
          </Button>
        )}
      </div>
    </ModalSheet>
  );
}
