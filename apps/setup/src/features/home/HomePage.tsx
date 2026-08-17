import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { SlidersHorizontal } from 'lucide-react';

import { Button } from '@/components/ui/button';
import type { OnboardingAnswers } from '@/domain/onboarding';
import type { TrainingDay, TrainingPlan } from '@/domain/plan';
import { storageRepository } from '@/services/storage';
import { InstallAppBanner } from './InstallAppBanner';
import { ReorderableDayList } from './ReorderableDayList';
import { getWeeklyActivitySummary, type WeekTone } from './weekly-activity';

// Active is full-opacity moss; a day with no activity reads at 60% if
// it's already happened (today included) or 20% if it's still upcoming
// — exact values (#294000/99/33) per explicit direction.
const WEEK_TONE_COLOR: Record<WeekTone, string> = {
  active: 'var(--foreground)',
  past: 'var(--foreground-secondary)',
  future: 'color-mix(in srgb, var(--moss) 20%, transparent)',
};

export function HomePage() {
  const navigate = useNavigate();
  const [preferences, setPreferences] = useState<OnboardingAnswers | null>(null);
  const [plan, setPlan] = useState<TrainingPlan | null>(null);
  const [ready, setReady] = useState(false);
  const [weekly, setWeekly] = useState(() => getWeeklyActivitySummary([], 45));

  useEffect(() => {
    let cancelled = false;
    Promise.all([
      storageRepository.getPreferences(),
      storageRepository.getCurrentPlan(),
      storageRepository.getActivities(),
    ]).then(([loadedPreferences, loadedPlan, activities]) => {
      if (cancelled) return;
      // No saved plan yet — e.g. preferences saved before plan generation
      // was wired into onboarding. Generate one instead of a dead end.
      if (!loadedPlan) {
        navigate('/loading', { replace: true });
        return;
      }
      setPreferences(loadedPreferences);
      setPlan(loadedPlan);
      // The graph's fixed height is scaled against this user's own usual
      // session length (already collected in onboarding) rather than a
      // one-size-fits-all constant or the week's own busiest day — the
      // most meaningful "typical" duration available per user.
      setWeekly(getWeeklyActivitySummary(activities, loadedPreferences?.sessionDuration ?? 45));
      setReady(true);
    });
    return () => {
      cancelled = true;
    };
  }, [navigate]);

  if (!ready || !plan) return null;

  async function handleReorder(days: TrainingDay[]) {
    if (!plan) return;
    const reordered = { ...plan, days };
    setPlan(reordered);
    await storageRepository.saveCurrentPlan(reordered);
  }

  // Only the greeting row is this screen's "top bar" (chrome, same role
  // OnboardingHeader plays elsewhere) — it runs full width uncapped. The
  // weekly-stats block below it is reading content, so it gets its own
  // outer-padding/inner-cap split at max-w-[440px] like the sections
  // further down, not a share of the greeting row's. Margins are matched
  // to Paper's home artboard exactly (re-audited via paper-desktop MCP
  // 2026-08-16), converting Paper's stock-Tailwind spacing numbers to
  // this app's --space-* token by px value, not by index — the two
  // scales don't share numbering.
  return (
    <div className="flex min-h-svh flex-col bg-background">
      <div className="flex flex-col bg-[var(--lime-soft)]">
        <div className="flex items-start justify-between gap-space-1 px-space-7 py-space-7">
          <span className="text-body-emphasis leading-body-emphasis text-foreground">Hi {preferences?.name},</span>
          <span className="text-body leading-body text-foreground-secondary">Your Weekly Workout</span>
        </div>

        <div className="px-space-7 py-space-7">
          <div className="mx-auto flex w-full max-w-[440px] flex-col gap-space-7">
            <div className="flex flex-col gap-space-3">
              <span className="text-body leading-body text-foreground-secondary">This week</span>
              <div className="flex items-baseline gap-space-3">
                <span className="text-display-lg leading-display-lg text-foreground">{weekly.totalMinutes}</span>
                <span className="text-body leading-body text-foreground">min</span>
              </div>
            </div>

            {/* Matches Paper's own structure: bars and labels are each
                their own justify-between row spanning the full width,
                not 7 flex-1 columns — flex-1 centers each bar within its
                own slice, which reads as extra margin before the first
                bar and after the last one instead of the row actually
                stretching edge to edge like "This week"'s number above
                it does. justify-between puts day 1 flush left and day 7
                flush right with the rest spread evenly between. */}
            <div className="flex flex-col gap-[2px] px-space-1">
              {/* Fixed height so the graph's overall size never changes
                  week to week — each bar (already capped at this same
                  height) sits bottom-aligned inside it. */}
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
          <span className="text-heading leading-heading font-light text-foreground-secondary">Your Plan</span>

          <ReorderableDayList days={plan.days} onReorder={handleReorder} />
        </div>
      </div>

      <div className="px-space-7 py-[32px]">
        <div className="mx-auto w-full max-w-[440px]">
          <Button variant="ghost" className="w-full" onClick={() => navigate('/adjust-plan')}>
            <SlidersHorizontal data-icon="inline-start" />
            Settings
          </Button>
        </div>
      </div>

      <InstallAppBanner />
    </div>
  );
}
