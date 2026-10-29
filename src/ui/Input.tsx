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
  /**
   * `word` IS A PHRASE INSIDE A SENTENCE (Rules, 2026-10-22): a rule's "because", typed where
   * the sentence says it, in the sentence's own size and face on a dotted underline — the
   * same mark as a select's `look="word"`, so the words a person can change read alike.
   *
   * `figure` IS A NUMBER INSIDE A SENTENCE (Rules, 2026-10-22): "a boat over [6] m". The same
   * mark as `word`, in the file's blue like a chosen word, but inline and only as wide as its
   * digits, asking for a decimal keyboard on a phone. Enter leaves it, as a sentence has no
   * second line. Added to the kit rather than drawn by the screen, because a figure typed into a
   * sentence is an input.
   */
  /** `lines` (Milestone 4, Settings): a field for words that keep their own line breaks — an
   *  address, a dealership's terms — drawn as the field is and growing with what is typed. Added
   *  to the kit rather than drawn by a screen (CLAUDE.md: extend a primitive, and say so). */
  look?: 'field' | 'word' | 'figure' | 'lines'
  ref?: Ref<HTMLElement>
}

export function Input({
  value,
  defaultValue,
  onValueChange,
  mono,
  size = 'md',
  icon,
  look = 'field',
  ref,
  ...rest
}: InputProps) {
  const attrs = withoutStyling(rest)
  /* A PHRASE WRAPS WITH ITS SENTENCE: a one-line field would cut a long because off at the
     plate's edge (measured on /rules at 1440: "…steered from the" and the rest under the clip),
     so the word look is a textarea that grows with its words and refuses a line break — a
     because is one clause, and Enter is not part of it. */
  if (look === 'figure') {
    return (
      <input
        aria-label={attrs['aria-label']}
        aria-describedby={attrs['aria-describedby']}
        id={attrs.id}
        name={attrs.name}
        placeholder={attrs.placeholder}
        readOnly={attrs.readOnly}
        onBlur={attrs.onBlur}
        onFocus={attrs.onFocus}
        className="ui-input"
        data-look="figure"
        type="text"
        inputMode="decimal"
        autoComplete="off"
        enterKeyHint="done"
        value={value}
        defaultValue={defaultValue}
        onKeyDown={(e) => {
          if (e.key === 'Enter') e.currentTarget.blur()
        }}
        onChange={onValueChange ? (e) => onValueChange(e.target.value) : undefined}
      />
    )
  }
  if (look === 'word') {
    return (
      <textarea
        aria-label={attrs['aria-label']}
        aria-describedby={attrs['aria-describedby']}
        id={attrs.id}
        name={attrs.name}
        placeholder={attrs.placeholder}
        readOnly={attrs.readOnly}
        onBlur={attrs.onBlur as never}
        onFocus={attrs.onFocus as never}
        className="ui-input"
        data-look="word"
        rows={1}
        value={value}
        defaultValue={defaultValue}
        onKeyDown={(e) => {
          if (e.key === 'Enter') e.preventDefault()
        }}
        onChange={
          onValueChange ? (e) => onValueChange(e.target.value.replace(/\s*\n\s*/g, ' ')) : undefined
        }
      />
    )
  }
  if (look === 'lines') {
    return (
      <textarea
        aria-label={attrs['aria-label']}
        aria-describedby={attrs['aria-describedby']}
        aria-invalid={attrs['aria-invalid']}
        id={attrs.id}
        name={attrs.name}
        placeholder={attrs.placeholder}
        readOnly={attrs.readOnly}
        autoComplete={attrs.autoComplete}
        onBlur={attrs.onBlur as never}
        onFocus={attrs.onFocus as never}
        onKeyDown={attrs.onKeyDown as never}
        ref={ref as never}
        className="ui-input"
        data-size={size}
        data-look="lines"
        rows={3}
        value={value}
        defaultValue={defaultValue}
        onChange={onValueChange ? (e) => onValueChange(e.target.value) : undefined}
      />
    )
  }
  const field = (
    <BaseInput
      {...attrs}
      ref={ref}
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
