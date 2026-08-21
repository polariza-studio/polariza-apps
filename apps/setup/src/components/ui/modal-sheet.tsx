import * as React from "react"
import { Dialog } from "radix-ui"

import { cn } from "@/lib/utils"

// ModalSheet v1 — the bottom-sheet shell behind ExerciseModal: slides up
// from the bottom on mobile, centers as a dialog on desktop (md:). Owns
// only the shell (surface, corner radius, position, enter/exit animation)
// — header and body content are the caller's own composition (PageHeader +
// form fields + footer actions, in ExerciseModal's case), not ModalSheet's
// concern, the same way FormField doesn't own the layout around it.
//
// Background is the white surface (--neutral-0/#FFFFFF), not the page's
// own --background (#FAFAFA/--neutral-50) — verified against Paper's
// "modal" artboards, which sit the sheet on a lighter, elevated surface
// than the page behind it; production had been using --background here,
// which is corrected as part of this extraction. --neutral-0 is a
// primitive deliberately left unmapped from Tailwind color utilities (see
// index.css's Color Foundations comment), so it's referenced directly via
// var() — the same escape hatch HomePage already uses for --lime-soft.
//
// `skipEntranceAnimation` exists solely for ExerciseModal's autofocus
// requirement: focusing the name field synchronously (inside the same
// click that opens the modal — required for mobile browsers to open the
// keyboard at all) only produces the correct native scroll-into-view nudge
// when the sheet has no entrance animation still running — see
// ExerciseModal's `focusNameOnMount` for the full explanation. Exit
// animation is unaffected either way.
function ModalSheet({
  open,
  onOpenChange,
  skipEntranceAnimation,
  children,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  skipEntranceAnimation?: boolean
  children: React.ReactNode
}) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-black/40 data-[state=open]:animate-in data-[state=open]:fade-in data-[state=closed]:animate-out data-[state=closed]:fade-out" />
        <Dialog.Content
          aria-describedby={undefined}
          className={cn(
            "fixed inset-x-0 bottom-0 z-50 isolate mx-auto flex max-h-[90vh] w-full max-w-[440px] flex-col overflow-y-auto rounded-t-2xl bg-[var(--neutral-0)] outline-none will-change-transform data-[state=closed]:animate-out data-[state=closed]:slide-out-to-bottom md:top-1/2 md:bottom-auto md:-translate-y-1/2 md:rounded-2xl",
            !skipEntranceAnimation && "data-[state=open]:animate-in data-[state=open]:slide-in-from-bottom",
          )}
        >
          {children}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}

export { ModalSheet }
