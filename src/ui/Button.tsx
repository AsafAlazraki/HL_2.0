import { Button as BaseButton } from '@base-ui/react/button'
import {
  useId,
  type ComponentPropsWithoutRef,
  type MouseEvent,
  type MouseEventHandler,
  type ReactNode,
  type Ref,
} from 'react'
import { Refusal } from './Refusal'
import { describedBy, withoutStyling } from './refuse'

type Native = ComponentPropsWithoutRef<'button'>

/**
 * There is no `disabled` prop. A disabled button cannot be focused, hovered or read by a
 * screen reader, so a refusal would be silent. `refusedBecause` renders the sentence beneath
 * the button, marks it `aria-disabled`, keeps it focusable and swallows the press.
 */
export interface ButtonProps extends Omit<
  Native,
  'className' | 'style' | 'disabled' | 'color' | 'children'
> {
  children: ReactNode
  /**
   * `veiled` is a control STANDING ON A PHOTOGRAPH: the dark room at 86% behind a white
   * edge, because a border drawn for paper disappears on lit water. Added for the entry
   * screen, whose second door is exactly that (docs/directions/entry/b-veil-and-card.html).
   */
  /**
   * `act` is THE ONE THING YOU PRESS ON A SCREEN, drawn in the amber `--color-act` that home
   * B spends exactly once (docs/directions/home/b-one-photograph.html). It is not a second
   * primary: `primary` is the blue that means the file, and a screen with an act has one.
   * Like `veiled` it is drawn for a dark ground, so its sentence is inked for the room rather
   * than for paper — and unlike every other intent it KEEPS its colour when refused, two steps
   * down the same ramp, because a screen whose only act is waiting on an unbuilt screen would
   * otherwise have no colour on it at all.
   *
   * IT FILLS THE MEASURE IT IS GIVEN. The board draws it 52px tall, 176px wide on a desk and
   * full width in a hand, so the width is the screen's decision and it is made by sizing the
   * container this sits in — a screen may not reach into `.ui-button`.
   */
  intent?: 'primary' | 'secondary' | 'quiet' | 'veiled' | 'act'
  /**
   * `door` is a full-width bar carrying a title, a sentence and an arrow, rather than a
   * label on one line — the shape entry B lays low across its water. The children are the
   * screen's own, as with any button; the size only says how much room the bar takes and
   * that its content is laid out end to end.
   */
  size?: 'sm' | 'md' | 'door'
  /** Why this button will not act right now, as a sentence. */
  refusedBecause?: string
  /**
   * THE SAME REFUSAL, WHEN THE SENTENCE IS ALREADY ON THE SCREEN ONCE
   * — the id of the element the screen printed it in. `Tile` carries
   * the same prop and its comment holds the measurement that asked
   * for it: one reason shared by a whole list belongs above the list,
   * not copied between its rows. The button is still dimmed, still
   * focusable, still swallows the press, and `aria-describedby` still
   * points a reader at the reason. `refusedBecause` wins if both are
   * given.
   */
  refusedBy?: string
  /**
   * THE ADDRESS THIS PRESS LANDS ON, when it has one — and with it, this
   * control becomes a real `<a href>` rather than a `<button>`.
   *
   * Added 2026-09-18, against a measured finding: grepped across
   * `src/screens`, `src/ui` and `src/routes`, NOT ONE `<a>` existed in
   * the whole app. Every move between screens was a button calling the
   * router, so nothing could be middle-clicked, copied as a link, or
   * opened in a new tab — in an app where every position is already a
   * real address and a search param, and where `docs/SCREENS.md` says so
   * about each screen in turn.
   *
   * The primitive is extended rather than worked around because a link
   * and a button are the same object here: the same fill, the same door
   * shape, the same refusal beneath. What differs is one fact — this one
   * has an address — and a screen that wanted the browser's own
   * behaviours would otherwise have had to draw its own anchor and style
   * it, which is the className the primitives exist to refuse.
   *
   * WHAT A PLAIN CLICK DOES. If an `onClick` is given, an unmodified
   * left click is prevented and the handler runs, so the router still
   * navigates with no page load and a screen keeps its own seam. A
   * middle click, a ctrl/cmd/shift/alt click and a right-click menu are
   * left entirely alone — those are the browser's, and they are the
   * whole reason for the element. With no `onClick`, the address is
   * simply followed.
   *
   * A REFUSED CONTROL IS NEVER A LINK. A refusal that could be opened in
   * a new tab would be an address a person is invited to visit and then
   * told they may not; with `refusedBecause` or `refusedBy` set, this
   * renders the refused button it already was, address and all dropped.
   */
  href?: string
  ref?: Ref<HTMLElement>
}

