import { Button as BaseButton } from '@base-ui/react/button'
import { CheckIcon } from '@phosphor-icons/react'
import { useId, type ReactNode } from 'react'
import type { TableKind } from '@/domain/model'
import { Icon } from './Icon'
import { KindMark } from './KindMark'
import { Picture } from './Picture'
import { Refusal } from './Refusal'
import { describedBy } from './refuse'

/**
 * AN OPTION ON THE BUILD: a motor, a trailer, a fit — board C's option tile. Its picture in a
 * well (the maker's studio render laid on the plate), its name bold, one line of its facts,
 * and its figure in a pill with what the figure means beside it ("Sell Price", "on the
 * quote"). The audit's option rows had "nothing that says motor or rigging kit" and a chosen
 * state that was a 3px bar (audit.md row 8).
 *
 * CHOSEN IS THE ACCENT, THREE TIMES OVER AND NEVER A COLOUR ALONE: a lit ring round the tile, a
 * filled tick disc at its corner, and the figure's pill filled — each landing on the settle
 * spring — with the picture's well washed pale blue. A tile with no picture held draws its
 * KIND in the well instead: the glyph in its ink, never a stand-in photograph.
 *
 * THE FIGURE IS THE SCREEN'S (a `PriceFigure` at a declared level, or the difference the press
 * makes); this only gives it its pill. Like every control here it is never disabled:
 * `refusedBecause` dims it, keeps it focusable and says why beneath it, and `refusedBy` points
 * at one sentence the screen already printed above a refused list.
 *
 * ON THE BUILD (2026-09-28, the component critique's first blocker): the build's motors were
 * rows of rigging-kit text while this tile stood only on /kit, and the verify round had left
 * the tile without what the build's rows say. So it takes them, and nothing more: the name as
 * a node (the build bolds what a search matched and sets the dealer's code beside it), a
 * `detail` line under the facts for the pairing's own words (the rigging kit, the prop), a
 * `label` where the tile's words are not its whole name ("…, on the quote"), and `lazy` for a
 * list of two hundred.
 */
export interface OptionTileProps {
  /** "Yamaha F115LB" — a node where a screen marks part of it */
  name: ReactNode
  /** "115 hp · 171 kg · 20″ shaft" */
  facts?: string
  /** The words that tell this option from its neighbours on this list — the pairing's rigging
   *  kit and prop — set small under the facts. Never truncated. */
  detail?: ReactNode
  /** The option's own picture. It shows the thing the tile's name already names, so it is
   *  not named a second time: inside a button, a picture's words would open the button's name. */
  picture?: { src: string; width: number; height: number } | null
  kind?: TableKind
  figure?: ReactNode
  /** What the figure is: "Cash", "on the quote", "the press adds". */
  figureSay?: string
  selected: boolean
  onSelect?: () => void
  refusedBecause?: string
  refusedBy?: string
  /** The accessible name, where the tile's words are not the whole of what it is. */
  label?: string
  /** One of a long list: its picture is fetched only as it nears the window (`Picture`). */
  lazy?: boolean
}

export function OptionTile({
  name,
  facts,
  detail,
  picture,
  kind,
  figure,
  figureSay,
  selected,
  onSelect,
  refusedBecause,
  refusedBy,
  label,
  lazy,
}: OptionTileProps) {
  const reasonId = useId()
  const refused = Boolean(refusedBecause) || Boolean(refusedBy)
  const saidAt = refusedBecause ? reasonId : refusedBy
  return (
    <span className="ui-option-frame">
      <BaseButton
        className="ui-option"
        aria-pressed={selected}
        aria-label={label}
        disabled={refused}
        focusableWhenDisabled
        onClick={onSelect}
        aria-describedby={describedBy(undefined, refused ? saidAt : undefined)}
        data-ground="plate"
      >
        <span className="ui-option-tick" aria-hidden="true">
          <Icon glyph={CheckIcon} />
        </span>
        <span className="ui-option-well">
          {picture ? (
            <Picture
              src={picture.src}
              alt=""
              width={picture.width}
              height={picture.height}
              fit="contain"
              lazy={lazy}
            />
          ) : kind ? (
            <KindMark kind={kind} size="lg" />
          ) : null}
        </span>
        <span className="ui-option-words">
          <span className="ui-option-name">{name}</span>
          {facts ? <span className="ui-option-facts">{facts}</span> : null}
          {detail ? <span className="ui-option-detail">{detail}</span> : null}
          {figure === undefined ? null : (
            <span className="ui-option-figure">
              {figure}
              {figureSay ? <span className="ui-option-say">{figureSay}</span> : null}
            </span>
          )}
        </span>
      </BaseButton>
      {refusedBecause ? <Refusal id={reasonId}>{refusedBecause}</Refusal> : null}
    </span>
  )
}
