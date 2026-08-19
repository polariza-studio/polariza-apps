import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Pause, Play, SkipBack, SkipForward, Square } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { IconButton } from '@/components/ui/icon-button';
import { formatElapsed, lastWeightForExercise } from './active-workout';
import { useActiveWorkout } from './use-active-workout';
import { useBottomShadow } from '@/lib/use-bottom-shadow';
import { storageRepository } from '@/services/storage';
import type { Activity } from '@/domain/activity';

export function WorkoutActivePage() {
  const { workoutId = '' } = useParams<{ workoutId: string }>();
  const { ready, workout, updateSet, togglePause, goToNext, goToPrevious, finishWorkout, discardActivity } =
    useActiveWorkout(workoutId);

  const [activities, setActivities] = useState<Activity[]>([]);
  useEffect(() => {
    void storageRepository.getActivities().then(setActivities);
  }, []);

  const showActionsShadow = useBottomShadow(ready && Boolean(workout));

  if (!ready || !workout) return null;

  const exercise = workout.exercises[workout.currentExerciseIndex];
  if (!exercise) return null;

  const isFirst = workout.currentExerciseIndex === 0;
  const isLast = workout.currentExerciseIndex === workout.exercises.length - 1;
  const paused = Boolean(workout.pausedAt);
  const lastWeight = lastWeightForExercise(exercise.name, activities);

  return (
    <div className="bg-background flex min-h-svh flex-col items-center">
      <div className="w-full px-space-7 pb-space-7">
        <div className="mx-auto flex w-full max-w-[440px] flex-col gap-space-6">
          <div className="flex items-baseline justify-between gap-space-3 pt-space-7">
            <div className="flex items-end gap-space-3">
              <span className="text-heading leading-heading text-foreground">{formatElapsed(workout.elapsedSeconds)}</span>
              <span className="text-label leading-label text-foreground-secondary">
                {paused ? 'Tiempo · Pausado' : 'Tiempo'}
              </span>
            </div>
            <IconButton aria-label={paused ? 'Reanudar' : 'Pausar'} className="text-foreground" onClick={togglePause}>
              {paused ? <Play fill="currentColor" stroke="none" /> : <Pause fill="currentColor" stroke="none" />}
            </IconButton>
          </div>
          <div className="flex items-center gap-space-1">
            {workout.exercises.map((_, index) => (
              <div
                key={index}
                className={`h-1 flex-1 rounded-full ${index <= workout.currentExerciseIndex ? 'bg-state-active' : 'bg-state-inactive'}`}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="w-full flex-1 p-space-7">
        <div className="mx-auto flex w-full max-w-[440px] flex-col gap-space-8">
          <div className="flex flex-col gap-space-3">
            <span className="text-display-md leading-display-md font-light text-foreground">{exercise.name}</span>
            {lastWeight !== undefined && (
              <span className="text-body leading-body text-foreground-secondary">Última vez: {lastWeight} kg</span>
            )}
          </div>

          <div className="flex flex-col gap-space-5">
            {exercise.sets.map((set, setIndex) => (
              <div key={setIndex} className="flex flex-col gap-space-5">
                <div className="flex items-start justify-center gap-space-5">
                  <div className="bg-interactive-subtle flex w-12 shrink-0 items-center justify-center rounded-lg p-space-2">
                    <span className="text-label leading-label text-foreground-secondary text-center">Set {setIndex + 1}</span>
                  </div>
                  <div className="border-border-subtle flex flex-1 items-center gap-space-5 rounded-lg border p-space-5">
                    <div className="flex flex-1 flex-col items-start gap-space-1">
                      <span className="text-label leading-label text-foreground-secondary">Reps</span>
                      <input
                        type="number"
                        inputMode="numeric"
                        value={set.reps ?? ''}
                        onChange={(event) => {
                          const reps = event.target.value === '' ? undefined : Number(event.target.value);
                          updateSet(workout.currentExerciseIndex, setIndex, { reps, completed: reps !== undefined });
                        }}
                        placeholder={exercise.targetReps}
                        className="text-display-md leading-display-md text-foreground placeholder:text-foreground/40 w-full border-none bg-transparent outline-none"
                      />
                    </div>
                    <div className="bg-border-subtle w-px self-stretch" />
                    <div className="flex flex-1 flex-col items-start gap-space-1">
                      <span className="text-label leading-label text-foreground-secondary">Peso (kg)</span>
                      <input
                        type="text"
                        inputMode="decimal"
                        value={set.weight ?? ''}
                        onChange={(event) => {
                          const raw = event.target.value.replace(',', '.');
                          if (raw !== '' && !/^\d*\.?\d*$/.test(raw)) return;
                          const weight = raw === '' ? undefined : Number(raw);
                          updateSet(workout.currentExerciseIndex, setIndex, { weight });
                        }}
                        placeholder="—"
                        className="text-display-md leading-display-md text-foreground placeholder:text-foreground/40 w-full border-none bg-transparent outline-none"
                      />
                    </div>
                  </div>
                </div>
                {setIndex < exercise.sets.length - 1 && (
                  <span className="pl-[68px] text-caption leading-caption text-foreground-secondary">
                    Descanso: {exercise.restSeconds} s
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div
        className={`bg-background sticky bottom-0 w-full px-space-7 pt-space-7 pb-8 ${showActionsShadow ? 'shadow-[0_-2px_35px_rgba(41,64,0,0.1)]' : ''}`}
      >
        <div className="mx-auto flex w-full max-w-[440px] items-center gap-space-6">
          {paused ? (
            <Button variant="primary" className="flex-1" onClick={togglePause}>
              <Play data-icon="inline-start" fill="currentColor" stroke="none" />
              Reanudar
            </Button>
          ) : isFirst ? (
            <Button variant="ghost" className="flex-1" onClick={() => void discardActivity()}>
              Salir
            </Button>
          ) : (
            <Button variant="ghost" className="flex-1" onClick={goToPrevious}>
              <SkipBack data-icon="inline-start" fill="currentColor" stroke="currentColor" />
              Anterior
            </Button>
          )}

          {paused || isLast ? (
            <Button variant="secondary" className="flex-1" onClick={finishWorkout}>
              <Square data-icon="inline-start" fill="currentColor" stroke="none" />
              Finalizar
            </Button>
          ) : (
            <Button variant="primary" className="flex-1" onClick={goToNext}>
              Siguiente
              <SkipForward data-icon="inline-end" fill="currentColor" stroke="currentColor" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
