import { Button as BaseButton } from '@base-ui/react/button'
import { useId, type ReactNode } from 'react'
import { Refusal } from './Refusal'
import { describedBy } from './refuse'

/**
 * A pressable surface: a model in the picker, a colourway, an offer. "Selected" is
 * `aria-pressed`, which is what a reader is told. Like `Button`, a tile is never disabled:
 * `refusedBecause` dims it, keeps it focusable and sets the sentence beneath it.
 */
export interface TileProps {
  children: ReactNode
  selected?: boolean
  onSelect?: () => void
  /** Why this tile cannot be chosen right now, as a sentence. */
  refusedBecause?: string
  /** An accessible name when the content is a picture and a figure. */
  label?: string
  /**
   * THE GROUND THIS TILE STANDS ON. `paper` is the white card this
   * primitive has always drawn. `room` is the same control on a dark
   * ground — the ink, the rule and the refused state all inverted —
   * added for the picker, which is a dark room and would otherwise
   * have had 289 white cards in it. It is the same move `Button`
   * already makes with `veiled` and `act`, and for the same reason: a
   * screen may not reach into a primitive, so the primitive carries
   * the ground as a prop.
   */
  tone?: 'paper' | 'room'
  /**
   * HOW LARGE IT IS, AND NOTHING ABOUT WHAT IS IN IT. `card` is
   * the padded, rounded surface this primitive has always been. `row`
   * is a full-width line in a list, ruled beneath rather than boxed,
   * which is what a register of 289 models wants. `chip` is a small
   * inline control — a material, a colourway. The children are the
   * screen's own in every case; the shape only says how large the
   * pressable area is and how it is bounded.
   */
  shape?: 'card' | 'row' | 'chip'
}

export function Tile({
  children,
  selected = false,
  onSelect,
  refusedBecause,
  label,
  tone = 'paper',
  shape = 'card',
}: TileProps) {
  const reasonId = useId()
  const refused = Boolean(refusedBecause)
  return (
    /* The frame carries the same two attributes as the tile, so a
       refusal under a row is as wide as the row and is inked for the
       ground the row stands on — the same reason `Button`'s frame
       carries them. */
    <span className="ui-tile-frame" data-tone={tone} data-shape={shape}>
      <BaseButton
        className="ui-tile"
        data-tone={tone}
        data-shape={shape}
        aria-pressed={selected}
        aria-label={label}
        disabled={refused}
        focusableWhenDisabled
        onClick={onSelect}
        aria-describedby={describedBy(undefined, refused ? reasonId : undefined)}
      >
        {children}
      </BaseButton>
      {refusedBecause ? <Refusal id={reasonId}>{refusedBecause}</Refusal> : null}
    </span>
  )
}
