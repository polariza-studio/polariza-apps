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
// Dragging used to engage the instant a finger touched the grip, so a
// scroll gesture that merely started on/near it would hijack the whole
// list. Require a brief hold before it arms: a quick touch (scrolling)
// releases or moves past the threshold first and is left alone; only a
// genuine press-and-hold engages the drag.
const HOLD_MS = 180;
const MOVE_CANCEL_THRESHOLD_PX = 8;

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
  const pending = useRef<{
    id: string;
    target: HTMLElement;
    pointerId: number;
    startX: number;
    startY: number;
    timer: number;
  } | null>(null);

  if (!draggedId && order !== exercises && !sameOrder(order, exercises)) {
    setOrder(exercises);
  }

  useLayoutEffect(() => () => clearPending(), []);

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

  function clearPending() {
    if (!pending.current) return;
    window.clearTimeout(pending.current.timer);
    window.removeEventListener('pointermove', onPendingMove);
    window.removeEventListener('pointerup', onPendingRelease);
    window.removeEventListener('pointercancel', onPendingRelease);
    pending.current = null;
  }

  function onPendingMove(event: PointerEvent) {
    const current = pending.current;
    if (!current || event.pointerId !== current.pointerId) return;
    const dx = event.clientX - current.startX;
    const dy = event.clientY - current.startY;
    if (Math.hypot(dx, dy) > MOVE_CANCEL_THRESHOLD_PX) clearPending();
  }

  function onPendingRelease(event: PointerEvent) {
    if (pending.current?.pointerId === event.pointerId) clearPending();
  }

  function engageDrag(id: string, target: HTMLElement, pointerId: number, clientY: number) {
    const cardEl = cardRefs.current.get(id);
    if (!cardEl) return;
    try {
      target.setPointerCapture(pointerId);
    } catch {
      // Pointer already gone (e.g. released/cancelled right as the hold
      // timer fired) — nothing to drag.
      return;
    }
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
    clearPending();
    const target = event.currentTarget;
    const pointerId = event.pointerId;
    const startX = event.clientX;
    const startY = event.clientY;
    pending.current = {
      id,
      target,
      pointerId,
      startX,
      startY,
      timer: window.setTimeout(() => {
        clearPending();
        engageDrag(id, target, pointerId, startY);
      }, HOLD_MS),
    };
    window.addEventListener('pointermove', onPendingMove);
    window.addEventListener('pointerup', onPendingRelease);
    window.addEventListener('pointercancel', onPendingRelease);
  }

  function handlePointerMove(event: React.PointerEvent) {
    if (!draggedId || !rowStep.current) return;
    // Dragging is engaged — stop the browser from also scrolling the
    // page underneath the gesture.
    event.preventDefault();
    setPointerY(event.clientY);
    const deltaSteps = Math.round((event.clientY - dragStartY.current) / rowStep.current);
    setOrder((current) => {
      const targetIndex = Math.max(0, Math.min(current.length - 1, dragStartIndex.current + deltaSteps));
      const currentIndex = current.findIndex((exercise) => exercise.id === draggedId);
      if (currentIndex === -1 || currentIndex === targetIndex) return current;
      const next = [...current];
      const [item] = next.splice(currentIndex, 1);
      next.splice(targetIndex, 0, item);
      return next;
    });
  }

  function handlePointerUp() {
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
            className={`flex items-center gap-space-1 rounded-lg py-space-5 px-space-6 outline outline-1 outline-border-subtle ${isDragged ? 'bg-[#F4F5F4]' : ''}`}
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
              className="flex shrink-0 items-center justify-center p-space-2"
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
