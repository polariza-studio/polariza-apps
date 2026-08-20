import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus } from 'lucide-react';

import { Button } from '@/components/ui/button';
import type { Activity } from '@/domain/activity';
import type { Workout } from '@/domain/workout';
import { storageRepository } from '@/services/storage';
import { InstallAppBanner } from './InstallAppBanner';
import { SwipeableWorkoutRow } from './SwipeableWorkoutRow';
import { getWeeklyActivitySummary, type WeekTone } from './weekly-activity';

const WEEK_TONE_COLOR: Record<WeekTone, string> = {
  active: 'var(--foreground)',
  past: 'var(--foreground-secondary)',
  future: 'color-mix(in srgb, var(--moss) 20%, transparent)',
};

const RECENT_ACTIVITY_LIMIT = 3;

function formatDateBadge(iso: string): { day: string; month: string } {
  const date = new Date(iso);
  return {
    day: String(date.getDate()),
    month: date.toLocaleDateString('en-US', { month: 'short' }).toUpperCase(),
  };
}

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
        <div className="flex items-center justify-between gap-space-1 px-space-7 py-space-7">
          <span className="text-body-emphasis leading-body-emphasis text-foreground">SetUp</span>
          <span className="text-body leading-body text-foreground-secondary">Workouts</span>
        </div>

        <div className="px-space-7 py-space-7">
          <div className="mx-auto flex w-full max-w-[440px] flex-col gap-space-7">
            <div className="flex flex-col gap-space-3">
              <span className="text-body leading-body text-foreground-secondary">Esta semana</span>
              <div className="flex items-baseline gap-space-3">
                <span className="text-display-lg leading-display-lg text-foreground">{weekly.totalMinutes}</span>
                <span className="text-body leading-body text-foreground">min</span>
              </div>
            </div>

            <div className="flex flex-col gap-[2px] px-space-1">
              <div className="flex h-[67px] items-end justify-between">
                {weekly.days.map((day, index) => (
                  <div
                    key={index}
                    className="w-3"
                    style={{ height: day.height, backgroundColor: WEEK_TONE_COLOR[day.tone] }}
                  />
                ))}
              </div>
              <div className="flex items-start justify-between">
                {weekly.days.map((day, index) => (
                  <span
                    key={index}
                    className="w-3 text-center text-label-emphasis leading-label-emphasis"
                    style={{ color: WEEK_TONE_COLOR[day.tone] }}
                  >
                    {day.label}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-1 flex-col px-space-7 py-[32px]">
        <div className="mx-auto flex w-full max-w-[440px] flex-col gap-space-8">
          <span className="text-heading leading-heading font-light text-foreground-secondary">Tus workouts</span>

          {workouts.length === 0 ? (
            <div className="border-border-subtle text-body leading-body text-foreground-secondary flex flex-col items-center justify-center gap-space-3 rounded-lg border border-dashed px-space-6 py-[32px] text-center">
              Todavía no has creado ningún workout
            </div>
          ) : (
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
          )}

          <Button variant="ghost" className="w-full" onClick={() => navigate('/workouts/new')}>
            <Plus data-icon="inline-start" />
            {workouts.length === 0 ? 'Crear workout' : 'Nuevo workout'}
          </Button>
        </div>
      </div>

      {recentActivities.length > 0 && (
        <div className="flex flex-col px-space-7 py-[32px]">
          <div className="mx-auto flex w-full max-w-[440px] flex-col gap-space-8">
            <span className="text-heading leading-heading font-light text-foreground-secondary">Tu actividad</span>

            <div className="flex flex-col gap-space-5">
              {recentActivities.map((activity) => {
                const { day, month } = formatDateBadge(activity.date);
                return (
                  // Hover/pressed/focus on the card only (the date chip
                  // keeps its own fixed interactive-subtle fill) — same
                  // Button v1 ghost ladder as the workout card.
                  <Link
                    key={activity.id}
                    to={`/history/${activity.id}`}
                    className="group flex items-center gap-space-5 rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-foreground focus-visible:ring-offset-2"
                  >
                    <div className="bg-interactive-subtle flex w-12 shrink-0 flex-col items-center justify-center gap-space-1 rounded-lg p-space-2">
                      <span className="text-label-emphasis leading-label-emphasis text-foreground">{day}</span>
                      <span className="text-label leading-label text-foreground-secondary">{month}</span>
                    </div>
                    <div className="border-border-subtle flex flex-1 flex-col items-start gap-space-3 rounded-lg border px-space-6 py-space-5 transition-colors group-hover:bg-interactive-subtle group-active:bg-border-subtle">
                      <span className="text-heading leading-heading font-light text-foreground">{activity.workoutName}</span>
                      <span className="text-caption leading-caption text-foreground-secondary">
                        {activity.exercises.length} ejercicios · {Math.round(activity.durationSeconds / 60)} min
                      </span>
                    </div>
                  </Link>
                );
              })}
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
