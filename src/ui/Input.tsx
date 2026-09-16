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
  ref?: Ref<HTMLElement>
}

export function Input({ value, defaultValue, onValueChange, mono, ...rest }: InputProps) {
  const attrs = withoutStyling(rest)
  return (
    <BaseInput
      {...attrs}
      className="ui-input"
      data-mono={mono ? '' : undefined}
      value={value}
      defaultValue={defaultValue}
      onValueChange={onValueChange ? (next) => onValueChange(next) : undefined}
    />
  )
}
