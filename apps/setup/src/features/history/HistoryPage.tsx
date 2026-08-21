import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { ActivityRow } from '@/components/ui/activity-row';
import { PageHeader } from '@/components/ui/page-header';
import type { Activity } from '@/domain/activity';
import { storageRepository } from '@/services/storage';

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
      <div className="mx-auto flex w-full max-w-[440px]">
        <PageHeader onBack={() => navigate('/home')} />
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

      {sorted.length > 0 && (
        <div className="flex-1 px-space-7 pt-space-5 pb-space-9">
          <div className="mx-auto flex w-full max-w-[440px] flex-col gap-space-5">
            {sorted.map((activity) => (
              <ActivityRow key={activity.id} activity={activity} to={`/history/${activity.id}`} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
