import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Play } from 'lucide-react';

import { BottomActions } from '@/components/ui/bottom-actions';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/ui/page-header';
import type { Activity } from '@/domain/activity';
import type { Workout, WorkoutExercise } from '@/domain/workout';
import { storageRepository } from '@/services/storage';
import { lastWeightForExercise } from './active-workout';

// "3x8-10 · 35 kg · 60 s" — matches Paper's "preview-workout" artboard
// exactly, including the lowercase "x" (not "×", unlike
// ReorderableExerciseList's own summary format — this screen has its own
// wording in Paper, not reconciled with that one). Weight is the
// exercise's own last-performed weight (lastWeightForExercise, already
// used by WorkoutActivePage's "Última vez" line) — a Workout's own
// exercises never carry weight themselves, only performed Activity sets
// do — and is omitted entirely, not shown as a placeholder, when there's
// no history for it yet.
function exerciseSummary(exercise: WorkoutExercise, lastWeight: number | undefined): string {
  const weightSegment = lastWeight !== undefined ? `${lastWeight} kg · ` : '';
  return `${exercise.sets}x${exercise.targetReps} · ${weightSegment}${exercise.restSeconds} s`;
}

// Paper: "preview-workout". A read-only overview of a workout's exercises,
// reached by tapping a workout card on Home (which previously started the
// workout immediately on tap — SwipeableWorkoutRow's tap now opens this
// instead). Inverse (dark moss) surface, the same background-inverse
// context as WorkoutCompletePage.
export function WorkoutPreviewPage() {
  const { workoutId = '' } = useParams<{ workoutId: string }>();
  const navigate = useNavigate();
  const [workout, setWorkout] = useState<Workout | null>(null);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    Promise.all([storageRepository.getWorkout(workoutId), storageRepository.getActivities()]).then(
      ([loadedWorkout, loadedActivities]) => {
        if (cancelled) return;
        setWorkout(loadedWorkout);
        setActivities(loadedActivities);
        setReady(true);
      },
    );
    return () => {
      cancelled = true;
    };
  }, [workoutId]);

  if (!ready) return null;
  if (!workout) {
    navigate('/home', { replace: true });
    return null;
  }

  return (
    <div className="bg-background-inverse flex min-h-svh flex-col">
      <PageHeader onClose={() => navigate('/home')} inverse />

      <div className="w-full p-space-7">
        <div className="mx-auto w-full max-w-[440px]">
          <span className="text-display-md leading-display-md font-light text-foreground-inverse">{workout.name}</span>
        </div>
      </div>

      <div className="flex w-full flex-1 flex-col px-space-7 pt-space-7 pb-space-9">
        <div className="mx-auto flex w-full max-w-[440px] flex-1 flex-col gap-space-7">
          <span className="text-body leading-body text-foreground-inverse-secondary">Ejercicios</span>

          <div className="flex flex-col gap-space-5">
            {workout.exercises.map((exercise, index) => {
              const lastWeight = lastWeightForExercise(exercise.name, activities);
              return (
                <div key={exercise.id} className="flex items-start justify-center gap-space-5">
                  {/* bg white@4% — no Foundations token covers this exact
                      tint yet (closest, interactive-subtle-inverse, is
                      white@10%); inlined the same way SwipeableWorkoutRow's
                      destructive red is, pending a token if this pattern
                      recurs. */}
                  <div className="flex w-12 shrink-0 items-center justify-center rounded-lg bg-[color-mix(in_srgb,var(--neutral-0)_4%,transparent)] p-space-2">
                    <span className="text-label leading-label text-foreground-inverse-secondary text-center">
                      {index + 1}
                    </span>
                  </div>
                  {/* outline-interactive-subtle-inverse: that token is also
                      white@10%, the same value Paper uses for this card's
                      outline — reused here for its value, not its
                      background-fill name; there's no separate
                      border-subtle-inverse token. Paper uses a real CSS
                      outline here (like several other cards in the app),
                      not a border. */}
                  <div className="outline-interactive-subtle-inverse flex flex-1 flex-col items-start gap-space-3 rounded-lg px-space-6 py-space-5 outline outline-1">
                    <span className="text-heading leading-heading font-light text-foreground-inverse">{exercise.name}</span>
                    <span className="text-caption leading-caption text-foreground-inverse-secondary">
                      {exerciseSummary(exercise, lastWeight)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <BottomActions ready={ready} inverse>
        <Button variant="primary" className="w-full" onClick={() => navigate(`/workouts/${workout.id}/active`)}>
          <Play data-icon="inline-start" fill="currentColor" stroke="none" />
          Empezar ahora
        </Button>
      </BottomActions>
    </div>
  );
}
