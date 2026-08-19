import { useEffect, useState } from 'react';

// TEMPORARY DIAGNOSTIC, round 6 — round 5's CSS-side compensation made
// canvas/content correctly *compute* to 852 (matching the true screen),
// but the visible result was unchanged: the extra space was silently
// clipped rather than painted, meaning the standalone webview's own
// rendering surface is genuinely capped at innerHeight (793), not just
// under-measured — no CSS can paint past a surface WebKit itself
// allocated smaller. That surface size is controlled by viewport-fit
// (see index.html) rather than anything in this page's CSS; this round
// removes viewport-fit=cover to test whether the surface then matches
// the full screen. BUILD_MARKER proves the device is running this
// build. Remove once the real cause is confirmed fixed.
const BUILD_MARKER = 'diag-r6-no-cover';

type Rect = { top: number; bottom: number; height: number } | null;

type Measurements = {
  windowInnerHeight: number;
  visualViewportHeight: number | null;
  visualViewportOffsetTop: number | null;
  html: Rect;
  body: Rect;
  root: Rect;
  canvas: Rect;
  gutter: Rect;
  content: Rect;
  canvasBg: string;
  bodyBg: string;
  safeAreaTop: string;
  safeAreaBottom: string;
};

function rect(el: Element | null): Rect {
  if (!el) return null;
  const r = el.getBoundingClientRect();
  return { top: Math.round(r.top * 100) / 100, bottom: Math.round(r.bottom * 100) / 100, height: Math.round(r.height * 100) / 100 };
}

function measure(): Measurements {
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

  const canvas = document.querySelector('.app-frame-canvas');
  const gutter = document.querySelector('.app-frame-gutter');
  const content = document.querySelector('.app-frame-content');
  const root = document.getElementById('root');

  return {
    windowInnerHeight: window.innerHeight,
    visualViewportHeight: window.visualViewport?.height ?? null,
    visualViewportOffsetTop: window.visualViewport?.offsetTop ?? null,
    html: rect(document.documentElement),
    body: rect(document.body),
    root: rect(root),
    canvas: rect(canvas),
    gutter: rect(gutter),
    content: rect(content),
    canvasBg: canvas ? getComputedStyle(canvas).backgroundColor : 'n/a',
    bodyBg: getComputedStyle(document.body).backgroundColor,
    safeAreaTop,
    safeAreaBottom,
  };
}

export function DebugViewportOverlay() {
  const [isStandalone, setIsStandalone] = useState(false);
  const [m, setM] = useState<Measurements | null>(null);

  useEffect(() => {
    setIsStandalone(window.matchMedia('(display-mode: standalone)').matches);
    function update() {
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
  const rectRow = (label: string, r: Rect) => row(label, r ? `top=${r.top} bottom=${r.bottom} h=${r.height}` : 'n/a');

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
        fontSize: 10,
        lineHeight: 1.35,
        padding: '6px 8px',
        pointerEvents: 'none',
        whiteSpace: 'pre',
      }}
    >
      {[
        row('BUILD', BUILD_MARKER),
        row('window.innerHeight', m.windowInnerHeight),
        row('visualViewport height/offsetTop', `${m.visualViewportHeight ?? 'n/a'} / ${m.visualViewportOffsetTop ?? 'n/a'}`),
        rectRow('html', m.html),
        rectRow('body', m.body),
        rectRow('#root', m.root),
        rectRow('canvas', m.canvas),
        rectRow('gutter', m.gutter),
        rectRow('content', m.content),
        row('canvas bg', m.canvasBg),
        row('body bg', m.bodyBg),
        row('safe-area top/bottom', `${m.safeAreaTop} / ${m.safeAreaBottom}`),
      ].join('\n')}
    </div>
  );
}
