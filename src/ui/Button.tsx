import { Button as BaseButton } from '@base-ui/react/button'
import { useId, type ComponentPropsWithoutRef, type ReactNode, type Ref } from 'react'
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
   * Like `veiled` it is drawn for a dark ground, so its refused state keeps a dark fill and
   * its sentence is inked for the room rather than for paper.
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
  ref?: Ref<HTMLElement>
}

export function Button({
  children,
  intent = 'secondary',
  size = 'md',
  refusedBecause,
  ...rest
}: ButtonProps) {
  const reasonId = useId()
  const refused = Boolean(refusedBecause)
  const attrs = withoutStyling(rest)
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
        aria-describedby={describedBy(attrs['aria-describedby'], refused ? reasonId : undefined)}
      >
        {children}
      </BaseButton>
      {refusedBecause ? <Refusal id={reasonId}>{refusedBecause}</Refusal> : null}
    </span>
  )
}
