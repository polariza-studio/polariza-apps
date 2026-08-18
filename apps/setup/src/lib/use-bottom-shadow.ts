import { useEffect, useState } from 'react';

// Whether the page has more content below the current scroll position —
// drives a sticky footer's "content hidden behind it" shadow. Plain
// scroll-position math, not an IntersectionObserver on a sentinel: a
// sentinel can't distinguish "hidden behind the sticky footer" from
// "still within the viewport's raw geometry" unless the footer's own
// height is reserved as scroll padding — without that, the observer
// never reports non-intersecting and the shadow never shows.
export function useBottomShadow(ready: boolean): boolean {
  const [hasMoreBelow, setHasMoreBelow] = useState(false);

  useEffect(() => {
    if (!ready) return;
    function update() {
      const el = document.scrollingElement ?? document.documentElement;
      setHasMoreBelow(el.scrollTop + el.clientHeight < el.scrollHeight - 1);
    }
    update();
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    return () => {
      window.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
    };
  }, [ready]);

  return hasMoreBelow;
}
