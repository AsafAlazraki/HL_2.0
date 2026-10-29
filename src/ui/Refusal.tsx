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
export function Refusal({
  id,
  on,
  children,
}: {
  id?: string
  /**
   * THE GROUND IT STANDS ON, when a screen says the reason apart from its control (2026-10-29,
   * built-critique-m3-2.md, major 5: the build's finale lists the give's several causes under
   * the act, one refusal each). Beneath a control the control's own context names the ink in
   * button.css; set apart, the screen names the ground: `room` takes the room's reason ink,
   * which turns with the theme, as an act's sentence does. Paper, the default, stays paper's.
   * The refusal ruler measured the paper ink on the finale's night ground at 2.23 : 1.
   */
  on?: 'room'
  children: string
}) {
  return (
    <span id={id} className="ui-refusal" data-on={on}>
      <Icon glyph={WarningCircleIcon} weight="fill" />
      {children}
    </span>
  )
}
