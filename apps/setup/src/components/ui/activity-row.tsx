import { Link } from "react-router-dom"

import type { Activity } from "@/domain/activity"

// ActivityRow v1 — the date-badge + card row used in Home's "Tu actividad"
// preview and the full History list (previously an identical copy-pasted
// block in both HomePage.tsx and HistoryPage.tsx). DateBadge stays
// encapsulated here rather than becoming its own component — it has no
// use outside this row.
//
// Verified against Paper ("historial" and "home" artboards), which
// surfaced two real discrepancies, both corrected here (not carried over
// from production):
// - the row aligns `items-start`, not `items-center` — the date badge
//   sits flush with the card's top edge, not vertically centered against
//   it.
// - day and month get the identical treatment (`text-label`/
//   `text-foreground-secondary`) — Paper has no extra emphasis on the day
//   number; production had incorrectly promoted it to
//   `text-label-emphasis`/`text-foreground`.
function formatDateBadge(iso: string): { day: string; month: string } {
  const date = new Date(iso)
  return {
    day: String(date.getDate()),
    month: date.toLocaleDateString("en-US", { month: "short" }).toUpperCase(),
  }
}

function ActivityRow({ activity, to }: { activity: Activity; to: string }) {
  const { day, month } = formatDateBadge(activity.date)

  return (
    <Link
      to={to}
      className="group flex items-start gap-space-5 rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-foreground focus-visible:ring-offset-2"
    >
      <div className="bg-interactive-subtle flex w-12 shrink-0 flex-col items-center justify-center gap-space-1 rounded-lg p-space-2">
        <span className="text-label leading-label text-foreground-secondary">{day}</span>
        <span className="text-label leading-label text-foreground-secondary">{month}</span>
      </div>
      <div className="border-border-subtle flex flex-1 flex-col items-start gap-space-3 rounded-lg border px-space-6 py-space-5 transition-colors group-hover:bg-interactive-subtle group-active:bg-border-subtle">
        <span className="text-heading leading-heading font-light text-foreground">{activity.workoutName}</span>
        <span className="text-caption leading-caption text-foreground-secondary">
          {activity.exercises.length} ejercicios · {Math.round(activity.durationSeconds / 60)} min
        </span>
      </div>
    </Link>
  )
}

export { ActivityRow }
