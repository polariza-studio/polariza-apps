import { useLayoutEffect, useRef, useState } from 'react';
import { GripVertical } from 'lucide-react';

import type { WorkoutExercise } from '@/domain/workout';

// Same drag-to-reorder pattern as the original day-reorder list (Paper:
// a floating white card — shadow, slight rotation — follows the pointer,
// while the row it's dragged from becomes an empty placeholder, and every
// other card FLIP-slides into its new slot). Adapted to exercises within
// one workout: numbered chip is position-only (never animates, never
// travels with the card), the card is the exercise itself.
//
// Pointer Events, not native HTML5 drag-and-drop — unreliable touch
// support, and this is a mobile-first app.
const GRIP_COLOR = 'color-mix(in srgb, var(--moss) 30%, transparent)';
const DRAG_SHADOW = '0 2px 19px var(--border-subtle)';
const DRAG_ROTATION_DEG = 4;
const FLIP_DURATION_MS = 200;
// A drag must reliably win against native scroll/selection from the very
// first touch, not out-wait it: the grip captures the pointer immediately
// on pointerdown (so every later event for that pointer is guaranteed to
// reach it, no matter where the finger travels) and `touch-action: none`
// on the grip (className below) tells the browser upfront this touch
// isn't for scrolling — there's nothing left to race. A previous version
// used a 180ms hold-then-engage timer instead, on plain (uncaptured)
// window listeners with no touch-action set; the browser was free to
// claim the touch for scrolling before that timer ever fired, and once
// it did, capture/preventDefault calls afterward were too late to get it
// back. DRAG_ENGAGE_THRESHOLD_PX only distinguishes an intentional drag
// from a stray tremor on an otherwise-stationary press — a movement
// check, not a time delay, so there's no perceptible lag before the drag
// starts.
const DRAG_ENGAGE_THRESHOLD_PX = 4;

function exerciseSummary(exercise: WorkoutExercise): string {
  return `${exercise.sets} × ${exercise.targetReps} · ${exercise.restSeconds} s`;
}

