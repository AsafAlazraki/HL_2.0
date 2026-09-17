import { Input as BaseInput } from '@base-ui/react/input'
import type { ComponentPropsWithoutRef, Ref } from 'react'
import { withoutStyling } from './refuse'

type Native = ComponentPropsWithoutRef<'input'>

/**
 * A text control. There is no `disabled`: a field that will not take a value says why
 * somewhere a reader can find it (a refused command, a `Field` error), and `readOnly`
 * keeps the value legible and copyable.
 */
export interface InputProps extends Omit<
  Native,
  'className' | 'style' | 'disabled' | 'color' | 'size' | 'value' | 'defaultValue'
> {
  value?: string
  defaultValue?: string
  onValueChange?: (value: string) => void
  /** Tabular figures in the monospace face, for a part number or a figure. */
  mono?: boolean
  /**
   * `lg` is a field that is the whole point of the screen it is on — entry's one name
   * field, drawn as the brightest object in the window at 64px. It is not a decoration:
   * a control that is the only thing a screen asks for is the size of the ask.
   *
   * (Not the native `size` attribute, which counts characters and is omitted above.)
   */
  size?: 'md' | 'lg'
  ref?: Ref<HTMLElement>
}

export function Input({
  value,
  defaultValue,
  onValueChange,
  mono,
  size = 'md',
  ...rest
}: InputProps) {
  const attrs = withoutStyling(rest)
  return (
    <BaseInput
      {...attrs}
      className="ui-input"
      data-size={size}
      data-mono={mono ? '' : undefined}
      value={value}
      defaultValue={defaultValue}
      onValueChange={onValueChange ? (next) => onValueChange(next) : undefined}
    />
  )
}
