import { useLayoutEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { GripVertical } from 'lucide-react';

import type { TrainingDay } from '@/domain/plan';

// Paper's exact grip color (#2940004D — moss at 30% alpha).
const GRIP_COLOR = 'color-mix(in srgb, var(--moss) 30%, transparent)';
// Paper's floating-card shadow (#2940001A 0px 2px 19px — border-subtle's
// color, i.e. moss at 10% alpha) and tilt (4deg), captured directly from
// its "picking up a card" reference export.
const DRAG_SHADOW = '0 2px 19px var(--border-subtle)';
const DRAG_ROTATION_DEG = 4;
const FLIP_DURATION_MS = 200;

// Drag-to-reorder which named workout sits on which day (per Paper's
// reference: a floating white card — shadow, slight rotation — follows
// the pointer, while the row it's dragged from becomes an empty
// placeholder (a light fill, "the shape left behind"), and every other
// card smoothly slides (FLIP) into its new slot as the drag crosses it.
// The "Day N" chips are their own fixed column, keyed by position (not
// day id) and never animated — they're slot labels, not something that
// travels with the card. Reordering only changes array position: each
// TrainingDay keeps its own id, so saved Activity history (keyed by
// trainingDayId, not position) is unaffected.
//
// Pointer Events, not native HTML5 drag-and-drop — the latter has
// unreliable touch support, and this is a mobile-first app.
export function ReorderableDayList({
  days,
  onReorder,
}: {
  days: TrainingDay[];
  onReorder: (days: TrainingDay[]) => void;
}) {
  const [order, setOrder] = useState(days);
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [pointerY, setPointerY] = useState(0);
  const [dragOrigin, setDragOrigin] = useState<{ left: number; top: number; width: number } | null>(null);
  const dragStartY = useRef(0);
  const dragStartIndex = useRef(0);
  const rowStep = useRef(0);
  const cardRefs = useRef(new Map<string, HTMLElement>());
  const prevRects = useRef(new Map<string, DOMRect>());

  // Re-sync if the plan changes from outside (e.g. regenerated via
  // Adjust Plan) while this list isn't mid-drag.
  if (!draggedId && order !== days && !sameOrder(order, days)) {
    setOrder(days);
  }

  // FLIP: each card smoothly slides from its previous position to its
  // new one whenever `order` changes — including the dragged card's own
  // now-empty placeholder. The chip column never participates: it's
  // rendered by position, not by day id, so it has nothing to animate.
  // The floating clone is a separate element with its own direct
  // pointer-following transform, so there's nothing to reconcile there
  // either.
  useLayoutEffect(() => {
    for (const day of order) {
      const el = cardRefs.current.get(day.id);
      const prev = prevRects.current.get(day.id);
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
    for (const day of order) {
      const el = cardRefs.current.get(day.id);
      if (el) prevRects.current.set(day.id, el.getBoundingClientRect());
    }
  }, [order]);

  function handlePointerDown(id: string, event: React.PointerEvent) {
    const cardEl = cardRefs.current.get(id);
    if (!cardEl) return;
    const rect = cardEl.getBoundingClientRect();
    event.currentTarget.setPointerCapture(event.pointerId);
    dragStartY.current = event.clientY;
    dragStartIndex.current = order.findIndex((day) => day.id === id);
    // Row-to-row distance, measured once up front from two *settled*
    // cards — never re-measured mid-drag. Re-measuring live during the
    // drag was the bug: cards mid-FLIP-transition report a moving rect,
    // so the old neighbor-boundary check could read a stale/shifting
    // target and stall, especially dragging downward through several
    // rows in one gesture. Position is now pure arithmetic (pointer
    // delta ÷ this step), independent of whatever's mid-animation.
    const first = cardRefs.current.get(order[0]?.id ?? '')?.getBoundingClientRect();
    const second = cardRefs.current.get(order[1]?.id ?? '')?.getBoundingClientRect();
    rowStep.current = first && second ? second.top - first.top : rect.height + 12;
    setPointerY(event.clientY);
    setDragOrigin({ left: rect.left, top: rect.top, width: rect.width });
    setDraggedId(id);
  }

  function handlePointerMove(event: React.PointerEvent) {
    if (!draggedId || !rowStep.current) return;
    setPointerY(event.clientY);
    const deltaSteps = Math.round((event.clientY - dragStartY.current) / rowStep.current);
    setOrder((current) => {
      const targetIndex = Math.max(0, Math.min(current.length - 1, dragStartIndex.current + deltaSteps));
      const currentIndex = current.findIndex((day) => day.id === draggedId);
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

  const draggedDay = order.find((day) => day.id === draggedId);

  return (
    <div className="grid w-full gap-space-5" style={{ gridTemplateColumns: 'auto 1fr' }}>
      {/* Chip and card share a CSS grid row per slot (explicit gridRow,
          not DOM adjacency), so the row's height is always driven by the
          taller card and the chip centers within it — two independent
          flex columns can't stay height-synced since chips are much
          shorter than cards. Chips are keyed by position and never
          reorder/animate; cards are keyed by day id and FLIP as before. */}
      {order.map((_, index) => (
        <span
          key={index}
          style={{ gridRow: index + 1, gridColumn: 1 }}
          className="flex min-w-12 shrink-0 items-center justify-center self-start rounded-lg bg-interactive-subtle p-space-2 text-center text-label leading-label whitespace-nowrap text-foreground-secondary"
        >
          Day {index + 1}
        </span>
      ))}

      {order.map((day, index) => {
        const isDragged = draggedId === day.id;
        return (
          <span
            key={day.id}
            ref={(element) => {
              if (element) cardRefs.current.set(day.id, element);
              else cardRefs.current.delete(day.id);
            }}
            style={{ gridRow: index + 1, gridColumn: 2 }}
            className={`flex items-center gap-space-1 rounded-lg py-space-5 px-space-6 outline outline-1 outline-border-subtle ${isDragged ? 'bg-[#F4F5F4]' : ''}`}
          >
            {/* Content fades out (not the outline) once this card is the
                one being dragged, so it reads as the empty shape left
                behind — the real content is the floating clone below.
                The grip button stays interactive at opacity 0 rather
                than unmounting: removing it mid-drag would drop its
                pointer capture and end the gesture early. */}
            <Link
              to={`/workout/${day.id}`}
              className={`flex flex-1 flex-col items-start gap-space-3 ${isDragged ? 'opacity-0' : ''}`}
            >
              <span className="text-heading leading-heading font-light text-foreground">{day.name}</span>
              <span className="flex items-center gap-space-1 text-caption leading-caption text-foreground-secondary">
                <span>{day.exercises.length} exercises</span>
                <span>·</span>
                <span>{day.estimatedDurationMinutes} min</span>
              </span>
            </Link>
            <button
              type="button"
              aria-label={`Reorder ${day.name}`}
              className="flex shrink-0 touch-none items-center justify-center p-space-2"
              style={{ color: GRIP_COLOR, opacity: isDragged ? 0 : 1 }}
              onPointerDown={(event) => handlePointerDown(day.id, event)}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onPointerCancel={handlePointerUp}
            >
              <GripVertical className="size-5 [stroke-width:1.5]" />
            </button>
          </span>
        );
      })}

      {draggedDay && dragOrigin && (
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
            <span className="text-heading leading-heading font-light text-foreground">{draggedDay.name}</span>
            <span className="flex items-center gap-space-1 text-caption leading-caption text-foreground-secondary">
              <span>{draggedDay.exercises.length} exercises</span>
              <span>·</span>
              <span>{draggedDay.estimatedDurationMinutes} min</span>
            </span>
          </span>
          <GripVertical className="size-5 shrink-0 [stroke-width:1.5]" style={{ color: GRIP_COLOR }} />
        </div>
      )}
    </div>
  );
}

function sameOrder(a: TrainingDay[], b: TrainingDay[]): boolean {
  return a.length === b.length && a.every((day, index) => day.id === b[index].id);
}
