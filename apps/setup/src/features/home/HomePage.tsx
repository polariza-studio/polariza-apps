// Placeholder — Home's real UI is a separate, not-yet-approved implementation
// phase. This exists only so Onboarding → Home navigation and the
// RequireOnboarding route guard can be verified end-to-end.
export function HomePage() {
  return (
    <main className="flex min-h-svh flex-col items-center justify-center gap-space-5 p-space-8 text-center">
      <h1 className="text-heading leading-heading text-foreground">Home</h1>
      <p className="text-body leading-body max-w-sm text-foreground-secondary">
        Not implemented yet.
      </p>
    </main>
  );
}
