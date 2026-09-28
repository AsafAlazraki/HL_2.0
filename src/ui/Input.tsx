import { Input as BaseInput } from '@base-ui/react/input'
import type { ComponentPropsWithoutRef, Ref } from 'react'
import { Icon, type Glyph } from './Icon'
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
  /**
   * A GLYPH INSIDE THE FIELD, at its start: the magnifier on every find field (the audit found
   * "a search field with no magnifier" on six screens, audit.md row 10). With it, the field is
   * drawn in a frame that holds the glyph; without it, the field is the bare input it always
   * was, so a screen's grid that places the input itself is not handed a wrapper.
   */
  icon?: Glyph
  ref?: Ref<HTMLElement>
}

export function Input({
  value,
  defaultValue,
  onValueChange,
  mono,
  size = 'md',
  icon,
  ...rest
}: InputProps) {
  const attrs = withoutStyling(rest)
  const field = (
    <BaseInput
      {...attrs}
      className="ui-input"
      data-size={size}
      data-mono={mono ? '' : undefined}
      data-icon={icon ? '' : undefined}
      value={value}
      defaultValue={defaultValue}
      onValueChange={onValueChange ? (next) => onValueChange(next) : undefined}
    />
  )
  if (!icon) return field
  return (
    <span className="ui-input-frame" data-size={size}>
      <Icon glyph={icon} size={size === 'lg' ? 'md' : 'sm'} />
      {field}
    </span>
  )
}
