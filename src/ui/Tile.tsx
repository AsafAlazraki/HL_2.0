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
}

export function Tile({ children, selected = false, onSelect, refusedBecause, label }: TileProps) {
  const reasonId = useId()
  const refused = Boolean(refusedBecause)
  return (
    <span className="ui-tile-frame">
      <BaseButton
        className="ui-tile"
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
