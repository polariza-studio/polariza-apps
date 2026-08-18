import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Play, Plus } from 'lucide-react';

import { Button } from '@/components/ui/button';
import type { Activity } from '@/domain/activity';
import type { Workout } from '@/domain/workout';
import { storageRepository } from '@/services/storage';
import { InstallAppBanner } from './InstallAppBanner';
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
                <div
                  key={workout.id}
                  className="border-border-subtle flex items-center gap-space-1 rounded-lg border px-space-6 py-space-5"
                >
                  <Link to={`/workouts/${workout.id}/edit`} className="flex flex-1 flex-col items-start gap-space-3">
                    <span className="text-heading leading-heading font-light text-foreground">{workout.name}</span>
                    <span className="text-caption leading-caption text-foreground-secondary">
                      {workout.exercises.length} ejercicios
                    </span>
                  </Link>
                  {/* The real primary Button, not a hand-copied class
                      string (that silently dropped the hover/active
                      color — copying classes onto a plain <button> isn't
                      equivalent to using the component). Its own h-12/
                      padding classes are overridden via inline style,
                      which always wins regardless of Tailwind class-merge
                      ordering, to get the 32px icon-only circle Paper
                      shows without touching button.tsx's box model. */}
                  <Button
                    variant="primary"
                    aria-label={`Empezar ${workout.name}`}
                    className="shrink-0 rounded-full"
                    style={{ width: 32, height: 32, padding: 0 }}
                    onClick={() => navigate(`/workouts/${workout.id}/active`)}
                  >
                    <Play className="size-4 [stroke-width:1.5]" fill="currentColor" stroke="none" />
                  </Button>
                </div>
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
                  <Link
                    key={activity.id}
                    to={`/history/${activity.id}`}
                    className="flex items-center gap-space-5"
                  >
                    <div className="bg-interactive-subtle flex w-12 shrink-0 flex-col items-center justify-center gap-space-1 rounded-lg p-space-2">
                      <span className="text-label-emphasis leading-label-emphasis text-foreground">{day}</span>
                      <span className="text-label leading-label text-foreground-secondary">{month}</span>
                    </div>
                    <div className="border-border-subtle flex flex-1 flex-col items-start gap-space-3 rounded-lg border px-space-6 py-space-5">
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
