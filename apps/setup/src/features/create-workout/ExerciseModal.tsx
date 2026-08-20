import { useCallback, useState } from 'react';
import { Dialog } from 'radix-ui';
import { X } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { IconButton } from '@/components/ui/icon-button';
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

  // Autofocus for a new exercise, done as a ref callback (not the plain
  // autoFocus attribute) so we can pass preventScroll: true — that's the
  // actual fix for the modal-jump bug: the browser's own "scroll the
  // focused element into view" runs against the input's still-animating
  // (slide-in-from-bottom) position and ends up hiding it once the
  // keyboard opens, something a manual tap never triggers because a
  // person can only tap once the sheet has visibly settled. Suppressing
  // that automatic scroll — not touching layout/scroll/viewport
  // ourselves — leaves the input exactly where it already is, which is
  // enough since it sits at the top of the sheet.
  //
  // This still fires synchronously in React's commit (same as the plain
  // autoFocus attribute did), inside the same gesture as the click that
  // opened the modal — required for mobile browsers to open the keyboard
  // at all. An earlier version deferred this focus() behind
  // getAnimations()/.finished to dodge the same bug, but awaiting that
  // promise moved the call outside the click's synchronous execution and
  // silently broke the keyboard on real devices.
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
        node.focus({ preventScroll: true });
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
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-black/40 data-[state=open]:animate-in data-[state=open]:fade-in data-[state=closed]:animate-out data-[state=closed]:fade-out" />
        <Dialog.Content
          aria-describedby={undefined}
          // isolate + will-change-transform: Safari/WebKit sub-pixel
          // misaligns and doubles descendant SVG icons in this dialog
          // without its own compositing layer. Not translate-z-0: this
          // element already has a real transform (md:-translate-y-1/2
          // for centering) that a literal `transform` override would
          // clobber.
          className="fixed inset-x-0 bottom-0 z-50 isolate mx-auto flex max-h-[90vh] w-full max-w-[440px] will-change-transform flex-col overflow-y-auto rounded-t-2xl bg-background outline-none data-[state=open]:animate-in data-[state=open]:slide-in-from-bottom data-[state=closed]:animate-out data-[state=closed]:slide-out-to-bottom md:top-1/2 md:bottom-auto md:-translate-y-1/2 md:rounded-2xl"
        >
          <div className="flex items-center justify-between p-space-7">
            <Dialog.Title className="text-body leading-body">
              <span className="text-foreground">{exercise ? 'Editar' : 'Nuevo'}</span>
              <span className="text-foreground-secondary"> · ejercicio</span>
            </Dialog.Title>
            <Dialog.Close asChild>
              <IconButton aria-label="Cerrar" className="text-foreground">
                <X />
              </IconButton>
            </Dialog.Close>
          </div>

          <div className="flex flex-col gap-space-3 px-space-7 pt-space-7 pb-space-4">
            <label htmlFor="exercise-name" className="text-label leading-label text-foreground-secondary">
              Nombre del ejercicio
            </label>
            <input
              id="exercise-name"
              ref={focusNameOnMount}
              list="exercise-name-suggestions"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Nombre del ejercicio"
              className="text-display-md leading-display-md text-foreground placeholder:text-foreground/30 w-full border-none bg-transparent font-light outline-none"
            />
            <datalist id="exercise-name-suggestions">
              {knownNames.map((knownName) => (
                <option key={knownName} value={knownName} />
              ))}
            </datalist>
          </div>

          <div className="flex flex-col gap-space-3 px-space-7 pt-space-7 pb-space-4">
            <label htmlFor="exercise-sets" className="text-label leading-label text-foreground-secondary">
              Sets
            </label>
            <input
              id="exercise-sets"
              type="number"
              inputMode="numeric"
              min={1}
              value={sets}
              onChange={(event) => setSets(event.target.value)}
              placeholder="3"
              className="text-display-md leading-display-md text-foreground placeholder:text-foreground/30 w-full border-none bg-transparent font-light outline-none"
            />
          </div>

          <div className="flex flex-col gap-space-3 px-space-7 pt-space-7 pb-space-4">
            <label htmlFor="exercise-reps" className="text-label leading-label text-foreground-secondary">
              Reps
            </label>
            <input
              id="exercise-reps"
              value={targetReps}
              onChange={(event) => setTargetReps(event.target.value)}
              placeholder="8-10"
              className="text-display-md leading-display-md text-foreground placeholder:text-foreground/30 w-full border-none bg-transparent font-light outline-none"
            />
          </div>

          <div className="flex flex-col gap-space-3 px-space-7 pt-space-7 pb-space-4">
            <label htmlFor="exercise-rest" className="text-label leading-label text-foreground-secondary">
              Descanso (s)
            </label>
            <input
              id="exercise-rest"
              type="number"
              inputMode="numeric"
              min={0}
              value={restSeconds}
              onChange={(event) => setRestSeconds(event.target.value)}
              placeholder="60"
              className="text-display-md leading-display-md text-foreground placeholder:text-foreground/30 w-full border-none bg-transparent font-light outline-none"
            />
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
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
