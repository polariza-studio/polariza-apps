import * as React from "react"

import { cn } from "@/lib/utils"

// EmptyState v1 — Home's "no hay workouts" and CreateWorkout's "no hay
// ejercicios" (Paper: "home-empty", "crear-workout-empty" artboards, which
// share this exact spec). Verified against Paper: production had been
// missing the empty-state's own `px-space-6` inline padding (only had
// `py-[32px]`), leaving content flush against the dashed edge — this was
// implementation drift, not a design choice, and is corrected here rather
// than carried forward.
function EmptyState({
  icon,
  cta,
  className,
  children,
}: {
  icon: React.ReactNode
  cta?: React.ReactNode
  className?: string
  children: React.ReactNode
}) {
  return (
    <div
      className={cn(
        "outline-border text-body leading-body text-foreground-secondary flex flex-1 flex-col items-center justify-center gap-space-7 rounded-lg px-space-6 py-[32px] text-center outline outline-1 outline-dashed",
        className,
      )}
    >
      <span className="bg-interactive-subtle flex size-12 shrink-0 items-center justify-center rounded-full">
        {icon}
      </span>
      {children}
      {cta}
    </div>
  )
}

export { EmptyState }
