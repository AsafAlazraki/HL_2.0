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
  /**
   * WHETHER THIS TILE IS IN A STATE, AND WHETHER IT HAS ONE AT ALL.
   *
   * `true` and `false` both say "this is a toggle" and write
   * `aria-pressed`. LEFT OUT, nothing is written, and the tile is an
   * ordinary button to a reader.
   *
   * It defaulted to `false` until 2026-09-18, which was fine while
   * every tile in the app chose something — a model, a colourway, a
   * finish. Home's filed-quote card is the first that OPENS something,
   * and a card announced as an unpressed toggle tells a screen-reader
   * user that pressing it will put it into a state it will then stay
   * in. The primitive carries the distinction rather than a screen
   * working around it; every existing caller passes `selected`
   * explicitly and is unchanged.
   */
  selected?: boolean
  onSelect?: () => void
  /** Why this tile cannot be chosen right now, as a sentence. */
  refusedBecause?: string
  /**
   * THE SAME REFUSAL, WHEN THE SENTENCE IS ALREADY ON THE SCREEN ONCE.
   *
   * `refusedBecause` prints its sentence under the control, which is
   * right for one refused control standing among live ones and wrong
   * for a LIST every row of which is refused for the same reason.
   * Measured on the configurator, 2026-09-17: issuing a quote printed
   * `ISSUED_REFUSAL` five times on one open chapter, four of them a
   * 58.5px paragraph wedged BETWEEN two rows, so each one read as
   * though it belonged to the row beneath it — and `Show all 209 in
   * Yamaha Outboards` would have made it 209.
   *
   * This is that refusal with the sentence said once, above the list,
   * in the screen's own element: the tile is still dimmed, still
   * focusable, still swallows the press, and `aria-describedby` still
   * points at the reason, so a reader hears it on the control. The id
   * is the screen's; the sentence remains a sentence with its reason,
   * where it is refused. `refusedBecause` wins if both are given.
   */
  refusedBy?: string
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
  selected,
  onSelect,
  refusedBecause,
  refusedBy,
  label,
  tone = 'paper',
  shape = 'card',
}: TileProps) {
  const reasonId = useId()
  const refused = Boolean(refusedBecause) || Boolean(refusedBy)
  /* the sentence's own element: this tile's, or the one the screen
     drew above the list. Never both — a reader hearing the reason
     twice on one control is the defect this prop exists to end. */
  const saidAt = refusedBecause ? reasonId : refusedBy
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
        aria-describedby={describedBy(undefined, refused ? saidAt : undefined)}
      >
        {children}
      </BaseButton>
      {refusedBecause ? <Refusal id={reasonId}>{refusedBecause}</Refusal> : null}
    </span>
  )
}