export function Button({
  children,
  intent = 'secondary',
  size = 'md',
  href,
  refusedBecause,
  refusedBy,
  ...rest
}: ButtonProps) {
  const reasonId = useId()
  const refused = Boolean(refusedBecause) || Boolean(refusedBy)
  const saidAt = refusedBecause ? reasonId : refusedBy
  const attrs = withoutStyling(rest)

  if (href !== undefined && !refused) {
    const { onClick, ...link } = attrs
    return (
      /* The same frame, the same two data attributes and the same
         stylesheet: an address changes the ELEMENT and nothing a reader
         can see. `.ui-button` is styled on the class, not on `button`,
         which is what makes that true without a second rule. */
      <span className="ui-button-frame" data-intent={intent} data-size={size}>
        <a
          /* The cast is the one place a button's own attributes and an
             anchor's meet. Everything a screen actually hands this — the
             aria-*, the data-* and the handler — is common to both; the
             half-dozen that are not (`type`, `form`, `value`) are
             button-only and an anchor drops them. */
          {...(link as ComponentPropsWithoutRef<'a'>)}
          className="ui-button"
          data-intent={intent}
          data-size={size}
          href={href}
          aria-describedby={attrs['aria-describedby']}
          onClick={followed(onClick)}
        >
          {children}
        </a>
      </span>
    )
  }

  return (
    /* The frame carries the same two data attributes as the button so that the refusal
       beneath a door is as wide as the door and is inked for the ground the door stands on.
       It is the only way the sentence can follow the control without a screen styling it. */
    <span className="ui-button-frame" data-intent={intent} data-size={size}>
      <BaseButton
        {...attrs}
        className="ui-button"
        data-intent={intent}
        data-size={size}
        disabled={refused}
        focusableWhenDisabled
        aria-describedby={describedBy(attrs['aria-describedby'], refused ? saidAt : undefined)}
      >
        {children}
      </BaseButton>
      {refusedBecause ? <Refusal id={reasonId}>{refusedBecause}</Refusal> : null}
    </span>
  )
}

/**
 * A CLICK ON A LINK THAT THE APP HANDLES, AND EVERY OTHER CLICK LEFT TO THE BROWSER.
 *
 * The one rule: a plain left click with a handler behind it is the app's, and is prevented
 * so the router can navigate without a page load; anything else belongs to the person. A
 * middle click opens a tab, ctrl/cmd opens a tab, shift opens a window, alt downloads, and
 * a right-click gets a menu with "Copy link address" on it — which is the entire reason
 * `href` exists on this primitive. Preventing those would give an anchor the behaviour of
 * the button it replaced and change nothing but the tag name.
 *
 * `defaultPrevented` is honoured: a screen whose own handler already decided is not
 * overruled here.
 */
function followed(
  onClick: MouseEventHandler<HTMLButtonElement> | undefined,
): MouseEventHandler<HTMLAnchorElement> | undefined {
  if (!onClick) return undefined
  return (event: MouseEvent<HTMLAnchorElement>) => {
    if (event.defaultPrevented) return
    if (event.button !== 0) return
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return
    event.preventDefault()
    onClick(event as unknown as MouseEvent<HTMLButtonElement>)
  }
}
