import { useParams } from 'react-router-dom';

// Placeholder — Workout Overview's real UI is a separate, not-yet-approved
// implementation phase. Exists only to verify route params and guards.
export function WorkoutOverviewPage() {
  const { dayId } = useParams<{ dayId: string }>();

  return (
    <main className="flex min-h-svh flex-col items-center justify-center gap-space-5 p-space-8 text-center">
      <h1 className="text-heading leading-heading text-foreground">Workout Overview</h1>
      <p className="text-body leading-body max-w-sm text-foreground-secondary">
        Day: {dayId} — not implemented yet.
      </p>
    </main>
  );
}
