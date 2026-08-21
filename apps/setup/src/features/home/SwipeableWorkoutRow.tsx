import { useEffect, useRef, useState } from 'react';
import { Pencil, Play, Trash } from 'lucide-react';

import type { Workout } from '@/domain/workout';

// Paper: "home-edit-mode". Swiping a workout card left reveals two quick
// actions (Editar, Eliminar) sitting underneath it, with a 20px gap
// (Paper's gap-5) between the card's trailing edge and the actions once
// open — the card doesn't slide flush against them. Both directions
// resolve to a
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
// of waiting for their gesture to finish. An open row also closes on
// swipe-right, on tapping the card itself, or on any tap outside this
// row's own DOM (the document-level pointerdown effect below) — the
// "outside" case covers everything that isn't another card's own swipe
// (that's the exclusivity claim), e.g. tapping "Nuevo workout" or empty
// page space. The other effect is what actually animates *this* row
// shut when isOpen goes false for a reason that wasn't its own gesture.
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
const DIRECTION_THRESHOLD_PX = 6;
const INTENT_PX = 16;

export function SwipeableWorkoutRow({
  workout,
  isOpen,
  onOpenChange,
  onStart,
  onEdit,
  onDelete,
}: {
  workout: Workout;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onStart: (workout: Workout) => void;
  onEdit: (workout: Workout) => void;
  onDelete: (workout: Workout) => void;
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
  const containerRef = useRef<HTMLDivElement>(null);

  // Keeps the visual slide in sync with the controlled `isOpen` prop for
  // any change that wasn't this row's own gesture — a sibling claiming
  // exclusivity, the parent closing it some other way, or mounting
  // already open (isOpen=true from the start). Without the true branch,
  // `offset` never leaves its initial 0 unless a gesture sets it, so a
  // row externally opened (isOpen=true with no preceding drag on this
  // row) would show the open background tint without actually sliding —
  // this makes the component fully honor its own controlled-prop
  // contract in both directions, not just closing. Skipped when we're the
  // one still mid-drag: onWindowMove already owns `offset` live in that
  // case, and stomping it here would fight the drag.
  useEffect(() => {
    if (gesture.current) return;
    setOffset(isOpen ? -OPEN_OFFSET : 0);
  }, [isOpen]);

  // Tap/click anywhere outside this row while it's open closes it — not
  // just another card (that's the exclusivity claim above), anywhere:
  // the "Nuevo workout" button, the header, empty page space. Only
  // listens while actually open, and only for a pointerdown that isn't
  // itself the start of a gesture on this row (that path is handled by
  // the row's own handlers, which also close-and-suppress correctly).
  useEffect(() => {
    if (!isOpen) return;
    function onOutsidePointerDown(event: PointerEvent) {
      if (containerRef.current?.contains(event.target as Node)) return;
      onOpenChange(false);
    }
    document.addEventListener('pointerdown', onOutsidePointerDown);
    return () => document.removeEventListener('pointerdown', onOutsidePointerDown);
  }, [isOpen, onOpenChange]);

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
      if (absDy > absDx) {
        // Clearly vertical — stop tracking and let the page scroll. Ties
        // bias horizontal on purpose: this row exists specifically for
        // horizontal gestures, so a borderline-diagonal swipe (thumb
        // imprecision) should still register as intent to swipe here.
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
    <div ref={containerRef} className="relative w-full overflow-hidden rounded-lg">
      <div
        className="absolute inset-y-0 right-0 flex items-center gap-space-5"
        style={{ width: ACTIONS_WIDTH }}
      >
        {/* Hover/pressed/focus mirror Button v1's secondary variant
            exactly (Foundations v1, index.css --button-secondary-hover/
            -pressed: moss mixed 92%/84% with white) — same state ladder
            as Finalizar (WorkoutActivePage), on request, even though
            this isn't literally <Button> yet (unification to come
            later in Storybook). No shadow: secondary's shadow-button is
            a variant detail, not part of the state ladder, and
            explicitly not wanted here. */}
        <button
          type="button"
          aria-label={`Editar ${workout.name}`}
          onClick={() => onEdit(workout)}
          className="bg-background-inverse flex shrink-0 items-center justify-center rounded-full outline-none transition-colors hover:bg-[color-mix(in_srgb,var(--moss)_92%,var(--neutral-0)_8%)] active:bg-[color-mix(in_srgb,var(--moss)_84%,var(--neutral-0)_16%)] focus-visible:ring-2 focus-visible:ring-foreground focus-visible:ring-offset-2"
          style={{ width: ACTION_SIZE, height: ACTION_SIZE }}
        >
          <Pencil className="text-foreground-inverse size-5 [stroke-width:1.5]" />
        </button>
        {/* Same 92%/8%, 84%/16% white-mix ratio as secondary's own
            hover/pressed, applied to this destructive red instead of
            moss — #C52D01 has no Foundations token yet (see where it
            was introduced), so the formula is inlined rather than
            referencing one. */}
        <button
          type="button"
          aria-label={`Eliminar ${workout.name}`}
          onClick={() => onDelete(workout)}
          className="flex shrink-0 items-center justify-center rounded-full bg-[#C52D01] outline-none transition-colors hover:bg-[color-mix(in_srgb,#C52D01_92%,var(--neutral-0)_8%)] active:bg-[color-mix(in_srgb,#C52D01_84%,var(--neutral-0)_16%)] focus-visible:ring-2 focus-visible:ring-foreground focus-visible:ring-offset-2"
          style={{ width: ACTION_SIZE, height: ACTION_SIZE }}
        >
          <Trash className="text-foreground-inverse size-5 [stroke-width:1.5]" />
        </button>
      </div>

      {/* Hover/pressed/focus follow Button v1's ghost ladder (Foundations
          v1, index.css): 4% → 10% moss tint, one rung below ghost's own
          since this card rests at 0% tint instead of ghost's 4%. Skipped
          while isOpen — that state already owns interactive-subtle as its
          own visual (safe there: the card has slid away from the actions
          it would otherwise reveal). Mixed against --background, not
          --interactive-subtle/--border-subtle directly: those tokens are
          color-mix(..., transparent) — swapping the card's opaque
          bg-background for one of them on hover would make the card
          partially see-through, revealing the swipe actions positioned
          underneath it at rest. */}
      <button
        type="button"
        onClick={handleClick}
        onPointerDown={handlePointerDown}
        aria-label={`Abrir ${workout.name}`}
        aria-disabled={isOpen}
        className={`border-border-subtle relative flex w-full items-center gap-space-1 rounded-lg border px-space-6 py-space-5 text-left outline-none transition-colors focus-visible:ring-2 focus-visible:ring-foreground focus-visible:ring-offset-2 ${isOpen ? 'bg-interactive-subtle' : 'bg-background hover:bg-[color-mix(in_srgb,var(--moss)_4%,var(--background))] active:bg-[color-mix(in_srgb,var(--moss)_10%,var(--background))]'}`}
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
            revealed Editar/Eliminar actions are the focus instead — the
            play affordance would be misleading there. */}
        {!isOpen && (
          <span className="bg-primary flex size-8 shrink-0 items-center justify-center rounded-full">
            <Play className="text-primary-foreground size-4 [stroke-width:1.5]" fill="currentColor" stroke="none" />
          </span>
        )}
      </button>
    </div>
  );
}
