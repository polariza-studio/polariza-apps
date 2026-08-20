import * as React from "react"

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
//
// Not cn() (tailwind-merge): twMerge doesn't know this project's custom
// Foundations type-scale names (text-display-md, text-action, etc. —
// none of them a stock Tailwind size like text-lg), so it can't tell
// `text-display-md` apart from a text-*color*  utility and treats it as
// conflicting with `text-foreground` right beside it — silently dropping
// text-display-md and shrinking every TextField to the browser's default
// 16px. Plain concatenation sidesteps that misclassification entirely;
// none of the 7 call sites ever pass a conflicting className anyway, so
// there's no real merge/conflict case to handle here.
const textFieldClassName =
  "text-display-md leading-display-md text-foreground placeholder:text-foreground/30 w-full border-none bg-transparent font-light outline-none"

function TextField({ className, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      data-slot="text-field"
      className={className ? `${textFieldClassName} ${className}` : textFieldClassName}
      {...props}
    />
  )
}

export { TextField }
