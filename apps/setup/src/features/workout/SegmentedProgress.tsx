// SegmentedProgress v1 — the exercise-progress bar in WorkoutActivePage's
// timer header: one segment per exercise, segments up through the current
// one lit. Extracted as-is except for one correction: verified against
// Paper's "workout-started"/"workout-paused" artboards (both agree), the
// gap between segments is 1px, not the gap-space-1 (4px) production had
// been using — implementation drift, not a design choice, corrected here.
function SegmentedProgress({ total, current }: { total: number; current: number }) {
  return (
    <div className="flex items-center gap-px">
      {Array.from({ length: total }, (_, index) => (
        <div
          key={index}
          className={`h-1 flex-1 rounded-full ${index <= current ? 'bg-state-active' : 'bg-state-inactive'}`}
        />
      ))}
    </div>
  )
}

export { SegmentedProgress }
