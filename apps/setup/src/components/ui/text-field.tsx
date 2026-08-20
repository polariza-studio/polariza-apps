import * as React from "react"

import { cn } from "@/lib/utils"

// TextField v1 — the borderless, display-md input used throughout SetUp
// wherever a field sits directly on the page or a modal, not inside a
// bordered container: workout name, exercise name/sets/reps/rest, and the
// active-workout set's reps/weight. One visual, no variants — `type`,
// `inputMode`, `min`, `list`, `autoFocus`, `ref`, etc. are just native
// <input> props passed through for each call site's own needs (numeric
// entry, datalist suggestions, focus timing).
//
// text-display-md already carries font-weight 300 (index.css) — call
// sites don't need an explicit font-light; some previously repeated it
// redundantly, others omitted it, and both rendered identically either
// way since the weight comes from text-display-md itself.
const textFieldClassName =
  "w-full border-none bg-transparent text-display-md leading-display-md text-foreground placeholder:text-foreground/30 outline-none"

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
