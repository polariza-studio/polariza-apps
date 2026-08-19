import { Dialog } from 'radix-ui';
import { Pencil, Share, Trash, X } from 'lucide-react';

import { IconButton } from '@/components/ui/icon-button';
import type { Workout } from '@/domain/workout';

// Paper: "edit-more-modal". Bottom-sheet reached via a workout card's
// swipe-left "..." action (HomePage) — secondary actions that don't need
// their own quick-swipe slot: Edit, Share (same action as the card's own
// Share quick-action), Delete.
export function WorkoutMoreModal({
  open,
  onOpenChange,
  workout,
  onEdit,
  onShare,
  onDelete,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  workout: Workout | null;
  onEdit: (workout: Workout) => void;
  onShare: (workout: Workout) => void;
  onDelete: (workout: Workout) => void;
}) {
  if (!workout) return null;

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-black/40 data-[state=open]:animate-in data-[state=open]:fade-in data-[state=closed]:animate-out data-[state=closed]:fade-out" />
        <Dialog.Content
          aria-describedby={undefined}
          // isolate + will-change-transform: see the same comment on
          // ExerciseModal's Dialog.Content — Dialog.Portal renders this
          // outside .app-frame-content, so it needs its own compositing
          // layer for the WebKit icon-doubling workaround to apply here.
          className="fixed inset-x-0 bottom-0 z-50 isolate mx-auto flex max-h-[90vh] w-full max-w-[440px] will-change-transform flex-col overflow-y-auto rounded-t-2xl bg-background outline-none data-[state=open]:animate-in data-[state=open]:slide-in-from-bottom data-[state=closed]:animate-out data-[state=closed]:slide-out-to-bottom md:top-1/2 md:bottom-auto md:-translate-y-1/2 md:rounded-2xl"
        >
          <div className="flex items-center justify-between p-space-7">
            <Dialog.Title className="text-body leading-body line-clamp-1">
              <span className="text-foreground">Workout</span>
              <span className="text-foreground-secondary"> · {workout.name}</span>
            </Dialog.Title>
            <Dialog.Close asChild>
              <IconButton aria-label="Cerrar" className="text-foreground shrink-0">
                <X />
              </IconButton>
            </Dialog.Close>
          </div>

          <div className="px-space-7">
            <div className="border-border-subtle flex w-full flex-col overflow-hidden rounded-2xl border">
              <button
                type="button"
                onClick={() => onEdit(workout)}
                className="border-border-subtle bg-interactive-subtle flex h-12 w-full items-center gap-space-5 border-b px-space-6"
              >
                <Pencil className="text-foreground size-5 [stroke-width:1.5]" />
                <span className="text-action leading-action text-foreground">Editar</span>
              </button>
              <button
                type="button"
                onClick={() => onShare(workout)}
                className="bg-interactive-subtle flex h-12 w-full items-center gap-space-5 px-space-6"
              >
                <Share className="text-foreground size-5 [stroke-width:1.5]" />
                <span className="text-action leading-action text-foreground">Compartir</span>
              </button>
            </div>
          </div>

          <div className="flex flex-col items-center gap-space-6 px-space-7 pt-space-7 pb-[32px]">
            <button
              type="button"
              onClick={() => onDelete(workout)}
              className="bg-interactive-subtle flex h-12 w-full items-center justify-center gap-space-5 rounded-full"
            >
              <Trash className="text-destructive size-5 [stroke-width:1.5]" />
              <span className="text-action leading-action text-destructive">Eliminar workout</span>
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
