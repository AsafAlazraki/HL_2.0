import { Button as BaseButton } from '@base-ui/react/button'
import { useId } from 'react'
import { Icon, type Glyph } from './Icon'
import { Refusal } from './Refusal'
import { describedBy } from './refuse'

/**
 * A CHIP: a small word you press to narrow or to choose — a series among a maker's boats, a
 * range of days, a sort. Board C's `.chip`: a white capsule on a hairline with its glyph and
 * its count, and FILLED WITH THE ACCENT WHEN CHOSEN, because in the kit the accent means
 * "chosen" and nothing else (tokens.css, THE KIT).
 *
 * The audit found chips drawn four ways on four screens — the picker's material chip, History's
 * range buttons, the book's sort, the sheet's door segments (audit.md rows 9, 61, 69, 78) — so
 * a screen that needs one takes this one.
 *
 * `selected` true or false makes it a toggle (`aria-pressed`); left out, it is a plain button.
 * The count is a figure that is not a price, set in tabular figures after the word; it is part
 * of the chip's name, so "Assault Pros 6" is what a reader hears. Like every control here it
 * is never disabled: `refusedBecause` keeps it focusable and says why beneath it.
 */
export interface ChipProps {
  children: string
  icon?: Glyph
  count?: number
  selected?: boolean
  onSelect?: () => void
  refusedBecause?: string
  /** The id of a sentence already on the screen that refuses this chip and its neighbours. */
  refusedBy?: string
}

const COUNT = new Intl.NumberFormat('en-AU')

export function Chip({
  children,
  icon,
  count,
  selected,
  onSelect,
  refusedBecause,
  refusedBy,
}: ChipProps) {
  const reasonId = useId()
  const refused = Boolean(refusedBecause) || Boolean(refusedBy)
  const saidAt = refusedBecause ? reasonId : refusedBy
  return (
    <span className="ui-chip-frame">
      <BaseButton
        className="ui-chip"
        aria-pressed={selected}
        disabled={refused}
        focusableWhenDisabled
        onClick={onSelect}
        aria-describedby={describedBy(undefined, refused ? saidAt : undefined)}
        data-ground="plate"
      >
        {icon ? <Icon glyph={icon} /> : null}
        <span className="ui-chip-word">{children}</span>
        {count === undefined ? null : <span className="ui-chip-count">{COUNT.format(count)}</span>}
      </BaseButton>
      {refusedBecause ? <Refusal id={reasonId}>{refusedBecause}</Refusal> : null}
    </span>
  )
}
