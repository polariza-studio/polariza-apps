import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Plus, X } from 'lucide-react';

import { Button } from '@/components/ui/button';
import type { Workout, WorkoutExercise } from '@/domain/workout';
import { storageRepository } from '@/services/storage';
import { getKnownExerciseNames } from './exercise-name-suggestions';
import { ExerciseModal } from './ExerciseModal';
import { ReorderableExerciseList } from './ReorderableExerciseList';

// Paper's "crear-workout"/"crear-workout-empty" artboards. Handles both
// creating a new workout (no :workoutId) and opening an existing one for
// editing — same screen either way, no separate read-only view.
export function CreateWorkoutPage() {
  const { workoutId } = useParams<{ workoutId: string }>();
  const navigate = useNavigate();
  const [ready, setReady] = useState(false);
  const [id] = useState(() => workoutId ?? crypto.randomUUID());
  const [createdAt, setCreatedAt] = useState(() => new Date().toISOString());
  const [name, setName] = useState('');
  const [exercises, setExercises] = useState<WorkoutExercise[]>([]);
  const [knownNames, setKnownNames] = useState<string[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingExercise, setEditingExercise] = useState<WorkoutExercise | null>(null);

  useEffect(() => {
    let cancelled = false;
    Promise.all([
      workoutId ? storageRepository.getWorkout(workoutId) : Promise.resolve(null),
      storageRepository.getWorkouts(),
      storageRepository.getActivities(),
    ]).then(([existing, workouts, activities]) => {
      if (cancelled) return;
      if (existing) {
        setName(existing.name);
        setExercises(existing.exercises);
        setCreatedAt(existing.createdAt);
      }
      setKnownNames(getKnownExerciseNames(workouts, activities));
      setReady(true);
    });
    return () => {
      cancelled = true;
    };
  }, [workoutId]);

  if (!ready) return null;

  const canSave = name.trim() !== '' && exercises.length > 0;

  async function handleSave() {
    if (!canSave) return;
    const workout: Workout = {
      id,
      name: name.trim(),
      exercises,
      createdAt,
      updatedAt: new Date().toISOString(),
    };
    await storageRepository.saveWorkout(workout);
    navigate('/home');
  }

  function openNewExerciseModal() {
    setEditingExercise(null);
    setModalOpen(true);
  }

  function openEditExerciseModal(exercise: WorkoutExercise) {
    setEditingExercise(exercise);
    setModalOpen(true);
  }

  function handleSaveExercise(exercise: WorkoutExercise) {
    setExercises((current) => {
      const index = current.findIndex((existing) => existing.id === exercise.id);
      if (index === -1) return [...current, exercise];
      const next = [...current];
      next[index] = exercise;
      return next;
    });
  }

  function handleDeleteExercise(exerciseId: string) {
    setExercises((current) => current.filter((exercise) => exercise.id !== exerciseId));
  }

  return (
    <div className="bg-background flex min-h-svh flex-col">
      <div className="w-full p-space-7">
        <div className="mx-auto flex w-full max-w-[440px] items-center justify-between">
          <span className="text-body leading-body text-foreground-secondary">
            {workoutId ? 'Editar' : 'Nuevo'} · workout
          </span>
          <button type="button" aria-label="Cerrar" className="text-foreground" onClick={() => navigate('/home')}>
            <X className="size-5 [stroke-width:1.5]" />
          </button>
        </div>
      </div>

      <div className="w-full p-space-7">
        <div className="mx-auto w-full max-w-[440px]">
          <input
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Nombre del workout"
            className="text-display-md leading-display-md text-foreground placeholder:text-foreground/40 w-full border-none bg-transparent font-light outline-none"
          />
        </div>
      </div>

      <div className="flex-1 px-space-7 pt-space-7 pb-[40px]">
        <div className="mx-auto flex w-full max-w-[440px] flex-col gap-space-7">
          <span className="text-heading leading-heading font-light text-foreground-secondary">Ejercicios</span>

          {exercises.length === 0 ? (
            <div className="border-border-subtle text-body leading-body text-foreground-secondary flex flex-col items-center justify-center gap-space-3 rounded-lg border border-dashed px-space-6 py-[32px] text-center">
              Todavía no has añadido ningún ejercicio
            </div>
          ) : (
            <ReorderableExerciseList exercises={exercises} onReorder={setExercises} onSelect={openEditExerciseModal} />
          )}

          <Button variant="ghost" className="w-full" onClick={openNewExerciseModal}>
            <Plus data-icon="inline-start" />
            Añadir ejercicios
          </Button>
        </div>
      </div>

      <div className="px-space-7 py-[32px]">
        <div className="mx-auto w-full max-w-[440px]">
          <Button variant="primary" className="w-full" disabled={!canSave} onClick={() => void handleSave()}>
            Guardar Workout
          </Button>
        </div>
      </div>

      <ExerciseModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        exercise={editingExercise}
        knownNames={knownNames}
        onSave={handleSaveExercise}
        onDelete={handleDeleteExercise}
      />
    </div>
  );
}
