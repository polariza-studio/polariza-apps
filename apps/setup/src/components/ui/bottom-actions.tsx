import * as React from "react"

import { useBottomShadow } from "@/lib/use-bottom-shadow"
import { cn } from "@/lib/utils"

// BottomActions v1 — the sticky action surface pinned to the bottom of a
// screen (CreateWorkoutPage's "Guardar Workout", WorkoutActivePage's
// Anterior/Siguiente/Finalizar row). Encapsulates the surface itself
// (sticky, background, spacing) and the scroll-driven shadow via
// useBottomShadow — both screens already shared that hook before this
// extraction, only the surrounding markup was duplicated.
//
// No `oneButton`/`twoButtons` variant: it adapts to whatever `children` it
// gets, always laid out in the same `flex items-center gap-space-6` row.
// CreateWorkoutPage's single full-width button (`className="w-full"` on
// the Button itself, no other change) fills that row exactly as it did in
// its old non-flex wrapper — flex-basis:auto plus an explicit `w-full`
// still resolves to the full row width.
//
// `ready` is passed straight through to useBottomShadow, not computed
// here — WorkoutActivePage gates it on `ready && Boolean(workout)`, not
// bare `ready`, so BottomActions takes the caller's own boolean rather
// than assuming what "ready" means for that screen.
//
// `inverse` swaps the surface to background-inverse and the shadow's
// color — verified against Paper's "preview-workout" artboard (the one
// dark-surface screen with a sticky action bar): a moss-tinted shadow
// reads as basically invisible against an already-dark-moss page, so the
// inverse case uses black instead. Same offset/blur as the light case
// (`0 -2px 35px`) — only the tint differs: `rgba(41,64,0,0.1)` (moss) vs.
// `rgba(0,0,0,0.2)` (black). Neither shadow has a Foundations token yet;
// both are inline exactly as the light one was before this variant.
// Padding/spacing is identical between the two — only color changes.
function BottomActions({
  ready,
  inverse = false,
  className,
  children,
}: {
  ready: boolean
  inverse?: boolean
  className?: string
  children: React.ReactNode
}) {
  const showShadow = useBottomShadow(ready)

  return (
    <div
      className={cn(
        "sticky bottom-0 w-full px-space-7 pt-space-7 pb-8",
        inverse ? "bg-background-inverse" : "bg-background",
        showShadow &&
          (inverse ? "shadow-[0_-2px_35px_rgba(0,0,0,0.2)]" : "shadow-[0_-2px_35px_rgba(41,64,0,0.1)]"),
      )}
    >
      <div className={cn("mx-auto flex w-full max-w-[440px] items-center gap-space-6", className)}>{children}</div>
    </div>
  )
}

export { BottomActions }
