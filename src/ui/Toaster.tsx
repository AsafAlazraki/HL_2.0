import { Toaster as Sonner, toast } from 'sonner'

/**
 * Mounted once, above the routes. Sonner keeps its own stacking, swipe and pause-on-hide;
 * the colours come from the tokens (see toaster.css) and the action button is ours.
 */
export function Toaster() {
  return (
    <Sonner
      position="bottom-right"
      duration={5000}
      visibleToasts={3}
      gap={12}
      offset={16}
      toastOptions={{
        classNames: {
          toast: 'ui-toast',
          title: 'ui-toast-title',
          description: 'ui-toast-description',
          actionButton: 'ui-toast-action',
        },
      }}
    />
  )
}

/** Say something happened. A plain sentence, no icon, no colour. */
export function say(text: string): string | number {
  return toast(text)
}

/**
 * Say something happened and offer to take it back. `onUndo` is pinned to this one toast:
 * the quotes store passes the inverse of exactly the command it just applied, never
 * "undo the latest thing", which may by then be a different thing.
 */
export function undo(text: string, onUndo: () => void): string | number {
  return toast(text, {
    duration: 8000,
    action: { label: 'Undo', onClick: () => onUndo() },
  })
}
