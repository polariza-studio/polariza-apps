import * as React from "react"
import { ArrowLeft, X } from "lucide-react"

import { IconButton } from "@/components/ui/icon-button"
import { cn } from "@/lib/utils"

// PageHeader v1 — the row of back/title/close controls at the top of a
// screen or a modal, covering the 4 real compositions in the product: back
// only (HistoryPage), back + title (ActivityDetailPage), title + close
// (CreateWorkoutPage, and ExerciseModal's own sheet header), and title only
// with neither action (HomePage's "SetUp / Workouts" band) — the absence of
// back/close doesn't make Home's header a different component, it's the
// same PageHeader with both action slots empty. No usage combines back and
// close in the same header — both are supported independently, but that
// combination doesn't exist today and isn't implied to be coming.
//
// One fixed spec across all compositions, verified against Paper (the
// "historial", "historial-workout-detail", "crear-workout", "modal" and
// "home" artboards): a 64px-tall row (`h-16` — Tailwind's own scale, no
// space-* token covers 64px, same direct-exception precedent as Button's
// own `h-12`), `p-space-7` (20px) padding on all sides, `items-center
// justify-between`.
//
// PageHeader owns its own width-capping too, not just its padding — it's
// dropped directly into a page or ModalSheet with no wrapper div at all
// (see HistoryPage/ActivityDetailPage/CreateWorkoutPage/ExerciseModal/
// HomePage). Every other section on these screens reaches the same 440px
// content column by applying its padding OUTSIDE an `mx-auto
// max-w-[440px]` box (padding on a full-bleed ancestor, no further inset
// inside the capped box) — so its content's actual edges sit flush with
// that 440px line. An earlier version of this component instead relied on
// callers wrapping it in that same `max-w-[440px]` box and then applied
// its OWN `p-space-7` inside it, insetting the header's real content a
// further 20px past every other section's edges — a visible misalignment
// on wide viewports (confirmed: "Nuevo · workout" sat noticeably right of
// "Nombre del workout" below it). `max-w-[480px]` here is exactly
// 440 + 2×20: on wide viewports this box centers at 480px and the
// header's own padding eats back precisely to the 440px line, landing
// flush with every other section; on narrow (mobile) viewports the cap
// never engages and `p-space-7` alone reproduces the same 20px inset
// every other section gets from its own outer padding. `mx-auto` centers
// it within whatever container it's placed in (a page's flow, or
// ModalSheet's own `max-w-[440px]` content, where this cap is simply
// irrelevant since the parent is already narrower).
//
// `title` always has an emphasis half and an optional secondary half — but
// how they render depends on whether an action fills one of the row's two
// ends. With `onBack` or `onClose` present, the title has only one end of
// the row to itself, so both halves join into one two-tone block ("Editar ·
// workout"). With neither present (Home), the whole row is free, and the
// two halves render as fully independent labels pushed to opposite edges
// by `justify-between` — no dot, no shared block — matching Paper exactly
// (verified against the "home"/"home-empty" artboards' greeting-text row).
//
// `titleAs` exists solely so ExerciseModal's sheet header can render the
// joined two-tone title as a Radix `Dialog.Title` (required for the
// dialog's own accessibility wiring) instead of a plain `<span>` — the
// visual/typography output is identical either way. It has no effect on
// the split (no-action) rendering, which never needs it.
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
  const hasAction = Boolean(onBack) || Boolean(onClose)

  return (
    <div className={cn("mx-auto flex h-16 w-full max-w-[480px] shrink-0 items-center justify-between p-space-7", className)}>
      {onBack && (
        <IconButton aria-label="Volver" className="text-foreground" onClick={onBack}>
          <ArrowLeft />
        </IconButton>
      )}
      {title &&
        (hasAction ? (
          <TitleComponent className="text-body leading-body">
            <span className="text-foreground">{title.emphasis}</span>
            {title.secondary && <span className="text-foreground-secondary"> · {title.secondary}</span>}
          </TitleComponent>
        ) : (
          <>
            <span className="text-body-emphasis leading-body-emphasis text-foreground">{title.emphasis}</span>
            {title.secondary && (
              <span className="text-body leading-body text-foreground-secondary">{title.secondary}</span>
            )}
          </>
        ))}
      {onClose && (
        <IconButton aria-label="Cerrar" className="text-foreground" onClick={onClose}>
          <X />
        </IconButton>
      )}
    </div>
  )
}

export { PageHeader }
