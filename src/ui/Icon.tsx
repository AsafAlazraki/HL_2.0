import type { Icon as PhosphorIcon, IconWeight } from '@phosphor-icons/react'

/**
 * A GLYPH, AND ONLY EVER BESIDE ITS WORD.
 *
 * The audit counted 603 controls and not one SVG icon (docs/research/refs/components/
 * audit.md): every arrow, magnifier and dot was a character of whatever face the operating
 * system chose. The kit puts a Phosphor glyph where it makes a thing read faster — a door, an
 * act, a kind, a state — and never INSTEAD of the word, so the glyph is hidden from a reader
 * unless it is the only name a control has, in which case `label` names it.
 *
 * `Glyph` is Phosphor's own component type: a screen hands `BoatIcon`, never a string, so a
 * glyph that does not exist is a compile error and not a blank square.
 *
 * The size is a token (`--icon-sm` 16px, `--icon-md` 18px, `--icon-lg` 22px) set in
 * icon.css, never Phosphor's `size` attribute, so a dealership's larger type could move every
 * glyph at once. The weight is `bold` by default — board C's weight, the one that stands beside
 * a 600-weight word without looking thin — and `fill` for a kind's own glyph in its square.
 * It is drawn in `currentColor`, so its contrast is the ink's own.
 */
export type Glyph = PhosphorIcon

export interface IconProps {
  glyph: Glyph
  size?: 'sm' | 'md' | 'lg'
  weight?: IconWeight
  /** Only when the glyph is the control's only name; otherwise it is hidden from a reader. */
  label?: string
}

export function Icon({ glyph: G, size = 'sm', weight = 'bold', label }: IconProps) {
  return (
    <G
      className="ui-icon"
      data-size={size}
      weight={weight}
      focusable="false"
      aria-hidden={label ? undefined : true}
      aria-label={label}
      role={label ? 'img' : undefined}
    />
  )
}
