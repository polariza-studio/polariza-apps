import * as React from "react"

import { cn } from "@/lib/utils"

// TextField v1 — the borderless, display-md input used throughout SetUp
// wherever a field sits directly on the page or a modal, not inside a
// bordered container: workout name, exercise name/sets/reps/rest, and the
// active-workout set's reps/weight. One visual, no variants — `type`,
// `inputMode`, `min`, `list`, `autoFocus`, `ref`, `disabled`, etc. are
// native <input> props passed through for each call site's own needs
// (numeric entry, datalist suggestions, focus timing).
//
// className below is the exact string every one of the 7 real call sites
// used verbatim before this extraction (confirmed identical across all
// of them — see the font-light fix that made them consistent) — nothing
// here was inferred or assumed redundant.
const textFieldClassName =
  "text-display-md leading-display-md text-foreground placeholder:text-foreground/30 w-full border-none bg-transparent font-light outline-none"

function TextField({ className, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      data-slot="text-field"
      className={cn(textFieldClassName, className)}
      {...props}
    />
  )
}

export { TextField }
