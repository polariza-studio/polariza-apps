import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Slot } from "radix-ui"

import { cn } from "@/lib/utils"

// Button v1 — Color/Typography/Spacing/Radius/Shadow Foundations v1,
// measured from Paper's 10 real button instances (see Foundations.mdx
// "Button audit"). Padding is icon-aware via the
// `data-icon="inline-start"|"inline-end"` convention on icon children (not
// a prop) — preserved from the prior implementation. `shadow-button` is
// applied only to `inverse` (Finish, its sole Paper example) — approved
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
const buttonVariants = cva(
  "group/button inline-flex h-12 shrink-0 items-center justify-center gap-space-5 rounded-full text-action leading-action whitespace-nowrap outline-none select-none transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-5 [&_svg]:[stroke-width:1.5] py-space-2 px-space-7 has-data-[icon=inline-start]:pl-space-6 has-data-[icon=inline-end]:pr-space-6",
  {
    variants: {
      variant: {
        primary: "bg-primary text-primary-foreground",
        ghost: "bg-interactive-subtle text-foreground",
        inverse: "bg-background-inverse text-foreground-inverse shadow-button",
        "ghost-inverse": "bg-interactive-subtle-inverse text-foreground-inverse",
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
