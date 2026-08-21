import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, SportShoe } from 'lucide-react';

import { ActivityRow } from '@/components/ui/activity-row';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { PageHeader } from '@/components/ui/page-header';
import type { Activity } from '@/domain/activity';
import type { Workout } from '@/domain/workout';
import { storageRepository } from '@/services/storage';
import { InstallAppBanner } from './InstallAppBanner';
import { SwipeableWorkoutRow } from './SwipeableWorkoutRow';
import { WeeklyActivity } from './WeeklyActivity';
import { getWeeklyActivitySummary } from './weekly-activity';

const RECENT_ACTIVITY_LIMIT = 3;

export function HomePage() {
  const navigate = useNavigate();
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [ready, setReady] = useState(false);
  const [openWorkoutId, setOpenWorkoutId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    Promise.all([storageRepository.getWorkouts(), storageRepository.getActivities()]).then(
      ([loadedWorkouts, loadedActivities]) => {
        if (cancelled) return;
        setWorkouts(loadedWorkouts);
        setActivities(loadedActivities);
        setReady(true);
      },
    );
    return () => {
      cancelled = true;
    };
  }, []);

  if (!ready) return null;

  async function handleDelete(workout: Workout) {
    setOpenWorkoutId((current) => (current === workout.id ? null : current));
    await storageRepository.deleteWorkout(workout.id);
    setWorkouts((current) => current.filter((existing) => existing.id !== workout.id));
  }

  const weekly = getWeeklyActivitySummary(activities);
  const recentActivities = [...activities]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, RECENT_ACTIVITY_LIMIT);

  return (
    <div className="flex min-h-svh flex-col bg-background">
      <div className="flex flex-col bg-[var(--lime-soft)]">
        <PageHeader title={{ emphasis: 'SetUp', secondary: 'Workouts' }} />

        <div className="px-space-7 py-space-7">
          <div className="mx-auto w-full max-w-[440px]">
            <WeeklyActivity weekly={weekly} />
          </div>
        </div>
      </div>

      <div className="flex flex-1 flex-col px-space-7 py-[32px]">
        <div className="mx-auto flex w-full max-w-[440px] flex-1 flex-col gap-space-8">
          <span className="text-body leading-body text-foreground-secondary">Tus workouts</span>

          {workouts.length === 0 ? (
            <EmptyState
              icon={
                <SportShoe
                  className="size-5 [stroke-width:1.5]"
                  style={{ color: 'color-mix(in srgb, var(--moss) 50%, transparent)' }}
                />
              }
              // Primary only here — it's the screen's one action while
              // empty. Once a workout exists, adding another is no longer
              // the primary action, so the equivalent button below (once
              // the list isn't empty) stays ghost.
              cta={
                <Button variant="primary" onClick={() => navigate('/workouts/new')}>
                  <Plus data-icon="inline-start" />
                  Crear workout
                </Button>
              }
            >
              No hay workouts creados.
            </EmptyState>
          ) : (
            <>
              <div className="flex flex-col gap-space-5">
                {workouts.map((workout) => (
                  <SwipeableWorkoutRow
                    key={workout.id}
                    workout={workout}
                    isOpen={openWorkoutId === workout.id}
                    onOpenChange={(willOpen) => setOpenWorkoutId(willOpen ? workout.id : null)}
                    onStart={(started) => navigate(`/workouts/${started.id}/active`)}
                    onEdit={(workout) => navigate(`/workouts/${workout.id}/edit`)}
                    onDelete={(workout) => void handleDelete(workout)}
                  />
                ))}
              </div>

              <Button variant="ghost" className="w-full" onClick={() => navigate('/workouts/new')}>
                <Plus data-icon="inline-start" />
                Nuevo workout
              </Button>
            </>
          )}
        </div>
      </div>

      {recentActivities.length > 0 && (
        <div className="flex flex-col px-space-7 py-[32px]">
          <div className="mx-auto flex w-full max-w-[440px] flex-col gap-space-8">
            <span className="text-body leading-body text-foreground-secondary">Tu actividad</span>

            <div className="flex flex-col gap-space-5">
              {recentActivities.map((activity) => (
                <ActivityRow key={activity.id} activity={activity} to={`/history/${activity.id}`} />
              ))}
            </div>

            <Button variant="ghost" className="w-full" onClick={() => navigate('/history')}>
              Ver historial
            </Button>
          </div>
        </div>
      )}

      <InstallAppBanner />
    </div>
  );
}
