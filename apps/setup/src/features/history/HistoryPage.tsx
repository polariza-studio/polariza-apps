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

// No Paper artboard exists for this screen yet — kept minimal and
// consistent with Home's own recent-activity row styling rather than
// inventing new visual language.
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
        <div className="mx-auto flex w-full max-w-[440px] items-center gap-space-3">
          <IconButton aria-label="Volver" onClick={() => navigate('/home')} className="text-foreground">
            <ArrowLeft />
          </IconButton>
          <span className="text-heading leading-heading font-light text-foreground">Historial</span>
        </div>
      </div>

      <div className="flex-1 px-space-7 py-space-7">
        <div className="mx-auto flex w-full max-w-[440px] flex-col gap-space-5">
          {sorted.length === 0 ? (
            <div className="border-border-subtle text-body leading-body text-foreground-secondary flex flex-col items-center justify-center gap-space-3 rounded-lg border border-dashed p-space-8 text-center">
              Todavía no has guardado ninguna actividad
            </div>
          ) : (
            sorted.map((activity) => {
              const { day, month } = formatDateBadge(activity.date);
              return (
                <Link key={activity.id} to={`/history/${activity.id}`} className="flex items-center gap-space-5">
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
            })
          )}
        </div>
      </div>
    </div>
  );
}
