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
  intent?: 'primary' | 'secondary' | 'quiet'
  size?: 'sm' | 'md'
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
    <span className="ui-button-frame">
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
