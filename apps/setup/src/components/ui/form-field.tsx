import * as React from "react"

import { cn } from "@/lib/utils"

// FormField v1 — the label+field composition used throughout ExerciseModal
// (Nombre/Sets/Reps/Descanso, 4 identical call sites before this
// extraction). Owns only the field's own anatomy: label, its relationship
// to the field (gap), and the label's typography/color
// (text-caption/leading-caption/text-foreground-secondary — the pattern
// actually used in production; TextField's own former "WithLabel" story
// used text-label instead, which never matched any real call site and has
// been removed, not carried over here).
//
// Deliberately does NOT own outer/page layout spacing (ExerciseModal's
// px-space-7/pt-space-7/pb-space-4 around each field) — that spacing
// belongs to whatever container lays out a list of FormFields, not to the
// field itself, so a FormField dropped into a different layout doesn't
// drag page-specific padding along with it.
function FormField({
  label,
  htmlFor,
  children,
  className,
}: {
  label: string
  htmlFor: string
  children: React.ReactNode
  className?: string
}) {
  return (
    <div className={cn("flex flex-col gap-space-3", className)}>
      <label htmlFor={htmlFor} className="text-caption leading-caption text-foreground-secondary">
        {label}
      </label>
      {children}
    </div>
  )
}

export { FormField }
