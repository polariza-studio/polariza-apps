import { useEffect, useState } from 'react';

// TEMPORARY DIAGNOSTIC — not a fix. Three prior attempts at the bottom
// moss-gap bug were reasoned from CSS alone and verified only in Chrome,
// which can't reproduce the real iOS/WebKit standalone rendering path —
// that's why they kept not landing. This reads the actual numbers off
// the real device instead of guessing again. Remove once the bug is
// actually diagnosed and fixed.
type Measurements = {
  windowInnerHeight: number;
  visualViewportHeight: number | null;
  htmlHeight: number;
  bodyHeight: number;
  rootHeight: number;
  canvasHeight: number;
  canvasBottom: number;
  safeAreaBottom: string;
  safeAreaTop: string;
};

function measure(): Measurements {
  const html = document.documentElement;
  const body = document.body;
  const root = document.getElementById('root');
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
    htmlHeight: html.getBoundingClientRect().height,
    bodyHeight: body.getBoundingClientRect().height,
    rootHeight: root?.getBoundingClientRect().height ?? -1,
    canvasHeight: canvasRect?.height ?? -1,
    canvasBottom: canvasRect?.bottom ?? -1,
    safeAreaBottom,
    safeAreaTop,
  };
}

export function DebugViewportOverlay() {
  const [isStandalone, setIsStandalone] = useState(false);
  const [m, setM] = useState<Measurements | null>(null);

  useEffect(() => {
    setIsStandalone(window.matchMedia('(display-mode: standalone)').matches);
    function update() {
      // Next frame, so layout has settled after any resize/orientation event.
      requestAnimationFrame(() => setM(measure()));
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
        row('visualViewport.height', m.visualViewportHeight ?? 'n/a'),
        row('html height', m.htmlHeight),
        row('body height', m.bodyHeight),
        row('#root height', m.rootHeight),
        row('.app-frame-canvas height', m.canvasHeight),
        row('.app-frame-canvas bottom (viewport px)', m.canvasBottom),
        row('safe-area-inset-top (computed)', m.safeAreaTop),
        row('safe-area-inset-bottom (computed)', m.safeAreaBottom),
        row(
          'expected canvas height (innerHeight + insetTop)',
          m.windowInnerHeight + parseFloat(m.safeAreaTop || '0'),
        ),
        row(
          'canvas height matches expected?',
          Math.abs(m.canvasHeight - (m.windowInnerHeight + parseFloat(m.safeAreaTop || '0'))) < 1 ? 'YES' : 'NO',
        ),
      ].join('\n')}
    </div>
  );
}
