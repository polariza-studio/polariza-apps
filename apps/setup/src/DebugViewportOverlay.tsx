import { useEffect, useRef, useState } from 'react';

// TEMPORARY DIAGNOSTIC — not a fix. Round 1 (static + safe-area-inset-top
// compensation) was contradicted by round 2's own data: window.innerHeight
// itself read a DIFFERENT value (793, then 852 — the true screen height)
// across separate launches of the same app on the same device, meaning a
// fixed formula can't be right either way. main.tsx now drives
// --app-frame-height from window.innerHeight directly, re-synced on
// resize/orientationchange/a delayed re-check, instead of leaving sizing
// to CSS dvh's own (apparently not always in sync) resolution. This round
// confirms whether that actually lands, and also tracks whether
// innerHeight itself changes *within* one session (not just across
// launches) so a "settles a moment later" theory can be told apart from a
// "different every launch" one. Remove once the bug is actually fixed.
type Measurements = {
  windowInnerHeight: number;
  visualViewportHeight: number | null;
  canvasHeight: number;
  canvasBottom: number;
  appFrameHeightVar: string;
  safeAreaBottom: string;
  safeAreaTop: string;
};

function measure(): Measurements {
  const canvas = document.querySelector('.app-frame-canvas');

  const probe = document.createElement('div');
  probe.style.paddingBottom = 'env(safe-area-inset-bottom)';
  probe.style.paddingTop = 'env(safe-area-inset-top)';
  probe.style.position = 'fixed';
  probe.style.visibility = 'hidden';
  document.body.appendChild(probe);
  const probeStyle = getComputedStyle(probe);
  const safeAreaBottom = probeStyle.paddingBottom;
  const safeAreaTop = probeStyle.paddingTop;
  document.body.removeChild(probe);

  const canvasRect = canvas?.getBoundingClientRect();

  return {
    windowInnerHeight: window.innerHeight,
    visualViewportHeight: window.visualViewport?.height ?? null,
    canvasHeight: canvasRect?.height ?? -1,
    canvasBottom: canvasRect?.bottom ?? -1,
    appFrameHeightVar: getComputedStyle(document.documentElement).getPropertyValue('--app-frame-height').trim(),
    safeAreaBottom,
    safeAreaTop,
  };
}

export function DebugViewportOverlay() {
  const [isStandalone, setIsStandalone] = useState(false);
  const [m, setM] = useState<Measurements | null>(null);
  const firstInnerHeight = useRef<number | null>(null);

  useEffect(() => {
    setIsStandalone(window.matchMedia('(display-mode: standalone)').matches);
    function update() {
      // Next frame, so layout has settled after any resize/orientation event.
      requestAnimationFrame(() => {
        const next = measure();
        if (firstInnerHeight.current === null) firstInnerHeight.current = next.windowInnerHeight;
        setM(next);
      });
    }
    update();
    window.addEventListener('resize', update);
    window.visualViewport?.addEventListener('resize', update);
    const interval = setInterval(update, 1000);
    return () => {
      window.removeEventListener('resize', update);
      window.visualViewport?.removeEventListener('resize', update);
      clearInterval(interval);
    };
  }, []);

  if (!isStandalone || !m) return null;

  const row = (label: string, value: string | number) => `${label}: ${value}`;
  const changedSinceFirst = firstInnerHeight.current !== null && firstInnerHeight.current !== m.windowInnerHeight;

  return (
    <div
      style={{
        position: 'fixed',
        top: 'env(safe-area-inset-top)',
        left: 0,
        right: 0,
        zIndex: 99999,
        background: 'rgba(255,0,255,0.92)',
        color: '#fff',
        fontFamily: 'monospace',
        fontSize: 11,
        lineHeight: 1.4,
        padding: '6px 8px',
        pointerEvents: 'none',
        whiteSpace: 'pre',
      }}
    >
      {[
        row('window.innerHeight', m.windowInnerHeight),
        row('  changed since first read this session?', changedSinceFirst ? `YES (was ${firstInnerHeight.current})` : 'no'),
        row('visualViewport.height', m.visualViewportHeight ?? 'n/a'),
        row('--app-frame-height (computed)', m.appFrameHeightVar || 'unset'),
        row('.app-frame-canvas height', m.canvasHeight),
        row('.app-frame-canvas bottom (viewport px)', m.canvasBottom),
        row('canvas bottom == innerHeight?', Math.abs(m.canvasBottom - m.windowInnerHeight) < 1 ? 'YES' : 'NO'),
        row('safe-area-inset-top (computed)', m.safeAreaTop),
        row('safe-area-inset-bottom (computed)', m.safeAreaBottom),
      ].join('\n')}
    </div>
  );
}
