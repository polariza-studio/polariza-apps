import { Navigate, useNavigate, useParams } from 'react-router-dom';
import { X } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { IconButton } from '@/components/ui/icon-button';
import type { Workout } from '@/domain/workout';
import { storageRepository } from '@/services/storage';
import { decodeSharedWorkout } from './share-link';

// Paper: "workout-shared-modal" — the landing page for a shared workout
// link (share-link.ts encodes the workout straight into the URL, no
// backend). Not a Radix Dialog like the app's other modals: this has to
// be a real route (its own URL, reachable by opening the link cold) —
// styled to match the same bottom-sheet-over-a-dark-backdrop look anyway.
export function SharedWorkoutPage() {
  const { encoded = '' } = useParams<{ encoded: string }>();
  const navigate = useNavigate();
  const shared = decodeSharedWorkout(encoded);

  if (!shared) return <Navigate to="/home" replace />;

  async function handleAdd() {
    if (!shared) return;
    const workout: Workout = {
      id: crypto.randomUUID(),
      name: shared.name,
      exercises: shared.exercises,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    await storageRepository.saveWorkout(workout);
    navigate('/home', { replace: true });
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end bg-black/40">
      <div className="mx-auto flex w-full max-w-[440px] flex-col rounded-t-2xl bg-background">
        <div className="flex items-center justify-between p-space-7">
          <span className="text-body leading-body line-clamp-1">
            <span className="text-foreground">Workout</span>
            <span className="text-foreground-secondary"> · Compartido</span>
          </span>
          <IconButton aria-label="Cerrar" className="text-foreground shrink-0" onClick={() => navigate('/home')}>
            <X />
          </IconButton>
        </div>

        <div className="flex flex-col gap-space-7 p-space-7">
          <span className="text-heading leading-heading text-center font-light text-foreground">
            ¿Añadir este workout?
          </span>
          <div className="bg-background flex items-center gap-space-5 rounded-xl p-space-7">
            <div className="border-border-subtle flex flex-1 flex-col items-start gap-space-3 rounded-lg border px-space-6 py-space-5">
              <span className="text-heading leading-heading font-light text-foreground">{shared.name}</span>
              <span className="text-caption leading-caption text-foreground-secondary">
                {shared.exercises.length} ejercicios
              </span>
            </div>
          </div>
        </div>

        <div className="flex flex-col items-center gap-space-6 px-space-7 pt-space-7 pb-[32px]">
          <Button variant="primary" className="w-full" onClick={() => void handleAdd()}>
            Añadir a mis workouts
          </Button>
          <Button variant="ghost" className="w-full" onClick={() => navigate('/home')}>
            Cancelar
          </Button>
        </div>
      </div>
    </div>
  );
}
