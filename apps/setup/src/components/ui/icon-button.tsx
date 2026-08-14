import * as React from "react"
import { Slot } from "radix-ui"

import { cn } from "@/lib/utils"

// IconButton v1 — approved 2026-08-14. Separate component from Button
// (no `icon-only` Button variant exists or should exist). One visual
// variant only — no default/inverse/size/filled variants. Icon color comes
// entirely from `currentColor`, inherited from whatever ancestor sets
// `text-foreground` (light surfaces) or `text-foreground-inverse` (inverse
// surfaces) — the same component works unmodified in both contexts, the
// caller never passes a color/variant prop.
//
// Geometry measured directly from Paper's "Back" button (the only fully
// designed instance — see Foundations.mdx "IconButton"): fixed 32×32px
// box (`size-8`), 6px padding (`p-space-2` — Paper's 6px already has a
// Foundations token, no arbitrary value needed), `rounded-full`, no
// background/border/shadow — Paper shows a bare icon, nothing behind it.
//
// Icon convention matches Button v1 exactly: `size-5` (20px) default,
// `stroke-width:1.5`, `stroke="currentColor" fill="none"` — no filled-icon
// exception here. Button's Play/Pause/Finish solid-icon treatment does NOT
// carry over to IconButton (explicit instruction).
//
// Settings is out of scope for v1 — Paper only has a hidden, empty shell
// with no designed icon (0×0 inner svg, no fill/stroke attributes at all).
// Back is the only implemented use case.
//
// States: Default only, approved 2026-08-14. No hover/pressed/disabled
// visual treatment has been invented — `disabled` only gets
// `pointer-events-none` (behavior, not a look); it renders visually
// identical to Default. Hover/Pressed/Focus-appearance/Disabled visuals
// are a separate proposal, pending visual approval in Storybook, same
// process Button went through. Focus ring uses `ring-current` rather than
// a fixed color, for the same both-contexts-for-free reason as the icon —
// and has no ring-offset: IconButton has no fill to separate the ring
// from, so an offset would just paint a fixed-color halo that mismatches
// whichever backdrop (light or inverse) it sits on.
const iconButtonClassName =
  "inline-flex size-8 shrink-0 items-center justify-center rounded-full p-space-2 outline-none select-none disabled:pointer-events-none focus-visible:ring-2 focus-visible:ring-current [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-5 [&_svg]:[stroke-width:1.5]"

function IconButton({
  className,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> & {
  asChild?: boolean
  "aria-label": string
}) {
  const Comp = asChild ? Slot.Root : "button"

  return (
    <Comp
      data-slot="icon-button"
      className={cn(iconButtonClassName, className)}
      {...props}
    />
  )
}

export { IconButton }
