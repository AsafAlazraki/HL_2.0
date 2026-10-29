import { Button as BaseButton } from '@base-ui/react/button'
import { CheckIcon } from '@phosphor-icons/react'
import { useId, type ReactNode } from 'react'
import { Icon } from './Icon'
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
   *
   * `fix` (2026-10-22, the Review screen) is a row that IS a proposal: the line as it would read
   * once pressed, on the accent's own wash (`--color-fix-wash`), deepening under a pointer. The
   * verdict on Review's board A asked for the fix to be "the row itself", tappable and tinted in
   * the org accent, in place of a column of identical black pills; a row on paper could not say
   * it, so the primitive carries it. Only with `shape="row"`.
   *
   * `livery` (2026-10-29, Places) is a card standing on its OWN coloured ground — a place's
   * livery, the colour the screen sets as `--livery` on an element round it — with white words
   * and no padding, so the screen lays its mark, its photograph and its facts edge to edge. Board
   * A of the places boards drew every place so; a white plate could not say it, so the
   * primitive carries it. Only with `shape="card"`. Every ground a place may take clears
   * white words at 4.5 : 1 (`GROUNDS`, src/domain/modules/livery.ts).
   */
  tone?: 'paper' | 'room' | 'fix' | 'livery'
  /** the one a screen's next press will take — the row keeps its accent edge (`aria-current`) */
  current?: boolean
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
  /**
   * WHERE A CHOOSING CARD'S TICK STANDS (2026-10-19, build-close-critique.md, minor 13 of
   * the second critique: "an empty ring still sits on every tile's top-left corner, over the
   * photograph"). `corner`, the default, is board C's disc at the card's top corner, empty
   * at rest and filled when chosen. `foot` is for a card whose top corner is a photograph,
   * the picker's boats: nothing is drawn at rest, and the filled disc stands at the card's
   * foot, at its inline end, only when the card is chosen. The screen keeps that corner
   * clear in its own layout, the way it keeps any of its own words clear.
   */
  tick?: 'corner' | 'foot'
}

export function Tile({
  children,
  selected,
  onSelect,
  refusedBecause,
  refusedBy,
  label,
  tone = 'paper',
  current,
  shape = 'card',
  tick = 'corner',
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
        data-tick={shape === 'card' && selected !== undefined ? tick : undefined}
        aria-pressed={selected}
        aria-current={current ? true : undefined}
        aria-label={label}
        disabled={refused}
        focusableWhenDisabled
        onClick={onSelect}
        aria-describedby={describedBy(undefined, refused ? saidAt : undefined)}
        /* A CARD OR A CHIP IS A WHITE PLATE, the day wherever it stands (tokens.css, THE
           PLATE), and a row on paper stands on light in both themes: what a screen puts inside
           either reads the day's inks. Only a row on the room takes the room's. */
        data-ground={
          (shape === 'row' && tone === 'room') || tone === 'livery' ? undefined : 'plate'
        }
      >
        {/* THE TICK, on a card that chooses (board C's option tile): a disc at its corner
            that fills with the accent when the card is chosen. Only where `selected` says
            this card is a choice at all; a card that opens something has none. */}
        {shape === 'card' && selected !== undefined ? (
          <span className="ui-tile-tick" aria-hidden="true">
            <Icon glyph={CheckIcon} />
          </span>
        ) : null}
        {children}
      </BaseButton>
      {refusedBecause ? <Refusal id={reasonId}>{refusedBecause}</Refusal> : null}
    </span>
  )
}
