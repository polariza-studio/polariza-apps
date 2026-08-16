import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ChevronLeft, Play } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { IconButton } from '@/components/ui/icon-button';
import type { OnboardingAnswers } from '@/domain/onboarding';
import type { TrainingDay } from '@/domain/plan';
import { exerciseLibrary } from '@/training/exercises/exercise-library';
import { storageRepository } from '@/services/storage';
import {
  formatMuscleGroup,
  getMusclesWorked,
  getSessionLevel,
  getStructureSummary,
  getWhatToExpect,
} from './workout-overview';

// Paper's "workout-page-starter" artboard: a dark gradient screen (not a
// light one like Home/Adjust Plan) — foreground-inverse tokens throughout.
const GRADIENT = 'linear-gradient(180deg, oklab(33.9% -0.056 0.070) 0%, oklab(42.4% -0.056 0.070) 100%)';

function MetaRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col items-start gap-space-1">
      <span className="text-label leading-label text-foreground-inverse-secondary">{label}</span>
      <span className="text-body leading-body text-foreground-inverse">{value}</span>
    </div>
  );
}

export function WorkoutOverviewPage() {
  const { dayId } = useParams<{ dayId: string }>();
  const navigate = useNavigate();
  const [preferences, setPreferences] = useState<OnboardingAnswers | null>(null);
  const [day, setDay] = useState<TrainingDay | null>(null);
  // Position within the week, matching Home's "Day N" chip convention
  // (ReorderableDayList — derived from array index, not stored on
  // TrainingDay itself).
  const [dayPosition, setDayPosition] = useState(0);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    Promise.all([storageRepository.getPreferences(), storageRepository.getCurrentPlan()]).then(
      ([loadedPreferences, plan]) => {
        if (cancelled) return;
        const foundIndex = plan?.days.findIndex((d) => d.id === dayId) ?? -1;
        // No plan, or a dayId that doesn't exist in it (stale link,
        // direct URL entry) — nothing to show, back to the source of
        // truth for what days exist.
        if (!loadedPreferences || !plan || foundIndex === -1) {
          navigate('/home', { replace: true });
          return;
        }
        setPreferences(loadedPreferences);
        setDay(plan.days[foundIndex]);
        setDayPosition(foundIndex + 1);
        setReady(true);
      },
    );
    return () => {
      cancelled = true;
    };
  }, [dayId, navigate]);

  if (!ready || !preferences || !day) return null;

  const muscles = getMusclesWorked(day, exerciseLibrary);

  return (
    <div className="flex min-h-svh flex-col items-center" style={{ backgroundImage: GRADIENT }}>
      <div className="flex w-full items-center justify-between px-space-7 py-space-7">
        <IconButton aria-label="Back" className="text-foreground-inverse" onClick={() => navigate('/home')}>
          <ChevronLeft />
        </IconButton>
      </div>

      <div className="flex w-full flex-1 flex-col items-center justify-center gap-space-9 px-space-7 py-space-7">
        <div className="mx-auto flex w-full max-w-[440px] flex-col items-start gap-space-3">
          <span className="text-body leading-body text-foreground-inverse-secondary">Day {dayPosition}</span>
          <span className="text-display-md leading-display-md font-light text-foreground-inverse">{day.name}</span>
        </div>

        <div className="mx-auto flex w-full max-w-[440px] flex-col gap-space-5">
          <MetaRow label="Structure" value={getStructureSummary(day)} />
          {/* Paper's mock shows a range ("45-55 min"), same as its "35-40
              kg" Initial-weight mock on the Active Workout screen — both
              illustrative, not a real range the generator computes. We
              only have one estimate, so we show exactly that. */}
          <MetaRow label="Duration" value={`${day.estimatedDurationMinutes} min`} />
          <MetaRow label="Level" value={getSessionLevel(preferences.experience)} />
          <MetaRow label="Muscles worked" value={muscles.map(formatMuscleGroup).join(', ') || '—'} />
        </div>

        <div className="mx-auto flex w-full max-w-[440px] flex-col gap-space-5 rounded-lg bg-[#FFFFFF1A] px-space-5 py-space-4">
          <span className="text-label leading-label text-foreground-inverse-secondary">What to expect</span>
          <span className="text-body leading-body text-foreground-inverse">{getWhatToExpect(day, exerciseLibrary)}</span>
        </div>
      </div>

      <div className="flex w-full flex-col px-space-7 pt-8 pb-8">
        <div className="mx-auto w-full max-w-[440px]">
          <Button variant="primary" className="w-full" onClick={() => navigate(`/workout/${day.id}/active`)}>
            <Play data-icon="inline-start" fill="currentColor" stroke="none" />
            Start Workout
          </Button>
        </div>
      </div>
    </div>
  );
}
