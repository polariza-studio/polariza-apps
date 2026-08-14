import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Slot } from "radix-ui"

import { cn } from "@/lib/utils"

// Button v1 — Color/Typography/Spacing/Radius/Shadow Foundations v1,
// measured from Paper's 10 real button instances (see Foundations.mdx
// "Button audit"). Padding is icon-aware via the
// `data-icon="inline-start"|"inline-end"` convention on icon children (not
// a prop) — preserved from the prior implementation. `shadow-button` is
// applied only to `secondary` (Finish, its sole Paper example) — approved
// 2026-08-14, see Foundations.mdx "Shadows". Height is a fixed 48px
// (`h-12`, Tailwind's own scale — no space-* token covers 48px, approved
// as a direct exception 2026-08-14), matching Paper exactly rather than
// the smaller content-driven height padding+line-height alone would give;
// content is centered in the extra space via `items-center`.
//
// `leading-action` (not just `text-action`) — required, see the comment on
// --leading-action in index.css: Preflight's `font: inherit` on `button`
// otherwise wins the line-height cascade over `text-action`'s built-in one.
// `[stroke-width:1.5]` on descendant icons matches Paper's measured value
// (Lucide's own default is 2, confirmed wrong by the Button audit).
//
// Variants — corrected naming 2026-08-14. `secondary` (was `inverse`) is
// NOT a dark-surface-context button: it's an important, lower-emphasis-
// than-primary action (Finish) that sits directly on a light screen with
// its own moss fill/white text — same primitives as
// --background-inverse/--foreground-inverse, distinct semantic role (see
// index.css). `ghost-inverse` is the only variant that actually lives on a
// dark/inverse surface (Discard Activity).
//
// Interaction states — Foundations v1, approved 2026-08-14 (visually
// reviewed and approved in Storybook, see Foundations.mdx "Buttons").
// Text/icon color (currentColor) never changes across default/hover/
// pressed — only background does, so contrast never degrades on
// interaction. `ghost`'s hover/pressed reuse existing approved color
// tokens (border-subtle/border — the same moss-opacity ladder its resting
// state already sits on). `primary`/`secondary`/`ghost-inverse`'s hover/
// pressed use the Button-scoped `--color-button-*` tokens defined in
// index.css (canonical, not general-purpose — Button-only). Focus ring
// color is conditional per variant (not a new token):
// `primary`/`ghost`/`secondary` ring in `foreground` (moss) — all three
// render directly on the light page, so the ring/offset need a dark ring
// to read. `ghost-inverse` rings in `foreground-inverse` (white) — the
// one variant that actually sits on a dark surface. Disabled never dims
// the whole button (no opacity) — `primary` and `secondary` both flatten
// to `ghost`'s resting visual weight (both are light-surface fills; unlike
// the old `inverse` naming, `secondary` has no dark-surface counterpart to
// flatten to), text moves to `foreground-secondary`, and `secondary` drops
// its shadow (nothing lifts off the page while inert). `ghost-inverse`
// flattens its own text to `foreground-inverse-secondary`, background
// unchanged.
const buttonVariants = cva(
  "group/button inline-flex h-12 shrink-0 items-center justify-center gap-space-5 rounded-full text-action leading-action whitespace-nowrap outline-none select-none transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-5 [&_svg]:[stroke-width:1.5] py-space-2 px-space-7 has-data-[icon=inline-start]:pl-space-6 has-data-[icon=inline-end]:pr-space-6",
  {
    variants: {
      variant: {
        primary:
          "bg-primary text-primary-foreground hover:bg-button-primary-hover active:bg-button-primary-pressed focus-visible:ring-foreground disabled:bg-interactive-subtle disabled:text-foreground-secondary",
        ghost:
          "bg-interactive-subtle text-foreground hover:bg-border-subtle active:bg-border focus-visible:ring-foreground disabled:bg-interactive-subtle disabled:text-foreground-secondary",
        secondary:
          "bg-secondary text-secondary-foreground shadow-button hover:bg-button-secondary-hover active:bg-button-secondary-pressed focus-visible:ring-foreground disabled:bg-interactive-subtle disabled:text-foreground-secondary disabled:shadow-none",
        "ghost-inverse":
          "bg-interactive-subtle-inverse text-foreground-inverse hover:bg-button-ghost-inverse-hover active:bg-button-ghost-inverse-pressed focus-visible:ring-foreground-inverse disabled:text-foreground-inverse-secondary",
      },
    },
    defaultVariants: {
      variant: "primary",
    },
  }
)

function Button({
  className,
  variant,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot.Root : "button"

  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      className={cn(buttonVariants({ variant, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
