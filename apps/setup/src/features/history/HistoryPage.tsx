import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

import { IconButton } from '@/components/ui/icon-button';
import type { Activity } from '@/domain/activity';
import { storageRepository } from '@/services/storage';

function formatDateBadge(iso: string): { day: string; month: string } {
  const date = new Date(iso);
  return {
    day: String(date.getDate()),
    month: date.toLocaleDateString('en-US', { month: 'short' }).toUpperCase(),
  };
}

// Paper: "historial".
export function HistoryPage() {
  const navigate = useNavigate();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    void storageRepository.getActivities().then((loaded) => {
      if (cancelled) return;
      setActivities(loaded);
      setReady(true);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  if (!ready) return null;

  const sorted = [...activities].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <div className="bg-background flex min-h-svh flex-col">
      <div className="w-full px-space-7 pt-space-7">
        <div className="mx-auto flex w-full max-w-[440px]">
          <IconButton aria-label="Volver" onClick={() => navigate('/home')} className="text-foreground">
            <ArrowLeft />
          </IconButton>
        </div>
      </div>

      <div className="w-full px-space-7 pt-space-9 pb-space-5">
        <div className="mx-auto flex w-full max-w-[440px] flex-col gap-space-9">
          <span className="text-display-md leading-display-md font-light text-foreground">Historial</span>
          <span className="text-body leading-body">
            <span className="text-foreground">{sorted.length}</span>
            <span className="text-foreground-secondary"> · Workouts realizados</span>
          </span>
        </div>
      </div>

      <div className="flex-1 px-space-7 pt-space-5 pb-space-9">
        <div className="mx-auto flex w-full max-w-[440px] flex-col gap-space-5">
          {sorted.length === 0 ? (
            <div className="border-border-subtle text-body leading-body text-foreground-secondary flex flex-col items-center justify-center gap-space-3 rounded-lg border border-dashed p-space-8 text-center">
              Todavía no has guardado ninguna actividad
            </div>
          ) : (
            sorted.map((activity) => {
              const { day, month } = formatDateBadge(activity.date);
              return (
                // Same card interaction pattern as HomePage's recent-
                // activity preview (Button v1 ghost ladder, Foundations
                // v1) — keep the two in sync.
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
            })
          )}
        </div>
      </div>
    </div>
  );
}
