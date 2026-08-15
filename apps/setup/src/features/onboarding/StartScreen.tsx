import { useEffect } from 'react';

import { Button } from '@/components/ui/button';

// Measured from Paper's "start-screen" artboard (re-audited 2026-08-15,
// fifth pass). The week-graph is its own section between the hero and the
// button, not nested inside the hero's centered stack; the hero only
// centers title+subtitle, with its own pt-[224px] compensating so their
// position reads the same as before. The weekly bar-graph is decorative
// (Paper shows it as a static illustration of a typical week, not real
// data — there's no activity yet at this point in the flow). "Let's start"
// is its own section between the week-graph and the footer — uses
// Button's `secondary` variant (moss fill, white text, shadow-button), the
// only onboarding button that isn't `primary`, confirmed via computed
// styles (bg #294000, not #BFF753). The gradient lives on the outer,
// full-width root (Paper moved it there too, dropping the separate flat
// `--lime-soft` fill it used to sit on) so it reaches the viewport edges
// on desktop instead of being clipped to content width — only the content
// below (title/subtitle, week-graph, button) is width-capped at
// `max-w-[440px]`, the app's general content cap (a bit roomier than
// Paper's 390px artboard) — applied to "Let's start" too, in place of
// Paper's literal measured 350px, per direction that buttons/content
// (everything except the top-bar/step-bar chrome) share this one cap.
// Uses Paper's exact
// `oklab()` stops rather than a `--lime`/`--lime-soft` color-mix
// approximation: a color-mix wash at a plausible opacity turned out
// visibly too faint next to Paper's actual (much more saturated) values —
// verified side by side in-browser 2026-08-15 — so this transcribes the
// gradient literally instead of guessing an equivalent from tokens.
// `bg-[var(--lime-soft)]` stays as the fallback solid color for browsers
// without `oklab()` support.
type WeekTone = 'active' | 'inactive' | 'inactive-weekend';

const WEEK: { label: string; height: number; tone: WeekTone }[] = [
  { label: 'M', height: 67, tone: 'active' },
  { label: 'T', height: 1, tone: 'inactive' },
  { label: 'W', height: 57, tone: 'active' },
  { label: 'T', height: 1, tone: 'inactive' },
  { label: 'F', height: 64, tone: 'active' },
  { label: 'S', height: 1, tone: 'inactive-weekend' },
  { label: 'S', height: 1, tone: 'inactive-weekend' },
];

// Paper measures three tones for the bars/labels: active (moss),
// inactive-weekday (moss 60%, same mix as --foreground-secondary), and
// inactive-weekend (moss 20%). The 20% mix coincides numerically with
// --border, but that token is scoped to borders by convention (see
// index.css), so it's mixed inline here rather than reused off-label.
const WEEK_TONE_COLOR: Record<WeekTone, string> = {
  active: 'var(--foreground)',
  inactive: 'var(--foreground-secondary)',
  'inactive-weekend': 'color-mix(in srgb, var(--moss) 20%, transparent)',
};

export function StartScreen({ onStart }: { onStart: () => void }) {
  // This screen's background differs from the rest of the app (gradient
  // vs. the general --background token), so <html>'s own background —
  // what iOS Safari shows during pull-to-refresh rubber-banding — needs
  // to match it here specifically while this screen is mounted.
  useEffect(() => {
    document.documentElement.style.backgroundColor = 'var(--lime-soft)';
    return () => {
      document.documentElement.style.backgroundColor = '';
    };
  }, []);

  return (
    <div
      className="flex min-h-svh flex-col bg-[var(--lime-soft)]"
      style={{
        backgroundImage:
          'linear-gradient(in oklab 168.34deg, oklab(81% -0.132 0.164 / 98%) 5.36%, oklab(90.8% -0.117 0.159) 38.13%, oklab(93.1% -0.092 0.126) 98.45%)',
      }}
    >
      <div className="flex flex-1 flex-col items-center gap-space-8 px-[64px] pt-[224px] pb-space-9">
        <span className="text-display-md leading-display-md text-foreground">SetUp</span>
        <p className="text-body leading-body text-foreground-secondary text-center">
          Plan, organize and track
          <br />
          your workouts
        </p>
      </div>
      <div className="flex justify-center px-space-7 pb-[124px]">
        <div className="mx-auto flex w-full max-w-[440px] items-end gap-space-8">
          {WEEK.map((day, index) => (
            <div key={index} className="flex flex-1 flex-col items-center gap-[2px]">
              <div
                className="w-3"
                style={{ height: day.height, backgroundColor: WEEK_TONE_COLOR[day.tone] }}
              />
              <span
                className="text-label-emphasis leading-label-emphasis"
                style={{ color: WEEK_TONE_COLOR[day.tone] }}
              >
                {day.label}
              </span>
            </div>
          ))}
        </div>
      </div>
      <div className="flex justify-center px-space-7 pt-[32px]">
        <Button variant="secondary" onClick={onStart} className="w-full max-w-[440px]">
          Let's start
        </Button>
      </div>
      <div className="flex items-center justify-center gap-space-1 px-space-7 py-[32px]">
        <span className="text-body leading-body text-foreground-secondary">Powered by</span>
        <span className="text-body leading-body text-foreground">Polariza</span>
      </div>
    </div>
  );
}
