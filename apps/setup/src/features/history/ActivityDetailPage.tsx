import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { PageHeader } from '@/components/ui/page-header';
import type { Activity } from '@/domain/activity';
import { storageRepository } from '@/services/storage';
import { formatElapsed } from '@/features/workout/active-workout';

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
}

// Paper: "historial-workout-detail". What was actually done: duration,
// exercises, sets, reps, weights. Nothing else — this is the entirety
// of SetUp's "progress tracking".
export function ActivityDetailPage() {
  const { activityId = '' } = useParams<{ activityId: string }>();
  const navigate = useNavigate();
  const [activity, setActivity] = useState<Activity | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    void storageRepository.getActivity(activityId).then((loaded) => {
      if (cancelled) return;
      setActivity(loaded);
      setReady(true);
    });
    return () => {
      cancelled = true;
    };
  }, [activityId]);

  if (!ready) return null;
  if (!activity) {
    navigate('/history', { replace: true });
    return null;
  }

  return (
    <div className="bg-background flex min-h-svh flex-col">
      <div className="mx-auto flex w-full max-w-[440px]">
        <PageHeader onBack={() => navigate('/history')} title={{ emphasis: 'Workout', secondary: 'Detalles' }} />
      </div>

      <div className="w-full px-space-7 pt-space-9 pb-space-5">
        <div className="mx-auto flex w-full max-w-[440px]">
          <span className="text-display-md leading-display-md font-light text-foreground">{activity.workoutName}</span>
        </div>
      </div>

      <div className="flex-1 px-space-7 pt-space-5 pb-space-9">
        <div className="mx-auto flex w-full max-w-[440px] flex-col gap-space-9">
          <div className="flex flex-col gap-space-1">
            <span className="text-body leading-body text-foreground-secondary">{formatDate(activity.date)}</span>
            <span className="text-display-md leading-display-md font-light text-foreground">
              {formatElapsed(activity.durationSeconds)}
            </span>
          </div>

          <div className="flex flex-col gap-space-9">
            {activity.exercises.map((exercise, index) => (
              <div key={index} className="flex flex-col gap-space-7">
                <span className="text-heading leading-heading font-light text-foreground">{exercise.exerciseName}</span>
                <div className="flex flex-col gap-space-5">
                  {exercise.sets.map((set, setIndex) => (
                    <div
                      key={setIndex}
                      className="outline outline-1 outline-border-subtle flex items-center justify-between gap-space-5 rounded-lg px-space-6 py-space-5"
                    >
                      <span className="text-body leading-body text-foreground-secondary">Set {setIndex + 1}</span>
                      <span className="text-body leading-body text-foreground">
                        {set.reps ?? '—'} reps{set.weight !== undefined ? ` · ${set.weight} kg` : ''}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
