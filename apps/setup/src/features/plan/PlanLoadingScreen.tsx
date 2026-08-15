import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { withLineBreaks } from '@/lib/text';
import { planGenerator } from '@/services/plan-generator';
import { storageRepository } from '@/services/storage';

// Generation itself is near-instant (deterministic, no network/AI call —
// spec §4.2), but a flash-and-gone screen would undercut the medical
// disclaimer below, which needs a moment to actually be read. The bar
// animates over this fixed duration regardless of how fast generation
// finishes; navigation waits for both.
const MIN_DISPLAY_MS = 1500;

// Same gradient as StartScreen (Paper reuses it verbatim on this
// artboard) — see StartScreen.tsx for why the literal oklab() stops are
// used instead of a --lime/--lime-soft color-mix approximation.
const GRADIENT =
  'linear-gradient(in oklab 168.34deg, oklab(81% -0.132 0.164 / 98%) 5.36%, oklab(90.8% -0.117 0.159) 38.13%, oklab(93.1% -0.092 0.126) 98.45%)';

export function PlanLoadingScreen() {
  const navigate = useNavigate();
  const [progress, setProgress] = useState(0);
  // The bar's growth is a genuine CSS transition (0% -> 100% over
  // MIN_DISPLAY_MS, eased), not hand-rolled per-frame width updates —
  // smoother, and the browser handles the easing instead of JS math.
  const [grown, setGrown] = useState(false);

  useEffect(() => {
    let cancelled = false;

    // Two rAFs: the first lets the initial 0%-width paint land on its own
    // frame; only the second flips to 100%, so the browser has something
    // to transition *from* instead of collapsing both into one frame and
    // skipping the animation.
    const startFrame = requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        if (!cancelled) setGrown(true);
      });
    });

    // Percentage readout — cosmetic, doesn't need to be pixel-synced to
    // the CSS-driven bar, just track roughly the same duration.
    const start = performance.now();
    const interval = setInterval(() => {
      const elapsed = performance.now() - start;
      setProgress(Math.min(100, Math.round((elapsed / MIN_DISPLAY_MS) * 100)));
    }, 50);

    async function run() {
      const [preferences] = await Promise.all([
        storageRepository.getPreferences(),
        new Promise((resolve) => setTimeout(resolve, MIN_DISPLAY_MS)),
      ]);
      // No preferences means this screen was reached directly without
      // completing onboarding — nothing to generate from.
      if (!preferences) {
        if (!cancelled) navigate('/onboarding', { replace: true });
        return;
      }
      const plan = await planGenerator.generate(preferences);
      await storageRepository.saveCurrentPlan(plan);
      if (!cancelled) navigate('/home', { replace: true });
    }
    run();

    return () => {
      cancelled = true;
      cancelAnimationFrame(startFrame);
      clearInterval(interval);
    };
  }, [navigate]);

  return (
    <div
      className="flex min-h-svh flex-col items-center justify-center px-[64px] py-space-7"
      style={{ backgroundImage: GRADIENT }}
    >
      <div className="mx-auto flex w-full max-w-[440px] flex-col items-center gap-space-8">
        <p className="text-body leading-body text-foreground text-center">Creating Your Plan...</p>

        <div className="flex w-full flex-col items-center gap-space-5">
          <div className="h-0.5 w-full overflow-hidden rounded-full bg-[color-mix(in_srgb,var(--moss)_20%,transparent)]">
            <div
              className="h-0.5 rounded-full bg-foreground transition-[width] duration-[1500ms] ease-out"
              style={{ width: grown ? '100%' : '0%' }}
            />
          </div>
          <span className="text-label leading-label text-foreground-secondary">{progress}%</span>
        </div>

        <p className="text-body leading-body text-foreground-secondary text-center">
          {withLineBreaks("SetUp provides general training\nguidance and isn't a substitute for\nprofessional medical advice.")}
        </p>
      </div>
    </div>
  );
}
