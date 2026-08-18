import { useState } from 'react';
import { Dialog } from 'radix-ui';
import { X } from 'lucide-react';

import { Button } from '@/components/ui/button';
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
  // state doesn't reset itself between opens.
  const [seededFor, setSeededFor] = useState<string | null>(null);
  const seedKey = open ? (exercise?.id ?? 'new') : null;
  if (open && seedKey !== seededFor) {
    setName(exercise?.name ?? '');
    setSets(exercise ? String(exercise.sets) : '');
    setTargetReps(exercise?.targetReps ?? '');
    setRestSeconds(exercise ? String(exercise.restSeconds) : '');
    setSeededFor(seedKey);
  }

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
          className="fixed inset-x-0 bottom-0 z-50 mx-auto flex max-h-[90vh] w-full max-w-[440px] flex-col overflow-y-auto rounded-t-2xl bg-background outline-none data-[state=open]:animate-in data-[state=open]:slide-in-from-bottom data-[state=closed]:animate-out data-[state=closed]:slide-out-to-bottom md:top-1/2 md:bottom-auto md:-translate-y-1/2 md:rounded-2xl"
        >
          <div className="flex items-center justify-between p-space-7">
            <Dialog.Title className="text-body leading-body text-foreground-secondary">
              {exercise ? 'Editar' : 'Nuevo'} · ejercicio
            </Dialog.Title>
            <Dialog.Close asChild>
              <button type="button" aria-label="Cerrar" className="text-foreground">
                <X className="size-5 [stroke-width:1.5]" />
              </button>
            </Dialog.Close>
          </div>

          <div className="flex flex-col gap-space-3 px-space-7 pt-space-7 pb-space-4">
            <label htmlFor="exercise-name" className="text-label leading-label text-foreground-secondary">
              Nombre del ejercicio
            </label>
            <input
              id="exercise-name"
              list="exercise-name-suggestions"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Nombre del ejercicio"
              className="text-display-md leading-display-md text-foreground placeholder:text-foreground/40 w-full border-none bg-transparent font-light outline-none"
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
              className="text-display-md leading-display-md text-foreground placeholder:text-foreground/40 w-full border-none bg-transparent font-light outline-none"
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
              className="text-display-md leading-display-md text-foreground placeholder:text-foreground/40 w-full border-none bg-transparent font-light outline-none"
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
              className="text-display-md leading-display-md text-foreground placeholder:text-foreground/40 w-full border-none bg-transparent font-light outline-none"
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
