import { useParams } from 'react-router-dom';

import { Button } from '@/components/ui/button';
import { formatElapsed } from './active-workout';
import { useActiveWorkout } from './use-active-workout';

export function WorkoutCompletePage() {
  const { workoutId = '' } = useParams<{ workoutId: string }>();
  const { ready, workout, elapsedSeconds, saveActivity, discardActivity } = useActiveWorkout(workoutId);

  if (!ready || !workout) return null;

  return (
    // Solid moss surface — verified against Paper's "workout-page-ending"
    // artboard (its own fill is flat #294000/--moss, no gradient stops at
    // all). A previous version here used a hand-authored CSS gradient
    // claiming to match Paper's stops; re-checked directly against the
    // current design, which has none — corrected rather than carried
    // forward. bg-background-inverse (--background-inverse: var(--moss))
    // is the semantic token for this exact color, same as the rest of the
    // system — not a raw var() reference. foreground-inverse tokens,
    // ghost-inverse for the lower-emphasis action, both still correct
    // against Paper regardless of the fill.
    <div className="bg-background-inverse flex min-h-svh flex-col items-center">
      {/* Empty top-section spacer — Paper hides the back button on this
          screen (no way back once the workout is finished), but keeps the
          64px reserved header space. */}
      <div className="mx-auto h-16 w-full max-w-[440px] px-space-7 py-space-7" />

      <div className="mx-auto flex w-full max-w-[440px] flex-1 flex-col items-center justify-center gap-space-8 px-space-7 text-center">
        <div className="flex flex-col items-center gap-space-3">
          <span className="text-body leading-body text-foreground-inverse-secondary">Tiempo de entreno</span>
          <span className="text-display-lg leading-display-lg font-light text-foreground-inverse">
            {formatElapsed(elapsedSeconds)}
          </span>
        </div>
        <span className="text-display-md leading-display-md font-light text-success">Bien hecho!</span>
      </div>

      <div className="mx-auto flex w-full max-w-[440px] flex-col gap-space-8 px-space-7 pt-8 pb-8">
        <Button variant="primary" className="w-full" onClick={() => void saveActivity()}>
          Guardar mi actividad
        </Button>
        <Button variant="ghost-inverse" className="w-full" onClick={() => void discardActivity()}>
          Descartar
        </Button>
      </div>
    </div>
  );
}
