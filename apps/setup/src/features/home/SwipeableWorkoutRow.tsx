import { useEffect, useRef, useState } from 'react';
import { MoreHorizontal, Play, Share } from 'lucide-react';

import type { Workout } from '@/domain/workout';

// Paper: "home-edit-mode". Swiping a workout card left reveals two quick
// actions (Share, More) sitting underneath it, with a 20px gap (Paper's
// gap-5) between the card's trailing edge and the actions once open — the
// card doesn't slide flush against them. Both directions resolve to a
// full snap (open or closed) the moment a short, clearly-horizontal
// gesture is detected — the user never has to drag the card all the way
// by hand, just express intent; INTENT_PX is how far that takes.
//
// "Open" is controlled by the parent (HomePage), not local state — only
// one row can be open at a time. The instant this row commits to an
// open-attempt (direction locks horizontal while starting from closed),
// it calls onOpenChange(true), which HomePage uses to flip every other
// row's isOpen to false — closing whichever one was open, mid-drag if
// necessary, the moment the user shows clear intent on this one instead
// of waiting for their gesture to finish. The effect below is what
// actually animates *this* row shut when isOpen goes false for a reason
// that wasn't its own gesture (i.e. a sibling stole exclusivity).
//
// Gesture tracking lives on `window`, not on setPointerCapture — capture
// reliably throws NotFoundError under CDP-driven mouse drags (confirmed
// live) and, per spec, is only ever a request the browser can decline, so
// leaning on it is fragile in general. window listeners are added on
// pointerdown and torn down on pointerup/cancel, the same trick
// ReorderableExerciseList's hold-to-arm phase already uses. Horizontal
// drag vs. vertical page scroll is disambiguated by direction — whichever
// axis passes DIRECTION_THRESHOLD_PX first wins, no ratio comparison
// making the gesture wait through several ambiguous samples before
// committing (that read as the drag being stuck for the first few pixels
// of real movement).
//
// Starting the workout is resolved entirely from the pointer-up handler,
// not the button's native `click` — the browser's own click-after-drag
// suppression isn't reliable enough across engines (confirmed: it was
// firing after real drags here) to trust for "did the user actually mean
// to tap". justResolvedByPointer suppresses the click event that still
// follows pointerup so it can't double-handle the same gesture; the
// `onClick` fallback below only ever runs for genuine keyboard activation
// (Enter/Space), which has no preceding pointer events at all. Since tap-
// to-start only ever fires from that pointer-up "no real drag happened"
// branch, it's structurally impossible for a mid-swipe or just-closed
// gesture to also start the workout.
//
// The actions sit absolutely-positioned under the card rather than as a
// flex sibling the card slides past — a flex sibling would need the card
// at width:100%, and percentage widths on a flex item whose container has
// no definite width of its own resolve unpredictably.
const ACTION_SIZE = 48;
const ACTION_GAP = 12;
const ACTIONS_WIDTH = ACTION_SIZE * 2 + ACTION_GAP;
const CARD_TO_ACTIONS_GAP = 20;
const OPEN_OFFSET = ACTIONS_WIDTH + CARD_TO_ACTIONS_GAP;
const DIRECTION_THRESHOLD_PX = 8;
const INTENT_PX = 24;

