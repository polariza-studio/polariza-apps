import { useParams } from 'react-router-dom';

import { Button } from '@/components/ui/button';
import { formatElapsed } from './active-workout';
import { useActiveWorkout } from './use-active-workout';

// Dark-gradient surface — Paper's "workout-page-ending" artboard —
// foreground-inverse tokens, ghost-inverse for the lower-emphasis action.
// Light-to-dark (not dark-to-light) and front-loaded into the top quarter
// (26.17%), matching Paper's stops exactly rather than spreading the
// transition across the full height.
const GRADIENT = 'linear-gradient(in oklab 180deg, oklab(42.4% -0.056 0.070) 0%, oklab(33.9% -0.056 0.070) 26.17%)';

export function WorkoutCompletePage() {
  const { workoutId = '' } = useParams<{ workoutId: string }>();
  const { ready, workout, saveActivity, discardActivity } = useActiveWorkout(workoutId);

  if (!ready || !workout) return null;

  return (
    <div className="flex min-h-svh flex-col items-center" style={{ backgroundImage: GRADIENT }}>
      {/* Empty top-section spacer — Paper hides the back button on this
          screen (no way back once the workout is finished), but keeps the
          64px reserved header space. */}
      <div className="mx-auto h-16 w-full max-w-[440px] px-space-7 py-space-7" />

      <div className="mx-auto flex w-full max-w-[440px] flex-1 flex-col items-center justify-center gap-space-8 px-space-7 text-center">
        <div className="flex flex-col items-center gap-space-3">
          <span className="text-body leading-body text-foreground-inverse-secondary">Tiempo de entreno</span>
          <span className="text-display-lg leading-display-lg font-light text-foreground-inverse">
            {formatElapsed(workout.elapsedSeconds)}
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
