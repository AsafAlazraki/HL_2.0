import { WarningCircleIcon } from '@phosphor-icons/react'
import { Icon } from './Icon'

/**
 * A refusal is a sentence with its reason, where it is refused. Button, Tile, Chip, the
 * segment, the toggle, MenuItem and Select items render this beneath the control and point
 * `aria-describedby` at it, so a screen reader hears the reason on the control itself.
 *
 * THE KIT GIVES IT A GLYPH (2026-09-28): the audit found it "tied to its control by adjacency
 * alone, with no rule, glyph or shared edge" (audit.md row 21). A warning circle leads the
 * sentence in the sentence's own ink — never the act's amber, which means "press this" — and
 * is hidden from a reader, who hears the words. The sentence is still the element's own text,
 * so it is found by its words and its contrast is measured on its real ground.
 */
export function Refusal({ id, children }: { id?: string; children: string }) {
  return (
    <span id={id} className="ui-refusal">
      <Icon glyph={WarningCircleIcon} weight="fill" />
      {children}
    </span>
  )
}