export function SwipeableWorkoutRow({
  workout,
  isOpen,
  onOpenChange,
  onStart,
  onShare,
  onMore,
}: {
  workout: Workout;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onStart: (workout: Workout) => void;
  onShare: (workout: Workout) => void;
  onMore: (workout: Workout) => void;
}) {
  const [offset, setOffset] = useState(0);
  const [dragging, setDragging] = useState(false);
  const gesture = useRef<{
    pointerId: number;
    startX: number;
    startY: number;
    startOffset: number;
    direction: 'horizontal' | 'vertical' | null;
  } | null>(null);
  const justResolvedByPointer = useRef(false);

  // A sibling row claimed exclusivity (or the parent closed us some other
  // way) — animate shut. Skipped when we're the one still mid-drag:
  // onWindowMove already owns `offset` live in that case, and stomping it
  // here would fight the drag.
  useEffect(() => {
    if (!isOpen && !gesture.current) setOffset(0);
  }, [isOpen]);

  function teardown() {
    window.removeEventListener('pointermove', onWindowMove);
    window.removeEventListener('pointerup', onWindowEnd);
    window.removeEventListener('pointercancel', onWindowEnd);
  }

  function onWindowMove(event: PointerEvent) {
    const state = gesture.current;
    if (!state || event.pointerId !== state.pointerId) return;
    const dx = event.clientX - state.startX;
    const dy = event.clientY - state.startY;

    if (state.direction === null) {
      const absDx = Math.abs(dx);
      const absDy = Math.abs(dy);
      if (absDx < DIRECTION_THRESHOLD_PX && absDy < DIRECTION_THRESHOLD_PX) return;
      if (absDy >= absDx) {
        // Vertical (or a tie) — stop tracking and let the page scroll.
        gesture.current = null;
        teardown();
        return;
      }
      state.direction = 'horizontal';
      setDragging(true);
      // Committing to an open-attempt — claim exclusivity now, not at
      // gesture end, so any other open row closes the instant intent is
      // clear rather than waiting for this drag to finish.
      if (state.startOffset === 0) onOpenChange(true);
    }

    if (state.direction !== 'horizontal') return;
    event.preventDefault();
    setOffset(Math.max(-OPEN_OFFSET, Math.min(0, state.startOffset + dx)));
  }

  function onWindowEnd(event: PointerEvent) {
    const state = gesture.current;
    if (!state || event.pointerId !== state.pointerId) return;
    gesture.current = null;
    teardown();
    setDragging(false);
    justResolvedByPointer.current = true;

    if (state.direction !== 'horizontal') {
      // No real drag ever started — a tap. Only route it to Start here,
      // from a spot that's provably not mid-swipe.
      if (isOpen) {
        setOffset(0);
        onOpenChange(false);
      } else {
        onStart(workout);
      }
      return;
    }

    // A real drag: snap fully open or closed the moment intent is clear,
    // regardless of how far past that the finger happened to travel.
    // Computed from the event's own clientX, not React state — `offset`
    // in this closure is whatever it was when this listener was attached
    // (gesture start), not the many intermediate updates since.
    const dx = event.clientX - state.startX;
    const next =
      state.startOffset === 0
        ? dx <= -INTENT_PX
          ? -OPEN_OFFSET
          : 0
        : dx >= INTENT_PX
          ? 0
          : -OPEN_OFFSET;
    onOpenChange(next < 0);
    setOffset(next);
  }

  function handlePointerDown(event: React.PointerEvent) {
    gesture.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      startOffset: offset,
      direction: null,
    };
    window.addEventListener('pointermove', onWindowMove, { passive: false });
    window.addEventListener('pointerup', onWindowEnd);
    window.addEventListener('pointercancel', onWindowEnd);
  }

  function handleClick() {
    // The pointer handlers above already resolved this interaction (tap
    // or drag) — this click, which the browser still fires right after,
    // would otherwise double-handle it. Only genuine keyboard activation
    // (no preceding pointer events) reaches here with the flag unset.
    if (justResolvedByPointer.current) {
      justResolvedByPointer.current = false;
      return;
    }
    if (isOpen) {
      setOffset(0);
      onOpenChange(false);
      return;
    }
    onStart(workout);
  }

  return (
    <div className="relative w-full overflow-hidden rounded-lg">
      <div
        className="absolute inset-y-0 right-0 flex items-center gap-space-5"
        style={{ width: ACTIONS_WIDTH }}
      >
        <button
          type="button"
          aria-label={`Más opciones de ${workout.name}`}
          onClick={() => onMore(workout)}
          className="bg-interactive-subtle flex shrink-0 items-center justify-center rounded-full"
          style={{ width: ACTION_SIZE, height: ACTION_SIZE }}
        >
          <MoreHorizontal className="text-foreground size-5 [stroke-width:1.5]" />
        </button>
        <button
          type="button"
          aria-label={`Compartir ${workout.name}`}
          onClick={() => onShare(workout)}
          className="bg-background-inverse flex shrink-0 items-center justify-center rounded-full"
          style={{ width: ACTION_SIZE, height: ACTION_SIZE }}
        >
          <Share className="text-foreground-inverse size-5 [stroke-width:1.5]" />
        </button>
      </div>

      <button
        type="button"
        onClick={handleClick}
        onPointerDown={handlePointerDown}
        aria-label={`Empezar ${workout.name}`}
        aria-disabled={isOpen}
        className={`border-border-subtle relative flex w-full items-center gap-space-1 rounded-lg border px-space-6 py-space-5 text-left ${isOpen ? 'bg-interactive-subtle' : 'bg-background'}`}
        style={{
          transform: `translateX(${offset}px)`,
          transition: dragging ? 'none' : 'transform 200ms ease',
        }}
      >
        <span className="flex flex-1 flex-col items-start gap-space-3">
          <span className="text-heading leading-heading font-light text-foreground">{workout.name}</span>
          <span className="text-caption leading-caption text-foreground-secondary">
            {workout.exercises.length} ejercicios
          </span>
        </span>
        {/* Decorative — the whole card starts the workout now, but Paper's
            "home" screens still show this play affordance, and removing
            it wasn't asked for. A <span>, not a nested <button>: this
            card is already a button and can't contain interactive
            descendants. Hidden while swiped open: tapping the card no
            longer starts anything then (it just closes), and the
            revealed Share/More actions are the focus instead — the play
            affordance would be misleading there. */}
        {!isOpen && (
          <span className="bg-primary flex size-8 shrink-0 items-center justify-center rounded-full">
            <Play className="text-primary-foreground size-4 [stroke-width:1.5]" fill="currentColor" stroke="none" />
          </span>
        )}
      </button>
    </div>
  );
}
