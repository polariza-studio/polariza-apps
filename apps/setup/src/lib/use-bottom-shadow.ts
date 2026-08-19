import { useEffect, useState } from 'react';

// Whether the page has more content below the current scroll position —
// drives a sticky footer's "content hidden behind it" shadow. Plain
// scroll-position math, not an IntersectionObserver on a sentinel: a
// sentinel can't distinguish "hidden behind the sticky footer" from
// "still within the viewport's raw geometry" unless the footer's own
// height is reserved as scroll padding — without that, the observer
// never reports non-intersecting and the shadow never shows.
//
// In the installed (standalone) PWA, .app-frame-canvas — not
// document/body — is the actual scroll container (index.css: position
// fixed + inset 0, overflow-y auto), so scroll events and scrollTop must
// be read from it there instead of from the document.
export function useBottomShadow(ready: boolean): boolean {
  const [hasMoreBelow, setHasMoreBelow] = useState(false);

  useEffect(() => {
    if (!ready) return;
    const standalone = window.matchMedia('(display-mode: standalone)').matches;
    const canvas = standalone ? document.querySelector('.app-frame-canvas') : null;
    const el = canvas ?? document.scrollingElement ?? document.documentElement;
    const scrollTarget: EventTarget = canvas ?? window;

    function update() {
      setHasMoreBelow(el.scrollTop + el.clientHeight < el.scrollHeight - 1);
    }
    update();
    scrollTarget.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    return () => {
      scrollTarget.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
    };
  }, [ready]);

  return hasMoreBelow;
}