export function ReorderableExerciseList({
  exercises,
  onReorder,
  onSelect,
}: {
  exercises: WorkoutExercise[];
  onReorder: (exercises: WorkoutExercise[]) => void;
  onSelect: (exercise: WorkoutExercise) => void;
}) {
  const [order, setOrder] = useState(exercises);
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [pointerY, setPointerY] = useState(0);
  const [dragOrigin, setDragOrigin] = useState<{ left: number; top: number; width: number } | null>(null);
  const dragStartY = useRef(0);
  const dragStartIndex = useRef(0);
  const rowStep = useRef(0);
  const cardRefs = useRef(new Map<string, HTMLElement>());
  const prevRects = useRef(new Map<string, DOMRect>());
  // Captured the instant the grip is pressed — `engaged` flips true once
  // movement crosses DRAG_ENGAGE_THRESHOLD_PX, at which point engageDrag
  // runs and draggedId takes over as the source of truth for the rest of
  // the gesture. A plain tap (pointerup before threshold) leaves this
  // null again with no side effect, same as before.
  const gesture = useRef<{ id: string; pointerId: number; startY: number; engaged: boolean } | null>(null);

  if (!draggedId && order !== exercises && !sameOrder(order, exercises)) {
    setOrder(exercises);
  }

  useLayoutEffect(() => {
    for (const exercise of order) {
      const el = cardRefs.current.get(exercise.id);
      const prev = prevRects.current.get(exercise.id);
      if (el && prev) {
        const next = el.getBoundingClientRect();
        const deltaY = prev.top - next.top;
        if (deltaY) {
          el.style.transition = 'none';
          el.style.transform = `translateY(${deltaY}px)`;
          requestAnimationFrame(() => {
            el.style.transition = `transform ${FLIP_DURATION_MS}ms ease`;
            el.style.transform = '';
          });
        }
      }
    }
    for (const exercise of order) {
      const el = cardRefs.current.get(exercise.id);
      if (el) prevRects.current.set(exercise.id, el.getBoundingClientRect());
    }
  }, [order]);

  function engageDrag(id: string, clientY: number) {
    const cardEl = cardRefs.current.get(id);
    if (!cardEl) return;
    const rect = cardEl.getBoundingClientRect();
    dragStartY.current = clientY;
    dragStartIndex.current = order.findIndex((exercise) => exercise.id === id);
    const first = cardRefs.current.get(order[0]?.id ?? '')?.getBoundingClientRect();
    const second = cardRefs.current.get(order[1]?.id ?? '')?.getBoundingClientRect();
    rowStep.current = first && second ? second.top - first.top : rect.height + 12;
    setPointerY(clientY);
    setDragOrigin({ left: rect.left, top: rect.top, width: rect.width });
    setDraggedId(id);
  }

  function handlePointerDown(id: string, event: React.PointerEvent<HTMLButtonElement>) {
    // Captured immediately, not once a drag is confirmed — this is what
    // guarantees every later pointermove/up for this pointer reaches the
    // grip regardless of where the finger physically travels, instead of
    // racing the browser's own gesture recognizer for it.
    try {
      event.currentTarget.setPointerCapture(event.pointerId);
    } catch {
      return;
    }
    gesture.current = { id, pointerId: event.pointerId, startY: event.clientY, engaged: false };
  }

  function handlePointerMove(event: React.PointerEvent) {
    const state = gesture.current;
    if (!state || event.pointerId !== state.pointerId) return;
    if (!state.engaged) {
      if (Math.abs(event.clientY - state.startY) < DRAG_ENGAGE_THRESHOLD_PX) return;
      state.engaged = true;
      engageDrag(state.id, state.startY);
    }
    // rowStep.current (a ref) is set synchronously inside engageDrag, but
    // draggedId (state) isn't visible in this closure until the next
    // render — checking rowStep.current instead of draggedId here means
    // the very event that just engaged the drag still applies its own
    // movement immediately, rather than waiting one more pointermove to
    // "catch up".
    if (!rowStep.current) return;
    // Dragging is engaged — stop the browser from also scrolling the
    // page underneath the gesture (belt-and-suspenders: touch-action:
    // none on the grip, in the JSX below, already keeps the browser from
    // ever starting that scroll in the first place).
    event.preventDefault();
    setPointerY(event.clientY);
    const deltaSteps = Math.round((event.clientY - dragStartY.current) / rowStep.current);
    setOrder((current) => {
      const targetIndex = Math.max(0, Math.min(current.length - 1, dragStartIndex.current + deltaSteps));
      // state.id, not the draggedId closure variable — same reasoning as
      // the rowStep.current check above: on the engaging event itself,
      // draggedId's state update from engageDrag hasn't re-rendered this
      // closure yet, but state.id (the ref) is already correct.
      const currentIndex = current.findIndex((exercise) => exercise.id === state.id);
      if (currentIndex === -1 || currentIndex === targetIndex) return current;
      const next = [...current];
      const [item] = next.splice(currentIndex, 1);
      next.splice(targetIndex, 0, item);
      return next;
    });
  }

  function handlePointerUp() {
    gesture.current = null;
    if (!draggedId) return;
    setDraggedId(null);
    setDragOrigin(null);
    rowStep.current = 0;
    onReorder(order);
  }

  const draggedExercise = order.find((exercise) => exercise.id === draggedId);

  return (
    <div className="grid w-full gap-space-5" style={{ gridTemplateColumns: 'auto 1fr' }}>
      {order.map((_, index) => (
        <span
          key={index}
          style={{ gridRow: index + 1, gridColumn: 1 }}
          className="flex min-w-8 shrink-0 items-center justify-center self-start rounded-lg bg-interactive-subtle p-space-2 text-center text-label leading-label whitespace-nowrap text-foreground-secondary"
        >
          {index + 1}
        </span>
      ))}

      {order.map((exercise, index) => {
        const isDragged = draggedId === exercise.id;
        return (
          <span
            key={exercise.id}
            ref={(element) => {
              if (element) cardRefs.current.set(exercise.id, element);
              else cardRefs.current.delete(exercise.id);
            }}
            style={{ gridRow: index + 1, gridColumn: 2 }}
            className={`flex items-center gap-space-1 rounded-lg py-space-5 px-space-6 outline outline-1 outline-border-subtle select-none ${isDragged ? 'bg-[#F4F5F4]' : ''}`}
          >
            <button
              type="button"
              onClick={() => onSelect(exercise)}
              className={`flex flex-1 flex-col items-start gap-space-3 text-left ${isDragged ? 'opacity-0' : ''}`}
            >
              <span className="text-heading leading-heading font-light text-foreground">{exercise.name}</span>
              <span className="text-caption leading-caption text-foreground-secondary">{exerciseSummary(exercise)}</span>
            </button>
            <button
              type="button"
              aria-label={`Reordenar ${exercise.name}`}
              // touch-none: the browser must never claim this touch for
              // scrolling — see the DRAG_ENGAGE_THRESHOLD_PX comment
              // above. select-none + -webkit-touch-callout none: a
              // stationary press here shouldn't trigger text selection or
              // iOS's copy/look-up callout while a drag is deciding
              // whether to engage.
              className="flex shrink-0 touch-none cursor-grab items-center justify-center p-space-2 select-none active:cursor-grabbing [-webkit-touch-callout:none] [-webkit-user-drag:none]"
              style={{ color: GRIP_COLOR, opacity: isDragged ? 0 : 1 }}
              onPointerDown={(event) => handlePointerDown(exercise.id, event)}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onPointerCancel={handlePointerUp}
            >
              <GripVertical className="size-5 [stroke-width:1.5]" />
            </button>
          </span>
        );
      })}

      {draggedExercise && dragOrigin && (
        <div
          className="pointer-events-none fixed z-50 flex items-center gap-space-1 rounded-lg bg-white py-space-5 px-space-6"
          style={{
            left: dragOrigin.left,
            top: dragOrigin.top,
            width: dragOrigin.width,
            boxShadow: DRAG_SHADOW,
            transform: `translateY(${pointerY - dragStartY.current}px) rotate(${DRAG_ROTATION_DEG}deg)`,
          }}
        >
          <span className="flex flex-1 flex-col items-start gap-space-3">
            <span className="text-heading leading-heading font-light text-foreground">{draggedExercise.name}</span>
            <span className="text-caption leading-caption text-foreground-secondary">{exerciseSummary(draggedExercise)}</span>
          </span>
          <GripVertical className="size-5 shrink-0 [stroke-width:1.5]" style={{ color: GRIP_COLOR }} />
        </div>
      )}
    </div>
  );
}

// Reference equality, not just matching ids: editing an exercise keeps its
// id and position but produces a new object (handleSaveExercise), and that
// edit needs to resync into `order` immediately rather than waiting for a
// remount — an id-only comparison would treat it as "no change".
function sameOrder(a: WorkoutExercise[], b: WorkoutExercise[]): boolean {
  return a.length === b.length && a.every((exercise, index) => exercise === b[index]);
}
