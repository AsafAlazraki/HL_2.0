import { useId } from 'react'
import { Icon, type Glyph } from './Icon'
import { Refusal } from './Refusal'

/**
 * A TOGGLE: one setting, on or off, said by its word — never by its colour alone (HIG:
 * "avoid relying solely on different colors", notes.md §2). Board C's switch: a capsule that
 * fills with the accent when on, and a white knob that TRAVELS across on the spring carrying
 * the setting's own glyph — a moon for the night — so the state is a position, a fill and a
 * picture at once.
 *
 * A plain `<button role="switch">` inside a `<label>`: pressing the word presses the switch,
 * Space and Enter turn it, and the word is its name. It is never disabled: `refusedBecause`
 * keeps it focusable, says it will not turn, and sets the sentence beneath.
 */
export interface ToggleProps {
  /** The setting, as a word: "Night". */
  label: string
  checked: boolean
  onCheckedChange?: (checked: boolean) => void
  /** The glyph the knob carries. */
  icon?: Glyph
  refusedBecause?: string
}

export function Toggle({ label, checked, onCheckedChange, icon, refusedBecause }: ToggleProps) {
  const reasonId = useId()
  const refused = Boolean(refusedBecause)
  return (
    <span className="ui-toggle-frame">
      <label className="ui-toggle">
        <button
          type="button"
          role="switch"
          className="ui-toggle-track"
          aria-checked={checked}
          aria-disabled={refused || undefined}
          aria-describedby={refused ? reasonId : undefined}
          onClick={() => {
            if (!refused) onCheckedChange?.(!checked)
          }}
        >
          <span className="ui-toggle-knob" aria-hidden="true">
            {icon ? <Icon glyph={icon} weight="fill" /> : null}
          </span>
        </button>
        <span className="ui-toggle-word">{label}</span>
      </label>
      {refusedBecause ? <Refusal id={reasonId}>{refusedBecause}</Refusal> : null}
    </span>
  )
}
