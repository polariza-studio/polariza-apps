import * as React from "react"
import { ArrowLeft, X } from "lucide-react"

import { IconButton } from "@/components/ui/icon-button"
import { cn } from "@/lib/utils"

// PageHeader v1 — the row of back/title/close controls at the top of a
// screen or a modal, covering the 3 real compositions in the product: back
// only (HistoryPage), back + title (ActivityDetailPage), title + close
// (CreateWorkoutPage, and ExerciseModal's own sheet header). No usage
// combines back and close in the same header — both are supported
// independently, but that fourth combination doesn't exist today and isn't
// implied to be coming.
//
// One fixed spec across all 3 compositions, verified against Paper (the
// "historial", "historial-workout-detail", "crear-workout" and "modal"
// artboards): a 64px-tall row (`h-16` — Tailwind's own scale, no space-*
// token covers 64px, same direct-exception precedent as Button's own
// `h-12`), `p-space-7` (20px) padding on all sides, `items-center
// justify-between`. All four artboards share this exact padding/height —
// production had drifted into two different paddings per screen
// (px-space-7 pt-space-7 vs. p-space-7) before this fix, which was pure
// implementation inconsistency, not an intentional per-screen difference.
// PageHeader now owns this spacing itself; callers no longer add their own
// padding around it (see HistoryPage/ActivityDetailPage/CreateWorkoutPage/
// ExerciseModal — each now wraps it in a bare width constraint only, no
// padding). Always `w-full` on its own root so `justify-between` has a
// real width to distribute across.
//
// The two-tone title ("Editar · workout") is part of PageHeader itself,
// not a caller-assembled composition — every current title use follows the
// same emphasis/secondary shape, so there's nothing screen-specific to let
// the caller override beyond the two strings.
//
// `titleAs` exists solely so ExerciseModal's sheet header can render the
// same two-tone title as a Radix `Dialog.Title` (required for the dialog's
// own accessibility wiring) instead of a plain `<span>` — the visual/typo-
// graphy output is identical either way.
function PageHeader({
  onBack,
  title,
  titleAs: TitleComponent = "span",
  onClose,
  className,
}: {
  onBack?: () => void
  title?: { emphasis: string; secondary?: string }
  titleAs?: React.ElementType
  onClose?: () => void
  className?: string
}) {
  return (
    <div className={cn("flex h-16 w-full shrink-0 items-center justify-between p-space-7", className)}>
      {onBack && (
        <IconButton aria-label="Volver" className="text-foreground" onClick={onBack}>
          <ArrowLeft />
        </IconButton>
      )}
      {title && (
        <TitleComponent className="text-body leading-body">
          <span className="text-foreground">{title.emphasis}</span>
          {title.secondary && <span className="text-foreground-secondary"> · {title.secondary}</span>}
        </TitleComponent>
      )}
      {onClose && (
        <IconButton aria-label="Cerrar" className="text-foreground" onClick={onClose}>
          <X />
        </IconButton>
      )}
    </div>
  )
}

export { PageHeader }
