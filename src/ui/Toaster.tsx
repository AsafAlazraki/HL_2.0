import { ArrowClockwiseIcon, ArrowCounterClockwiseIcon } from '@phosphor-icons/react'
import { useEffect, useState } from 'react'
import { Toaster as Sonner, toast } from 'sonner'
import type { TableKind } from '@/domain/model'
import { Icon } from './Icon'
import { KindMark } from './KindMark'

/* ============================================================
   THE TOASTER — Sonner, mounted once above the routes
   (src/routes/__root.tsx), and never per screen: a second Toaster
   duplicates every toast (the ask-sonner skill's first rule).

   THE TOAST IS OURS, HEADLESS (`toast.custom`), the top rung of the
   skill's styling ladder: Sonner keeps what it is good at — the
   stack, the swipe, the pause while the window is hidden — and the
   card is the kit's. Board C's undo toast: a navy capsule, the kind's
   glyph in its own ink at its start, the sentence, and a white Undo
   with its glyph at its end. It is the night wherever it stands
   (`data-ground='night'`), so a motor's glyph on it is the night's
   carmine, drawn for the navy it is on.

   It arrives from where it will leave by (Sonner's own spatial
   rule), and while a caret is in a field it arrives without moving
   (toaster.css reads `data-still`, which src/ui/MotionRoot.tsx sets).

   A KEYBOARD REACHES IT TWO WAYS, both Sonner's own: Alt T takes the
   caret to the stack, which holds every toast's clock while it is
   there and hands the caret back to where it was taken from when it
   leaves; and each toast is a Tab stop, wearing the kit's ring.
   ============================================================ */

/* WHERE THE BAND BESIDE THE PILL HOLDS A TOAST. The pill stands centred at the top above 600px
   (src/screens/shell), about 700px wide, so the band to its right is (width − 700) ÷ 2: 370px at
   1440 and 610px at 1920, but 290px at 1280 and 250px at 1200, where the card would wrap to three
   lines. The query is a media query because the stylesheet answers the same width
   (toaster.css). */
const BESIDE_THE_PILL = '(min-width: 1440px)'

function besideThePill(): boolean {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return false
  return window.matchMedia(BESIDE_THE_PILL).matches
}

/**
 * THE TOAST STANDS WHERE NOTHING ELSE DOES, wherever there is such a place (the second
 * components critique's minor 11). At 1440 the build's undo toast, in the corner, covered
 * Dealer fit's "Not priced on this quote" and its chevron at the rail's foot for its five
 * seconds. Where the band beside the pill is wide enough it stands there instead, top right, level
 * with the pill: an empty band over the masthead's total, which is the figure the step just
 * changed. Narrower, it keeps the corner, and in a hand it stands above the tab bar.
 */
export function Toaster() {
  const [beside, setBeside] = useState(besideThePill)
  useEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return
    const query = window.matchMedia(BESIDE_THE_PILL)
    const changed = (): void => setBeside(query.matches)
    query.addEventListener('change', changed)
    return () => query.removeEventListener('change', changed)
  }, [])
  return (
    <Sonner
      position={beside ? 'top-right' : 'bottom-right'}
      visibleToasts={3}
      gap={10}
      offset={beside ? { top: 8, right: 16 } : 16}
      /* ON A PHONE THE SHELL'S PILL IS THE TAB BAR AT THE FOOT, and a toast stands above it
         rather than on it: the pill's own height and safe area are `--shell-foot`. */
      mobileOffset={{ bottom: 'calc(var(--shell-foot) + 12px)', left: '12px', right: '12px' }}
      toastOptions={{ unstyled: true, classNames: { toast: 'ui-toast-slot' } }}
    />
  )
}

/** The two ways back a toast can offer: from a step, and from the step that took it back. */
export type WayBack = 'Undo' | 'Put it back'

interface Said {
  text: string
  kind?: TableKind
  action?: { label: WayBack; onPress: () => void }
}

/** The card itself — exported so the kit's specimen (/kit) can draw one at rest. */
export function Toast({ text, kind, action, onDismiss }: Said & { onDismiss?: () => void }) {
  return (
    <div className="ui-toast" data-ground="night">
      {kind ? <KindMark kind={kind} size="sm" /> : null}
      <span className="ui-toast-title">{text}</span>
      {action ? (
        <button
          type="button"
          className="ui-toast-action"
          onClick={() => {
            action.onPress()
            onDismiss?.()
          }}
        >
          <Icon
            glyph={action.label === 'Put it back' ? ArrowClockwiseIcon : ArrowCounterClockwiseIcon}
          />
          {action.label}
        </button>
      ) : null}
    </div>
  )
}

/** Where a toast stands and what it is about. */
export interface ToastOptions {
  /** the kind of thing it happened to, drawn as its glyph at the card's start */
  kind?: TableKind
  /**
   * A TOAST THAT IS ONE PLACE'S LATEST WORD. Raised again under the same id, the card
   * changes where it stands, its clock starting again, instead of a second card stacking
   * under it — so a screen that says its last step is never showing two, and never offers a
   * way back from a step that is no longer the last.
   */
  id?: string
  /** a handle a test finds the card by */
  testId?: string
}

function show(said: Said, duration: number, options?: ToastOptions): string | number {
  return toast.custom((id) => <Toast {...said} onDismiss={() => toast.dismiss(id)} />, {
    duration,
    ...(options?.id === undefined ? {} : { id: options.id }),
    ...(options?.testId === undefined ? {} : { testId: options.testId }),
  })
}

/** Say something happened. A plain sentence, with the kind of thing it happened to. */
export function say(text: string, options?: ToastOptions): string | number {
  return show({ text, kind: options?.kind }, 5000, options)
}

/**
 * Say something happened and offer to take it back. `onUndo` is pinned to this one toast:
 * the quotes store passes the inverse of exactly the command it just applied, never
 * "undo the latest thing", which may by then be a different thing. `way` is the word on the
 * press: "Put it back" when the step being said was itself a way back.
 */
export function undo(
  text: string,
  onUndo: () => void,
  options?: ToastOptions & { way?: WayBack },
): string | number {
  return show(
    { text, kind: options?.kind, action: { label: options?.way ?? 'Undo', onPress: onUndo } },
    8000,
    options,
  )
}

/** Take a toast away before its clock does: a place that no longer holds what it said. */
export function unsay(id: string): void {
  toast.dismiss(id)
}
